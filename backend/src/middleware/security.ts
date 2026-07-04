import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/http";
import { recordAudit, requestAuditContext } from "../services/auditService";
import { structuredLog } from "../services/loggerService";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const loginFailures = new Map<string, { count: number; lockedUntil: number; resetAt: number }>();

function clientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || req.socket.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function cleanup(now = Date.now()) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
  for (const [key, item] of loginFailures.entries()) {
    if (item.resetAt < now && item.lockedUntil < now) loginFailures.delete(key);
  }
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
}

export function rateLimit(options: { windowMs: number; max: number; keyPrefix: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    cleanup(now);
    const key = `${options.keyPrefix}:${clientIp(req)}:${req.path}`;
    const bucket = buckets.get(key) || { count: 0, resetAt: now + options.windowMs };
    if (bucket.resetAt < now) {
      bucket.count = 0;
      bucket.resetAt = now + options.windowMs;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    res.setHeader("X-RateLimit-Limit", String(options.max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, options.max - bucket.count)));
    if (bucket.count > options.max) {
      structuredLog("security", "rate-limit", "Rate limit aplicado.", { path: req.path, ip: clientIp(req) });
      return sendError(res, 429, "Muitas requisições. Tente novamente em instantes.");
    }
    return next();
  };
}

export function bruteForceProtection(req: Request, res: Response, next: NextFunction) {
  const identifier = String(req.body?.identifier || req.body?.email || "").toLowerCase().trim();
  const key = `${clientIp(req)}:${identifier || "unknown"}`;
  const current = loginFailures.get(key);
  if (current && current.lockedUntil > Date.now()) {
    recordAudit({
      userId: null,
      category: "security",
      action: "login_blocked",
      status: "failed",
      message: "Tentativa de login bloqueada por proteção brute force.",
      metadata: { identifier },
      ...requestAuditContext(req)
    });
    return sendError(res, 429, "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.");
  }
  res.once("finish", () => {
    if (req.path !== "/login") return;
    const now = Date.now();
    if (res.statusCode >= 400) {
      const item = loginFailures.get(key) || { count: 0, lockedUntil: 0, resetAt: now + 15 * 60_000 };
      item.count += 1;
      item.resetAt = now + 15 * 60_000;
      if (item.count >= 5) item.lockedUntil = now + 10 * 60_000;
      loginFailures.set(key, item);
    } else {
      loginFailures.delete(key);
    }
  });
  return next();
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  if (!req.path.startsWith("/api/")) return next();
  if (req.path.startsWith("/api/auth/")) return next();
  if (req.path.includes("/webhook")) return next();
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        structuredLog("security", "csrf", "Origem bloqueada.", { originHost, host, path: req.path });
        return sendError(res, 403, "Origem não autorizada.");
      }
    } catch {
      return sendError(res, 403, "Origem inválida.");
    }
  }
  return next();
}
