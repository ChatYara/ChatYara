import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import { parseMultipartUpload } from "../services/uploadService";
import { uploadFile } from "../services/fileService";
import {
  createTechnicalProject,
  deleteTechnicalProject,
  exportTechnicalProject,
  getTechnicalDashboard,
  getTechnicalProject,
  getTechnicalProjectFiles,
  inspectTechnicalProject,
  linkTechnicalProjectFile,
  listTechnicalProjectExports,
  listTechnicalChatHistory,
  listTechnicalProjects,
  sendTechnicalChatMessage,
  updateTechnicalProject
} from "../services/technicalProjectService";
import { refreshKnowledgeGraphSoon } from "../services/graphService";
import { sendError } from "../utils/http";

export const technicalProjectRoutes = Router();

technicalProjectRoutes.use(authRequired);

const projectSchema = z.object({
  title: z.string().min(2).max(140).optional(),
  description: z.string().min(2).max(8000),
  projectType: z.string().min(2).max(80).optional(),
  discipline: z.string().min(2).max(80).optional(),
  location: z.string().max(180).nullable().optional(),
  metadata: z.record(z.unknown()).optional()
});

const updateProjectSchema = projectSchema.partial().extend({
  status: z.string().min(2).max(40).optional()
});

const inspectSchema = z.object({
  title: z.string().min(2).max(140).optional(),
  observations: z.string().min(2).max(8000),
  fileIds: z.array(z.string().min(1)).max(10).optional()
});

const exportSchema = z.object({
  format: z.enum(["txt", "pdf", "docx", "dxf", "dwg", "ifc"]).default("txt")
});

const chatSchema = z.object({
  message: z.string().min(1).max(8000),
  sessionId: z.string().min(1).optional(),
  projectId: z.string().min(1).nullable().optional(),
  fileIds: z.array(z.string().min(1)).max(10).optional()
});

technicalProjectRoutes.get("/technical-projects/dashboard", (req, res) => {
  return res.json({ dashboard: getTechnicalDashboard(req.user!.id) });
});

technicalProjectRoutes.post("/technical-projects", (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe dados válidos para o projeto técnico.");
  try {
    const data = createTechnicalProject(req.user!.id, parsed.data);
    recordAudit({
      userId: req.user!.id,
      category: "technical-projects",
      action: "create",
      entityType: "technical_project",
      entityId: data.project.id,
      message: "Projeto técnico criado.",
      ...requestAuditContext(req)
    });
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json(data);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar projeto técnico.");
  }
});

technicalProjectRoutes.get("/technical-projects", (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  return res.json({
    projects: listTechnicalProjects(req.user!.id, { query, status }),
    dashboard: getTechnicalDashboard(req.user!.id)
  });
});

technicalProjectRoutes.post("/technical-projects/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Mensagem técnica inválida.");
  try {
    const data = await sendTechnicalChatMessage(req.user!.id, parsed.data);
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.json(data);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível processar o Chat Técnico.");
  }
});

technicalProjectRoutes.get("/technical-projects/chat/history", (req, res) => {
  return res.json(listTechnicalChatHistory(req.user!.id));
});

technicalProjectRoutes.get("/technical-projects/:id", (req, res) => {
  try {
    return res.json(getTechnicalProject(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto técnico não encontrado.");
  }
});

technicalProjectRoutes.put("/technical-projects/:id", (req, res) => {
  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para atualização.");
  try {
    const data = updateTechnicalProject(req.user!.id, req.params.id, parsed.data);
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.json(data);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto técnico não encontrado.");
  }
});

technicalProjectRoutes.delete("/technical-projects/:id", (req, res) => {
  try {
    const data = deleteTechnicalProject(req.user!.id, req.params.id);
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.json({ project: data });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto técnico não encontrado.");
  }
});

technicalProjectRoutes.post("/technical-projects/:id/export", async (req, res) => {
  const parsed = exportSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Formato inválido para exportação.");
  try {
    const data = await exportTechnicalProject(req.user!.id, req.params.id, parsed.data.format);
    recordAudit({
      userId: req.user!.id,
      category: "technical-projects",
      action: "export",
      entityType: "technical_project",
      entityId: req.params.id,
      message: "Projeto técnico exportado.",
      metadata: { format: parsed.data.format, fileId: data.file.id },
      ...requestAuditContext(req)
    });
    return res.status(201).json(data);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível exportar projeto técnico.");
  }
});

technicalProjectRoutes.get("/technical-projects/:id/exports", (req, res) => {
  try {
    return res.json({ exports: listTechnicalProjectExports(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto técnico não encontrado.");
  }
});

technicalProjectRoutes.post("/technical-projects/:id/inspect", (req, res) => {
  const parsed = inspectSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe observações válidas para inspeção.");
  try {
    const data = inspectTechnicalProject(req.user!.id, req.params.id, parsed.data);
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json(data);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível registrar inspeção.");
  }
});

technicalProjectRoutes.get("/technical-projects/:id/files", (req, res) => {
  try {
    return res.json({ files: getTechnicalProjectFiles(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto técnico não encontrado.");
  }
});

technicalProjectRoutes.post("/technical-projects/:id/files", async (req, res) => {
  try {
    const { fields, file } = await parseMultipartUpload(req);
    const saved = uploadFile(req.user!.id, {
      originalName: file.originalName,
      fileType: file.fileType,
      buffer: file.buffer
    });
    const linked = linkTechnicalProjectFile(req.user!.id, req.params.id, saved.id, fields.role || "input");
    refreshKnowledgeGraphSoon(req.user!.id);
    return res.status(201).json({ file: linked });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível anexar arquivo técnico.");
  }
});
