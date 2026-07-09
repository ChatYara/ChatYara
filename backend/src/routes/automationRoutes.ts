import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  createAutomation,
  createAutomationFromChat,
  deleteAutomation,
  getAutomation,
  listAutomationExecutions,
  listAutomationHistory,
  listAutomationLogs,
  listAutomations,
  listAutomationWorkspace,
  processDueAutomations,
  runAutomation,
  setAutomationStatus,
  testAutomation,
  updateAutomation
} from "../services/automationService";
import { sendError } from "../utils/http";

export const automationRoutes = Router();

const actionSchema = z.object({
  type: z.string().optional(),
  actionType: z.string().optional(),
  config: z.record(z.unknown()).optional(),
  actionConfig: z.record(z.unknown()).optional()
});

const automationSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(2000).optional(),
  type: z.string().min(2).max(80).default("reminder"),
  triggerType: z.string().min(2).max(80).optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  scheduleExpression: z.enum(["once", "daily", "weekly", "monthly", "manual"]).optional().nullable(),
  nextRunAt: z.string().optional().nullable(),
  action: z.record(z.unknown()).optional(),
  actions: z.array(actionSchema).max(20).optional(),
  status: z.enum(["active", "paused", "completed", "failed", "disabled"]).optional()
});

const automationIdBodySchema = z.object({
  automationId: z.string().min(1)
});

const chatSchema = z.object({
  message: z.string().min(6).max(2000)
});

automationRoutes.use(authRequired);

automationRoutes.get("/automations", (req, res) => {
  return res.json({ automations: listAutomations(req.user!.id), dashboard: listAutomationWorkspace(req.user!.id).dashboard });
});

automationRoutes.get("/automations/workspace", (req, res) => {
  return res.json(listAutomationWorkspace(req.user!.id));
});

automationRoutes.post("/automations", (req, res) => {
  const parsed = automationSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para automação.");
  try {
    return res.status(201).json({ automation: createAutomation(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar automação.");
  }
});

automationRoutes.get("/automations/logs", (req, res) => {
  const automationId = typeof req.query.automationId === "string" ? req.query.automationId : undefined;
  return res.json({ logs: listAutomationLogs(req.user!.id, automationId) });
});

automationRoutes.get("/automations/history", (req, res) => {
  const automationId = typeof req.query.automationId === "string" ? req.query.automationId : undefined;
  return res.json({ history: listAutomationHistory(req.user!.id, automationId) });
});

automationRoutes.get("/automations/executions", (req, res) => {
  const automationId = typeof req.query.automationId === "string" ? req.query.automationId : undefined;
  return res.json({ executions: listAutomationExecutions(req.user!.id, automationId) });
});

automationRoutes.post("/automations/run", (req, res) => {
  const parsed = automationIdBodySchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe automationId.");
  try {
    return res.json(runAutomation(req.user!.id, parsed.data.automationId));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível executar automação.");
  }
});

automationRoutes.post("/automations/test", (req, res) => {
  const parsed = automationIdBodySchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe automationId.");
  try {
    return res.json(testAutomation(req.user!.id, parsed.data.automationId));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível testar automação.");
  }
});

automationRoutes.post("/automations/enable", (req, res) => {
  const parsed = automationIdBodySchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe automationId.");
  try {
    return res.json({ automation: setAutomationStatus(req.user!.id, parsed.data.automationId, "active") });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Automação não encontrada.");
  }
});

automationRoutes.post("/automations/disable", (req, res) => {
  const parsed = automationIdBodySchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe automationId.");
  try {
    return res.json({ automation: setAutomationStatus(req.user!.id, parsed.data.automationId, "paused") });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Automação não encontrada.");
  }
});

automationRoutes.post("/automations/chat", (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Descreva a automação em linguagem natural.");
  try {
    return res.status(201).json(createAutomationFromChat(req.user!.id, parsed.data.message));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar automação pelo chat.");
  }
});

automationRoutes.post("/automations/process-due", (_req, res) => {
  return res.json(processDueAutomations());
});

automationRoutes.get("/automations/:id", (req, res) => {
  try {
    return res.json({ automation: getAutomation(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Automação não encontrada.");
  }
});

automationRoutes.put("/automations/:id", (req, res) => {
  const parsed = automationSchema.partial().safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para atualizar automação.");
  try {
    return res.json({ automation: updateAutomation(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Automação não encontrada.");
  }
});

automationRoutes.patch("/automations/:id", (req, res) => {
  const parsed = automationSchema.partial().safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para atualizar automação.");
  try {
    return res.json({ automation: updateAutomation(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Automação não encontrada.");
  }
});

automationRoutes.delete("/automations/:id", (req, res) => {
  try {
    return res.json({ automation: deleteAutomation(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Automação não encontrada.");
  }
});

automationRoutes.post("/automations/:id/run", (req, res) => {
  try {
    return res.json(runAutomation(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível executar automação.");
  }
});
