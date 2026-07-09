import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  getPlugin,
  handlePluginChat,
  installPlugin,
  listInstalledPlugins,
  listMarketplacePlugins,
  pluginCategories,
  pluginDashboard,
  pluginLogs,
  setPluginEnabled,
  uninstallPlugin
} from "../services/pluginService";
import { sendError } from "../utils/http";

export const pluginRoutes = Router();

const pluginIdSchema = z.object({
  pluginId: z.string().min(1),
  settings: z.record(z.unknown()).optional()
});

const chatSchema = z.object({
  message: z.string().min(3).max(1000)
});

pluginRoutes.use(authRequired);

pluginRoutes.get("/plugins", (req, res) => {
  return res.json({
    plugins: listMarketplacePlugins(req.user!.id),
    dashboard: pluginDashboard(req.user!.id)
  });
});

pluginRoutes.get("/plugins/marketplace", (req, res) => {
  return res.json({
    plugins: listMarketplacePlugins(req.user!.id),
    dashboard: pluginDashboard(req.user!.id)
  });
});

pluginRoutes.get("/plugins/installed", (req, res) => {
  return res.json({
    plugins: listInstalledPlugins(req.user!.id),
    dashboard: pluginDashboard(req.user!.id)
  });
});

pluginRoutes.get("/plugins/categories", (_req, res) => {
  return res.json({ categories: pluginCategories() });
});

pluginRoutes.get("/plugins/logs", (req, res) => {
  return res.json({ logs: pluginLogs(req.user!.id) });
});

pluginRoutes.post("/plugins/install", (req, res) => {
  const parsed = pluginIdSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o plugin para instalar.");
  try {
    return res.status(201).json({ plugin: installPlugin(req.user!.id, parsed.data.pluginId, parsed.data.settings || {}) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível instalar o plugin.");
  }
});

pluginRoutes.post("/plugins/uninstall", (req, res) => {
  const parsed = pluginIdSchema.pick({ pluginId: true }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o plugin para desinstalar.");
  try {
    return res.json({ plugin: uninstallPlugin(req.user!.id, parsed.data.pluginId) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível desinstalar o plugin.");
  }
});

pluginRoutes.post("/plugins/enable", (req, res) => {
  const parsed = pluginIdSchema.pick({ pluginId: true }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o plugin para ativar.");
  try {
    return res.json({ plugin: setPluginEnabled(req.user!.id, parsed.data.pluginId, true) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível ativar o plugin.");
  }
});

pluginRoutes.post("/plugins/disable", (req, res) => {
  const parsed = pluginIdSchema.pick({ pluginId: true }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o plugin para desativar.");
  try {
    return res.json({ plugin: setPluginEnabled(req.user!.id, parsed.data.pluginId, false) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível desativar o plugin.");
  }
});

pluginRoutes.post("/plugins/chat", (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe um comando para o marketplace.");
  try {
    return res.json(handlePluginChat(req.user!.id, parsed.data.message));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível processar o comando.");
  }
});

pluginRoutes.get("/plugins/:id", (req, res) => {
  try {
    return res.json({ plugin: getPlugin(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Plugin não encontrado.");
  }
});
