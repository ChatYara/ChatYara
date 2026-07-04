import crypto from "node:crypto";
import fs from "node:fs";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";
import { askYara } from "./ai/aiService";
import { createAutomation } from "./automationService";
import { getFileForDownload } from "./fileService";

type IntegrationServiceName = "calendar" | "gmail" | "drive" | "telegram" | "whatsapp" | "push";

type OAuthConnectionRow = {
  id: string;
  user_id: string;
  provider: string;
  service: string;
  email: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  scopes: string | null;
  status: string;
  last_sync_at: string | null;
  last_error: string | null;
  metadata_json: string;
  updated_at: string;
};

type CalendarInput = {
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
  location?: string | null;
  participants?: string[] | string | null;
};

const googleNotConfiguredMessage = "Google OAuth ainda não configurado pelo administrador.";
const gmailNotConfiguredMessage = "Gmail ainda não configurado pelo administrador.";
const driveNotConfiguredMessage = "Google Drive ainda não configurado pelo administrador.";
const telegramNotConfiguredMessage = "Telegram ainda não configurado pelo administrador.";
const whatsappNotConfiguredMessage = "WhatsApp Business API ainda não configurado pelo administrador.";
const pushNotConfiguredMessage = "Push notifications ainda precisam das chaves VAPID no servidor.";

function nowIso() {
  return new Date().toISOString();
}

function cleanText(value: unknown, fallback = "") {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  return clean || fallback;
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function encryptionKey() {
  return crypto.createHash("sha256").update(env.jwtSecret).digest();
}

function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

function decryptSecret(value: string) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("Token criptografado inválido.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final()
  ]).toString("utf8");
}

function base64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function googleConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleRedirectUri);
}

function gmailConfigured() {
  return googleConfigured();
}

function driveConfigured() {
  return googleConfigured();
}

function telegramConfigured() {
  return Boolean(env.telegramBotToken);
}

function whatsappConfigured() {
  return Boolean(env.whatsappAccessToken && env.whatsappPhoneNumberId);
}

function pushConfigured() {
  return Boolean(env.vapidPublicKey && env.vapidPrivateKey);
}

