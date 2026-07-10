import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  buildDeployProject,
  createAndDeploySystem,
  createDeployProject,
  deployProject,
  getDeployProject,
  getDeployStatus,
  listDeployLogs,
  listDeployProjects,
  publicDeployApiStatus,
  redeployProject,
  renderPublicDeployPage,
  restartProject,
  rollbackProject
} from "../services/deployService";
import { sendError } from "../utils/http";

export const deployRoutes = Router();
export const publicDeployRoutes = Router();

const projectBody = z.object({ projectId: z.string().min(1) });

deployRoutes.use(authRequired);

deployRoutes.get("/deploy/projects", (req, res) => {
  return res.json({ projects: listDeployProjects(req.user!.id) });
});

deployRoutes.get("/deploy/projects/:id", (req, res) => {
  try {
    return res.json(getDeployProject(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Projeto de deploy não encontrado.");
  }
});

deployRoutes.post("/deploy/create", (req, res) => {
  const parsed = z.object({ systemId: z.string().min(1), autoDeploy: z.boolean().optional() }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o sistema que deve ser publicado.");
  try {
    const result = parsed.data.autoDeploy
      ? createAndDeploySystem(req.user!.id, parsed.data.systemId)
      : createDeployProject(req.user!.id, parsed.data.systemId);
    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar o deploy.");
  }
});

deployRoutes.post("/deploy/build", (req, res) => {
  const parsed = projectBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o projeto de deploy.");
  try {
    return res.json({ build: buildDeployProject(req.user!.id, parsed.data.projectId) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível executar o build.");
  }
});

deployRoutes.post("/deploy/deploy", (req, res) => {
  const parsed = projectBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o projeto de deploy.");
  try {
    return res.json(deployProject(req.user!.id, parsed.data.projectId));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível publicar.");
  }
});

deployRoutes.post("/deploy/redeploy", (req, res) => {
  const parsed = projectBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o projeto de deploy.");
  try {
    return res.json(redeployProject(req.user!.id, parsed.data.projectId));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível republicar.");
  }
});

deployRoutes.post("/deploy/rollback", (req, res) => {
  const parsed = projectBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o projeto de deploy.");
  try {
    return res.json(rollbackProject(req.user!.id, parsed.data.projectId));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível executar rollback.");
  }
});

deployRoutes.post("/deploy/restart", (req, res) => {
  const parsed = projectBody.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o projeto de deploy.");
  try {
    return res.json(restartProject(req.user!.id, parsed.data.projectId));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível reiniciar.");
  }
});

deployRoutes.get("/deploy/logs", (req, res) => {
  return res.json(
    listDeployLogs(req.user!.id, {
      projectId: typeof req.query.projectId === "string" ? req.query.projectId : undefined,
      limit: typeof req.query.limit === "string" ? Number(req.query.limit) : undefined
    })
  );
});

deployRoutes.get("/deploy/status", (req, res) => {
  return res.json(
    getDeployStatus(req.user!.id, {
      projectId: typeof req.query.projectId === "string" ? req.query.projectId : undefined,
      systemId: typeof req.query.systemId === "string" ? req.query.systemId : undefined
    })
  );
});

publicDeployRoutes.get("/deploy/apps/:slug", (req, res) => {
  const html = renderPublicDeployPage(req.params.slug, "app");
  return html ? res.type("html").send(html) : sendError(res, 404, "Aplicação não encontrada ou ainda não publicada.");
});

publicDeployRoutes.get("/deploy/admin/:slug", (req, res) => {
  const html = renderPublicDeployPage(req.params.slug, "admin");
  return html ? res.type("html").send(html) : sendError(res, 404, "Painel não encontrado ou ainda não publicado.");
});

publicDeployRoutes.get("/deploy/docs/:slug", (req, res) => {
  const html = renderPublicDeployPage(req.params.slug, "docs");
  return html ? res.type("html").send(html) : sendError(res, 404, "Documentação não encontrada ou ainda não publicada.");
});

publicDeployRoutes.get("/deploy/api/:slug/health", (req, res) => {
  const status = publicDeployApiStatus(req.params.slug);
  return status ? res.json(status) : sendError(res, 404, "API não encontrada ou ainda não publicada.");
});
