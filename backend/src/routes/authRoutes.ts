import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { getUserById, loginUser, registerUser } from "../services/authService";
import { sendError } from "../utils/http";

export const authRoutes = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRoutes.post("/register", async (req, res) => {
  const parsed = authSchema
    .extend({
      name: z.string().min(2)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados de cadastro invalidos.");
  }

  try {
    return res.status(201).json(await registerUser(parsed.data));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao cadastrar.");
  }
});

authRoutes.post("/login", async (req, res) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Email e senha sao obrigatorios.");
  }

  try {
    return res.json(await loginUser(parsed.data));
  } catch (error) {
    return sendError(res, 401, error instanceof Error ? error.message : "Erro ao entrar.");
  }
});

authRoutes.get("/me", authRequired, (req, res) => {
  const user = getUserById(req.user!.id);
  return user ? res.json({ user }) : sendError(res, 404, "Usuario nao encontrado.");
});