function audit(
  userId: string | null,
  provider: string,
  service: string,
  action: string,
  status: "success" | "failed" | "prepared",
  message: string,
  metadata: Record<string, unknown> = {}
) {
  getDatabase()
    .prepare(
      `insert into integration_audit_logs (id, user_id, provider, service, action, status, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, provider, service, action, status, message, JSON.stringify(metadata));
}

function publicConnection(row: OAuthConnectionRow | undefined) {
  if (!row) return { connected: false };
  return {
    connected: row.status === "connected",
    email: row.email,
    status: row.status,
    lastSyncAt: row.last_sync_at,
    lastError: row.last_error,
    scopes: row.scopes ? row.scopes.split(/\s+/).filter(Boolean) : [],
    metadata: safeJsonParse(row.metadata_json, {}),
    updatedAt: row.updated_at
  };
}

function getConnection(userId: string, provider: string, service: IntegrationServiceName) {
  return getDatabase()
    .prepare(
      `select id, user_id, provider, service, email, access_token_encrypted, refresh_token_encrypted,
              expires_at, scopes, status, last_sync_at, last_error, metadata_json, updated_at
       from oauth_connections
       where user_id = ? and provider = ? and service = ?`
    )
    .get(userId, provider, service) as OAuthConnectionRow | undefined;
}

function saveConnection(input: {
  userId: string;
  provider: string;
  service: IntegrationServiceName;
  email?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: string | null;
  scopes?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const current = getConnection(input.userId, input.provider, input.service);
  const id = current?.id || uuid();
  getDatabase()
    .prepare(
      `insert into oauth_connections (
         id, user_id, provider, service, email, access_token_encrypted, refresh_token_encrypted,
         expires_at, scopes, status, metadata_json, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'connected', ?, current_timestamp)
       on conflict(user_id, provider, service) do update set
         email = excluded.email,
         access_token_encrypted = coalesce(excluded.access_token_encrypted, oauth_connections.access_token_encrypted),
         refresh_token_encrypted = coalesce(excluded.refresh_token_encrypted, oauth_connections.refresh_token_encrypted),
         expires_at = excluded.expires_at,
         scopes = excluded.scopes,
         status = 'connected',
         last_error = null,
         metadata_json = excluded.metadata_json,
         updated_at = current_timestamp`
    )
    .run(
      id,
      input.userId,
      input.provider,
      input.service,
      input.email || null,
      input.accessToken ? encryptSecret(input.accessToken) : null,
      input.refreshToken ? encryptSecret(input.refreshToken) : null,
      input.expiresAt || null,
      input.scopes || null,
      JSON.stringify(input.metadata || {})
    );
}

function markConnectionError(userId: string, provider: string, service: IntegrationServiceName, error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "Erro de integração.");
  getDatabase()
    .prepare(
      `update oauth_connections
       set status = 'error', last_error = ?, updated_at = current_timestamp
       where user_id = ? and provider = ? and service = ?`
    )
    .run(message, userId, provider, service);
  audit(userId, provider, service, "error", "failed", message);
  return message;
}

function googleScopes(service: IntegrationServiceName) {
  const base = ["openid", "email", "profile"];
  if (service === "calendar") {
    return [...base, "https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"];
  }
  if (service === "gmail") {
    return [...base, "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send"];
  }
  if (service === "drive") {
    return [...base, "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.metadata.readonly"];
  }
  return base;
}

export function getIntegrationStatus(userId: string) {
  const calendar = getConnection(userId, "google", "calendar");
  const gmail = getConnection(userId, "google", "gmail");
  const drive = getConnection(userId, "google", "drive");
  const pushCount = Number(
    (getDatabase()
      .prepare("select count(*) as total from push_subscriptions where user_id = ? and status = 'active'")
      .get(userId) as { total: number } | undefined)?.total || 0
  );

  return {
    googleCalendar: {
      configured: googleConfigured(),
      ...publicConnection(calendar),
      message: googleConfigured() ? undefined : googleNotConfiguredMessage
    },
    gmail: {
      configured: gmailConfigured(),
      ...publicConnection(gmail),
      message: gmailConfigured() ? undefined : gmailNotConfiguredMessage
    },
    googleDrive: {
      configured: driveConfigured(),
      ...publicConnection(drive),
      message: driveConfigured() ? undefined : driveNotConfiguredMessage
    },
    future: {
      oneDrive: { configured: false, connected: false, status: "prepared", message: "OneDrive preparado para integração futura." },
      outlook: { configured: false, connected: false, status: "prepared", message: "Outlook preparado para integração futura." },
      slack: { configured: false, connected: false, status: "prepared", message: "Slack preparado para integração futura." },
      webhooks: { configured: false, connected: false, status: "prepared", message: "Webhooks personalizados preparados para integração futura." }
    },
    telegram: {
      configured: telegramConfigured(),
      connected: telegramConfigured(),
      status: telegramConfigured() ? "ready" : "not_configured",
      message: telegramConfigured() ? "Bot Telegram configurado no servidor." : telegramNotConfiguredMessage
    },
    whatsapp: {
      configured: whatsappConfigured(),
      connected: whatsappConfigured(),
      status: whatsappConfigured() ? "ready" : "not_configured",
      message: whatsappConfigured() ? "WhatsApp Business API configurado no servidor." : whatsappNotConfiguredMessage
    },
    push: {
      configured: pushConfigured(),
      connected: pushCount > 0,
      subscriptions: pushCount,
      publicKey: env.vapidPublicKey || null,
      message: pushConfigured() ? "Push preparado para inscrições do navegador/app." : pushNotConfiguredMessage
    }
  };
}

export function listIntegrationAuditLogs(userId: string) {
  return getDatabase()
    .prepare(
      `select id, provider, service, action, status, message, metadata_json, created_at
       from integration_audit_logs
       where user_id = ? or user_id is null
       order by created_at desc
       limit 80`
    )
    .all(userId)
    .map((row) => ({
      ...(row as Record<string, unknown>),
      metadata: safeJsonParse(String((row as { metadata_json?: string }).metadata_json || "{}"), {})
    }));
}

export function startGoogleOAuth(userId: string, service: "calendar" | "gmail" | "drive") {
  if (!googleConfigured()) {
    const message = service === "gmail" ? gmailNotConfiguredMessage : service === "drive" ? driveNotConfiguredMessage : googleNotConfiguredMessage;
    audit(userId, "google", service, "connect", "prepared", message);
    return { configured: false, connected: false, message };
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const scopes = googleScopes(service).join(" ");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  getDatabase()
    .prepare(
      `insert into oauth_states (state, user_id, provider, service, scopes, redirect_path, expires_at)
       values (?, ?, 'google', ?, ?, '/app?view=integrations', ?)`
    )
    .run(state, userId, service, scopes, expiresAt);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.googleClientId);
  url.searchParams.set("redirect_uri", env.googleRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  audit(userId, "google", service, "connect_url", "success", "URL OAuth gerada.");
  return { configured: true, connected: false, url: url.toString() };
}

export async function finishGoogleOAuth(code?: string, state?: string) {
  if (!googleConfigured()) return { configured: false, message: googleNotConfiguredMessage };
  if (!code || !state) throw new Error("Código ou estado OAuth ausente.");

  const db = getDatabase();
  const stateRow = db
    .prepare("select state, user_id, provider, service, scopes, expires_at from oauth_states where state = ?")
    .get(state) as { state: string; user_id: string; provider: string; service: "calendar" | "gmail" | "drive"; scopes: string; expires_at: string } | undefined;
  if (!stateRow) throw new Error("Estado OAuth inválido.");
  if (new Date(stateRow.expires_at).getTime() < Date.now()) throw new Error("Estado OAuth expirado. Tente conectar novamente.");

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
    error_description?: string;
  };
  if (!response.ok || !token.access_token) {
    throw new Error(token.error_description || "Não foi possível concluir o OAuth Google.");
  }

  const profile = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  }).then((res) => res.json().catch(() => ({}))) as { email?: string; name?: string };
  const expiresAt = new Date(Date.now() + Number(token.expires_in || 3600) * 1000).toISOString();
  saveConnection({
    userId: stateRow.user_id,
    provider: "google",
    service: stateRow.service,
    email: profile.email || null,
    accessToken: token.access_token,
    refreshToken: token.refresh_token || null,
    expiresAt,
    scopes: token.scope || stateRow.scopes,
    metadata: { name: profile.name || "", connectedVia: "google-oauth" }
  });
  db.prepare("delete from oauth_states where state = ?").run(state);
  audit(stateRow.user_id, "google", stateRow.service, "connect", "success", "Conta Google conectada.", {
    email: profile.email || null
  });
  return {
    connected: true,
    service: stateRow.service,
    email: profile.email || null,
    message: stateRow.service === "gmail" ? "Gmail conectado com segurança." : stateRow.service === "drive" ? "Google Drive conectado com segurança." : "Google Calendar conectado com segurança."
  };
}

async function refreshGoogleConnection(row: OAuthConnectionRow) {
  if (!row.refresh_token_encrypted) throw new Error("Reconecte sua conta Google para renovar o acesso.");
  const refreshToken = decryptSecret(row.refresh_token_encrypted);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  const token = (await response.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !token.access_token) throw new Error(token.error_description || "Não foi possível renovar o token Google.");
  const expiresAt = new Date(Date.now() + Number(token.expires_in || 3600) * 1000).toISOString();
  getDatabase()
    .prepare(
      `update oauth_connections
       set access_token_encrypted = ?, expires_at = ?, status = 'connected', last_error = null, updated_at = current_timestamp
       where id = ?`
    )
    .run(encryptSecret(token.access_token), expiresAt, row.id);
  return token.access_token;
}

async function getGoogleAccessToken(userId: string, service: "calendar" | "gmail" | "drive") {
  const row = getConnection(userId, "google", service);
  if (!row) {
    const message = service === "gmail" ? "Conecte o Gmail antes de usar este recurso." : service === "drive" ? "Conecte o Google Drive antes de usar este recurso." : "Conecte o Google Calendar antes de usar este recurso.";
    throw new Error(message);
  }
  if (!row.access_token_encrypted) throw new Error("Token Google ausente. Reconecte a integração.");
  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (expiresAt && expiresAt - Date.now() < 60_000) {
    return refreshGoogleConnection(row);
  }
  return decryptSecret(row.access_token_encrypted);
}

async function googleJson<T>(userId: string, service: "calendar" | "gmail" | "drive", url: string, init: RequestInit = {}) {
  const accessToken = await getGoogleAccessToken(userId, service);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  const data = (text ? JSON.parse(text) : {}) as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || `Falha Google ${response.status}.`);
  return data as T;
}

function googleEventPayload(input: CalendarInput) {
  const title = cleanText(input.title, "Evento YARA");
  const date = input.date;
  const time = input.time || "";
  const start = time ? { dateTime: `${date}T${time}:00`, timeZone: "America/Bahia" } : { date };
  const endHour = time ? String(Math.min(23, Number(time.slice(0, 2)) + 1)).padStart(2, "0") + time.slice(2) : "";
  const end = time ? { dateTime: `${date}T${endHour}:00`, timeZone: "America/Bahia" } : { date };
  const participants = Array.isArray(input.participants)
    ? input.participants
    : String(input.participants || "").split(",");
  return {
    summary: title,
    description: input.description || "",
    location: input.location || "",
    start,
    end,
    attendees: participants.map((email) => cleanText(email)).filter((email) => /@/.test(email)).map((email) => ({ email }))
  };
}

function upsertLocalGoogleEvent(userId: string, item: Record<string, any>) {
  const start = item.start?.dateTime || item.start?.date || "";
  const eventDate = String(start).slice(0, 10);
  const eventTime = item.start?.dateTime ? String(item.start.dateTime).slice(11, 16) : null;
  if (!item.id || !eventDate) return null;
  const db = getDatabase();
  const participants = Array.isArray(item.attendees)
    ? item.attendees.map((attendee) => attendee.email).filter(Boolean).join(", ")
    : null;
  const existing = db
    .prepare(
      `select id from calendar_events
       where user_id = ? and external_provider = 'google' and external_event_id = ?`
    )
    .get(userId, item.id) as { id: string } | undefined;
  if (existing) {
    db.prepare(
      `update calendar_events
       set title = ?, description = ?, event_date = ?, event_time = ?, location = ?,
           participants = ?, status = ?, external_calendar_id = 'primary', updated_at = current_timestamp
       where id = ? and user_id = ?`
    ).run(
      cleanText(item.summary, "Evento Google"),
      item.description || null,
      eventDate,
      eventTime,
      item.location || null,
      participants,
      item.status || "confirmed",
      existing.id,
      userId
    );
    return item.id as string;
  }
  db.prepare(
    `insert into calendar_events (
       id, user_id, title, description, event_date, event_time, location, participants,
       reminder_minutes, status, created_by, external_provider, external_event_id, external_calendar_id
     )
     values (?, ?, ?, ?, ?, ?, ?, ?, null, ?, 'google', 'google', ?, 'primary')`
  ).run(
    uuid(),
    userId,
    cleanText(item.summary, "Evento Google"),
    item.description || null,
    eventDate,
    eventTime,
    item.location || null,
    participants,
    item.status || "confirmed",
    item.id
  );
  return item.id as string;
}

export async function listGoogleCalendarEvents(userId: string, range?: { from?: string; to?: string }) {
  if (!googleConfigured()) return { configured: false, message: googleNotConfiguredMessage };
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "20");
  if (range?.from) url.searchParams.set("timeMin", `${range.from}T00:00:00-03:00`);
  if (range?.to) url.searchParams.set("timeMax", `${range.to}T23:59:59-03:00`);
  try {
    const data = await googleJson<{ items?: Record<string, any>[] }>(userId, "calendar", url.toString());
    audit(userId, "google", "calendar", "list_events", "success", "Eventos Google listados.");
    return { configured: true, connected: true, events: data.items || [] };
  } catch (error) {
    const message = markConnectionError(userId, "google", "calendar", error);
    return { configured: true, connected: false, message };
  }
}

export async function listGoogleCalendars(userId: string) {
  if (!googleConfigured()) return { configured: false, message: googleNotConfiguredMessage };
  try {
    const data = await googleJson<{ items?: Record<string, unknown>[] }>(
      userId,
      "calendar",
      "https://www.googleapis.com/calendar/v3/users/me/calendarList"
    );
    audit(userId, "google", "calendar", "list_calendars", "success", "Calendários Google listados.");
    return { configured: true, connected: true, calendars: data.items || [] };
  } catch (error) {
    const message = markConnectionError(userId, "google", "calendar", error);
    return { configured: true, connected: false, message };
  }
}

export async function syncGoogleCalendar(userId: string) {
  if (!googleConfigured()) return { configured: false, message: googleNotConfiguredMessage };
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const result = await listGoogleCalendarEvents(userId, { from: today, to: end });
  const events = "events" in result && Array.isArray(result.events) ? result.events : null;
  if (!events) return result;
  const imported = events.map((event) => upsertLocalGoogleEvent(userId, event)).filter(Boolean).length;
  getDatabase()
    .prepare(
      `update oauth_connections set last_sync_at = current_timestamp, status = 'connected', last_error = null, updated_at = current_timestamp
       where user_id = ? and provider = 'google' and service = 'calendar'`
    )
    .run(userId);
  audit(userId, "google", "calendar", "sync", "success", `${imported} evento(s) importado(s).`);
  return { configured: true, connected: true, imported, message: `${imported} evento(s) importado(s) do Google Calendar.` };
}

export async function createGoogleCalendarEvent(userId: string, input: CalendarInput) {
  if (!googleConfigured()) return { configured: false, message: googleNotConfiguredMessage };
  try {
    const data = await googleJson<Record<string, any>>(
      userId,
      "calendar",
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      { method: "POST", body: JSON.stringify(googleEventPayload(input)) }
    );
    upsertLocalGoogleEvent(userId, data);
    audit(userId, "google", "calendar", "create_event", "success", "Evento criado no Google Calendar.", { id: data.id });
    return { configured: true, connected: true, event: data };
  } catch (error) {
    const message = markConnectionError(userId, "google", "calendar", error);
    return { configured: true, connected: false, message };
  }
}

export async function updateGoogleCalendarEvent(userId: string, googleEventId: string, input: Partial<CalendarInput>) {
  if (!googleConfigured()) return { configured: false, message: googleNotConfiguredMessage };
  try {
    const local = getDatabase()
      .prepare("select title, description, event_date, event_time, location, participants from calendar_events where user_id = ? and external_event_id = ?")
      .get(userId, googleEventId) as { title: string; description: string | null; event_date: string; event_time: string | null; location: string | null; participants: string | null } | undefined;
    const payload = googleEventPayload({
      title: input.title || local?.title || "Evento YARA",
      description: input.description ?? local?.description ?? "",
      date: input.date || local?.event_date || new Date().toISOString().slice(0, 10),
      time: input.time ?? local?.event_time ?? null,
      location: input.location ?? local?.location ?? "",
      participants: input.participants ?? local?.participants ?? ""
    });
    const data = await googleJson<Record<string, any>>(
      userId,
      "calendar",
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(googleEventId)}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    upsertLocalGoogleEvent(userId, data);
    audit(userId, "google", "calendar", "update_event", "success", "Evento atualizado no Google Calendar.", { id: googleEventId });
    return { configured: true, connected: true, event: data };
  } catch (error) {
    const message = markConnectionError(userId, "google", "calendar", error);
    return { configured: true, connected: false, message };
  }
}

export async function deleteGoogleCalendarEvent(userId: string, googleEventId: string) {
  if (!googleConfigured()) return { configured: false, message: googleNotConfiguredMessage };
  try {
    await googleJson<Record<string, unknown>>(
      userId,
      "calendar",
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(googleEventId)}`,
      { method: "DELETE" }
    );
    getDatabase()
      .prepare("update calendar_events set status = 'cancelled', updated_at = current_timestamp where user_id = ? and external_event_id = ?")
      .run(userId, googleEventId);
    audit(userId, "google", "calendar", "delete_event", "success", "Evento excluído no Google Calendar.", { id: googleEventId });
    return { configured: true, connected: true, deleted: true, id: googleEventId };
  } catch (error) {
    const message = markConnectionError(userId, "google", "calendar", error);
    return { configured: true, connected: false, message };
  }
}

