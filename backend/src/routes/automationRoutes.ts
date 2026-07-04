import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  createAutomation,
  deleteAutomation,
  listAutomationExecutions,
  listAutomations,
  processDueAutomations,
  runAutomation,
  updateAutomation
} from "../services/automationService";
import { sendError } from "../utils/http";

export const automationRoutes = Router();

const automationSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["reminder", "recurring_task", "daily_summary", "auto_report", "scheduled_check"]).default("reminder"),
  triggerType: z.string().optional(),
  scheduleExpression: z.enum(["once", "daily", "weekly", "monthly", "manual"]).optional().nullable(),
  nextRunAt: z.string().optional().nullable(),
  action: z.record(z.unknown()).optional(),
  status: z.enum(["active", "paused", "completed"]).optional()
});

automationRoutes.use(authRequired);

automationRoutes.get("/automations", (req, res) => {
  return res.json({ automations: listAutomations(req.user!.id) });
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

automationRoutes.get("/automations/executions", (req, res) => {
  const automationId = typeof req.query.automationId === "string" ? req.query.automationId : undefined;
  return res.json({ executions: listAutomationExecutions(req.user!.id, automationId) });
});

automationRoutes.post("/automations/:id/run", (req, res) => {
  try {
    return res.json(runAutomation(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível executar automação.");
  }
});

automationRoutes.post("/automations/process-due", (_req, res) => {
  return res.json(processDueAutomations());
});
