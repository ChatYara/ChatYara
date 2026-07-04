import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import {
  addProjectCommit,
  addProjectDecision,
  addProjectMilestone,
  addProjectPendingItem,
  createProjectMemory,
  deleteProjectMemory,
  ensureDefaultYaraProjectMemory,
  getProjectMemoryDetails,
  listProjectMemories,
  listProjectMemoryChildren,
  updateProjectMemory
} from "../services/projectMemoryService";
import { refreshKnowledgeGraphSoon } from "../services/graphService";
import { sendError } from "../utils/http";

export const projectMemoryRoutes = Router();

projectMemoryRoutes.use(authRequired);

const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.string().optional(),
  currentPillar: z.string().optional(),
  currentPhase: z.string().optional(),
  nextSteps: z.array(z.string().min(1)).max(20).optional()
});

const updateProjectSchema = projectSchema.partial().extend({
  description: z.string().nullable().optional(),
  currentPillar: z.string().nullable().optional(),
  currentPhase: z.string().nullable().optional()
});

function audit(req: any, action: string, entityId: string | null, message: string, metadata: Record<string, unknown> = {}) {
  recordAudit({
    userId: req.user!.id,
    category: "project_memory",
    action,
    entityType: "project_memory",
    entityId,
    message,
    metadata,
    ...requestAuditContext(req)
  });
}

projectMemoryRoutes.get("/projects-memory", (req, res) => {
  ensureDefaultYaraProjectMemory(req.user!.id);
  return res.json({ projects: listProjectMemories(req.user!.id) });
});

projectMemoryRoutes.post("/projects-memory", (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe dados válidos para o projeto inteligente.");

  try {
    const project = createProjectMemory(req.user!.id, parsed.data);
    audit(req, "create", project.id, "Projeto inteligente criado.");
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json({ project });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar projeto inteligente.");
  }
});

projectMemoryRoutes.get("/projects-memory/:id", (req, res) => {
  try {
    return res.json(getProjectMemoryDetails(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto inteligente não encontrado.");
  }
});

projectMemoryRoutes.put("/projects-memory/:id", (req, res) => {
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe dados válidos para atualizar o projeto inteligente.");

  try {
    const project = updateProjectMemory(req.user!.id, req.params.id, parsed.data);
    audit(req, "update", req.params.id, "Projeto inteligente atualizado.");
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.json({ project });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto inteligente não encontrado.");
  }
});

projectMemoryRoutes.delete("/projects-memory/:id", (req, res) => {
  try {
    const project = deleteProjectMemory(req.user!.id, req.params.id);
    audit(req, "delete", req.params.id, "Projeto inteligente excluído.");
    return res.json({ project });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto inteligente não encontrado.");
  }
});

projectMemoryRoutes.get("/projects-memory/:id/timeline", (req, res) => {
  try {
    return res.json({ timeline: listProjectMemoryChildren(req.user!.id, req.params.id, "project_timeline_events") });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Linha do tempo não encontrada.");
  }
});

projectMemoryRoutes.get("/projects-memory/:id/decisions", (req, res) => {
  try {
    return res.json({ decisions: listProjectMemoryChildren(req.user!.id, req.params.id, "project_decisions") });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Decisões não encontradas.");
  }
});

projectMemoryRoutes.get("/projects-memory/:id/milestones", (req, res) => {
  try {
    return res.json({ milestones: listProjectMemoryChildren(req.user!.id, req.params.id, "project_milestones") });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Marcos não encontrados.");
  }
});

projectMemoryRoutes.get("/projects-memory/:id/pending", (req, res) => {
  try {
    return res.json({ pending: listProjectMemoryChildren(req.user!.id, req.params.id, "project_pending_items") });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Pendências não encontradas.");
  }
});

projectMemoryRoutes.get("/projects-memory/:id/commits", (req, res) => {
  try {
    return res.json({ commits: listProjectMemoryChildren(req.user!.id, req.params.id, "project_commits") });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Commits não encontrados.");
  }
});

projectMemoryRoutes.post("/projects-memory/:id/decisions", (req, res) => {
  const parsed = z.object({ title: z.string().min(2), content: z.string().min(2), impact: z.string().optional(), source: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe uma decisão válida.");
  try {
    const decision = addProjectDecision(req.user!.id, req.params.id, parsed.data);
    audit(req, "decision_create", req.params.id, "Decisão registrada.", { decision });
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json({ decision });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível registrar decisão.");
  }
});

projectMemoryRoutes.post("/projects-memory/:id/milestones", (req, res) => {
  const parsed = z.object({ title: z.string().min(2), description: z.string().optional(), status: z.string().optional(), milestoneDate: z.string().nullable().optional() }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe um marco válido.");
  try {
    const milestone = addProjectMilestone(req.user!.id, req.params.id, parsed.data);
    audit(req, "milestone_create", req.params.id, "Marco registrado.", { milestone });
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json({ milestone });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível registrar marco.");
  }
});

projectMemoryRoutes.post("/projects-memory/:id/pending", (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      status: z.enum(["open", "done", "blocked"]).optional(),
      dueDate: z.string().nullable().optional()
    })
    .safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe uma pendência válida.");
  try {
    const pending = addProjectPendingItem(req.user!.id, req.params.id, parsed.data);
    audit(req, "pending_create", req.params.id, "Pendência registrada.", { pending });
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json({ pending });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível registrar pendência.");
  }
});

projectMemoryRoutes.post("/projects-memory/:id/commits", (req, res) => {
  const parsed = z.object({ hash: z.string().min(4), message: z.string().min(2), branch: z.string().optional(), committedAt: z.string().nullable().optional() }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe um commit válido.");
  try {
    const commit = addProjectCommit(req.user!.id, req.params.id, parsed.data);
    audit(req, "commit_create", req.params.id, "Commit registrado.", { commit });
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json({ commit });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível registrar commit.");
  }
});
