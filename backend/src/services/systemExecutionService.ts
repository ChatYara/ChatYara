import { EventEmitter } from "node:events";
import type { Response } from "express";
import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

type ExecutionStatus = "pending" | "running" | "completed" | "warning" | "error" | "cancelled";
type ExecutionCategory =
  | "planning"
  | "agent"
  | "tool"
  | "command"
  | "file"
  | "database"
  | "test"
  | "build"
  | "deploy"
  | "validation"
  | "error"
  | "completion";

type ExecutionSessionRow = {
  id: string;
  user_id: string;
  system_id: string | null;
  conversation_id: string | null;
  operation_type: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

type ExecutionEventRow = {
  id: string;
  session_id: string;
  event_type: string;
  category: string;
  title: string;
  summary: string | null;
  details_json: string;
  status: string;
  progress: number;
  metadata_json: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

const emitter = new EventEmitter();
emitter.setMaxListeners(500);

const SENSITIVE_PATTERNS = [
  /OPENAI_API_KEY\s*=\s*[^\s]+/gi,
  /GEMINI_API_KEY\s*=\s*[^\s]+/gi,
  /JWT_SECRET\s*=\s*[^\s]+/gi,
  /DATABASE_URL\s*=\s*[^\s]+/gi,
  /Bearer\s+[A-Za-z0-9._-]+/g,
  /eyJ[A-Za-z0-9._-]+/g
];

function sanitizeText(value: unknown) {
  let text = String(value ?? "");
  for (const pattern of SENSITIVE_PATTERNS) text = text.replace(pattern, "[redigido]");
  return text.slice(0, 8000);
}

function sanitizeJson(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 200).map(sanitizeJson);
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (/secret|token|password|api[_-]?key|jwt|credential/i.test(key)) {
        output[key] = "[redigido]";
      } else {
        output[key] = sanitizeJson(item);
      }
    }
    return output;
  }
  return sanitizeText(value);
}

function jsonParse<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function publicSession(row: ExecutionSessionRow) {
  return {
    id: row.id,
    userId: row.user_id,
    systemId: row.system_id,
    conversationId: row.conversation_id,
    operationType: row.operation_type,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicEvent(row: ExecutionEventRow) {
  return {
    id: row.id,
    sessionId: row.session_id,
    eventType: row.event_type,
    category: row.category,
    title: row.title,
    summary: row.summary,
    details: jsonParse(row.details_json, null),
    status: row.status,
    progress: Number(row.progress || 0),
    metadata: jsonParse(row.metadata_json, {}),
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    createdAt: row.created_at
  };
}

function getSessionRow(userId: string, sessionId: string) {
  const row = getDatabase()
    .prepare("select * from system_execution_sessions where id = ? and user_id = ?")
    .get(sessionId, userId) as ExecutionSessionRow | undefined;
  if (!row) throw new Error("Sessão de execução não encontrada.");
  return row;
}

function emitSession(sessionId: string, payload: unknown) {
  emitter.emit(`session:${sessionId}`, payload);
}

export function createExecutionSession(
  userId: string,
  input: { systemId?: string | null; conversationId?: string | null; operationType: string }
) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into system_execution_sessions (
         id, user_id, system_id, conversation_id, operation_type, status, started_at
       ) values (?, ?, ?, ?, ?, 'running', current_timestamp)`
    )
    .run(id, userId, input.systemId || null, input.conversationId || null, input.operationType);
  const session = publicSession(getSessionRow(userId, id));
  emitSession(id, { type: "session", session });
  return session;
}

export function updateExecutionSession(
  userId: string,
  sessionId: string,
  input: { systemId?: string | null; conversationId?: string | null; status?: ExecutionStatus }
) {
  getSessionRow(userId, sessionId);
  const current = getSessionRow(userId, sessionId);
  getDatabase()
    .prepare(
      `update system_execution_sessions
       set system_id = ?, conversation_id = ?, status = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      input.systemId === undefined ? current.system_id : input.systemId,
      input.conversationId === undefined ? current.conversation_id : input.conversationId,
      input.status || current.status,
      sessionId,
      userId
    );
  const session = publicSession(getSessionRow(userId, sessionId));
  emitSession(sessionId, { type: "session", session });
  return session;
}