function parseGmailHeaders(message: Record<string, any>) {
  const headers = Array.isArray(message.payload?.headers) ? message.payload.headers : [];
  const find = (name: string) => headers.find((header: { name?: string }) => String(header.name || "").toLowerCase() === name.toLowerCase())?.value || "";
  return {
    subject: find("Subject"),
    from: find("From"),
    date: find("Date")
  };
}

function cacheGmailMessage(userId: string, message: Record<string, any>) {
  const headers = parseGmailHeaders(message);
  getDatabase()
    .prepare(
      `insert into gmail_messages_cache (
         id, user_id, gmail_id, thread_id, subject, from_email, snippet, labels_json, received_at, payload_json, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
       on conflict(user_id, gmail_id) do update set
         thread_id = excluded.thread_id,
         subject = excluded.subject,
         from_email = excluded.from_email,
         snippet = excluded.snippet,
         labels_json = excluded.labels_json,
         received_at = excluded.received_at,
         payload_json = excluded.payload_json,
         updated_at = current_timestamp`
    )
    .run(
      uuid(),
      userId,
      message.id,
      message.threadId || null,
      headers.subject || "(sem assunto)",
      headers.from || "",
      message.snippet || "",
      JSON.stringify(message.labelIds || []),
      message.internalDate ? new Date(Number(message.internalDate)).toISOString() : null,
      JSON.stringify(message)
    );
}

