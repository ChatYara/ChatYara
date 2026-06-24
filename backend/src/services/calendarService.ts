import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";

type CalendarEventRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  participants: string | null;
  reminder_minutes: number | null;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ReminderRow = {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  scheduled_at: string;
  recurrence: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type EventInput = {
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
  location?: string | null;
  participants?: string[] | string | null;
  reminderMinutes?: number | null;
  status?: string;
  createdBy?: string;
};

type ReminderInput = {
  title: string;
  message?: string | null;
  scheduledAt: string;
  recurrence?: string;
  status?: string;
};

const googleNotConfiguredMessage = "Google Calendar ainda não configurado pelo administrador.";

function cleanText(value: string, fallback = "") {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean || fallback;
}

function ensureDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Informe a data no formato YYYY-MM-DD.");
  return value;
}

function ensureTime(value?: string | null) {
  if (!value) return null;
  if (!/^\d{2}:\d{2}$/.test(value)) throw new Error("Informe a hora no formato HH:mm.");
  return value;
}

function ensureScheduledAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error("Informe uma data e hora válidas.");
  return parsed.toISOString();
}

function participantsToString(value?: string[] | string | null) {
  if (!value) return null;
  if (Array.isArray(value)) return value.map((item) => cleanText(item)).filter(Boolean).join(", ") || null;
  return cleanText(value) || null;
}

