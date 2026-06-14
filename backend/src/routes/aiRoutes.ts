import { Router } from "express";
import { env } from "../config/env";
import { authRequired } from "../middleware/auth";
import { testAIConnection } from "../services/ai/aiService";
import { sendError } from "../utils/http";

export const aiRoutes = Router();

aiRoutes.use(authRequired);

aiRoutes.get("/ai/status", (_req, res) => {
  return res.json({
    provider: env.aiProvider,
    model: env.aiProvider === "gemini" ? env.geminiModel : env.openaiModel,
    online: true,
    api: true
  });
});

aiRoutes.post("/ai/test", async (_req, res) => {
  try {
    const result = await testAIConnection();
    return res.json({
      success: true,
      provider: result.provider,
      model: result.model,
      response: result.response
    });
  } catch {
    return sendError(res, 502, "Não foi possível validar a conexão com a IA neste momento.");
  }
});
