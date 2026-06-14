import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  addFavorite,
  addProjectFile,
  createProject,
  createProjectNote,
  createProjectTask,
  deleteMemory,
  deleteAllMemories,
  deleteProject,
  deleteProjectNote,
  deleteProjectTask,
  generateSystem,
  getDashboard,
  getProject,
  getProjectDetails,
  getSettings,
  listFavorites,
  listMemories,
  listProjectFiles,
  listProjectNotes,
  listProjectTasks,
  listProjects,
  saveMemory,
  updateMemory,
  updateProjectNote,
  updateProjectTask,
  updateSettings
} from "../services/workspaceService";
import { sendError } from "../utils/http";

export const workspaceRoutes = Router();

workspaceRoutes.use(authRequired);

workspaceRoutes.get("/dashboard", (req, res) => {
  return res.json({ dashboard: getDashboard(req.user!.id) });
});

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

workspaceRoutes.patch("/memories/:id", (req, res) => {
  const parsed = z.object({ title: z.string().min(2).optional(), content: z.string().min(2).optional() }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Memória inválida.");
  }

  try {
    return res.json({ memory: updateMemory(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Memória não encontrada.");
  }
});

workspaceRoutes.delete("/memories/:id", (req, res) => {
  try {
    return res.json({ memory: deleteMemory(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Memória não encontrada.");
  }
});

workspaceRoutes.delete("/memories", (req, res) => {
  return res.json({ memories: deleteAllMemories(req.user!.id) });
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

workspaceRoutes.get("/projects/:id/details", (req, res) => {
  try {
    return res.json(getProjectDetails(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.get("/projects/:id/tasks", (req, res) => {
  try {
    return res.json({ tasks: listProjectTasks(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.post("/projects/:id/tasks", (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2),
      description: z.string().optional(),
      dueDate: z.string().optional().nullable()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Informe uma tarefa válida.");
  }

  try {
    return res.status(201).json({ task: createProjectTask(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.patch("/projects/:id/tasks/:taskId", (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      status: z.enum(["pending", "done"]).optional(),
      dueDate: z.string().optional().nullable()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Informe uma atualização válida para a tarefa.");
  }

  try {
    return res.json({ task: updateProjectTask(req.user!.id, req.params.id, req.params.taskId, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Tarefa não encontrada.");
  }
});

workspaceRoutes.delete("/projects/:id/tasks/:taskId", (req, res) => {
  try {
    return res.json({ task: deleteProjectTask(req.user!.id, req.params.id, req.params.taskId) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Tarefa não encontrada.");
  }
});

workspaceRoutes.get("/projects/:id/notes", (req, res) => {
  try {
    return res.json({ notes: listProjectNotes(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.post("/projects/:id/notes", (req, res) => {
  const parsed = z.object({ content: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Escreva uma nota válida.");
  }

  try {
    return res.status(201).json({ note: createProjectNote(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.patch("/projects/:id/notes/:noteId", (req, res) => {
  const parsed = z.object({ content: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Escreva uma nota válida.");
  }

  try {
    return res.json({ note: updateProjectNote(req.user!.id, req.params.id, req.params.noteId, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Nota não encontrada.");
  }
});

workspaceRoutes.delete("/projects/:id/notes/:noteId", (req, res) => {
  try {
    return res.json({ note: deleteProjectNote(req.user!.id, req.params.id, req.params.noteId) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Nota não encontrada.");
  }
});

workspaceRoutes.get("/projects/:id/files", (req, res) => {
  try {
    return res.json({ files: listProjectFiles(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto não encontrado.");
  }
});

workspaceRoutes.post("/projects/:id/files", (req, res) => {
  const parsed = z.object({ uploadId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Informe o arquivo para vincular.");
  }

  try {
    return res.status(201).json({ link: addProjectFile(req.user!.id, req.params.id, parsed.data.uploadId) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível vincular o arquivo.");
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
      fullName: z.string().optional(),
      avatarUrl: z.string().optional(),
      theme: z.string().min(1).optional(),
      aiStyle: z.string().min(1).optional(),
      language: z.string().min(2).optional(),
      responseLength: z.string().min(1).optional(),
      voiceEnabled: z.boolean().optional(),
      voiceLanguage: z.string().min(2).optional(),
      voiceRate: z.number().min(0.6).max(1.8).optional(),
      voicePitch: z.number().min(0.6).max(1.6).optional(),
      voiceGender: z.enum(["auto", "female", "male"]).optional(),
      voiceAutoRead: z.boolean().optional()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Configurações inválidas.");
  }

  return res.json({ settings: updateSettings(req.user!.id, parsed.data) });
});