export async function listGmailMessages(userId: string, query = "", maxResults = 10) {
  if (!gmailConfigured()) return { configured: false, message: gmailNotConfiguredMessage };
  try {
    const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
    url.searchParams.set("maxResults", String(Math.min(20, Math.max(1, maxResults))));
    if (query) url.searchParams.set("q", query);
    const list = await googleJson<{ messages?: Array<{ id: string }> }>(userId, "gmail", url.toString());
    const messages = [];
    for (const item of list.messages || []) {
      const detail = await googleJson<Record<string, any>>(
        userId,
        "gmail",
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(item.id)}?format=metadata`
      );
      cacheGmailMessage(userId, detail);
      const headers = parseGmailHeaders(detail);
      messages.push({
        id: detail.id,
        threadId: detail.threadId,
        subject: headers.subject || "(sem assunto)",
        from: headers.from,
        snippet: detail.snippet || "",
        labels: detail.labelIds || [],
        receivedAt: detail.internalDate ? new Date(Number(detail.internalDate)).toISOString() : null
      });
    }
    getDatabase()
      .prepare(
        `update oauth_connections set last_sync_at = current_timestamp, status = 'connected', last_error = null, updated_at = current_timestamp
         where user_id = ? and provider = 'google' and service = 'gmail'`
      )
      .run(userId);
    audit(userId, "google", "gmail", "list_messages", "success", `${messages.length} e-mail(s) listado(s).`);
    return { configured: true, connected: true, messages };
  } catch (error) {
    const message = markConnectionError(userId, "google", "gmail", error);
    return { configured: true, connected: false, message };
  }
}

export async function summarizeGmailMessages(userId: string, query = "is:unread", maxResults = 5) {
  const result = await listGmailMessages(userId, query, maxResults);
  const messages = "messages" in result && Array.isArray(result.messages) ? result.messages : null;
  if (!messages) return result;
  if (messages.length === 0) return { ...result, summary: "Nenhum e-mail encontrado para resumir." };
  try {
    const ai = await askYara({
      prompt: [
        "Resuma os e-mails abaixo em português, separando prioridades e próximos passos.",
        ...messages.map((message, index) => `${index + 1}. ${message.subject} — ${message.from}\n${message.snippet}`)
      ].join("\n\n")
    });
    return { ...result, summary: ai.response, model: ai.model };
  } catch {
    return {
      ...result,
      summary: messages.map((message, index) => `${index + 1}. ${message.subject} — ${message.snippet}`).join("\n")
    };
  }
}

export async function sendGmailMessage(userId: string, input: { to: string; subject: string; body: string }) {
  if (!gmailConfigured()) return { configured: false, message: gmailNotConfiguredMessage };
  const to = cleanText(input.to);
  const subject = cleanText(input.subject, "Mensagem da YARA AI");
  const body = String(input.body || "").trim();
  if (!/@/.test(to) || !body) throw new Error("Informe destinatário e corpo do e-mail.");
  const raw = base64Url([
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body
  ].join("\r\n"));
  try {
    const data = await googleJson<Record<string, any>>(
      userId,
      "gmail",
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      { method: "POST", body: JSON.stringify({ raw }) }
    );
    audit(userId, "google", "gmail", "send_email", "success", "E-mail enviado via Gmail.", { to, subject });
    return { configured: true, connected: true, sent: true, id: data.id };
  } catch (error) {
    const message = markConnectionError(userId, "google", "gmail", error);
    return { configured: true, connected: false, message };
  }
}

export async function createGmailDraft(userId: string, input: { to: string; subject: string; body: string }) {
  if (!gmailConfigured()) return { configured: false, message: gmailNotConfiguredMessage };
  const to = cleanText(input.to);
  const subject = cleanText(input.subject, "Rascunho da YARA AI");
  const body = String(input.body || "").trim();
  if (!/@/.test(to) || !body) throw new Error("Informe destinatário e corpo do rascunho.");
  const raw = base64Url([
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body
  ].join("\r\n"));
  try {
    const data = await googleJson<Record<string, any>>(
      userId,
      "gmail",
      "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
      { method: "POST", body: JSON.stringify({ message: { raw } }) }
    );
    audit(userId, "google", "gmail", "create_draft", "success", "Rascunho criado no Gmail.", { to, subject });
    return { configured: true, connected: true, draft: data };
  } catch (error) {
    const message = markConnectionError(userId, "google", "gmail", error);
    return { configured: true, connected: false, message };
  }
}

function driveQuery(value = "") {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function cacheDriveFile(userId: string, file: Record<string, any>) {
  if (!file.id) return;
  getDatabase()
    .prepare(
      `insert into drive_files_cache (
         id, user_id, drive_id, name, mime_type, web_view_link, size, modified_at, metadata_json, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
       on conflict(user_id, drive_id) do update set
         name = excluded.name,
         mime_type = excluded.mime_type,
         web_view_link = excluded.web_view_link,
         size = excluded.size,
         modified_at = excluded.modified_at,
         metadata_json = excluded.metadata_json,
         updated_at = current_timestamp`
    )
    .run(
      uuid(),
      userId,
      file.id,
      cleanText(file.name, "Arquivo Drive"),
      file.mimeType || null,
      file.webViewLink || null,
      file.size ? Number(file.size) : null,
      file.modifiedTime || null,
      JSON.stringify(file)
    );
}

export async function listGoogleDriveFiles(userId: string, query = "", maxResults = 10) {
  if (!driveConfigured()) return { configured: false, message: driveNotConfiguredMessage };
  try {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("pageSize", String(Math.min(50, Math.max(1, maxResults))));
    url.searchParams.set("fields", "files(id,name,mimeType,size,modifiedTime,webViewLink,parents)");
    url.searchParams.set("orderBy", "modifiedTime desc");
    if (query) {
      url.searchParams.set("q", `name contains '${driveQuery(query)}' and trashed = false`);
    } else {
      url.searchParams.set("q", "trashed = false");
    }
    const data = await googleJson<{ files?: Record<string, any>[] }>(userId, "drive", url.toString());
    const files = data.files || [];
    files.forEach((file) => cacheDriveFile(userId, file));
    getDatabase()
      .prepare(
        `update oauth_connections set last_sync_at = current_timestamp, status = 'connected', last_error = null, updated_at = current_timestamp
         where user_id = ? and provider = 'google' and service = 'drive'`
      )
      .run(userId);
    audit(userId, "google", "drive", "list_files", "success", `${files.length} arquivo(s) listado(s).`);
    return { configured: true, connected: true, files };
  } catch (error) {
    const message = markConnectionError(userId, "google", "drive", error);
    return { configured: true, connected: false, message };
  }
}

export async function createGoogleDriveFolder(userId: string, name: string) {
  if (!driveConfigured()) return { configured: false, message: driveNotConfiguredMessage };
  try {
    const folder = await googleJson<Record<string, any>>(
      userId,
      "drive",
      "https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink",
      {
        method: "POST",
        body: JSON.stringify({
          name: cleanText(name, "YARA AI"),
          mimeType: "application/vnd.google-apps.folder"
        })
      }
    );
    cacheDriveFile(userId, folder);
    audit(userId, "google", "drive", "create_folder", "success", "Pasta criada no Google Drive.", { id: folder.id });
    return { configured: true, connected: true, folder };
  } catch (error) {
    const message = markConnectionError(userId, "google", "drive", error);
    return { configured: true, connected: false, message };
  }
}

export async function uploadYaraFileToDrive(userId: string, fileId: string, folderId?: string | null) {
  if (!driveConfigured()) return { configured: false, message: driveNotConfiguredMessage };
  const file = getFileForDownload(userId, fileId);
  const accessToken = await getGoogleAccessToken(userId, "drive");
  const boundary = `yara-drive-${crypto.randomBytes(12).toString("hex")}`;
  const metadata = {
    name: file.name,
    mimeType: file.type,
    ...(folderId ? { parents: [folderId] } : {})
  };
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`, "utf8"),
    Buffer.from(`--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`, "utf8"),
    fs.readFileSync(file.path),
    Buffer.from(`\r\n--${boundary}--`, "utf8")
  ]);
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": String(body.length)
    },
    body
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, any> & { error?: { message?: string } };
  if (!response.ok) {
    const message = data.error?.message || "Não foi possível salvar no Google Drive.";
    markConnectionError(userId, "google", "drive", new Error(message));
    return { configured: true, connected: false, message };
  }
  cacheDriveFile(userId, data);
  audit(userId, "google", "drive", "upload_file", "success", "Arquivo YARA enviado ao Drive.", { fileId, driveId: data.id });
  return { configured: true, connected: true, file: data };
}

