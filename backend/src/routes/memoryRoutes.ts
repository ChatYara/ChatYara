import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  createMemory,
  deleteIntelligentMemory,
  getMemoryDashboard,
  getMemorySystemStatus,
  listIntelligentMemories,
  searchMemories,
  updateIntelligentMemory
} from "../services/memoryService";
import { refreshKnowledgeGraphSoon } from "../services/graphService";
import { sendError } from "../utils/http";

export const memoryRoutes = Router();

memoryRoutes.use(authRequired);

const memorySchema = z.object({
  title: z.string().min(2).optional(),
  category: z.string().min(2).max(40).optional(),
  importance: z.number().min(1).max(5).optional(),
  content: z.string().min(2),
  projectId: z.string().min(1).nullable().optional(),
  conversationId: z.string().min(1).nullable().optional(),
  pinned: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional()
});

memoryRoutes.get("/memory", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  return res.json({
    memories: listIntelligentMemories(req.user!.id, { category, limit }),
    dashboard: getMemoryDashboard(req.user!.id)
  });
});

memoryRoutes.get("/memory/search", (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query : "";
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 8;
  if (query.trim().length < 2) return sendError(res, 400, "Informe uma busca para a memória.");
  return res.json({ results: searchMemories(req.user!.id, query, limit) });
});

memoryRoutes.get("/memory/status", (req, res) => {
  return res.json({ status: getMemorySystemStatus() });
});

memoryRoutes.post("/memory", (req, res) => {
  const parsed = memorySchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Memória inválida.");
  try {
    const memory = createMemory(req.user!.id, parsed.data);
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json({ memory });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar memória.");
  }
});

memoryRoutes.put("/memory/:id", (req, res) => {
  const parsed = memorySchema.partial().safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Memória inválida.");
  try {
    return res.json({ memory: updateIntelligentMemory(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Memória não encontrada.");
  }
});

memoryRoutes.delete("/memory/:id", (req, res) => {
  try {
    return res.json({ memory: deleteIntelligentMemory(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Memória não encontrada.");
  }
});
