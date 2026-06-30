import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  createGoogleCalendarEvent,
  createInternalNotification,
  deleteGoogleCalendarEvent,
  deletePushSubscription,
  finishGoogleOAuth,
  getIntegrationStatus,
  handleTelegramWebhook,
  handleWhatsappWebhook,
  listGmailMessages,
  listGoogleCalendarEvents,
  listIntegrationAuditLogs,
  listPushSubscriptions,
  savePushSubscription,
  sendGmailMessage,
  sendTelegramMessage,
  sendWhatsappMessage,
  startGoogleOAuth,
  summarizeGmailMessages,
  syncGoogleCalendar,
  updateGoogleCalendarEvent,
  verifyWhatsappWebhook
} from "../services/integrationService";
import { sendError } from "../utils/http";

export const integrationRoutes = Router();

const calendarEventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  location: z.string().optional().nullable(),
  participants: z.union([z.array(z.string()), z.string()]).optional().nullable()
});

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1)
});

integrationRoutes.get("/integrations/google/callback", async (req, res) => {
  try {
    const result = await finishGoogleOAuth(
      typeof req.query.code === "string" ? req.query.code : undefined,
      typeof req.query.state === "string" ? req.query.state : undefined
    );
    const html = [
      "<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
      "<title>YARA AI | Integração conectada</title>",
      "<style>body{margin:0;background:#081120;color:#fff;font-family:Inter,Arial,sans-serif;display:grid;place-items:center;min-height:100vh}.card{max-width:560px;padding:32px;border:1px solid rgba(56,189,248,.35);border-radius:16px;background:rgba(15,23,42,.86);box-shadow:0 24px 90px rgba(10,132,255,.25)}a{color:#38bdf8}</style>",
      "</head><body><main class=\"card\"><h1>Integração conectada</h1>",
      `<p>${"message" in result ? result.message : "Conta conectada com segurança."}</p>`,
      "<p>Você já pode voltar para a plataforma YARA AI.</p><a href=\"/app?view=integrations\">Abrir integrações</a>",
      "</main></body></html>"
    ].join("");
    return res.type("html").send(html);
  } catch (error) {
    return res.status(400).type("html").send(`<p>Não foi possível conectar: ${error instanceof Error ? error.message : "erro OAuth"}</p><p><a href="/app?view=integrations">Voltar</a></p>`);
  }
});

integrationRoutes.get("/integrations/whatsapp/webhook", (req, res) => {
  try {
    const result = verifyWhatsappWebhook(req.query);
    if ("challenge" in result) return res.type("text").send(result.challenge);
    return res.status(503).json(result);
  } catch (error) {
    return sendError(res, 403, error instanceof Error ? error.message : "Webhook WhatsApp não autorizado.");
  }
});

integrationRoutes.post("/integrations/whatsapp/webhook", (req, res) => {
  return res.json(handleWhatsappWebhook(req.body));
});

integrationRoutes.post("/integrations/telegram/webhook", async (req, res) => {
  try {
    return res.json(await handleTelegramWebhook(req.body, req.header("x-telegram-bot-api-secret-token") || undefined));
  } catch (error) {
    return sendError(res, 403, error instanceof Error ? error.message : "Webhook Telegram não autorizado.");
  }
});

integrationRoutes.use(authRequired);

integrationRoutes.get("/integrations/status", (req, res) => {
  return res.json({ integrations: getIntegrationStatus(req.user!.id) });
});

integrationRoutes.get("/integrations/audit", (req, res) => {
  return res.json({ logs: listIntegrationAuditLogs(req.user!.id) });
});

integrationRoutes.get("/integrations/google/calendar/connect", (req, res) => {
  const result = startGoogleOAuth(req.user!.id, "calendar");
  if ("configured" in result && result.configured === false) return res.status(503).json(result);
  return res.json(result);
});

integrationRoutes.get("/integrations/google/gmail/connect", (req, res) => {
  const result = startGoogleOAuth(req.user!.id, "gmail");
  if ("configured" in result && result.configured === false) return res.status(503).json(result);
  return res.json(result);
});