export async function sendTelegramMessage(input: { chatId?: string; text?: string }) {
  if (!telegramConfigured()) return { configured: false, message: telegramNotConfiguredMessage };
  const chatId = cleanText(input.chatId);
  const text = cleanText(input.text, "YARA AI online.");
  if (!chatId) throw new Error("Informe o chatId do Telegram.");
  const response = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  const data = await response.json().catch(() => ({})) as { ok?: boolean; description?: string };
  if (!response.ok || data.ok === false) throw new Error(data.description || "Não foi possível enviar mensagem no Telegram.");
  audit(null, "telegram", "telegram", "send_message", "success", "Mensagem enviada no Telegram.");
  return { configured: true, sent: true, result: data };
}

export async function handleTelegramWebhook(body: any, secret?: string) {
  if (!telegramConfigured()) return { configured: false, message: telegramNotConfiguredMessage };
  if (env.telegramWebhookSecret && secret !== env.telegramWebhookSecret) throw new Error("Webhook Telegram não autorizado.");
  const chatId = body?.message?.chat?.id;
  const text = body?.message?.text;
  audit(null, "telegram", "telegram", "webhook", "success", "Webhook Telegram recebido.", { chatId, hasText: Boolean(text) });
  if (chatId && text) {
    await sendTelegramMessage({ chatId: String(chatId), text: `YARA recebeu: ${text}` });
  }
  return { configured: true, received: true };
}

