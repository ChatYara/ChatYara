import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import {
  deleteSystem,
  exportSystem,
  generateSystemFromPrompt,
  getSystemDetails,
  listSystemChatHistory,
  listSystems,
  sendSystemChatMessage
} from "../services/systemGeneratorService";
import { sendError } from "../utils/http";

export const systemsRoutes = Router();

systemsRoutes.use(authRequired);

systemsRoutes.post("/systems/generate", (req, res) => {
  const parsed = z.object({ prompt: z.string().min(8).max(4000) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Descreva melhor o sistema que a YARA deve criar.");

  try {
    const system = generateSystemFromPrompt(req.user!.id, parsed.data.prompt);
    recordAudit({
      userId: req.user!.id,
      category: "systems",
      action: "generate",
      entityType: "system",
      entityId: system.id,
      message: "Sistema inteligente gerado.",
      metadata: { architecture: system.architecture, type: system.type },
      ...requestAuditContext(req)
    });
    return res.status(201).json({ system });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível gerar o sistema.");
  }
});

systemsRoutes.get("/systems", (req, res) => {
  return res.json({ systems: listSystems(req.user!.id) });
});

systemsRoutes.get("/systems/chat/history", (req, res) => {
  return res.json(listSystemChatHistory(req.user!.id));
});

systemsRoutes.post("/systems/chat", async (req, res) => {
  const parsed = z
    .object({
      message: z.string().min(2).max(4000),
      sessionId: z.string().min(1).optional(),
      systemId: z.string().min(1).nullable().optional()
    })
    .safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Mensagem inválida para o Chat de Sistemas.");

  try {
    const result = await sendSystemChatMessage(req.user!.id, parsed.data);
    recordAudit({
      userId: req.user!.id,
      category: "systems",
      action: "chat",
      entityType: "system",
      entityId: result.system?.id || parsed.data.systemId || null,
      message: "Chat de Sistemas processado.",
      metadata: { sessionId: result.session.id, fileId: result.file?.id || null },
      ...requestAuditContext(req)
    });
    return res.json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível processar o Chat de Sistemas.");
  }
});

systemsRoutes.get("/systems/:id", (req, res) => {
  try {
    return res.json({ system: getSystemDetails(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Sistema não encontrado.");
  }
});

systemsRoutes.delete("/systems/:id", (req, res) => {
  try {
    const system = deleteSystem(req.user!.id, req.params.id);
    recordAudit({
      userId: req.user!.id,
      category: "systems",
      action: "delete",
      entityType: "system",
      entityId: req.params.id,
      message: "Sistema excluído.",
      ...requestAuditContext(req)
    });
    return res.json({ system });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Sistema não encontrado.");
  }
});

systemsRoutes.post("/systems/:id/export", async (req, res) => {
  const parsed = z.object({ format: z.enum(["txt", "pdf", "docx"]) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe um formato válido: txt, pdf ou docx.");

  try {
    const result = await exportSystem(req.user!.id, req.params.id, parsed.data.format);
    recordAudit({
      userId: req.user!.id,
      category: "systems",
      action: "export",
      entityType: "system",
      entityId: req.params.id,
      message: "Sistema exportado.",
      metadata: { format: parsed.data.format, fileId: result.file.id },
      ...requestAuditContext(req)
    });
    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível exportar o sistema.");
  }
});
