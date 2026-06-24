import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  calendarSummary,
  createCalendarEvent,
  createReminder,
  deleteCalendarEvent,
  deleteReminder,
  googleConnectUrl,
  handleGoogleCallback,
  listCalendarEvents,
  listGoogleCalendars,
  listNotifications,
  listReminders,
  syncGoogleCalendar,
  updateCalendarEvent,
  updateReminder
} from "../services/calendarService";
import { sendError } from "../utils/http";

export const calendarRoutes = Router();

calendarRoutes.use(authRequired);

const eventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  location: z.string().optional().nullable(),
  participants: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  reminderMinutes: z.number().int().min(0).max(43200).optional().nullable(),
  status: z.string().optional()
});

const reminderSchema = z.object({
  title: z.string().min(2),
  message: z.string().optional().nullable(),
  scheduledAt: z.string().min(8),
  recurrence: z.string().optional(),
  status: z.string().optional()
});

calendarRoutes.get("/calendar/summary", (req, res) => {
  return res.json({ summary: calendarSummary(req.user!.id) });
});

calendarRoutes.get("/calendar/events", (req, res) => {
  const parsed = z
    .object({
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    })
    .safeParse(req.query);
  if (!parsed.success) return sendError(res, 400, "Período inválido para eventos.");
  return res.json({ events: listCalendarEvents(req.user!.id, parsed.data) });
});

calendarRoutes.post("/calendar/events", (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para criar evento.");
  try {
    return res.status(201).json({ event: createCalendarEvent(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar evento.");
  }
});

calendarRoutes.patch("/calendar/events/:id", (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para atualizar evento.");
  try {
    return res.json({ event: updateCalendarEvent(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Evento não encontrado.");
  }
});

calendarRoutes.delete("/calendar/events/:id", (req, res) => {
  try {
    return res.json({ event: deleteCalendarEvent(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Evento não encontrado.");
  }
});

calendarRoutes.get("/calendar/google/connect", (req, res) => {
  const result = googleConnectUrl(req.user!.id);
  if ("url" in result) return res.json(result);
  return res.status(503).json(result);
});

calendarRoutes.get("/calendar/google/callback", async (req, res) => {
  try {
    const result = await handleGoogleCallback(req.user!.id, typeof req.query.code === "string" ? req.query.code : undefined);
    if ("configured" in result && result.configured === false) return res.status(503).json(result);
    return res.json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível conectar ao Google Calendar.");
  }
});

calendarRoutes.get("/calendar/google/calendars", (req, res) => {
  const result = listGoogleCalendars(req.user!.id);
  if ("configured" in result && result.configured === false) return res.status(503).json(result);
  return res.json(result);
});

calendarRoutes.post("/calendar/google/sync", (req, res) => {
  const result = syncGoogleCalendar(req.user!.id);
  if ("configured" in result && result.configured === false) return res.status(503).json(result);
  return res.json(result);
});

calendarRoutes.get("/reminders", (req, res) => {
  return res.json({ reminders: listReminders(req.user!.id) });
});

calendarRoutes.post("/reminders", (req, res) => {
  const parsed = reminderSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para criar lembrete.");
  try {
    return res.status(201).json({ reminder: createReminder(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível criar lembrete.");
  }
});

calendarRoutes.patch("/reminders/:id", (req, res) => {
  const parsed = reminderSchema.partial().safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Dados inválidos para atualizar lembrete.");
  try {
    return res.json({ reminder: updateReminder(req.user!.id, req.params.id, parsed.data) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Lembrete não encontrado.");
  }
});

calendarRoutes.delete("/reminders/:id", (req, res) => {
  try {
    return res.json({ reminder: deleteReminder(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Lembrete não encontrado.");
  }
});

calendarRoutes.get("/notifications", (req, res) => {
  return res.json({ notifications: listNotifications(req.user!.id) });
});