export async function sendWhatsappMessage(input: { to?: string; text?: string }) {
  if (!whatsappConfigured()) return { configured: false, message: whatsappNotConfiguredMessage };
  const to = cleanText(input.to);
  const text = cleanText(input.text, "YARA AI online.");
  if (!to) throw new Error("Informe o número destino do WhatsApp.");
  const response = await fetch(`https://graph.facebook.com/v20.0/${env.whatsappPhoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.whatsappAccessToken}`
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text }
    })
  });
  const data = await response.json().catch(() => ({})) as { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || "Não foi possível enviar mensagem no WhatsApp.");
  audit(null, "whatsapp", "whatsapp", "send_message", "success", "Mensagem enviada no WhatsApp.", { to });
  return { configured: true, sent: true, result: data };
}

export function verifyWhatsappWebhook(query: { [key: string]: unknown }) {
  if (!env.whatsappVerifyToken) return { configured: false, message: whatsappNotConfiguredMessage };
  const mode = String(query["hub.mode"] || "");
  const token = String(query["hub.verify_token"] || "");
  const challenge = String(query["hub.challenge"] || "");
  if (mode === "subscribe" && token === env.whatsappVerifyToken) return { challenge };
  throw new Error("Webhook WhatsApp não autorizado.");
}

export function handleWhatsappWebhook(body: any) {
  audit(null, "whatsapp", "whatsapp", "webhook", "success", "Webhook WhatsApp recebido.", {
    entries: Array.isArray(body?.entry) ? body.entry.length : 0
  });
  return { configured: whatsappConfigured(), received: true };
}

