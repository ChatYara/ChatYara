import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { bruteForceProtection } from "../middleware/security";
import { recordAudit, requestAuditContext } from "../services/auditService";
import {
  getUserById,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword
} from "../services/authService";
import { sendError } from "../utils/http";

export const authRoutes = Router();

const authSchema = z.object({
  identifier: z.string().email(),
  password: z.string().min(6)
});

function requestDevice(req: { headers: { "user-agent"?: string | string[] } }) {
  const userAgent = req.headers["user-agent"];
  return Array.isArray(userAgent) ? userAgent.join(" ") : userAgent;
}

authRoutes.post("/register", async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      password: z.string().min(6),
      confirmPassword: z.string().min(6)
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas nao conferem.",
      path: ["confirmPassword"]
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados de cadastro inválidos.");
  }

  try {
    const result = await registerUser({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.password,
        device: requestDevice(req)
      });
    recordAudit({
      userId: result.user.id,
      category: "auth",
      action: "register",
      entityType: "user",
      entityId: result.user.id,
      message: "Usuário cadastrado.",
      ...requestAuditContext(req)
    });
    return res.status(201).json(result);
  } catch (error) {
    recordAudit({
      userId: null,
      category: "auth",
      action: "register",
      status: "failed",
      message: error instanceof Error ? error.message : "Erro ao cadastrar.",
      ...requestAuditContext(req)
    });
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao cadastrar.");
  }
});

authRoutes.post("/login", bruteForceProtection, async (req, res) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "E-mail e senha são obrigatórios.");
  }

  try {
    const result = await loginUser({ ...parsed.data, device: requestDevice(req) });
    recordAudit({
      userId: result.user.id,
      category: "auth",
      action: "login",
      entityType: "user_session",
      entityId: result.sessionId,
      message: "Login realizado.",
      ...requestAuditContext(req)
    });
    return res.json(result);
  } catch (error) {
    recordAudit({
      userId: null,
      category: "auth",
      action: "login",
      status: "failed",
      message: error instanceof Error ? error.message : "Erro ao entrar.",
      metadata: { identifier: parsed.data.identifier },
      ...requestAuditContext(req)
    });
    return sendError(res, 401, error instanceof Error ? error.message : "Erro ao entrar.");
  }
});

authRoutes.get("/me", authRequired, (req, res) => {
  const user = getUserById(req.user!.id);
  return user ? res.json({ user }) : sendError(res, 404, "Usuário não encontrado.");
});

authRoutes.post("/forgot-password", async (req, res) => {
  const parsed = z.object({ identifier: z.string().email() }).safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Informe seu e-mail para recuperar a senha.");
  }

  return res.json(await requestPasswordReset(parsed.data));
});

authRoutes.post("/reset-password", async (req, res) => {
  const parsed = z
    .object({
      identifier: z.string().min(3),
      token: z.string().min(8),
      password: z.string().min(6),
      confirmPassword: z.string().min(6)
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas nao conferem.",
      path: ["confirmPassword"]
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados inválidos para redefinir senha.");
  }

  try {
    return res.json(
      await resetPassword({
        identifier: parsed.data.identifier,
        token: parsed.data.token,
        password: parsed.data.password
      })
    );
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao redefinir senha.");
  }
});
