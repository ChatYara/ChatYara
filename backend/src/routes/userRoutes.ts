import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  changeUserPassword,
  getUserById,
  listUserSessions,
  revokeOtherSessions,
  updateUserProfile
} from "../services/authService";
import { getSettings } from "../services/workspaceService";
import { recordAudit, requestAuditContext } from "../services/auditService";
import { sendError } from "../utils/http";

export const userRoutes = Router();

userRoutes.use(authRequired);

userRoutes.get("/users/profile", (req, res) => {
  const user = getUserById(req.user!.id);
  if (!user) {
    return sendError(res, 404, "Usuário não encontrado.");
  }

  return res.json({
    user,
    settings: getSettings(req.user!.id)
  });
});

userRoutes.patch("/users/profile", (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional().nullable()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados de perfil inválidos.");
  }

  try {
    return res.json({ user: updateUserProfile(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao atualizar perfil.");
  }
});

userRoutes.get("/users/sessions", (req, res) => {
  return res.json({
    sessions: listUserSessions(req.user!.id).map((session) => ({
      ...(session as object),
      current: (session as { id: string }).id === req.user!.sessionId
    }))
  });
});

userRoutes.post("/users/logout-all", (req, res) => {
  const result = revokeOtherSessions(req.user!.id, req.user!.sessionId);
  recordAudit({
    userId: req.user!.id,
    category: "auth",
    action: "logout_all",
    entityType: "user_session",
    status: "success",
    message: "Outras sessões encerradas.",
    metadata: { revoked: result.revoked },
    ...requestAuditContext(req)
  });
  return res.json({
    message: result.revoked > 0 ? "Outras sessões encerradas com segurança." : "Nenhuma outra sessão ativa encontrada.",
    revoked: result.revoked
  });
});

userRoutes.patch("/users/password", async (req, res) => {
  const parsed = z
    .object({
      currentPassword: z.string().min(6),
      newPassword: z.string().min(6),
      confirmPassword: z.string().min(6)
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "As senhas nao conferem.",
      path: ["confirmPassword"]
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados inválidos para alterar a senha.");
  }

  try {
    return res.json(
      await changeUserPassword(req.user!.id, {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword
      })
    );
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao alterar senha.");
  }
});
