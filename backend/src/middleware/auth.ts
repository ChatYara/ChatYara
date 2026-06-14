import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { touchSession } from "../services/authService";
import { sendError } from "../utils/http";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  sid?: string;
};

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return sendError(res, 401, "Sessao invalida. Faca login novamente.");
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (payload.sid && !touchSession(payload.sub, payload.sid)) {
      return sendError(res, 401, "Sessao encerrada. Faca login novamente.");
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sid
    };
    return next();
  } catch {
    return sendError(res, 401, "Sessao expirada. Faca login novamente.");
  }
}

export function adminRequired(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return sendError(res, 403, "Acesso administrativo necessario.");
  }

  return next();
}
