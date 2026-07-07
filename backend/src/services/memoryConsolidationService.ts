import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { createMemoryEmbedding } from "./memoryService";
import { reindexSemanticSearch, semanticSearch } from "./semanticSearchService";

type VectorRow = {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  title: string;
  content: string;
  search_text: string;
  embedding_json: string;
  metadata_json: string;
  indexed_at: string;
  updated_at: string;
};

type ConsolidationRow = {
  id: string;
  user_id: string;
  status: string;
  summary: string;
  source_count: number;
  duplicate_count: number;
  conflict_count: number;
  stale_count: number;
  quality_score: number;
  metadata_json: string;
  created_at: string;
};

type ConsolidatedItemRow = {
  id: string;
  user_id: string;
  consolidation_id: string;
  category: string;
  title: string;
  content: string;
  source_types_json: string;
  source_refs_json: string;
  confidence_score: number;
  freshness_score: number;
  quality_score: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type ConflictRow = {
  id: string;
  user_id: string;
  consolidation_id: string | null;
  title: string;
  description: string;
  source_a_json: string;
  source_b_json: string;
  severity: string;
  status: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
};

type ConsolidationSource = VectorRow & {
  embedding: number[];
  normalizedTitle: string;
  normalizedContent: string;
  freshnessScore: number;
  confidenceScore: number;
  qualityScore: number;
};

type SourceGroup = {
  sources: ConsolidationSource[];
  duplicate: boolean;
  maxSimilarity: number;
};

const STOP_WORDS = new Set([
  "ainda",
  "aquele",
  "aquela",
  "como",
  "com",
  "das",
  "dos",
  "de",
  "do",
  "em",
  "essa",
  "esse",
  "esta",
  "este",
  "foi",
  "para",
  "por",
  "que",
  "sobre",
  "uma",
  "um"
]);

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clean(value: unknown, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function truncate(value: string, limit: number) {
  const text = clean(value);
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function parseVector(value: string) {
  const parsed = parseJson<number[]>(value, []);
  return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
}

function cosineSimilarity(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  if (!length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  return dot / ((Math.sqrt(normA) || 1) * (Math.sqrt(normB) || 1));
}

function terms(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((term) => term.length >= 3 && !STOP_WORDS.has(term));
}

function lexicalSimilarity(a: string, b: string) {
  const left = new Set(terms(a));
  const right = new Set(terms(b));
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const term of left) {
    if (right.has(term)) intersection += 1;
  }
  return intersection / Math.max(left.size, right.size);
}

function sourceLabel(row: Pick<VectorRow, "source_type" | "source_id" | "title" | "updated_at">) {
  return {
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    updatedAt: row.updated_at
  };
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function freshness(updatedAt: string) {
  const timestamp = new Date(updatedAt || 0).getTime();
  if (!timestamp) return 0.35;
  const ageDays = Math.max(0, (Date.now() - timestamp) / 86_400_000);
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.86;
  if (ageDays <= 90) return 0.68;
  if (ageDays <= 180) return 0.5;
  return 0.32;
}

function confidenceFromMetadata(row: VectorRow) {
  const metadata = parseJson<Record<string, unknown>>(row.metadata_json, {});
  const explicit = Number(metadata.confidence || metadata.confidenceScore || metadata.weight);
  if (Number.isFinite(explicit) && explicit > 0) return clamp(explicit);
  const importance = Number(metadata.importance);
  if (Number.isFinite(importance) && importance > 0) return clamp(0.45 + importance * 0.1);
  const sourceBoosts: Record<string, number> = {
    memory: 0.72,
    profile: 0.7,
    profile_fact: 0.68,
    project_memory: 0.76,
    project_decision: 0.82,
    project_commit: 0.78,
    knowledge: 0.7,
    document: 0.62,
    file: 0.58,
    system: 0.66,
    conversation: 0.5
  };
  return sourceBoosts[row.source_type] || 0.56;
}

function toSource(row: VectorRow): ConsolidationSource {
  const embedding = parseVector(row.embedding_json);
  return {
    ...row,
    embedding: embedding.length ? embedding : createMemoryEmbedding(row.search_text || `${row.title}\n${row.content}`),
    normalizedTitle: normalizeText(row.title),
    normalizedContent: normalizeText(row.content),
    freshnessScore: freshness(row.updated_at || row.indexed_at),
    confidenceScore: confidenceFromMetadata(row),
    qualityScore: 0
  };
}

function scoreSource(source: ConsolidationSource, duplicatePenalty = 0, conflictPenalty = 0) {
  return clamp(source.confidenceScore * 0.48 + source.freshnessScore * 0.34 + sourceTypeDiversityScore(source.source_type) * 0.18 - duplicatePenalty - conflictPenalty);
}

function sourceTypeDiversityScore(sourceType: string) {
  if (["project_decision", "project_commit", "project_memory", "memory"].includes(sourceType)) return 0.9;
  if (["profile", "profile_fact", "knowledge", "system"].includes(sourceType)) return 0.75;
  return 0.58;
}

function collectIndexedSources(userId: string) {
  reindexSemanticSearch(userId);
  const rows = getDatabase()
    .prepare(
      `select *
       from vector_search_index
       where user_id = ?
       order by datetime(updated_at) desc
       limit 1600`
    )
    .all(userId) as VectorRow[];
  return rows.map(toSource);
}

function buildGroups(sources: ConsolidationSource[]) {
  const groups: SourceGroup[] = [];
  for (const source of sources) {
    let selected: SourceGroup | null = null;
    let selectedScore = 0;
    for (const group of groups) {
      const representative = group.sources[0];
      const semantic = cosineSimilarity(source.embedding, representative.embedding);
      const lexical = Math.max(lexicalSimilarity(source.title, representative.title), lexicalSimilarity(source.content, representative.content));
      const sameTitle = source.normalizedTitle && source.normalizedTitle === representative.normalizedTitle;
      const score = Math.max(semantic, lexical, sameTitle ? 1 : 0);
      if (score > selectedScore && (score >= 0.84 || sameTitle || lexical >= 0.72)) {
        selected = group;
        selectedScore = score;
      }
    }
    if (selected) {
      selected.sources.push(source);
      selected.duplicate = true;
      selected.maxSimilarity = Math.max(selected.maxSimilarity, selectedScore);
    } else {
      groups.push({ sources: [source], duplicate: false, maxSimilarity: 0 });
    }
  }
  return groups;
}

function contradictionSignals(content: string) {
  const text = normalizeText(content);
  return {
    done: /\b(concluido|concluida|finalizado|finalizada|pronto|pronta|feito|feita|publicado|deployado)\b/.test(text),
    pending: /\b(pendente|em andamento|aberto|aberta|bloqueado|bloqueada|aguardando|falta|fazer|nao concluido|nao finalizado)\b/.test(text),
    frozen: /\b(congelado|congelada|pausado|pausada|suspenso|suspensa)\b/.test(text),
    canceled: /\b(cancelado|cancelada|removido|removida|excluido|excluida)\b/.test(text)
  };
}

function isContradictory(a: ConsolidationSource, b: ConsolidationSource) {
  const relation = Math.max(lexicalSimilarity(a.title, b.title), lexicalSimilarity(a.content, b.content), cosineSimilarity(a.embedding, b.embedding));
  if (relation < 0.54) return false;
  const left = contradictionSignals(`${a.title}\n${a.content}`);
  const right = contradictionSignals(`${b.title}\n${b.content}`);
  return (
    (left.done && (right.pending || right.frozen || right.canceled)) ||
    (right.done && (left.pending || left.frozen || left.canceled)) ||
    (left.frozen && right.pending) ||
    (right.frozen && left.pending)
  );
}

function detectConflicts(groups: SourceGroup[]) {
  const conflicts: Array<{ title: string; description: string; sourceA: ConsolidationSource; sourceB: ConsolidationSource; severity: string }> = [];
  const seen = new Set<string>();
  const candidates = groups.flatMap((group) => group.sources).slice(0, 450);
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      const left = candidates[leftIndex];
      const right = candidates[rightIndex];
      if (left.source_id === right.source_id && left.source_type === right.source_type) continue;
      const key = [left.id, right.id].sort().join(":");
      if (seen.has(key) || !isContradictory(left, right)) continue;
      seen.add(key);
      conflicts.push({
        title: `Possível conflito: ${truncate(left.title || right.title, 90)}`,
        description: "A YARA encontrou registros relacionados com sinais de status ou decisão incompatíveis. Revise para manter a memória confiável.",
        sourceA: left,
        sourceB: right,
        severity: left.source_type.includes("project") || right.source_type.includes("project") ? "high" : "medium"
      });
      if (conflicts.length >= 30) return conflicts;
    }
  }
  return conflicts;
}

function groupCategory(group: SourceGroup) {
  const sourceTypes = Array.from(new Set(group.sources.map((source) => source.source_type)));
  if (sourceTypes.some((type) => type.startsWith("project"))) return "project";
  if (sourceTypes.some((type) => type.includes("profile"))) return "profile";
  if (sourceTypes.some((type) => ["document", "file", "system_file"].includes(type))) return "files";
  if (sourceTypes.includes("system")) return "systems";
  if (sourceTypes.includes("knowledge")) return "graph";
  if (sourceTypes.includes("conversation")) return "conversation";
  return "memory";
}

function buildItem(group: SourceGroup, consolidationId: string, userId: string, conflicts: Set<string>) {
  const sorted = [...group.sources].sort((a, b) => {
    const scoreA = scoreSource(a, group.duplicate ? 0.04 : 0, conflicts.has(a.id) ? 0.16 : 0);
    const scoreB = scoreSource(b, group.duplicate ? 0.04 : 0, conflicts.has(b.id) ? 0.16 : 0);
    return scoreB - scoreA;
  });
  const primary = sorted[0];
  const sourceTypes = Array.from(new Set(sorted.map((source) => source.source_type)));
  const refs = sorted.slice(0, 8).map(sourceLabel);
  const combined = Array.from(new Set(sorted.map((source) => truncate(source.content, 420)).filter(Boolean))).slice(0, 3).join("\n");
  const confidence = clamp(sorted.reduce((sum, source) => sum + source.confidenceScore, 0) / sorted.length + Math.min(0.16, (sorted.length - 1) * 0.04));
  const fresh = Math.max(...sorted.map((source) => source.freshnessScore));
  const conflictPenalty = sorted.some((source) => conflicts.has(source.id)) ? 0.14 : 0;
  const duplicatePenalty = group.duplicate ? 0.03 : 0;
  const quality = clamp(confidence * 0.46 + fresh * 0.34 + Math.min(1, sourceTypes.length / 4) * 0.2 - duplicatePenalty - conflictPenalty);
  return {
    id: uuid(),
    userId,
    consolidationId,
    category: groupCategory(group),
    title: truncate(primary.title || "Memória consolidada", 160),
    content: truncate(combined || primary.content, 1500),
    sourceTypes,
    refs,
    confidenceScore: Number(confidence.toFixed(4)),
    freshnessScore: Number(fresh.toFixed(4)),
    qualityScore: Number(quality.toFixed(4)),
    status: conflictPenalty > 0 ? "needs_review" : fresh < 0.35 ? "stale" : "active"
  };
}

function publicConsolidation(row: ConsolidationRow) {
  return {
    id: row.id,
    status: row.status,
    summary: row.summary,
    sourceCount: row.source_count,
    duplicateCount: row.duplicate_count,
    conflictCount: row.conflict_count,
    staleCount: row.stale_count,
    qualityScore: row.quality_score,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    createdAt: row.created_at
  };
}

function publicItem(row: ConsolidatedItemRow) {
  return {
    id: row.id,
    consolidationId: row.consolidation_id,
    category: row.category,
    title: row.title,
    content: row.content,
    sourceTypes: parseJson<string[]>(row.source_types_json, []),
    sourceRefs: parseJson<Array<Record<string, unknown>>>(row.source_refs_json, []),
    confidenceScore: row.confidence_score,
    freshnessScore: row.freshness_score,
    qualityScore: row.quality_score,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicConflict(row: ConflictRow) {
  return {
    id: row.id,
    consolidationId: row.consolidation_id,
    title: row.title,
    description: row.description,
    sourceA: parseJson<Record<string, unknown>>(row.source_a_json, {}),
    sourceB: parseJson<Record<string, unknown>>(row.source_b_json, {}),
    severity: row.severity,
    status: row.status,
    resolution: row.resolution,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at
  };
}

function audit(userId: string, consolidationId: string | null, action: string, message: string, metadata: Record<string, unknown> = {}, status = "success") {
  getDatabase()
    .prepare(
      `insert into memory_consolidation_audit_logs (id, user_id, consolidation_id, action, status, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, consolidationId, action, status, message, JSON.stringify(metadata));
}

export function consolidateMemory(userId: string) {
  const db = getDatabase();
  const sources = collectIndexedSources(userId);
  const groups = buildGroups(sources);
  const rawConflicts = detectConflicts(groups);
  const conflictSourceIds = new Set(rawConflicts.flatMap((conflict) => [conflict.sourceA.id, conflict.sourceB.id]));
  const duplicateCount = groups.filter((group) => group.duplicate).reduce((sum, group) => sum + Math.max(0, group.sources.length - 1), 0);
  const staleCount = sources.filter((source) => source.freshnessScore < 0.35).length;
  const consolidationId = uuid();
  const items = groups.map((group) => buildItem(group, consolidationId, userId, conflictSourceIds)).sort((a, b) => b.qualityScore - a.qualityScore);
  const qualityScore = items.length ? Number((items.reduce((sum, item) => sum + item.qualityScore, 0) / items.length).toFixed(4)) : 0;
  const summary = sources.length
    ? `Memória consolidada com ${sources.length} fontes, ${duplicateCount} duplicidades, ${rawConflicts.length} conflitos e qualidade média de ${Math.round(qualityScore * 100)}%.`
    : "Ainda não há fontes suficientes para consolidar a memória.";

  db.prepare(
    `insert into memory_consolidations (
       id, user_id, status, summary, source_count, duplicate_count, conflict_count, stale_count, quality_score, metadata_json
     ) values (?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?)`
  ).run(consolidationId, userId, summary, sources.length, duplicateCount, rawConflicts.length, staleCount, qualityScore, JSON.stringify({ sourceTypes: Array.from(new Set(sources.map((source) => source.source_type))) }));

  const insertItem = db.prepare(
    `insert into consolidated_memory_items (
       id, user_id, consolidation_id, category, title, content, source_types_json, source_refs_json,
       confidence_score, freshness_score, quality_score, status, updated_at
     ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
  );
  for (const item of items) {
    insertItem.run(
      item.id,
      userId,
      consolidationId,
      item.category,
      item.title,
      item.content,
      JSON.stringify(item.sourceTypes),
      JSON.stringify(item.refs),
      item.confidenceScore,
      item.freshnessScore,
      item.qualityScore,
      item.status
    );
  }

  const insertConflict = db.prepare(
    `insert into memory_conflicts (
       id, user_id, consolidation_id, title, description, source_a_json, source_b_json, severity, status
     ) values (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
  );
  for (const conflict of rawConflicts) {
    insertConflict.run(
      uuid(),
      userId,
      consolidationId,
      conflict.title,
      conflict.description,
      JSON.stringify(sourceLabel(conflict.sourceA)),
      JSON.stringify(sourceLabel(conflict.sourceB)),
      conflict.severity
    );
  }

  const upsertQuality = db.prepare(
    `insert into memory_quality_scores (
       id, user_id, source_type, source_id, quality_score, freshness_score, confidence_score, duplicate_score, conflict_score, metadata_json, updated_at
     ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
     on conflict(user_id, source_type, source_id) do update set
       quality_score = excluded.quality_score,
       freshness_score = excluded.freshness_score,
       confidence_score = excluded.confidence_score,
       duplicate_score = excluded.duplicate_score,
       conflict_score = excluded.conflict_score,
       metadata_json = excluded.metadata_json,
       updated_at = current_timestamp`
  );
  const duplicateSources = new Set(groups.filter((group) => group.duplicate).flatMap((group) => group.sources.map((source) => source.id)));
  for (const source of sources) {
    const conflictScore = conflictSourceIds.has(source.id) ? 1 : 0;
    const duplicateScore = duplicateSources.has(source.id) ? 1 : 0;
    const quality = scoreSource(source, duplicateScore ? 0.04 : 0, conflictScore ? 0.16 : 0);
    upsertQuality.run(
      uuid(),
      userId,
      source.source_type,
      source.source_id,
      Number(quality.toFixed(4)),
      Number(source.freshnessScore.toFixed(4)),
      Number(source.confidenceScore.toFixed(4)),
      duplicateScore,
      conflictScore,
      JSON.stringify({ title: source.title, indexedAt: source.indexed_at, updatedAt: source.updated_at })
    );
  }

  audit(userId, consolidationId, "consolidate", "Memória consolidada.", { sourceCount: sources.length, itemCount: items.length, duplicateCount, conflictCount: rawConflicts.length, staleCount });
  return getMemoryConsolidation(userId, consolidationId);
}

export function getConsolidatedMemoryDashboard(userId: string) {
  const db = getDatabase();
  const total = (sql: string, ...params: unknown[]) => (db.prepare(sql).get(...params as any[]) as { total: number }).total;
  const latest = db
    .prepare("select * from memory_consolidations where user_id = ? order by datetime(created_at) desc limit 1")
    .get(userId) as ConsolidationRow | undefined;
  const categories = db
    .prepare(
      `select category, count(*) as total, avg(quality_score) as quality
       from consolidated_memory_items
       where user_id = ? and consolidation_id = coalesce(?, consolidation_id)
       group by category
       order by total desc`
    )
    .all(userId, latest?.id || null) as Array<{ category: string; total: number; quality: number }>;
  const latestItems = db
    .prepare(
      `select * from consolidated_memory_items
       where user_id = ? and consolidation_id = coalesce(?, consolidation_id)
       order by quality_score desc, datetime(updated_at) desc
       limit 8`
    )
    .all(userId, latest?.id || null) as ConsolidatedItemRow[];
  const pendingConflicts = db
    .prepare(
      `select * from memory_conflicts
       where user_id = ? and status = 'pending'
       order by case severity when 'high' then 1 when 'medium' then 2 else 3 end, datetime(created_at) desc
       limit 8`
    )
    .all(userId) as ConflictRow[];
  return {
    latest: latest ? publicConsolidation(latest) : null,
    totals: {
      consolidations: total("select count(*) as total from memory_consolidations where user_id = ?", userId),
      consolidatedItems: total("select count(*) as total from consolidated_memory_items where user_id = ?", userId),
      pendingConflicts: total("select count(*) as total from memory_conflicts where user_id = ? and status = 'pending'", userId),
      resolvedConflicts: total("select count(*) as total from memory_conflicts where user_id = ? and status = 'resolved'", userId),
      qualityScores: total("select count(*) as total from memory_quality_scores where user_id = ?", userId)
    },
    categories,
    latestItems: latestItems.map(publicItem),
    pendingConflicts: pendingConflicts.map(publicConflict)
  };
}

export function listMemoryConsolidations(userId: string) {
  const rows = getDatabase()
    .prepare("select * from memory_consolidations where user_id = ? order by datetime(created_at) desc limit 30")
    .all(userId) as ConsolidationRow[];
  return {
    consolidations: rows.map(publicConsolidation),
    dashboard: getConsolidatedMemoryDashboard(userId)
  };
}

export function getMemoryConsolidation(userId: string, consolidationId: string) {
  const db = getDatabase();
  const consolidation = db
    .prepare("select * from memory_consolidations where user_id = ? and id = ?")
    .get(userId, consolidationId) as ConsolidationRow | undefined;
  if (!consolidation) throw new Error("Consolidação não encontrada.");
  const items = db
    .prepare("select * from consolidated_memory_items where user_id = ? and consolidation_id = ? order by quality_score desc, datetime(updated_at) desc")
    .all(userId, consolidationId) as ConsolidatedItemRow[];
  const conflicts = db
    .prepare("select * from memory_conflicts where user_id = ? and consolidation_id = ? order by datetime(created_at) desc")
    .all(userId, consolidationId) as ConflictRow[];
  return {
    consolidation: publicConsolidation(consolidation),
    items: items.map(publicItem),
    conflicts: conflicts.map(publicConflict),
    dashboard: getConsolidatedMemoryDashboard(userId)
  };
}

export function listMemoryConflicts(userId: string, status = "pending") {
  const cleanStatus = ["pending", "resolved", "ignored", "all"].includes(status) ? status : "pending";
  const rows = cleanStatus === "all"
    ? getDatabase()
        .prepare("select * from memory_conflicts where user_id = ? order by datetime(created_at) desc limit 80")
        .all(userId)
    : getDatabase()
        .prepare("select * from memory_conflicts where user_id = ? and status = ? order by datetime(created_at) desc limit 80")
        .all(userId, cleanStatus);
  return { conflicts: (rows as ConflictRow[]).map(publicConflict) };
}

export function resolveMemoryConflict(userId: string, conflictId: string, input: { resolution: string; status?: string }) {
  const status = input.status === "ignored" ? "ignored" : "resolved";
  const resolution = truncate(input.resolution, 1200);
  const existing = getDatabase()
    .prepare("select * from memory_conflicts where user_id = ? and id = ?")
    .get(userId, conflictId) as ConflictRow | undefined;
  if (!existing) throw new Error("Conflito não encontrado.");
  getDatabase()
    .prepare("update memory_conflicts set status = ?, resolution = ?, resolved_at = current_timestamp where user_id = ? and id = ?")
    .run(status, resolution, userId, conflictId);
  audit(userId, existing.consolidation_id, "resolve_conflict", "Conflito de memória resolvido.", { conflictId, resolution, status });
  const updated = getDatabase()
    .prepare("select * from memory_conflicts where user_id = ? and id = ?")
    .get(userId, conflictId) as ConflictRow;
  return { conflict: publicConflict(updated), dashboard: getConsolidatedMemoryDashboard(userId) };
}

export function readConsolidatedMemoryContext(userId: string, query: string) {
  const latest = getDatabase()
    .prepare("select id from memory_consolidations where user_id = ? order by datetime(created_at) desc limit 1")
    .get(userId) as { id: string } | undefined;
  if (!latest) return "";
  const rows = getDatabase()
    .prepare(
      `select * from consolidated_memory_items
       where user_id = ? and consolidation_id = ?
       order by quality_score desc, datetime(updated_at) desc
       limit 12`
    )
    .all(userId, latest.id) as ConsolidatedItemRow[];
  if (!rows.length) return "";
  const queryVector = createMemoryEmbedding(query);
  const queryTerms = terms(query);
  const ranked = rows
    .map((row) => {
      const semantic = cosineSimilarity(queryVector, createMemoryEmbedding(`${row.title}\n${row.content}`));
      const lexical = lexicalSimilarity(queryTerms.join(" "), `${row.title}\n${row.content}`);
      return { row, score: semantic * 0.62 + lexical * 0.28 + row.quality_score * 0.1 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return [
    "Memória consolidada mais relevante:",
    ...ranked.map((item, index) => `${index + 1}. ${item.row.title} (${item.row.category}, qualidade ${Math.round(item.row.quality_score * 100)}%): ${truncate(item.row.content, 280)}`)
  ].join("\n");
}

export function answerConsolidatedMemoryQuestion(userId: string, message: string) {
  if (!/(mem[oó]ria consolidada|informações? repetidas|informacoes? repetidas|duplicidad|conflitant|mem[oó]ria mais atual|o que voc[eê] sabe sobre meu projeto yara|onde paramos|status do projeto|o que falta na yara)/i.test(message)) {
    return null;
  }
  const normalized = normalizeText(message);
  const dashboard = getConsolidatedMemoryDashboard(userId);
  if (!dashboard.latest) {
    const created = consolidateMemory(userId);
    return [
      "Consolidei a memória agora para responder com base nos dados salvos.",
      created.consolidation.summary,
      created.items.slice(0, 5).map((item, index) => `${index + 1}. ${item.title}: ${truncate(item.content, 220)}`).join("\n") || "Ainda há poucos dados para resumir."
    ].filter(Boolean).join("\n\n");
  }
  if (/repetid|duplicidad/.test(normalized)) {
    const latest = dashboard.latest;
    return latest.duplicateCount
      ? `Encontrei ${latest.duplicateCount} possíveis duplicidades na última consolidação. Abra Memória Consolidada para revisar os itens agrupados e manter apenas a informação mais confiável.`
      : "Não encontrei duplicidades relevantes na última consolidação da memória.";
  }
  if (/conflitant|conflito/.test(normalized)) {
    const conflicts = listMemoryConflicts(userId, "pending").conflicts;
    if (!conflicts.length) return "Não há conflitos pendentes na memória consolidada agora.";
    return [
      `Existem ${conflicts.length} conflitos pendentes. Principais pontos:`,
      ...conflicts.slice(0, 5).map((conflict, index) => `${index + 1}. ${conflict.title} — ${conflict.severity}`),
      "Você pode resolver em Memória Consolidada."
    ].join("\n");
  }
  const result = semanticSearch(userId, { query: message, limit: 6, mode: "context" });
  const consolidatedContext = readConsolidatedMemoryContext(userId, message);
  const contextLines = result.results.slice(0, 4).map((item, index) => `${index + 1}. ${item.title} (${item.sourceType}, ${Math.round(item.score * 100)}%): ${item.snippet}`);
  return [
    dashboard.latest.summary,
    consolidatedContext,
    contextLines.length ? "Registros relacionados:\n" + contextLines.join("\n") : "",
    dashboard.pendingConflicts.length ? `Atenção: há ${dashboard.pendingConflicts.length} conflito(s) pendente(s) para revisão.` : ""
  ].filter(Boolean).join("\n\n");
}