export function savePushSubscription(userId: string, subscription: Record<string, unknown>) {
  const endpoint = cleanText(subscription.endpoint);
  if (!endpoint) throw new Error("Inscrição push inválida.");
  getDatabase()
    .prepare(
      `insert into push_subscriptions (id, user_id, endpoint, subscription_json, status, updated_at)
       values (?, ?, ?, ?, 'active', current_timestamp)
       on conflict(user_id, endpoint) do update set
         subscription_json = excluded.subscription_json,
         status = 'active',
         updated_at = current_timestamp`
    )
    .run(uuid(), userId, endpoint, JSON.stringify(subscription));
  audit(userId, "browser", "push", "subscribe", "success", "Inscrição push salva.");
  return { configured: pushConfigured(), subscribed: true, message: pushConfigured() ? "Push inscrito." : pushNotConfiguredMessage };
}

export function listPushSubscriptions(userId: string) {
  return getDatabase()
    .prepare("select id, endpoint, status, created_at, updated_at from push_subscriptions where user_id = ? order by updated_at desc")
    .all(userId);
}

export function deletePushSubscription(userId: string, id: string) {
  getDatabase().prepare("delete from push_subscriptions where id = ? and user_id = ?").run(id, userId);
  audit(userId, "browser", "push", "unsubscribe", "success", "Inscrição push removida.");
  return { id };
}