integrationRoutes.get("/integrations/google/calendar/events", async (req, res) => {
  const parsed = z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  }).safeParse(req.query);
  if (!parsed.success) return sendError(res, 400, "Período inválido.");
  return res.json(await listGoogleCalendarEvents(req.user!.id, parsed.data));
});

integrationRoutes.post("/integrations/google/calendar/sync", async (req, res) => {
  return res.json(await syncGoogleCalendar(req.user!.id));
});

integrationRoutes.post("/integrations/google/calendar/events", async (req, res) => {
  const parsed = calendarEventSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para evento Google.");
  return res.json(await createGoogleCalendarEvent(req.user!.id, parsed.data));
});

integrationRoutes.patch("/integrations/google/calendar/events/:id", async (req, res) => {
  const parsed = calendarEventSchema.partial().safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para atualizar evento Google.");
  return res.json(await updateGoogleCalendarEvent(req.user!.id, req.params.id, parsed.data));
});

integrationRoutes.delete("/integrations/google/calendar/events/:id", async (req, res) => {
  return res.json(await deleteGoogleCalendarEvent(req.user!.id, req.params.id));
});

integrationRoutes.get("/integrations/gmail/messages", async (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query : "";
  const maxResults = Number(req.query.maxResults || 10);
  return res.json(await listGmailMessages(req.user!.id, query, maxResults));
});

integrationRoutes.post("/integrations/gmail/search", async (req, res) => {
  const parsed = z.object({ query: z.string().optional(), maxResults: z.number().optional() }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Busca de Gmail inválida.");
  return res.json(await listGmailMessages(req.user!.id, parsed.data.query || "", parsed.data.maxResults || 10));
});

integrationRoutes.post("/integrations/gmail/summarize", async (req, res) => {
  const parsed = z.object({ query: z.string().optional(), maxResults: z.number().optional() }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Resumo de Gmail inválido.");
  return res.json(await summarizeGmailMessages(req.user!.id, parsed.data.query || "is:unread", parsed.data.maxResults || 5));
});

integrationRoutes.post("/integrations/gmail/send", async (req, res) => {
  const parsed = emailSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para envio de e-mail.");
  return res.json(await sendGmailMessage(req.user!.id, parsed.data));
});

integrationRoutes.post("/integrations/telegram/send", async (req, res) => {
  const parsed = z.object({ chatId: z.string().min(1), text: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para Telegram.");
  return res.json(await sendTelegramMessage(parsed.data));
});

integrationRoutes.post("/integrations/whatsapp/send", async (req, res) => {
  const parsed = z.object({ to: z.string().min(4), text: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para WhatsApp.");
  return res.json(await sendWhatsappMessage(parsed.data));
});

integrationRoutes.get("/push/subscriptions", (req, res) => {
  return res.json({ configured: getIntegrationStatus(req.user!.id).push.configured, subscriptions: listPushSubscriptions(req.user!.id) });
});

integrationRoutes.post("/push/subscribe", (req, res) => {
  try {
    return res.status(201).json(savePushSubscription(req.user!.id, req.body));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível salvar inscrição push.");
  }
});

integrationRoutes.delete("/push/subscriptions/:id", (req, res) => {
  return res.json({ subscription: deletePushSubscription(req.user!.id, req.params.id) });
});

integrationRoutes.post("/push/test", (req, res) => {
  const parsed = z.object({ title: z.string().optional(), message: z.string().optional() }).safeParse(req.body);
  const notification = createInternalNotification(req.user!.id, {
    type: "push_test",
    title: parsed.success && parsed.data.title ? parsed.data.title : "Teste YARA AI",
    message: parsed.success && parsed.data.message ? parsed.data.message : "Notificação interna criada com sucesso.",
    channel: "push"
  });
  return res.status(201).json({ configured: getIntegrationStatus(req.user!.id).push.configured, notification });
});
