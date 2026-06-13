import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/http";

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return sendError(res, 401, "Sessao invalida. Faca login novamente.");
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
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