export function createInternalNotification(userId: string, input: { type?: string; title: string; message: string; scheduledFor?: string; channel?: string }) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into notifications (id, user_id, type, title, message, status, scheduled_for, channel)
       values (?, ?, ?, ?, ?, 'scheduled', ?, ?)`
    )
    .run(id, userId, input.type || "manual", cleanText(input.title, "YARA AI"), cleanText(input.message), input.scheduledFor || nowIso(), input.channel || "internal");
  return { id, title: input.title, message: input.message, status: "scheduled" };
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

function nextWeekday(target: number) {
  const date = todayInYaraTimezone();
  const diff = (target - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function normalized(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function dateFromPortuguese(message: string) {
  const lower = normalized(message);
  if (/\bhoje\b/.test(lower)) return todayInYaraTimezone().toISOString().slice(0, 10);
  if (/\bamanha\b/.test(lower)) {
    const date = todayInYaraTimezone();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }
  const weekdays: Record<string, number> = {
    domingo: 0,
    segunda: 1,
    "segunda-feira": 1,
    terca: 2,
    "terca-feira": 2,
    quarta: 3,
    "quarta-feira": 3,
    quinta: 4,
    "quinta-feira": 4,
    sexta: 5,
    "sexta-feira": 5,
    sabado: 6
  };
  const found = Object.entries(weekdays).find(([name]) => lower.includes(name));
  return found ? nextWeekday(found[1]) : todayInYaraTimezone().toISOString().slice(0, 10);
}

function parseTime(message: string) {
  const match = /\b(?:às|as)?\s*(\d{1,2})(?::|h)?(\d{2})?\b/i.exec(message);
  if (!match) return null;
  const hour = Math.max(0, Math.min(23, Number(match[1])));
  const minute = Math.max(0, Math.min(59, Number(match[2] || 0)));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export async function tryHandleIntegrationChatIntent(userId: string, message: string) {
  const lower = normalized(message);
  const wantsAutomation =
    /\b(todo dia|diario|diaria|semanal|recorrente|automatico|automacao|automatize|criar relatorio diario|relatorio diario)\b/.test(lower) &&
    /\b(lembre|relatorio|resumo|tarefa|verificar|checagem)\b/.test(lower);
  if (wantsAutomation) {
    const scheduleExpression = /\b(semanal|toda semana)\b/.test(lower) ? "weekly" : "daily";
    const time = parseTime(message) || "09:00";
    const tomorrow = todayInYaraTimezone();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextRunAt = new Date(`${tomorrow.toISOString().slice(0, 10)}T${time}:00`).toISOString();
    const type = /\b(relatorio|resumo)\b/.test(lower) ? "daily_summary" : /\b(tarefa)\b/.test(lower) ? "recurring_task" : "reminder";
    const automation = createAutomation(userId, {
      name: cleanText(message.replace(/^(crie|criar|automatize|lembre-me de)\s+/i, ""), "Automação YARA"),
      type,
      scheduleExpression,
      nextRunAt,
      action: {
        title: cleanText(message, "Automação YARA"),
        message,
        source: "chat"
      }
    });
    return {
      type: "automation_create",
      text: `Automação criada: ${automation.name}. Próxima execução: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(automation.nextRunAt || nextRunAt))}.`
    };
  }

  if (/\b(drive|google drive)\b/.test(lower) && /\b(busque|procure|listar|arquivos)\b/.test(lower)) {
    const result = await listGoogleDriveFiles(userId, "", 10);
    const files = "files" in result && Array.isArray(result.files) ? result.files : null;
    if (!files) return { type: "drive_list", text: result.message };
    if (!files.length) return { type: "drive_list", text: "Nenhum arquivo encontrado no Google Drive conectado." };
    return {
      type: "drive_list",
      text: ["Arquivos recentes no Drive:", ...files.map((file, index) => `${index + 1}. ${file.name || "Arquivo"} — ${file.mimeType || "tipo não informado"}`)].join("\n")
    };
  }

  const wantsEvents = /\b(eventos?|agenda|compromissos?)\b/.test(lower) && /\b(hoje|amanha|semana|quais|listar|tenho)\b/.test(lower);
  if (wantsEvents) {
    const date = dateFromPortuguese(message);
    const rows = getDatabase()
      .prepare(
        `select title, event_date, event_time, location, status
         from calendar_events
         where user_id = ? and event_date = ? and status <> 'cancelled'
         order by coalesce(event_time, '23:59') asc`
      )
      .all(userId, date) as Array<{ title: string; event_date: string; event_time: string | null; location: string | null; status: string }>;
    if (rows.length === 0) return { type: "calendar_query", text: `Você não tem eventos registrados para ${date}.` };
    return {
      type: "calendar_query",
      text: [
        `Eventos em ${date}:`,
        ...rows.map((event, index) => `${index + 1}. ${event.event_time || "sem horário"} — ${event.title}${event.location ? ` (${event.location})` : ""}`)
      ].join("\n")
    };
  }

  const wantsCancel = /\b(cancele|cancelar|exclua|remova)\b/.test(lower) && /\b(reuniao|evento|consulta|compromisso)\b/.test(lower);
  if (wantsCancel) {
    const date = dateFromPortuguese(message);
    const event = getDatabase()
      .prepare(
        `select id, title, external_event_id
         from calendar_events
         where user_id = ? and event_date = ? and status <> 'cancelled'
         order by coalesce(event_time, '23:59') asc
         limit 1`
      )
      .get(userId, date) as { id: string; title: string; external_event_id: string | null } | undefined;
    if (!event) return { type: "calendar_cancel", text: `Não encontrei evento ativo para cancelar em ${date}.` };
    getDatabase()
      .prepare("update calendar_events set status = 'cancelled', updated_at = current_timestamp where id = ? and user_id = ?")
      .run(event.id, userId);
    if (event.external_event_id) {
      await deleteGoogleCalendarEvent(userId, event.external_event_id).catch(() => null);
    }
    return { type: "calendar_cancel", text: `Evento cancelado: ${event.title} em ${date}.` };
  }

  if (/\b(ultimos emails|ultimos e-mails|emails recentes|e-mails recentes|mostre meus.*emails)\b/.test(lower)) {
    const result = await listGmailMessages(userId, "", 5);
    const messages = "messages" in result && Array.isArray(result.messages) ? result.messages : null;
    if (!messages) return { type: "gmail_list", text: result.message };
    if (messages.length === 0) return { type: "gmail_list", text: "Nenhum e-mail recente encontrado." };
    return {
      type: "gmail_list",
      text: [
        "Últimos e-mails:",
        ...messages.map((email, index) => `${index + 1}. ${email.subject} — ${email.from}\n${email.snippet}`)
      ].join("\n\n")
    };
  }

  if (/\b(resuma|resumir)\b/.test(lower) && /\b(emails|e-mails|gmail)\b/.test(lower)) {
    const result = await summarizeGmailMessages(userId, lower.includes("nao lidos") || lower.includes("não lidos") ? "is:unread" : "", 5);
    if (!("summary" in result)) return { type: "gmail_summary", text: result.message };
    return { type: "gmail_summary", text: result.summary };
  }

  if (/\b(envie|enviar)\b/.test(lower) && /\b(email|e-mail)\b/.test(lower)) {
    const email = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    if (!email) {
      return {
        type: "gmail_send",
        text: "Posso enviar e-mail pelo Gmail conectado, mas preciso do endereço completo do destinatário, assunto e mensagem."
      };
    }
    return {
      type: "gmail_send",
      text: `Encontrei o destinatário ${email}. Para evitar envio acidental, confirme o assunto e o corpo do e-mail na área Integrações > Gmail.`
    };
  }

  return null;
}
