import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import {
  agentDashboard,
  collaborateAgents,
  createAgent,
  deleteAgent,
  getAgent,
  listAgentChatHistory,
  listAgents,
  routeAgent,
  sendAgentChat,
  updateAgent
} from "../services/agentService";
import { sendError } from "../utils/http";

export const agentRoutes = Router();

agentRoutes.use(authRequired);

const agentSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().min(2).max(500),
  specialty: z.string().min(2).max(80),
  basePrompt: z.string().min(4).max(2000),
  status: z.enum(["active", "inactive"]).optional(),
  settings: z.record(z.unknown()).optional()
});

agentRoutes.get("/agents", (req, res) => {
  return res.json(listAgents(req.user!.id));
});

agentRoutes.get("/agents/dashboard", (req, res) => {
  return res.json({ dashboard: agentDashboard(req.user!.id) });
});

agentRoutes.get("/agents/chat/history", (req, res) => {
  const agentId = typeof req.query.agentId === "string" ? req.query.agentId : undefined;
  const conversationId = typeof req.query.conversationId === "string" ? req.query.conversationId : undefined;
  try {
    return res.json(listAgentChatHistory(req.user!.id, agentId, conversationId));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Histórico não encontrado.");
  }
});

agentRoutes.post("/agents/chat", (req, res) => {
  const parsed = z.object({
    message: z.string().min(2).max(4000),
    agentId: z.string().min(1).optional(),
    conversationId: z.string().min(1).optional()
  }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Mensagem inválida para agente.");
  try {
    const result = sendAgentChat(req.user!.id, parsed.data);
    recordAudit({
      userId: req.user!.id,
      category: "agents",
      action: "chat",
      entityType: "agent",
      entityId: result.agent.id,
      message: "Chat de agente processado.",
      metadata: { conversationId: result.conversation.id },
      ...requestAuditContext(req)
    });
    return res.json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível processar agente.");
  }
});

agentRoutes.post("/agents/route", (req, res) => {
  const parsed = z.object({ message: z.string().min(2).max(4000) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe a mensagem para roteamento.");
  try {
    return res.json(routeAgent(req.user!.id, parsed.data.message));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível rotear agente.");
  }
});

agentRoutes.post("/agents/collaborate", (req, res) => {
  const parsed = z.object({
    sourceAgentId: z.string().min(1),
    targetAgentId: z.string().min(1),
    request: z.string().min(2).max(4000),
    conversationId: z.string().min(1).optional()
  }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para colaboração.");
  try {
    return res.status(201).json(collaborateAgents(req.user!.id, parsed.data));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível colaborar entre agentes.");
  }
});

agentRoutes.post("/agents", (req, res) => {
  const parsed = agentSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para criar agente.");
  try {
    const agent = createAgent(req.user!.id, parsed.data);
    return res.status(201).json({ agent });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar agente.");
  }
});

agentRoutes.get("/agents/:id", (req, res) => {
  try {
    return res.json(getAgent(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Agente não encontrado.");
  }
});

agentRoutes.put("/agents/:id", (req, res) => {
  const parsed = agentSchema.partial().safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para atualizar agente.");
  try {
    return res.json({ agent: updateAgent(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Agente não encontrado.");
  }
});

agentRoutes.delete("/agents/:id", (req, res) => {
  try {
    return res.json({ agent: deleteAgent(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Agente não encontrado.");
  }
});
