import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  getExecutionArtifacts,
  getExecutionJob,
  getExecutionLogs,
  retryRealExecution,
  startRealExecution,
  stopRealExecution,
  supportedExecutionCommands
} from "../services/realExecutionService";
import { sendError } from "../utils/http";

export const executionRoutes = Router();

executionRoutes.use(authRequired);

const commandSchema = z.enum(supportedExecutionCommands as [string, ...string[]]);

executionRoutes.post("/execution/start", async (req, res) => {
  const parsed = z
    .object({
      systemId: z.string().min(1),
      executionSessionId: z.string().min(1).nullable().optional(),
      commands: z.array(commandSchema).min(1).max(8).optional()
    })
    .safeParse(req.body || {});
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para iniciar execução real.");

  try {
    const result = await startRealExecution(req.user!.id, {
      systemId: parsed.data.systemId,
      executionSessionId: parsed.data.executionSessionId || null,
      commands: parsed.data.commands as any
    });
    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Execução real falhou.");
  }
});

executionRoutes.post("/execution/stop", (req, res) => {
  const parsed = z.object({ jobId: z.string().min(1) }).safeParse(req.body || {});
  if (!parsed.success) return sendError(res, 400, "Informe a execução que deve ser parada.");
  try {
    return res.json(stopRealExecution(req.user!.id, parsed.data.jobId));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Execução não encontrada.");
  }
});

executionRoutes.get("/execution/status/:id", (req, res) => {
  try {
    return res.json(getExecutionJob(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Execução não encontrada.");
  }
});

executionRoutes.get("/execution/logs/:id", (req, res) => {
  try {
    return res.json(getExecutionLogs(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Logs de execução não encontrados.");
  }
});

executionRoutes.get("/execution/artifacts/:id", (req, res) => {
  try {
    return res.json(getExecutionArtifacts(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Artefatos de execução não encontrados.");
  }
});

executionRoutes.post("/execution/retry", async (req, res) => {
  const parsed = z
    .object({
      jobId: z.string().min(1),
      executionSessionId: z.string().min(1).nullable().optional()
    })
    .safeParse(req.body || {});
  if (!parsed.success) return sendError(res, 400, "Informe a execução que deve ser repetida.");
  try {
    return res.status(201).json(await retryRealExecution(req.user!.id, parsed.data.jobId, { executionSessionId: parsed.data.executionSessionId || null }));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível repetir a execução.");
  }
});
