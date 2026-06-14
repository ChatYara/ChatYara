import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { listSearchHistory, runSearch } from "../services/searchService";
import { sendError } from "../utils/http";

export const searchRoutes = Router();

searchRoutes.use(authRequired);

searchRoutes.post("/search", (req, res) => {
  const parsed = z.object({ query: z.string().min(3) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Informe o que a YARA deve pesquisar.");
  }

  try {
    return res.json({ search: runSearch(req.user!.id, parsed.data.query) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível preparar a busca.");
  }
});

searchRoutes.get("/search/history", (req, res) => {
  return res.json({ history: listSearchHistory(req.user!.id) });
});
