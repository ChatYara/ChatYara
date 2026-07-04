import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";
import { createMemoryEmbedding } from "./memoryService";
import { queryKnowledgeGraph } from "./graphService";

type SourceDocument = {
  sourceType: string;
  sourceId: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
};

type IndexRow = {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  title: string;
  content: string;
  search_text: string;
  embedding_json: string;
  content_hash: string;
  metadata_json: string;
  indexed_at: string;
  updated_at: string;
};

type SearchMode = "semantic" | "hybrid" | "context";

type SemanticResult = {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  snippet: string;
  score: number;
  semanticScore: number;
  lexicalScore: number;
  contextScore: number;
  metadata: Record<string, unknown>;
  updatedAt: string;
};

type SemanticSearchResponse = {
  query: string;
  mode: SearchMode;
  results: SemanticResult[];
  topScore: number;
  provider: string;
  cache: "hit" | "miss";
};

const CACHE_TTL_MS = 3 * 60 * 1000;
const searchCache = new Map<string, { expiresAt: number; value: unknown }>();

function normalizeText(value: string) {
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

function hashContent(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
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
  return Array.from(
    new Set(
      normalizeText(value)
        .split(" ")
        .filter((term) => term.length >= 3 && !["para", "como", "onde", "qual", "quais", "sobre", "meus", "minhas", "essa", "esse", "isso"].includes(term))
    )
  ).slice(0, 12);
}

function lexicalScore(queryTerms: string[], haystack: string) {
  if (!queryTerms.length) return 0;
  const text = normalizeText(haystack);
  const matches = queryTerms.filter((term) => text.includes(term)).length;
  const exactPhrase = text.includes(queryTerms.join(" ")) ? 0.16 : 0;
  return Math.min(1, matches / queryTerms.length + exactPhrase);
}

function contextScore(queryTerms: string[], row: IndexRow) {
  const typeBoosts: Record<string, number> = {
    memory: 0.08,
    project_memory: 0.08,
    project_decision: 0.08,
    knowledge: 0.07,
    conversation: 0.06,
    system: 0.05,
    document: 0.04,
    file: 0.03
  };
  const metadata = parseJson<Record<string, unknown>>(row.metadata_json, {});
  const importance = Number(metadata.importance || metadata.weight || 0);
  const importanceBoost = Number.isFinite(importance) ? Math.min(0.1, importance * 0.02) : 0;
  const updated = new Date(row.updated_at || row.indexed_at || 0).getTime();
  const ageDays = updated ? Math.max(0, (Date.now() - updated) / 86_400_000) : 999;
  const recencyBoost = ageDays < 30 ? 0.04 : ageDays < 120 ? 0.02 : 0;
  const titleBoost = queryTerms.some((term) => normalizeText(row.title).includes(term)) ? 0.08 : 0;
  return Math.min(0.3, (typeBoosts[row.source_type] || 0.02) + importanceBoost + recencyBoost + titleBoost);
}

function cacheGet<T>(key: string) {
  const item = searchCache.get(key) as { expiresAt: number; value: T } | undefined;
  if (!item || item.expiresAt < Date.now()) {
    searchCache.delete(key);
    return null;
  }
  return item.value;
}

function cacheSet<T>(key: string, value: T) {
  searchCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function clearUserCache(userId: string) {
  for (const key of searchCache.keys()) {
    if (key.includes(`:${userId}:`)) searchCache.delete(key);
  }
}

function audit(userId: string, action: string, message: string, metadata: Record<string, unknown> = {}, status = "success") {
  getDatabase()
    .prepare(
      `insert into vector_search_audit_logs (id, user_id, action, status, message, metadata_json)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, action, status, message, JSON.stringify(metadata));
}

function addDocument(list: SourceDocument[], sourceType: string, sourceId: unknown, title: unknown, content: unknown, metadata: Record<string, unknown> = {}) {
  const id = clean(sourceId);
  const safeTitle = truncate(clean(title, "Registro YARA"), 180);
  const safeContent = truncate(clean(content), 5000);
  if (!id || safeContent.length < 2) return;
  list.push({ sourceType, sourceId: id, title: safeTitle, content: safeContent, metadata });
}

function collectSourceDocuments(userId: string) {
  const db = getDatabase();
  const docs: SourceDocument[] = [];

  for (const row of db.prepare("select id, title, category, importance, content, source, updated_at from memories where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "memory", row.id, row.title, `${row.category}\n${row.content}`, { category: row.category, importance: row.importance, source: row.source, updatedAt: row.updated_at });
  }

  const profile = db.prepare("select * from cognitive_profiles where user_id = ?").get(userId) as any;
  if (profile) {
    addDocument(docs, "profile", userId, "Perfil cognitivo", [profile.preferred_name, profile.profession, profile.studies, profile.projects_json, profile.interests_json, profile.goals_json, profile.history_json].filter(Boolean).join("\n"), {
      confidence: profile.confidence_score,
      source: profile.source
    });
  }

  for (const row of db.prepare("select id, fact_type, label, content, confidence_score, source, updated_at from cognitive_profile_facts where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "profile_fact", row.id, row.label, `${row.fact_type}\n${row.content}`, { confidence: row.confidence_score, source: row.source, updatedAt: row.updated_at });
  }

  for (const row of db.prepare("select id, name, type, prompt, output, description, content, updated_at from projects where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "project", row.id, row.name, [row.type, row.description, row.prompt, row.content || row.output].filter(Boolean).join("\n"), { updatedAt: row.updated_at });
  }

  for (const row of db.prepare("select id, name, description, status, current_pillar, current_phase, next_steps_json, updated_at from project_memories where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "project_memory", row.id, row.name, [row.description, row.status, row.current_pillar, row.current_phase, row.next_steps_json].filter(Boolean).join("\n"), { status: row.status, updatedAt: row.updated_at });
  }

  for (const row of db.prepare("select id, title, content, impact, source, decided_at from project_decisions where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "project_decision", row.id, row.title, [row.content, row.impact].filter(Boolean).join("\n"), { source: row.source, updatedAt: row.decided_at });
  }

  for (const row of db.prepare("select id, title, description, status, milestone_date from project_milestones where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "project_milestone", row.id, row.title, [row.description, row.status].filter(Boolean).join("\n"), { status: row.status, updatedAt: row.milestone_date });
  }

  for (const row of db.prepare("select id, title, description, priority, status, due_date, updated_at from project_pending_items where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "project_pending", row.id, row.title, [row.description, row.priority, row.status, row.due_date].filter(Boolean).join("\n"), { priority: row.priority, status: row.status, updatedAt: row.updated_at });
  }

  for (const row of db.prepare("select id, hash, message, branch, committed_at from project_commits where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "project_commit", row.id, row.hash, [row.message, row.branch, row.committed_at].filter(Boolean).join("\n"), { hash: row.hash, branch: row.branch, updatedAt: row.committed_at });
  }

  for (const row of db.prepare("select id, title, description, event_type, event_at from project_timeline_events where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "project_timeline", row.id, row.title, [row.event_type, row.description].filter(Boolean).join("\n"), { eventType: row.event_type, updatedAt: row.event_at });
  }

  for (const row of db.prepare("select id, type, label, summary, importance, source_table, source_id, updated_at from knowledge_nodes where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "knowledge", row.id, row.label, [row.type, row.summary].filter(Boolean).join("\n"), { importance: row.importance, sourceTable: row.source_table, sourceId: row.source_id, updatedAt: row.updated_at });
  }

  for (const row of db.prepare("select id, name, type, category, status, created_at, updated_at from files where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "file", row.id, row.name, [row.type, row.category, row.status].filter(Boolean).join("\n"), { type: row.type, category: row.category, updatedAt: row.updated_at || row.created_at });
  }

  for (const row of db.prepare("select id, title, type, template, format, metadata_json, created_at, updated_at from documents where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "document", row.id, row.title, [row.type, row.template, row.format, row.metadata_json].filter(Boolean).join("\n"), { format: row.format, template: row.template, updatedAt: row.updated_at || row.created_at });
  }

  for (const row of db.prepare("select id, name, prompt, type, architecture, frontend, backend, database_choice, objective, scope_json, stack_json, updated_at from systems where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "system", row.id, row.name, [row.prompt, row.type, row.architecture, row.frontend, row.backend, row.database_choice, row.objective, row.scope_json, row.stack_json].filter(Boolean).join("\n"), { architecture: row.architecture, updatedAt: row.updated_at });
  }

  for (const row of db.prepare("select id, name, type, content, updated_at from system_files where user_id = ?").all(userId) as any[]) {
    addDocument(docs, "system_file", row.id, row.name, [row.type, row.content].filter(Boolean).join("\n"), { type: row.type, updatedAt: row.updated_at });
  }

  for (const row of db.prepare(
    `select messages.id, conversations.id as conversation_id, conversations.title, messages.role, messages.content, messages.created_at
     from messages
     join conversations on conversations.id = messages.conversation_id
     where conversations.user_id = ? and length(trim(messages.content)) > 8
     order by datetime(messages.created_at) desc
     limit 700`
  ).all(userId) as any[]) {
    addDocument(docs, "conversation", row.id, `${row.title} · ${row.role === "user" ? "Usuário" : "YARA"}`, row.content, { conversationId: row.conversation_id, role: row.role, updatedAt: row.created_at });
  }

  return docs;
}

function upsertSource(userId: string, source: SourceDocument) {
  const db = getDatabase();
  const searchText = [source.title, source.content, JSON.stringify(source.metadata || {})].join("\n");
  const contentHash = hashContent(searchText);
  const existing = db
    .prepare("select id, content_hash from vector_search_index where user_id = ? and source_type = ? and source_id = ?")
    .get(userId, source.sourceType, source.sourceId) as { id: string; content_hash: string } | undefined;
  if (existing?.content_hash === contentHash) return { status: "skipped", id: existing.id };

  const id = existing?.id || uuid();
  const embedding = JSON.stringify(createMemoryEmbedding(searchText));
  db.prepare(
    `insert into vector_search_index (
       id, user_id, source_type, source_id, title, content, search_text, embedding_json, content_hash, metadata_json, indexed_at, updated_at
     ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp, current_timestamp)
     on conflict(user_id, source_type, source_id) do update set
       title = excluded.title,
       content = excluded.content,
       search_text = excluded.search_text,
       embedding_json = excluded.embedding_json,
       content_hash = excluded.content_hash,
       metadata_json = excluded.metadata_json,
       updated_at = current_timestamp`
  ).run(id, userId, source.sourceType, source.sourceId, source.title, source.content, searchText, embedding, contentHash, JSON.stringify(source.metadata || {}));
  return { status: existing ? "updated" : "inserted", id };
}

export function reindexSemanticSearch(userId: string) {
  const docs = collectSourceDocuments(userId);
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const seen = new Set<string>();
  for (const source of docs) {
    seen.add(`${source.sourceType}:${source.sourceId}`);
    const result = upsertSource(userId, source);
    if (result.status === "inserted") inserted += 1;
    else if (result.status === "updated") updated += 1;
    else skipped += 1;
  }

  const rows = getDatabase()
    .prepare("select id, source_type, source_id from vector_search_index where user_id = ?")
    .all(userId) as Array<{ id: string; source_type: string; source_id: string }>;
  const staleIds = rows.filter((row) => !seen.has(`${row.source_type}:${row.source_id}`)).map((row) => row.id);
  if (staleIds.length) {
    getDatabase()
      .prepare(`delete from vector_search_index where user_id = ? and id in (${staleIds.map(() => "?").join(",")})`)
      .run(userId, ...staleIds);
  }
  clearUserCache(userId);
  const result = { indexed: docs.length, inserted, updated, skipped, removed: staleIds.length };
  audit(userId, "reindex", "Índice vetorial reconstruído.", result);
  return result;
}

function publicResult(row: IndexRow, score: number, semanticScore: number, lexical: number, context: number): SemanticResult {
  return {
    id: row.id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    snippet: truncate(row.content, 360),
    score: Number(score.toFixed(4)),
    semanticScore: Number(semanticScore.toFixed(4)),
    lexicalScore: Number(lexical.toFixed(4)),
    contextScore: Number(context.toFixed(4)),
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    updatedAt: row.updated_at
  };
}

export function semanticSearch(userId: string, input: { query: string; limit?: number; mode?: SearchMode; sourceTypes?: string[] }): SemanticSearchResponse {
  const query = truncate(clean(input.query), 500);
  if (query.length < 2) throw new Error("Informe uma busca mais específica.");
  const limit = Math.min(30, Math.max(1, Number(input.limit || 10)));
  const mode: SearchMode = input.mode || "hybrid";
  const sourceTypes = (input.sourceTypes || []).map((item) => normalizeText(item)).filter(Boolean);
  const cacheKey = `semantic:${userId}:${hashContent(JSON.stringify({ query, limit, mode, sourceTypes }))}`;
  const cached = cacheGet<SemanticSearchResponse>(cacheKey);
  if (cached) return cached;

  const db = getDatabase();
  const count = db.prepare("select count(*) as total from vector_search_index where user_id = ?").get(userId) as { total: number };
  if (!count.total) reindexSemanticSearch(userId);

  const rows = db
    .prepare(
      `select * from vector_search_index
       where user_id = ?
       order by datetime(updated_at) desc
       limit 1200`
    )
    .all(userId) as IndexRow[];
  const queryVector = createMemoryEmbedding(query);
  const queryTerms = terms(query);
  const filtered = sourceTypes.length ? rows.filter((row) => sourceTypes.includes(row.source_type)) : rows;
  const scored = filtered
    .map((row) => {
      const semanticScore = cosineSimilarity(queryVector, parseVector(row.embedding_json));
      const lexical = lexicalScore(queryTerms, row.search_text);
      const context = contextScore(queryTerms, row);
      const score = mode === "semantic"
        ? semanticScore * 0.88 + context
        : mode === "context"
          ? semanticScore * 0.48 + lexical * 0.24 + context * 1.2
          : semanticScore * 0.62 + lexical * 0.28 + context;
      return { row, score: Math.min(1, score), semanticScore, lexical, context };
    })
    .filter((item) => item.score >= 0.12 || item.lexical > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => publicResult(item.row, item.score, item.semanticScore, item.lexical, item.context));

  const result: SemanticSearchResponse = {
    query,
    mode,
    results: scored,
    topScore: scored[0]?.score || 0,
    provider: env.databaseUrl.startsWith("postgres") || env.postgresUrl ? "pgvector-ready" : "sqlite-local-vector",
    cache: "miss"
  };
  db.prepare(
    `insert into semantic_search_history (id, user_id, query, mode, status, results_json, top_score)
     values (?, ?, ?, ?, 'completed', ?, ?)`
  ).run(uuid(), userId, query, mode, JSON.stringify(scored), result.topScore);
  audit(userId, "semantic_search", "Busca semântica executada.", { query, mode, results: scored.length, topScore: result.topScore });
  cacheSet<SemanticSearchResponse>(cacheKey, { ...result, cache: "hit" });
  return result;
}

export function getSemanticSearchDashboard(userId: string) {
  const db = getDatabase();
  const total = (sql: string, ...params: unknown[]) => (db.prepare(sql).get(...params as any[]) as { total: number }).total;
  const sourceTypes = db
    .prepare(
      `select source_type as type, count(*) as total
       from vector_search_index
       where user_id = ?
       group by source_type
       order by total desc`
    )
    .all(userId);
  const recent = db
    .prepare(
      `select id, query, mode, status, results_json, top_score, created_at
       from semantic_search_history
       where user_id = ?
       order by datetime(created_at) desc
       limit 12`
    )
    .all(userId) as any[];
  const onlineRecent = db
    .prepare(
      `select id, query, provider, status, created_at
       from search_history
       where user_id = ?
       order by datetime(created_at) desc
       limit 8`
    )
    .all(userId);
  const topRows = db
    .prepare(
      `select title, source_type, updated_at
       from vector_search_index
       where user_id = ?
       order by datetime(updated_at) desc
       limit 8`
    )
    .all(userId);
  return {
    status: {
      database: env.databaseUrl.startsWith("postgres") ? "postgres" : "sqlite",
      pgvector: env.databaseUrl.startsWith("postgres") || Boolean(env.postgresUrl) ? "configured" : "prepared",
      embeddingProvider: env.memoryEmbeddingProvider === "local" ? "local-hash" : env.memoryEmbeddingProvider,
      cache: env.redisUrl ? "redis-ready" : "in-memory",
      cacheEntries: searchCache.size
    },
    totals: {
      indexedItems: total("select count(*) as total from vector_search_index where user_id = ?", userId),
      embeddings: total("select count(*) as total from vector_search_index where user_id = ? and embedding_json <> ''", userId),
      semanticSearches: total("select count(*) as total from semantic_search_history where user_id = ?", userId),
      sourceTypes: sourceTypes.length
    },
    sourceTypes,
    recentSearches: recent.map((row) => ({
      id: row.id,
      query: row.query,
      mode: row.mode,
      status: row.status,
      topScore: row.top_score,
      resultCount: parseJson<unknown[]>(row.results_json, []).length,
      createdAt: row.created_at
    })),
    onlineSearches: onlineRecent,
    recentIndexed: topRows
  };
}

export function readSemanticSearchContext(userId: string, query: string) {
  const result = semanticSearch(userId, { query, limit: 6, mode: "context" });
  if (!result.results.length) return "";
  return [
    "Contexto recuperado por busca vetorial/híbrida:",
    ...result.results.map((item: SemanticResult, index: number) => `${index + 1}. [${item.sourceType} · relevância ${Math.round(item.score * 100)}%] ${item.title}: ${item.snippet}`)
  ].join("\n");
}

export function answerSemanticSearchQuestion(userId: string, message: string) {
  if (!/(onde falamos|onde falei|qual conversa|conversa.*relacionad|projetos?.*relaç|o que eu ja falei|o que eu já falei|falamos sobre|busca inteligente|busque no meu contexto|procure no meu contexto)/i.test(message)) {
    return null;
  }
  const result = semanticSearch(userId, { query: message, limit: 8, mode: "hybrid" });
  if (!result.results.length) {
    return "Ainda não encontrei registros relacionados no seu contexto. Posso indexar novas conversas, memórias, projetos e arquivos conforme você usa a YARA.";
  }
  return [
    "Encontrei estes registros mais relevantes no seu contexto:",
    ...result.results.slice(0, 6).map((item: SemanticResult, index: number) => `${index + 1}. ${item.title} (${item.sourceType}) — relevância ${Math.round(item.score * 100)}%\n${item.snippet}`),
    "",
    "A busca combinou similaridade semântica, termos do texto e contexto recente."
  ].join("\n");
}

export function indexConversationMessageForSearch(userId: string, input: { messageId: string; conversationId: string; role: string; content: string }) {
  const title = getDatabase()
    .prepare("select title from conversations where id = ? and user_id = ?")
    .get(input.conversationId, userId) as { title: string } | undefined;
  upsertSource(userId, {
    sourceType: "conversation",
    sourceId: input.messageId,
    title: `${title?.title || "Conversa"} · ${input.role === "user" ? "Usuário" : "YARA"}`,
    content: input.content,
    metadata: { conversationId: input.conversationId, role: input.role }
  });
  clearUserCache(userId);
}
