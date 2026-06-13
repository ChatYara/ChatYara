import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  addFavorite,
  generateSystem,
  listFavorites,
  listMemories,
  listProjects,
  saveMemory
} from "../services/workspaceService";
import { sendError } from "../utils/http";

export const workspaceRoutes = Router();

workspaceRoutes.use(authRequired);

workspaceRoutes.get("/favorites", (req, res) => {
  return res.json({ favorites: listFavorites(req.user!.id) });
});

workspaceRoutes.post("/favorites", (req, res) => {
  const parsed = z.object({ messageId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Mensagem invalida para favorito.");
  }
  return res.status(201).json({ favorite: addFavorite(req.user!.id, parsed.data.messageId) });
});

workspaceRoutes.get("/memories", (req, res) => {
  return res.json({ memories: listMemories(req.user!.id) });
});

workspaceRoutes.post("/memories", (req, res) => {
  const parsed = z.object({ title: z.string().min(2), content: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Memoria invalida.");
  }
  return res.status(201).json({ memory: saveMemory(req.user!.id, parsed.data) });
});

workspaceRoutes.get("/projects", (req, res) => {
  return res.json({ projects: listProjects(req.user!.id) });
});

workspaceRoutes.post("/generate-system", async (req, res) => {
  const parsed = z
    .object({
      type: z.enum(["Criar Web App", "Criar API REST", "Criar Dashboard", "Criar Banco de Dados", "Criar Mobile App"]),
      prompt: z.string().min(8)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Informe o tipo de sistema e um briefing mais detalhado.");
  }

  try {
    return res.status(201).json({ project: await generateSystem(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao gerar sistema.");
  }
});

