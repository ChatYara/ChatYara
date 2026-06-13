import { Router } from "express";
import { checkDatabase } from "../db/connection";
import { adminRequired, authRequired } from "../middleware/auth";
import { testOpenAIConnection } from "../services/openaiService";
import { sendError } from "../utils/http";

export const systemRoutes = Router();

systemRoutes.get("/status", (_req, res) => {
  return res.json({
    openai: true,
    database: checkDatabase(),
    api: true
  });
});

systemRoutes.post("/test-openai", authRequired, adminRequired, async (_req, res) => {
  try {
    const result = await testOpenAIConnection();
    return res.json({
      success: true,
      model: result.model,
      response: result.response
    });
  } catch {
    return sendError(res, 502, "Nao foi possivel validar a conexao com a OpenAI. Verifique a chave no .env do servidor.");
  }
});

