import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import {
  graphDashboard,
  listGraphEdges,
  listGraphInsights,
  listGraphNodes,
  queryKnowledgeGraph,
  rebuildKnowledgeGraph
} from "../services/graphService";
import { sendError } from "../utils/http";

export const graphRoutes = Router();

graphRoutes.use(authRequired);

function audit(req: any, action: string, message: string, metadata: Record<string, unknown> = {}) {
  recordAudit({
    userId: req.user!.id,
    category: "graph",
    action,
    entityType: "knowledge_graph",
    message,
    metadata,
    ...requestAuditContext(req)
  });
}

graphRoutes.get("/graph", (req, res) => {
  const current = graphDashboard(req.user!.id);
  if (current.totals.nodes === 0) {
    return res.json({ graph: rebuildKnowledgeGraph(req.user!.id) });
  }
  return res.json({ graph: current });
});

graphRoutes.get("/graph/nodes", (req, res) => {
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 120;
  return res.json({ nodes: listGraphNodes(req.user!.id, Number.isFinite(limit) ? limit : 120) });
});

graphRoutes.get("/graph/edges", (req, res) => {
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 160;
  return res.json({ edges: listGraphEdges(req.user!.id, Number.isFinite(limit) ? limit : 160) });
});

graphRoutes.get("/graph/insights", (req, res) => {
  return res.json({ insights: listGraphInsights(req.user!.id) });
});

graphRoutes.post("/graph/query", (req, res) => {
  const parsed = z.object({ query: z.string().min(2).max(500) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe uma consulta válida para o grafo.");
  try {
    const result = queryKnowledgeGraph(req.user!.id, parsed.data.query);
    audit(req, "query", "Consulta ao grafo executada.", { query: parsed.data.query, nodes: result.nodes.length, edges: result.edges.length });
    return res.json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível consultar o grafo.");
  }
});

graphRoutes.post("/graph/rebuild", (req, res) => {
  try {
    const graph = rebuildKnowledgeGraph(req.user!.id);
    audit(req, "rebuild", "Grafo reconstruído.");
    return res.json({ graph });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Não foi possível reconstruir o grafo.");
  }
});
