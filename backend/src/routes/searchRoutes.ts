import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { getSearchHistoryItem, listSearchHistory, runSearch } from "../services/searchService";
import {
  getSemanticSearchDashboard,
  reindexSemanticSearch,
  semanticSearch
} from "../services/semanticSearchService";
import { sendError } from "../utils/http";

export const searchRoutes = Router();

searchRoutes.use(authRequired);

searchRoutes.get("/search", (req, res) => {
  return res.json({ dashboard: getSemanticSearchDashboard(req.user!.id) });
});

searchRoutes.post("/search", async (req, res) => {
  const parsed = z.object({ query: z.string().min(3).max(500) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Informe o que a YARA deve pesquisar.");
  }

  try {
    return res.json({ search: await runSearch(req.user!.id, parsed.data.query) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível preparar a busca.");
  }
});

searchRoutes.post("/search/semantic", (req, res) => {
  const parsed = z
    .object({
      query: z.string().min(2).max(500),
      limit: z.number().int().min(1).max(30).optional(),
      mode: z.enum(["semantic", "hybrid", "context"]).optional(),
      sourceTypes: z.array(z.string().min(2).max(40)).max(12).optional()
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Informe uma consulta válida para a busca inteligente.");
  }

  try {
    return res.json({ search: semanticSearch(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível executar a busca inteligente.");
  }
});

searchRoutes.post("/search/reindex", (req, res) => {
  try {
    return res.json({ reindex: reindexSemanticSearch(req.user!.id), dashboard: getSemanticSearchDashboard(req.user!.id) });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Não foi possível reindexar a busca inteligente.");
  }
});

searchRoutes.get("/search/history", (req, res) => {
  return res.json({ history: listSearchHistory(req.user!.id) });
});

searchRoutes.get("/search/:id", (req, res) => {
  try {
    return res.json({ search: getSearchHistoryItem(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Pesquisa não encontrada.");
  }
});