function toPublicEvent(row: CalendarEventRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.event_date,
    time: row.event_time,
    location: row.location,
    participants: row.participants ? row.participants.split(",").map((item) => item.trim()).filter(Boolean) : [],
    reminder_minutes: row.reminder_minutes,
    status: row.status,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function toPublicReminder(row: ReminderRow) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    scheduled_at: row.scheduled_at,
    recurrence: row.recurrence,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function createNotification(userId: string, input: { type: string; title: string; message: string; status?: string }) {
  const id = uuid();
  getDatabase()
    .prepare("insert into notifications (id, user_id, type, title, message, status) values (?, ?, ?, ?, ?, ?)")
    .run(id, userId, input.type, input.title, input.message, input.status || "scheduled");
  return { id, type: input.type, title: input.title, message: input.message, status: input.status || "scheduled" };
}

export function listCalendarEvents(userId: string, range?: { from?: string; to?: string }) {
  const params: string[] = [userId];
  const filters = ["user_id = ?"];
  if (range?.from) {
    filters.push("event_date >= ?");
    params.push(ensureDate(range.from));
  }
  if (range?.to) {
    filters.push("event_date <= ?");
    params.push(ensureDate(range.to));
  }
  const rows = getDatabase()
    .prepare(
      `select id, user_id, title, description, event_date, event_time, location, participants,
              reminder_minutes, status, created_by, created_at, updated_at
       from calendar_events
       where ${filters.join(" and ")}
       order by event_date asc, coalesce(event_time, '23:59') asc, created_at desc`
    )
    .all(...params) as CalendarEventRow[];
  return rows.map(toPublicEvent);
}

export function createCalendarEvent(userId: string, input: EventInput) {
  const id = uuid();
  const title = cleanText(input.title);
  if (title.length < 2) throw new Error("Informe um título para o evento.");
  const date = ensureDate(input.date);
  const time = ensureTime(input.time);
  const reminderMinutes = input.reminderMinutes === undefined || input.reminderMinutes === null
    ? null
    : Math.max(0, Math.min(43200, Math.round(Number(input.reminderMinutes))));

  getDatabase()
    .prepare(
      `insert into calendar_events (
         id, user_id, title, description, event_date, event_time, location, participants,
         reminder_minutes, status, created_by, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(
      id,
      userId,
      title,
      input.description ? cleanText(input.description) : null,
      date,
      time,
      input.location ? cleanText(input.location) : null,
      participantsToString(input.participants),
      reminderMinutes,
      input.status || "scheduled",
      input.createdBy || "user"
    );

  if (reminderMinutes !== null) {
    createNotification(userId, {
      type: "event_reminder",
      title: `Lembrete: ${title}`,
      message: `Evento em ${date}${time ? ` às ${time}` : ""}.`
    });
  }

  return getCalendarEvent(userId, id);
}

export function getCalendarEvent(userId: string, eventId: string) {
  const row = getDatabase()
    .prepare(
      `select id, user_id, title, description, event_date, event_time, location, participants,
              reminder_minutes, status, created_by, created_at, updated_at
       from calendar_events
       where id = ? and user_id = ?`
    )
    .get(eventId, userId) as CalendarEventRow | undefined;
  if (!row) throw new Error("Evento não encontrado.");
  return toPublicEvent(row);
}

export function updateCalendarEvent(userId: string, eventId: string, input: Partial<EventInput>) {
  const current = getCalendarEvent(userId, eventId);
  const title = input.title !== undefined ? cleanText(input.title) : current.title;
  const date = input.date !== undefined ? ensureDate(input.date) : current.date;
  const time = input.time !== undefined ? ensureTime(input.time) : current.time;
  const reminderMinutes = input.reminderMinutes !== undefined
    ? input.reminderMinutes === null
      ? null
      : Math.max(0, Math.min(43200, Math.round(Number(input.reminderMinutes))))
    : current.reminder_minutes;

  const result = getDatabase()
    .prepare(
      `update calendar_events
       set title = ?, description = ?, event_date = ?, event_time = ?, location = ?, participants = ?,
           reminder_minutes = ?, status = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      title,
      input.description !== undefined ? (input.description ? cleanText(input.description) : null) : current.description,
      date,
      time,
      input.location !== undefined ? (input.location ? cleanText(input.location) : null) : current.location,
      input.participants !== undefined ? participantsToString(input.participants) : current.participants.join(", "),
      reminderMinutes,
      input.status || current.status,
      eventId,
      userId
    );
  if (result.changes === 0) throw new Error("Evento não encontrado.");
  return getCalendarEvent(userId, eventId);
}

export function deleteCalendarEvent(userId: string, eventId: string) {
  const result = getDatabase().prepare("delete from calendar_events where id = ? and user_id = ?").run(eventId, userId);
  if (result.changes === 0) throw new Error("Evento não encontrado.");
  return { id: eventId };
}

export function listReminders(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, user_id, title, message, scheduled_at, recurrence, status, created_at, updated_at
       from reminders
       where user_id = ?
       order by scheduled_at asc, created_at desc`
    )
    .all(userId) as ReminderRow[];
  return rows.map(toPublicReminder);
}

export function createReminder(userId: string, input: ReminderInput) {
  const id = uuid();
  const title = cleanText(input.title);
  if (title.length < 2) throw new Error("Informe um título para o lembrete.");
  const scheduledAt = ensureScheduledAt(input.scheduledAt);
  const recurrence = input.recurrence || "none";
  getDatabase()
    .prepare(
      `insert into reminders (id, user_id, title, message, scheduled_at, recurrence, status, updated_at)
       values (?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(id, userId, title, input.message ? cleanText(input.message) : null, scheduledAt, recurrence, input.status || "pending");
  createNotification(userId, {
    type: "reminder",
    title: `Lembrete: ${title}`,
    message: input.message ? cleanText(input.message) : `Agendado para ${scheduledAt}.`
  });
  return getReminder(userId, id);
}

export function getReminder(userId: string, reminderId: string) {
  const row = getDatabase()
    .prepare(
      `select id, user_id, title, message, scheduled_at, recurrence, status, created_at, updated_at
       from reminders
       where id = ? and user_id = ?`
    )
    .get(reminderId, userId) as ReminderRow | undefined;
  if (!row) throw new Error("Lembrete não encontrado.");
  return toPublicReminder(row);
}

export function updateReminder(userId: string, reminderId: string, input: Partial<ReminderInput>) {
  const current = getReminder(userId, reminderId);
  const title = input.title !== undefined ? cleanText(input.title) : current.title;
  const scheduledAt = input.scheduledAt !== undefined ? ensureScheduledAt(input.scheduledAt) : current.scheduled_at;
  const result = getDatabase()
    .prepare(
      `update reminders
       set title = ?, message = ?, scheduled_at = ?, recurrence = ?, status = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      title,
      input.message !== undefined ? (input.message ? cleanText(input.message) : null) : current.message,
      scheduledAt,
      input.recurrence || current.recurrence,
      input.status || current.status,
      reminderId,
      userId
    );
  if (result.changes === 0) throw new Error("Lembrete não encontrado.");
  return getReminder(userId, reminderId);
}

export function deleteReminder(userId: string, reminderId: string) {
  const result = getDatabase().prepare("delete from reminders where id = ? and user_id = ?").run(reminderId, userId);
  if (result.changes === 0) throw new Error("Lembrete não encontrado.");
  return { id: reminderId };
}

export function listNotifications(userId: string) {
  return getDatabase()
    .prepare(
      `select id, type, title, message, status, created_at
       from notifications
       where user_id = ?
       order by created_at desc
       limit 50`
    )
    .all(userId);
}

function googleConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleRedirectUri);
}

function todayInYaraTimezone() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bahia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Number(values.year), Number(values.month) - 1, Number(values.day));
}

export function googleNotConfigured() {
  return { configured: false, message: googleNotConfiguredMessage };
}

function encryptSecret(value: string) {
  const key = crypto.createHash("sha256").update(env.jwtSecret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function googleConnectUrl(userId: string) {
  if (!googleConfigured()) return googleNotConfigured();
  const state = Buffer.from(JSON.stringify({ userId, nonce: crypto.randomUUID() })).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.googleClientId);
  url.searchParams.set("redirect_uri", env.googleRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return { configured: true, url: url.toString() };
}

export async function handleGoogleCallback(userId: string, code?: string) {
  if (!googleConfigured()) return googleNotConfigured();
  if (!code) throw new Error("Código OAuth ausente.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: env.googleRedirectUri,
      grant_type: "authorization_code"
    })
  });
  const token = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
  if (!response.ok || !token.access_token) throw new Error("Não foi possível conectar ao Google Calendar.");
  const expiresAt = new Date(Date.now() + Number(token.expires_in || 3600) * 1000).toISOString();
  getDatabase()
    .prepare(
      `insert into google_calendar_connections (
         user_id, access_token_encrypted, refresh_token_encrypted, expires_at, scopes, updated_at
       )
       values (?, ?, ?, ?, ?, current_timestamp)
       on conflict(user_id) do update set
         access_token_encrypted = excluded.access_token_encrypted,
         refresh_token_encrypted = coalesce(excluded.refresh_token_encrypted, google_calendar_connections.refresh_token_encrypted),
         expires_at = excluded.expires_at,
         scopes = excluded.scopes,
         updated_at = current_timestamp`
    )
    .run(
      userId,
      encryptSecret(token.access_token),
      token.refresh_token ? encryptSecret(token.refresh_token) : null,
      expiresAt,
      token.scope || ""
    );
  return { connected: true, message: "Google Calendar conectado com segurança." };
}

export function listGoogleCalendars(userId: string) {
  if (!googleConfigured()) return googleNotConfigured();
  const connection = getDatabase()
    .prepare("select user_id, updated_at from google_calendar_connections where user_id = ?")
    .get(userId);
  if (!connection) return { configured: true, connected: false, message: "Conecte o Google Calendar para listar calendários." };
  return { configured: true, connected: true, calendars: [], message: "Listagem remota preparada; sincronização ativa quando o token OAuth estiver disponível." };
}

export function syncGoogleCalendar(userId: string) {
  if (!googleConfigured()) return googleNotConfigured();
  const connection = getDatabase()
    .prepare("select user_id from google_calendar_connections where user_id = ?")
    .get(userId);
  if (!connection) return { configured: true, connected: false, message: "Conecte o Google Calendar antes de sincronizar." };
  return { configured: true, connected: true, status: "prepared", message: "Sincronização Google Calendar preparada para execução com OAuth conectado." };
}

export function calendarSummary(userId: string) {
  const today = new Date();
  const isoToday = today.toISOString().slice(0, 10);
  const weekEnd = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const events = listCalendarEvents(userId, { from: isoToday, to: weekEnd });
  const reminders = listReminders(userId).filter((item) => item.status !== "done").slice(0, 5);
  return {
    today: events.filter((event) => event.date === isoToday),
    week: events,
    reminders,
    notifications: listNotifications(userId).slice(0, 6)
  };
}

function nextWeekday(target: number) {
  const date = todayInYaraTimezone();
  const diff = (target - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date;
}

function normalizedText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseRelativeDate(message: string) {
  const lower = normalizedText(message);
  const base = todayInYaraTimezone();
  if (/\bdepois de amanha\b/.test(lower)) base.setDate(base.getDate() + 2);
  else if (/\bamanha\b/.test(lower)) base.setDate(base.getDate() + 1);
  else {
    const weekdays: Record<string, number> = {
      domingo: 0,
      segunda: 1,
      "segunda-feira": 1,
      terça: 2,
      terca: 2,
      "terça-feira": 2,
      "terca-feira": 2,
      quarta: 3,
      "quarta-feira": 3,
      quinta: 4,
      "quinta-feira": 4,
      sexta: 5,
      "sexta-feira": 5,
      sábado: 6,
      sabado: 6
    };
    const found = Object.entries(weekdays).find(([name]) => lower.includes(name));
    if (found) return nextWeekday(found[1]).toISOString().slice(0, 10);
  }
  return base.toISOString().slice(0, 10);
}

function parseTime(message: string) {
  const match = /(?:às|as|para|por volta de)?\s*(\d{1,2})(?::|h)?(\d{2})?\s*h?/i.exec(message);
  if (!match) return null;
  const hour = Math.max(0, Math.min(23, Number(match[1])));
  const minute = Math.max(0, Math.min(59, Number(match[2] || 0)));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function titleFromMessage(message: string, fallback: string) {
  return cleanText(
    message
      .replace(/^(marque|agende|crie|lembre-me de|me lembre de|lembrar de)\s+/i, "")
      .replace(/\b(amanh[ãa]|hoje|sexta-feira|sexta|segunda-feira|segunda|terça-feira|terca-feira|quarta-feira|quinta-feira|sábado|sabado|domingo)\b/gi, "")
      .replace(/\b(às|as)\s*\d{1,2}(:|h)?\d{0,2}\b/gi, ""),
    fallback
  ).slice(0, 120);
}

export function tryCreateCalendarItemFromChat(userId: string, message: string) {
  const lower = normalizedText(message);
  const wantsReminder = /\b(lembre-me|me lembre|lembrar|lembrete)\b/.test(lower);
  const wantsEvent = /\b(marque|agende|agenda|reuniao|consulta|compromisso)\b/.test(lower);
  if (!wantsReminder && !wantsEvent) return null;

  const date = parseRelativeDate(message);
  const time = parseTime(message);
  if (wantsReminder) {
    const scheduledAt = new Date(`${date}T${time || "09:00"}:00`).toISOString();
    const reminder = createReminder(userId, {
      title: titleFromMessage(message, "Lembrete YARA"),
      message,
      scheduledAt,
      recurrence: "none"
    });
    return {
      type: "reminder",
      text: `Lembrete criado: ${reminder.title} em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(reminder.scheduled_at))}.`
    };
  }

  const event = createCalendarEvent(userId, {
    title: titleFromMessage(message, "Compromisso YARA"),
    description: message,
    date,
    time,
    reminderMinutes: 30,
    createdBy: "chat"
  });
  return {
    type: "event",
    text: `Evento criado: ${event.title} em ${event.date}${event.time ? ` às ${event.time}` : ""}.`
  };
}