export function recordExecutionEvent(
  userId: string,
  sessionId: string | null | undefined,
  input: {
    eventType: string;
    category: ExecutionCategory;
    title: string;
    summary?: string | null;
    details?: unknown;
    status?: ExecutionStatus;
    progress?: number;
    metadata?: Record<string, unknown>;
    startedAt?: string | null;
    finishedAt?: string | null;
  }
) {
  if (!sessionId) return null;
  getSessionRow(userId, sessionId);
  const id = uuid();
  const status = input.status || "completed";
  getDatabase()
    .prepare(
      `insert into system_execution_events (
         id, session_id, event_type, category, title, summary, details_json,
         status, progress, metadata_json, started_at, finished_at
       ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      sessionId,
      input.eventType,
      input.category,
      sanitizeText(input.title),
      input.summary ? sanitizeText(input.summary) : null,
      JSON.stringify(sanitizeJson(input.details ?? null)),
      status,
      Math.max(0, Math.min(100, Number(input.progress || 0))),
      JSON.stringify(sanitizeJson(input.metadata || {})),
      input.startedAt || null,
      input.finishedAt || (status === "completed" || status === "error" || status === "warning" ? new Date().toISOString() : null)
    );
  getDatabase()
    .prepare("update system_execution_sessions set updated_at = current_timestamp where id = ? and user_id = ?")
    .run(sessionId, userId);
  const event = publicEvent(
    getDatabase().prepare("select * from system_execution_events where id = ?").get(id) as ExecutionEventRow
  );
  emitSession(sessionId, { type: "event", event });
  return event;
}

export function finishExecutionSession(userId: string, sessionId: string | null | undefined, status: ExecutionStatus = "completed") {
  if (!sessionId) return null;
  getSessionRow(userId, sessionId);
  getDatabase()
    .prepare(
      `update system_execution_sessions
       set status = ?, finished_at = current_timestamp, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(status, sessionId, userId);
  const session = publicSession(getSessionRow(userId, sessionId));
  emitSession(sessionId, { type: "session", session });
  emitSession(sessionId, { type: "done", session });
  return session;
}

export function failExecutionSession(userId: string, sessionId: string | null | undefined, error: unknown) {
  if (!sessionId) return null;
  const event = recordExecutionEvent(userId, sessionId, {
    eventType: "execution_failed",
    category: "error",
    title: "Execução falhou",
    summary: error instanceof Error ? error.message : "A execução encontrou uma falha.",
    status: "error",
    progress: 100
  });
  getDatabase()
    .prepare(
      `insert into system_execution_errors (id, session_id, event_id, message, stack, metadata_json)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      uuid(),
      sessionId,
      event?.id || null,
      sanitizeText(error instanceof Error ? error.message : String(error || "Erro desconhecido")),
      error instanceof Error ? sanitizeText(error.stack || "") : null,
      "{}"
    );
  return finishExecutionSession(userId, sessionId, "error");
}

export function cancelExecutionSession(userId: string, sessionId: string) {
  const session = getSessionRow(userId, sessionId);
  if (["completed", "error", "cancelled", "failed", "online", "rolled_back"].includes(session.status)) {
    throw new Error("Esta execução já foi encerrada e não pode ser cancelada.");
  }
  recordExecutionEvent(userId, sessionId, {
    eventType: "execution_cancelled",
    category: "completion",
    title: "Execução cancelada",
    summary: "O usuário solicitou a interrupção da atividade.",
    status: "cancelled",
    progress: 100
  });
  return finishExecutionSession(userId, sessionId, "cancelled");
}

export function getExecutionSession(userId: string, sessionId: string) {
  const session = publicSession(getSessionRow(userId, sessionId));
  return { session, events: listExecutionEvents(userId, sessionId).events };
}

export function listExecutionEvents(userId: string, sessionId: string, input: { afterId?: string } = {}) {
  getSessionRow(userId, sessionId);
  const rows = getDatabase()
    .prepare(
      `select * from system_execution_events
       where session_id = ?
       order by datetime(created_at) asc`
    )
    .all(sessionId) as ExecutionEventRow[];
  const startIndex = input.afterId ? rows.findIndex((row) => row.id === input.afterId) + 1 : 0;
  return { events: rows.slice(Math.max(0, startIndex)).map(publicEvent) };
}

export function listExecutionsForSystem(userId: string, systemId: string) {
  const rows = getDatabase()
    .prepare(
      `select * from system_execution_sessions
       where user_id = ? and system_id = ?
       order by datetime(created_at) desc
       limit 20`
    )
    .all(userId, systemId) as ExecutionSessionRow[];
  return { sessions: rows.map(publicSession) };
}

export function listExecutionsForConversation(userId: string, conversationId: string) {
  const rows = getDatabase()
    .prepare(
      `select * from system_execution_sessions
       where user_id = ? and conversation_id = ?
       order by datetime(created_at) desc
       limit 20`
    )
    .all(userId, conversationId) as ExecutionSessionRow[];
  return { sessions: rows.map(publicSession) };
}

export function streamExecutionEvents(userId: string, sessionId: string, res: Response, lastEventId?: string) {
  const session = publicSession(getSessionRow(userId, sessionId));
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });

  const send = (name: string, payload: unknown, id?: string) => {
    if (id) res.write(`id: ${id}\n`);
    res.write(`event: ${name}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  send("session", { session });
  for (const event of listExecutionEvents(userId, sessionId, { afterId: lastEventId }).events) {
    send("event", { event }, event.id);
  }

  const listener = (payload: any) => {
    if (payload.type === "event") send("event", { event: payload.event }, payload.event.id);
    if (payload.type === "session") send("session", { session: payload.session });
    if (payload.type === "done") send("done", { session: payload.session });
  };
  emitter.on(`session:${sessionId}`, listener);
  const heartbeat = setInterval(() => send("heartbeat", { at: new Date().toISOString() }), 15000);

  res.on("close", () => {
    clearInterval(heartbeat);
    emitter.off(`session:${sessionId}`, listener);
  });
}
