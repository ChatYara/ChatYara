import { env } from "../config/env";
import { Router } from "express";
import { checkDatabase } from "../db/connection";
import { adminRequired, authRequired } from "../middleware/auth";
import { testAIConnection } from "../services/ai/aiService";
import { sendError } from "../utils/http";

export const systemRoutes = Router();

systemRoutes.get("/status", (_req, res) => {
  return res.json({
    ai: true,
    provider: env.aiProvider,
    openai: env.aiProvider === "openai",
    gemini: env.aiProvider === "gemini",
    database: checkDatabase(),
    api: true
  });
});

systemRoutes.post("/test-openai", authRequired, adminRequired, async (_req, res) => {
  try {
    const result = await testAIConnection();
    return res.json({
      success: true,
      provider: result.provider,
      model: result.model,
      response: result.response
    });
  } catch {
    return sendError(res, 502, "Nao foi possivel validar a conexao com o provedor de IA. Verifique a chave no .env do servidor.");
  }
});
