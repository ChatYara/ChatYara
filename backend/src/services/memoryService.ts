import crypto from "node:crypto";
import type { SQLInputValue } from "node:sqlite";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";

const EMBEDDING_MODEL = "yara-local-embedding-v1";
const EMBEDDING_PROVIDER = env.memoryEmbeddingProvider === "local" ? "local-hash" : env.memoryEmbeddingProvider;
const EMBEDDING_DIMENSION = Number.isFinite(env.memoryEmbeddingDimensions) && env.memoryEmbeddingDimensions > 16
  ? Math.min(384, Math.max(32, env.memoryEmbeddingDimensions))
  : 96;
const CACHE_TTL_MS = 5 * 60 * 1000;

type MemoryRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  importance: number;
  content: string;
  embedding_json: string | null;
  source: string;
  project_id: string | null;
  conversation_id: string | null;
  pinned: number;
  metadata_json: string;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
};

type MemoryInput = {
  title?: string;
  category?: string;
  importance?: number;
  content: string;
  source?: string;
  projectId?: string | null;
  conversationId?: string | null;
  pinned?: boolean;
  metadata?: Record<string, unknown>;
};

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string) {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry || entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet<T>(key: string, value: T) {
  memoryCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function clearUserCache(userId: string) {
  for (const key of memoryCache.keys()) {
    if (key.includes(`:${userId}:`)) memoryCache.delete(key);
  }
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value: string, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function clampImportance(value?: number) {
  if (!Number.isFinite(value)) return 3;
  return Math.min(5, Math.max(1, Math.round(Number(value))));
}

function hashIndex(token: string, seed: string) {
  const digest = crypto.createHash("sha256").update(`${seed}:${token}`).digest();
  return digest.readUInt32BE(0) % EMBEDDING_DIMENSION;
}

export function createMemoryEmbedding(content: string) {
  const vector = Array.from({ length: EMBEDDING_DIMENSION }, () => 0);
  const tokens = normalizeText(content).split(" ").filter((token) => token.length > 1);
  for (const token of tokens) {
    vector[hashIndex(token, "word")] += 1;
    if (token.length > 4) vector[hashIndex(token.slice(0, 4), "stem")] += 0.7;
  }
  for (let index = 0; index < tokens.length - 1; index += 1) {
    vector[hashIndex(`${tokens[index]} ${tokens[index + 1]}`, "bigram")] += 0.45;
  }
  const norm = Math.sqrt(vector.reduce((sum, item) => sum + item * item, 0)) || 1;
  return vector.map((item) => Number((item / norm).toFixed(6)));
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

function contentHash(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function parseVector(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function toPublicMemory(row: MemoryRow, score?: number) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    importance: row.importance,
    content: row.content,
    source: row.source,
    projectId: row.project_id,
    conversationId: row.conversation_id,
    pinned: Boolean(row.pinned),
    metadata: safeJson(row.metadata_json, {}),
    score,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function safeJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function audit(userId: string, memoryId: string | null, action: string, message: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into memory_audit_logs (id, user_id, memory_id, action, message, metadata_json)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, memoryId, action, message, JSON.stringify(metadata));
}

function saveEmbedding(userId: string, memoryId: string, content: string) {
  const embedding = createMemoryEmbedding(content);
  const embeddingJson = JSON.stringify(embedding);
  const hash = contentHash(content);
  getDatabase()
    .prepare(
      `insert into memory_embeddings (id, memory_id, user_id, provider, model, dimension, embedding_json, content_hash, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
       on conflict(memory_id, provider, model) do update set
         dimension = excluded.dimension,
         embedding_json = excluded.embedding_json,
         content_hash = excluded.content_hash,
         updated_at = current_timestamp`
    )
    .run(uuid(), memoryId, userId, EMBEDDING_PROVIDER, EMBEDDING_MODEL, EMBEDDING_DIMENSION, embeddingJson, hash);
  getDatabase().prepare("update memories set embedding_json = ?, updated_at = current_timestamp where id = ? and user_id = ?").run(embeddingJson, memoryId, userId);
  return embedding;
}

function linkRelatedMemories(userId: string, memoryId: string, embedding: number[]) {
  const candidates = getDatabase()
    .prepare(
      `select id, embedding_json
       from memories
       where user_id = ? and id <> ? and embedding_json is not null
       order by updated_at desc
       limit 80`
    )
    .all(userId, memoryId) as Array<{ id: string; embedding_json: string }>;

  for (const candidate of candidates) {
    const score = cosineSimilarity(embedding, parseVector(candidate.embedding_json));
    if (score < 0.72) continue;
    getDatabase()
      .prepare(
        `insert into memory_relations (id, user_id, source_memory_id, target_memory_id, relation_type, weight, metadata_json, updated_at)
         values (?, ?, ?, ?, 'semantic_similarity', ?, ?, current_timestamp)`
      )
      .run(uuid(), userId, memoryId, candidate.id, Number(score.toFixed(4)), JSON.stringify({ model: EMBEDDING_MODEL }));
  }
}

function linkProjectRelations(userId: string, memoryId: string, content: string) {
  const normalized = normalizeText(content);
  const projects = getDatabase()
    .prepare("select id, name from projects where user_id = ? order by updated_at desc limit 50")
    .all(userId) as Array<{ id: string; name: string }>;
  for (const project of projects) {
    if (!project.name || !normalized.includes(normalizeText(project.name))) continue;
    getDatabase()
      .prepare(
        `insert into memory_relations (id, user_id, source_memory_id, target_memory_id, target_type, relation_type, weight, metadata_json)
         values (?, ?, ?, null, 'project', 'mentions_project', 0.9, ?)`
      )
      .run(uuid(), userId, memoryId, JSON.stringify({ projectId: project.id, projectName: project.name }));
  }
}

export function createMemory(userId: string, input: MemoryInput) {
  const content = cleanText(input.content);
  if (content.length < 2) throw new Error("Memória inválida.");
  const id = uuid();
  const title = cleanText(input.title || content.slice(0, 54), "Memória");
  const category = cleanText(input.category || "general", "general").slice(0, 40);
  const importance = clampImportance(input.importance);
  const source = cleanText(input.source || "manual", "manual").slice(0, 40);
  getDatabase()
    .prepare(
      `insert into memories (
         id, user_id, title, category, importance, content, source, project_id, conversation_id,
         pinned, metadata_json, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(
      id,
      userId,
      title,
      category,
      importance,
      content,
      source,
      input.projectId || null,
      input.conversationId || null,
      input.pinned ? 1 : 0,
      JSON.stringify(input.metadata || {})
    );
  const embedding = saveEmbedding(userId, id, `${title}\n${category}\n${content}`);
  linkRelatedMemories(userId, id, embedding);
  linkProjectRelations(userId, id, content);
  audit(userId, id, "create", "Memória criada.", { category, source });
  clearUserCache(userId);
  return getMemory(userId, id);
}

export function updateIntelligentMemory(userId: string, memoryId: string, input: Partial<MemoryInput>) {
  const current = getMemoryRow(userId, memoryId);
  if (!current) throw new Error("Memória não encontrada.");
  const title = cleanText(input.title || current.title, "Memória");
  const category = cleanText(input.category || current.category, "general").slice(0, 40);
  const importance = clampImportance(input.importance ?? current.importance);
  const content = cleanText(input.content || current.content);
  const pinned = input.pinned === undefined ? current.pinned : input.pinned ? 1 : 0;
  const metadata = input.metadata || safeJson(current.metadata_json, {});

  getDatabase()
    .prepare(
      `update memories
       set title = ?, category = ?, importance = ?, content = ?, pinned = ?, metadata_json = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(title, category, importance, content, pinned, JSON.stringify(metadata), memoryId, userId);
  const embedding = saveEmbedding(userId, memoryId, `${title}\n${category}\n${content}`);
  linkRelatedMemories(userId, memoryId, embedding);
  audit(userId, memoryId, "update", "Memória atualizada.", { category });
  clearUserCache(userId);
  return getMemory(userId, memoryId);
}

export function deleteIntelligentMemory(userId: string, memoryId: string) {
  const current = getMemoryRow(userId, memoryId);
  if (!current) throw new Error("Memória não encontrada.");
  audit(userId, memoryId, "delete", "Memória removida.", { title: current.title, category: current.category });
  const result = getDatabase().prepare("delete from memories where id = ? and user_id = ?").run(memoryId, userId);
  if (result.changes === 0) throw new Error("Memória não encontrada.");
  clearUserCache(userId);
  return { id: memoryId };
}

function getMemoryRow(userId: string, memoryId: string) {
  return getDatabase()
    .prepare("select * from memories where id = ? and user_id = ?")
    .get(memoryId, userId) as MemoryRow | undefined;
}

export function getMemory(userId: string, memoryId: string) {
  const row = getMemoryRow(userId, memoryId);
  if (!row) throw new Error("Memória não encontrada.");
  return toPublicMemory(row);
}

export function listIntelligentMemories(userId: string, filters: { category?: string; limit?: number } = {}) {
  const limit = Math.min(100, Math.max(1, Number(filters.limit || 50)));
  const rows = filters.category
    ? getDatabase()
        .prepare(
          `select * from memories
           where user_id = ? and category = ?
           order by pinned desc, importance desc, updated_at desc
           limit ?`
        )
        .all(userId, filters.category, limit)
    : getDatabase()
        .prepare(
          `select * from memories
           where user_id = ?
           order by pinned desc, importance desc, updated_at desc
           limit ?`
        )
        .all(userId, limit);
  return (rows as MemoryRow[]).map((row) => toPublicMemory(row));
}

export function searchMemories(userId: string, query: string, limit = 8) {
  const normalized = cleanText(query);
  if (normalized.length < 2) return [];
  const cacheKey = `memory-search:${userId}:${contentHash(`${normalized}:${limit}`)}`;
  const cached = cacheGet<ReturnType<typeof toPublicMemory>[]>(cacheKey);
  if (cached) return cached;

  const queryEmbedding = createMemoryEmbedding(normalized);
  const rows = getDatabase()
    .prepare(
      `select * from memories
       where user_id = ?
       order by pinned desc, importance desc, updated_at desc
       limit 250`
    )
    .all(userId) as MemoryRow[];

  const terms = normalizeText(normalized).split(" ").filter(Boolean);
  const scored = rows
    .map((row) => {
      const vector = parseVector(row.embedding_json);
      const semantic = vector.length ? cosineSimilarity(queryEmbedding, vector) : 0;
      const haystack = normalizeText(`${row.title} ${row.category} ${row.content}`);
      const lexical = terms.length ? terms.filter((term) => haystack.includes(term)).length / terms.length : 0;
      const importanceBoost = Number(row.importance || 3) * 0.025 + (row.pinned ? 0.08 : 0);
      const score = Number(Math.min(1, semantic * 0.76 + lexical * 0.2 + importanceBoost).toFixed(4));
      return { row, score };
    })
    .filter((item) => item.score >= 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(20, Math.max(1, limit)))
    .map((item) => toPublicMemory(item.row, item.score));

  if (scored.length > 0) {
    const ids = scored.map((memory) => memory.id);
    const placeholders = ids.map(() => "?").join(", ");
    getDatabase().prepare(`update memories set last_accessed_at = current_timestamp where user_id = ? and id in (${placeholders})`).run(userId, ...ids);
  }
  cacheSet(cacheKey, scored);
  return scored;
}

export function getMemoryDashboard(userId: string) {
  const count = (sql: string, ...params: SQLInputValue[]) =>
    (getDatabase().prepare(sql).get(...params) as { total: number }).total;
  const categories = getDatabase()
    .prepare(
      `select category, count(*) as total
       from memories
       where user_id = ?
       group by category
       order by total desc, category asc`
    )
    .all(userId);
  const latest = listIntelligentMemories(userId, { limit: 8 });
  const relations = getDatabase()
    .prepare(
      `select relation_type, count(*) as total
       from memory_relations
       where user_id = ?
       group by relation_type
       order by total desc`
    )
    .all(userId);
  const storageBytes = count("select coalesce(sum(length(content) + length(coalesce(embedding_json, ''))), 0) as total from memories where user_id = ?", userId);
  return {
    totals: {
      memories: count("select count(*) as total from memories where user_id = ?", userId),
      embeddings: count("select count(*) as total from memory_embeddings where user_id = ?", userId),
      relations: count("select count(*) as total from memory_relations where user_id = ?", userId),
      sessions: count("select count(*) as total from memory_sessions where user_id = ?", userId),
      summaries: count("select count(*) as total from memory_summaries where user_id = ?", userId),
      storageBytes
    },
    categories,
    relations,
    latest,
    system: getMemorySystemStatus()
  };
}

export function getMemorySystemStatus() {
  return {
    database: env.databaseUrl.startsWith("postgres") ? "postgres" : "sqlite",
    postgres: {
      configured: Boolean(env.postgresUrl || env.databaseUrl.startsWith("postgres")),
      pgvector: Boolean(env.postgresUrl || env.databaseUrl.startsWith("postgres")),
      status: env.postgresUrl || env.databaseUrl.startsWith("postgres") ? "configured" : "prepared"
    },
    embeddings: {
      provider: EMBEDDING_PROVIDER,
      model: EMBEDDING_MODEL,
      dimension: EMBEDDING_DIMENSION
    },
    redis: {
      configured: Boolean(env.redisUrl),
      status: env.redisUrl ? "configured" : "local-cache"
    },
    cache: {
      mode: env.redisUrl ? "redis-ready" : "in-memory",
      entries: memoryCache.size
    }
  };
}

export function readIntelligentMemoryContext(userId: string, query: string, conversationId?: string) {
  const semantic = searchMemories(userId, query, 6);
  const summaries = conversationId
    ? getDatabase()
        .prepare(
          `select summary from memory_summaries
           where user_id = ? and conversation_id = ?
           order by updated_at desc
           limit 2`
        )
        .all(userId, conversationId) as Array<{ summary: string }>
    : [];
  const parts = [
    semantic.length
      ? ["Memórias relevantes encontradas por busca semântica:", ...semantic.map((memory) => `- [${memory.category}/importância ${memory.importance}] ${memory.title}: ${memory.content}`)].join("\n")
      : "",
    summaries.length ? ["Resumos recentes da conversa:", ...summaries.map((item) => `- ${item.summary}`)].join("\n") : ""
  ].filter(Boolean);
  return parts.join("\n\n");
}

export function captureEpisodicMemoryFromMessage(userId: string, conversationId: string, message: string) {
  const text = cleanText(message);
  if (text.length < 16) return null;
  const shouldRemember = /\b(decidimos|decis[aã]o|pend[eê]ncia|fase\s+\d|congelad[ao]|aguardando|roadmap|commit|deploy|render|credenciais|objetivo|marco)\b/i.test(text);
  if (!shouldRemember) return null;
  return createMemory(userId, {
    title: "Evento importante",
    category: "episodic",
    importance: 4,
    content: text.slice(0, 800),
    source: "chat",
    conversationId,
    metadata: { capturedBy: "episodic-rule" }
  });
}

export function updateConversationMemorySession(userId: string, conversationId: string, userMessage: string, assistantResponse: string) {
  const db = getDatabase();
  const sessionId = uuid();
  const recentContext = [
    { role: "user", content: cleanText(userMessage).slice(0, 600) },
    { role: "assistant", content: cleanText(assistantResponse).slice(0, 800) }
  ];
  const tokenEstimate = Math.ceil((userMessage.length + assistantResponse.length) / 4);
  db.prepare(
    `insert into memory_sessions (id, user_id, conversation_id, recent_context_json, token_estimate, last_message_at, updated_at)
     values (?, ?, ?, ?, ?, current_timestamp, current_timestamp)
     on conflict(user_id, conversation_id) do update set
       recent_context_json = excluded.recent_context_json,
       token_estimate = memory_sessions.token_estimate + excluded.token_estimate,
       last_message_at = current_timestamp,
       updated_at = current_timestamp`
  ).run(sessionId, userId, conversationId, JSON.stringify(recentContext), tokenEstimate);

  const messageCount = (db.prepare("select count(*) as total from messages where conversation_id = ?").get(conversationId) as { total: number }).total;
  if (messageCount < 24 || messageCount % 12 !== 0) return;
  const rows = db
    .prepare("select role, content from messages where conversation_id = ? order by created_at desc limit 16")
    .all(conversationId) as Array<{ role: string; content: string }>;
  const summary = rows
    .reverse()
    .map((row) => `${row.role === "user" ? "Usuário" : "YARA"}: ${cleanText(row.content).slice(0, 180)}`)
    .join(" | ")
    .slice(0, 1600);
  db.prepare(
    `insert into memory_summaries (id, user_id, conversation_id, summary, message_count, importance, updated_at)
     values (?, ?, ?, ?, ?, 3, current_timestamp)`
  ).run(uuid(), userId, conversationId, summary, messageCount);
  audit(userId, null, "summarize_conversation", "Resumo de conversa longa criado.", { conversationId, messageCount });
  clearUserCache(userId);
}
