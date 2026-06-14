import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { changeUserPassword, updateUserProfile } from "../services/authService";
import { sendError } from "../utils/http";

export const userRoutes = Router();

userRoutes.use(authRequired);

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
