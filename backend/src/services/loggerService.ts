import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

type LogLevel = "info" | "warn" | "error" | "security";

function sanitizeContext(context: Record<string, unknown> = {}) {
  const blocked = /token|secret|password|authorization|cookie|api[_-]?key|jwt/i;
  return Object.fromEntries(
    Object.entries(context)
      .filter(([key]) => !blocked.test(key))
      .map(([key, value]) => [key, typeof value === "string" && value.length > 800 ? `${value.slice(0, 800)}...` : value])
  );
}

export function structuredLog(level: LogLevel, channel: string, message: string, context: Record<string, unknown> = {}) {
  const payload = sanitizeContext(context);
  const line = JSON.stringify({
    at: new Date().toISOString(),
    level,
    channel,
    message,
    ...payload
  });

  if (level === "error") console.error(line);
  else if (level === "warn" || level === "security") console.warn(line);
  else console.log(line);

  try {
    getDatabase()
      .prepare("insert into application_logs (id, level, channel, message, context_json) values (?, ?, ?, ?, ?)")
      .run(uuid(), level, channel, message, JSON.stringify(payload));
  } catch {
    // Logging must never break the request lifecycle.
  }
}

export function listApplicationLogs(filters: { level?: string; channel?: string; page?: number; pageSize?: number }) {
  const page = Math.max(1, Number(filters.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize || 25)));
  const where: string[] = [];
  const params: Array<string | number | null> = [];
  if (filters.level) {
    where.push("level = ?");
    params.push(filters.level);
  }
  if (filters.channel) {
    where.push("channel = ?");
    params.push(filters.channel);
  }
  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const total = Number((getDatabase().prepare(`select count(*) as total from application_logs ${whereSql}`).get(...params) as { total: number }).total || 0);
  const rows = getDatabase()
    .prepare(
      `select id, level, channel, message, context_json, created_at
       from application_logs
       ${whereSql}
       order by created_at desc
       limit ? offset ?`
    )
    .all(...params, pageSize, (page - 1) * pageSize) as Array<Record<string, unknown>>;
  return {
    logs: rows.map((row) => ({
      ...row,
      context: JSON.parse(String(row.context_json || "{}"))
    })),
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) }
  };
}
