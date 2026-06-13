import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  addFavorite,
  createProject,
  deleteMemory,
  deleteProject,
  generateSystem,
  getProject,
  getSettings,
  listFavorites,
  listMemories,
  listProjects,
  saveMemory,
  updateSettings
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
  const parsed = z.object({ title: z.string().min(2).optional(), content: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Memória inválida.");
  }
  return res.status(201).json({ memory: saveMemory(req.user!.id, parsed.data) });
});

workspaceRoutes.delete("/memories/:id", (req, res) => {
  try {
    return res.json({ memory: deleteMemory(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Memória não encontrada.");
  }
});

workspaceRoutes.get("/projects", (req, res) => {
  return res.json({ projects: listProjects(req.user!.id) });
});

workspaceRoutes.post("/projects", (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(2),
      description: z.string().optional(),
      content: z.string().optional(),
      type: z.string().optional(),
      prompt: z.string().optional()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Informe um nome para o projeto.");
  }

  return res.status(201).json({ project: createProject(req.user!.id, parsed.data) });
});

workspaceRoutes.get("/projects/:id", (req, res) => {
  try {
    return res.json({ project: getProject(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.delete("/projects/:id", (req, res) => {
  try {
    return res.json({ project: deleteProject(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.post("/generator", async (req, res) => {
  const parsed = z
    .object({
      type: z.string().min(2).optional(),
      prompt: z.string().min(8)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Descreva melhor o sistema que a YARA deve criar.");
  }

  try {
    return res.status(201).json({ project: await generateSystem(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao gerar sistema.");
  }
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

workspaceRoutes.get("/settings", (req, res) => {
  return res.json({ settings: getSettings(req.user!.id) });
});

workspaceRoutes.patch("/settings", (req, res) => {
  const parsed = z
    .object({
      displayName: z.string().min(1).optional(),
      theme: z.string().min(1).optional(),
      aiStyle: z.string().min(1).optional()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Configurações inválidas.");
  }

  return res.json({ settings: updateSettings(req.user!.id, parsed.data) });
});
