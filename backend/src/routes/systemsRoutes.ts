import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import { createAndDeploySystem, redeploySystemIfDeployed } from "../services/deployService";
import { runRealExecutionPipeline } from "../services/realExecutionService";
import {
  cancelExecutionSession,
  createExecutionSession,
  failExecutionSession,
  finishExecutionSession,
  getExecutionSession,
  listExecutionEvents,
  listExecutionsForConversation,
  listExecutionsForSystem,
  streamExecutionEvents,
  updateExecutionSession
} from "../services/systemExecutionService";
import {
  deleteSystem,
  duplicateSystem,
  exportSystem,
  generateSystemFromPrompt,
  getSystemChatHistory,
  getSystemDetails,
  listSystemChatHistory,
  listSystems,
  publishSystem,
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

systemsRoutes.post("/systems/executions", (req, res) => {
  const parsed = z
    .object({
      systemId: z.string().min(1).nullable().optional(),
      conversationId: z.string().min(1).nullable().optional(),
      operationType: z.string().min(2).max(80).default("system_chat")
    })
    .safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para iniciar atividade.");
  try {
    const session = createExecutionSession(req.user!.id, parsed.data);
    return res.status(201).json({ session });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível iniciar a atividade.");
  }
});

systemsRoutes.get("/systems/executions", (req, res) => {
  const conversationId = typeof req.query.conversationId === "string" ? req.query.conversationId : "";
  if (!conversationId) return sendError(res, 400, "Informe a conversa.");
  try {
    return res.json(listExecutionsForConversation(req.user!.id, conversationId));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Histórico de atividade não encontrado.");
  }
});

systemsRoutes.get("/systems/executions/:sessionId/stream", (req, res) => {
  try {
    const lastEventId = typeof req.headers["last-event-id"] === "string"
      ? req.headers["last-event-id"]
      : typeof req.query.lastEventId === "string"
        ? req.query.lastEventId
        : undefined;
    return streamExecutionEvents(req.user!.id, req.params.sessionId, res, lastEventId);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Stream de atividade não encontrado.");
  }
});

systemsRoutes.get("/systems/executions/:sessionId", (req, res) => {
  try {
    return res.json(getExecutionSession(req.user!.id, req.params.sessionId));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Sessão de atividade não encontrada.");
  }
});

systemsRoutes.get("/systems/executions/:sessionId/events", (req, res) => {
  try {
    return res.json(listExecutionEvents(req.user!.id, req.params.sessionId));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Eventos de atividade não encontrados.");
  }
});

systemsRoutes.post("/systems/executions/:sessionId/cancel", (req, res) => {
  try {
    return res.json({ session: cancelExecutionSession(req.user!.id, req.params.sessionId) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível cancelar a atividade.");
  }
});

systemsRoutes.post("/systems/chat", async (req, res) => {
  const parsed = z
    .object({
      message: z.string().min(2).max(4000),
      sessionId: z.string().min(1).optional(),
      systemId: z.string().min(1).nullable().optional(),
      executionSessionId: z.string().min(1).nullable().optional()
    })
    .safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Mensagem inválida para o Chat de Sistemas.");

  let executionSession: { id: string } | null = null;
  try {
    executionSession = parsed.data.executionSessionId
      ? updateExecutionSession(req.user!.id, parsed.data.executionSessionId, {
          systemId: parsed.data.systemId || null,
          conversationId: parsed.data.sessionId || null,
          status: "running"
        })
      : createExecutionSession(req.user!.id, {
          systemId: parsed.data.systemId || null,
          conversationId: parsed.data.sessionId || null,
          operationType: parsed.data.systemId ? "system_update" : "system_create"
        });
    const result = await sendSystemChatMessage(req.user!.id, { ...parsed.data, executionSessionId: executionSession.id });
    const realExecution = result.system?.id && !result.file
      ? await runRealExecutionPipeline(req.user!.id, result.system.id, { executionSessionId: executionSession.id, operationType: parsed.data.systemId ? "system_update" : "system_create" })
      : null;
    const deploy = result.system?.id && realExecution ? redeploySystemIfDeployed(req.user!.id, result.system.id, { executionSessionId: executionSession.id }) : null;
    const finalExecutionSession = finishExecutionSession(req.user!.id, executionSession.id, "completed");
    recordAudit({
      userId: req.user!.id,
      category: "systems",
      action: "chat",
      entityType: "system",
      entityId: result.system?.id || parsed.data.systemId || null,
      message: "Chat de Sistemas processado.",
      metadata: { sessionId: result.session.id, fileId: result.file?.id || null, redeployed: Boolean(deploy), executionSessionId: executionSession.id, realExecutionJobId: realExecution?.job.id || null },
      ...requestAuditContext(req)
    });
    return res.json({ ...result, deploy, realExecution, executionSession: finalExecutionSession });
  } catch (error) {
    if (executionSession?.id) failExecutionSession(req.user!.id, executionSession.id, error);
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível processar o Chat de Sistemas.");
  }
});

systemsRoutes.get("/systems/:id/executions", (req, res) => {
  try {
    getSystemDetails(req.user!.id, req.params.id);
    return res.json(listExecutionsForSystem(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Histórico de execução não encontrado.");
  }
});

systemsRoutes.get("/systems/:id", (req, res) => {
  try {
    return res.json({ system: getSystemDetails(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Sistema não encontrado.");
  }
});

systemsRoutes.get("/systems/:id/chat/history", (req, res) => {
  try {
    return res.json(getSystemChatHistory(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Histórico do sistema não encontrado.");
  }
});

systemsRoutes.post("/systems/:id/publish", async (req, res) => {
  const parsed = z.object({ executionSessionId: z.string().min(1).nullable().optional() }).safeParse(req.body || {});
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para publicar.");
  let executionSession: { id: string } | null = null;
  try {
    executionSession = parsed.data.executionSessionId
      ? updateExecutionSession(req.user!.id, parsed.data.executionSessionId, { systemId: req.params.id, status: "running" })
      : createExecutionSession(req.user!.id, { systemId: req.params.id, operationType: "system_publish" });
    const realExecution = await runRealExecutionPipeline(req.user!.id, req.params.id, { executionSessionId: executionSession.id, operationType: "system_publish" });
    const system = publishSystem(req.user!.id, req.params.id);
    const deploy = createAndDeploySystem(req.user!.id, req.params.id, { executionSessionId: executionSession.id });
    const finalExecutionSession = finishExecutionSession(req.user!.id, executionSession.id, "completed");
    recordAudit({
      userId: req.user!.id,
      category: "systems",
      action: "publish",
      entityType: "system",
      entityId: req.params.id,
      message: "Sistema publicado e hospedado.",
      metadata: { deployProjectId: deploy.project.id, executionSessionId: executionSession.id, realExecutionJobId: realExecution.job.id },
      ...requestAuditContext(req)
    });
    return res.json({ system, deploy, realExecution, executionSession: finalExecutionSession });
  } catch (error) {
    if (executionSession?.id) failExecutionSession(req.user!.id, executionSession.id, error);
    return sendError(res, 400, error instanceof Error ? error.message : "Sistema não encontrado.");
  }
});

systemsRoutes.post("/systems/:id/duplicate", (req, res) => {
  try {
    const system = duplicateSystem(req.user!.id, req.params.id);
    recordAudit({
      userId: req.user!.id,
      category: "systems",
      action: "duplicate",
      entityType: "system",
      entityId: system.id,
      message: "Sistema duplicado.",
      metadata: { sourceSystemId: req.params.id },
      ...requestAuditContext(req)
    });
    return res.status(201).json({ system });
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
