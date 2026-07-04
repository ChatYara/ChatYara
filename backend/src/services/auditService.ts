import type { Request } from "express";
import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { structuredLog } from "./loggerService";

export type AuditInput = {
  userId?: string | null;
  category: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  status?: "success" | "failed" | "warning";
  message?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function safeMetadata(metadata: Record<string, unknown> = {}) {
  const blocked = /token|secret|password|authorization|cookie|api[_-]?key|jwt/i;
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !blocked.test(key)));
}

export function requestAuditContext(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || req.socket.remoteAddress || "";
  const agent = req.headers["user-agent"];
  return {
    ipAddress: String(ip).split(",")[0].trim(),
    userAgent: Array.isArray(agent) ? agent.join(" ") : String(agent || "")
  };
}

export function recordAudit(input: AuditInput) {
  const metadata = safeMetadata(input.metadata);
  try {
    getDatabase()
      .prepare(
        `insert into audit_events (
           id, user_id, category, action, entity_type, entity_id, status, ip_address, user_agent, message, metadata_json
         )
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        uuid(),
        input.userId || null,
        input.category,
        input.action,
        input.entityType || null,
        input.entityId || null,
        input.status || "success",
        input.ipAddress || null,
        input.userAgent || null,
        input.message || null,
        JSON.stringify(metadata)
      );
  } catch (error) {
    structuredLog("warn", "audit", "Falha ao registrar auditoria.", {
      category: input.category,
      action: input.action,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export function listAuditEvents(filters: {
  userId?: string;
  category?: string;
  action?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, Number(filters.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize || 25)));
  const where: string[] = [];
  const params: Array<string | number | null> = [];
  if (filters.userId) {
    where.push("(user_id = ? or user_id is null)");
    params.push(filters.userId);
  }
  if (filters.category) {
    where.push("category = ?");
    params.push(filters.category);
  }
  if (filters.action) {
    where.push("action = ?");
    params.push(filters.action);
  }
  if (filters.query) {
    where.push("(message like ? or entity_type like ? or entity_id like ? or action like ?)");
    const term = `%${filters.query}%`;
    params.push(term, term, term, term);
  }
  const whereSql = where.length ? `where ${where.join(" and ")}` : "";
  const total = Number((getDatabase().prepare(`select count(*) as total from audit_events ${whereSql}`).get(...params) as { total: number }).total || 0);
  const rows = getDatabase()
    .prepare(
      `select id, user_id, category, action, entity_type, entity_id, status, ip_address, user_agent, message, metadata_json, created_at
       from audit_events
       ${whereSql}
       order by created_at desc
       limit ? offset ?`
    )
    .all(...params, pageSize, (page - 1) * pageSize) as Array<Record<string, unknown>>;
  return {
    events: rows.map((row) => ({
      ...row,
      metadata: JSON.parse(String(row.metadata_json || "{}"))
    })),
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) }
  };
}
