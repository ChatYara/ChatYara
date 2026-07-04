import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { recordAudit } from "./auditService";

type AutomationRow = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  trigger_type: string;
  schedule_expression: string | null;
  next_run_at: string | null;
  action_json: string;
  status: string;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AutomationInput = {
  name: string;
  type: string;
  triggerType?: string;
  scheduleExpression?: string | null;
  nextRunAt?: string | null;
  action?: Record<string, unknown>;
  status?: string;
};

let schedulerStarted = false;

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

function normalizeDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Data da automação inválida.");
  return date.toISOString();
}

function normalizeSchedule(value?: string | null) {
  const schedule = cleanText(value || "once").toLowerCase();
  if (["once", "daily", "weekly", "monthly", "manual"].includes(schedule)) return schedule;
  return "once";
}

function publicAutomation(row: AutomationRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    triggerType: row.trigger_type,
    scheduleExpression: row.schedule_expression,
    nextRunAt: row.next_run_at,
    action: safeJsonParse(row.action_json, {}),
    status: row.status,
    lastRunAt: row.last_run_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function nextRunFrom(schedule: string | null, base = new Date()) {
  const normalized = normalizeSchedule(schedule);
  if (normalized === "daily") return new Date(base.getTime() + 24 * 60 * 60 * 1000).toISOString();
  if (normalized === "weekly") return new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  if (normalized === "monthly") {
    const next = new Date(base);
    next.setMonth(next.getMonth() + 1);
    return next.toISOString();
  }
  return null;
}

function assertAutomationOwner(userId: string, automationId: string) {
  const automation = getDatabase()
    .prepare("select * from automations where id = ? and user_id = ?")
    .get(automationId, userId) as AutomationRow | undefined;
  if (!automation) throw new Error("Automação não encontrada.");
  return automation;
}

export function listAutomations(userId: string) {
  const rows = getDatabase()
    .prepare("select * from automations where user_id = ? order by coalesce(next_run_at, updated_at) asc")
    .all(userId) as AutomationRow[];
  return rows.map(publicAutomation);
}

export function listAutomationExecutions(userId: string, automationId?: string) {
  const sql = automationId
    ? "select * from automation_executions where user_id = ? and automation_id = ? order by started_at desc limit 80"
    : "select * from automation_executions where user_id = ? order by started_at desc limit 80";
  const rows = automationId
    ? getDatabase().prepare(sql).all(userId, automationId)
    : getDatabase().prepare(sql).all(userId);
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    ...row,
    result: safeJsonParse(String(row.result_json || "{}"), {})
  }));
}

export function createAutomation(userId: string, input: AutomationInput) {
  const name = cleanText(input.name, "Automação YARA");
  const type = cleanText(input.type, "reminder").toLowerCase();
  const schedule = normalizeSchedule(input.scheduleExpression);
  const nextRunAt = normalizeDate(input.nextRunAt) || (schedule === "manual" ? null : new Date(Date.now() + 60_000).toISOString());
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into automations (
         id, user_id, name, type, trigger_type, schedule_expression, next_run_at, action_json, status, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(
      id,
      userId,
      name,
      type,
      cleanText(input.triggerType || "scheduled", "scheduled"),
      schedule,
      nextRunAt,
      JSON.stringify(input.action || {}),
      input.status || "active"
    );
  recordAudit({
    userId,
    category: "automations",
    action: "create",
    entityType: "automation",
    entityId: id,
    message: "Automação criada.",
    metadata: { type, schedule }
  });
  return publicAutomation(assertAutomationOwner(userId, id));
}

export function updateAutomation(userId: string, automationId: string, input: Partial<AutomationInput>) {
  const current = assertAutomationOwner(userId, automationId);
  const action = input.action === undefined ? safeJsonParse(current.action_json, {}) : input.action || {};
  const schedule = input.scheduleExpression === undefined ? current.schedule_expression : normalizeSchedule(input.scheduleExpression);
  const nextRunAt = input.nextRunAt === undefined ? current.next_run_at : normalizeDate(input.nextRunAt);
  getDatabase()
    .prepare(
      `update automations
       set name = ?, type = ?, trigger_type = ?, schedule_expression = ?, next_run_at = ?,
           action_json = ?, status = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      input.name ? cleanText(input.name, current.name) : current.name,
      input.type ? cleanText(input.type, current.type).toLowerCase() : current.type,
      input.triggerType ? cleanText(input.triggerType, current.trigger_type) : current.trigger_type,
      schedule,
      nextRunAt,
      JSON.stringify(action),
      input.status || current.status,
      automationId,
      userId
    );
  return publicAutomation(assertAutomationOwner(userId, automationId));
}

export function deleteAutomation(userId: string, automationId: string) {
  assertAutomationOwner(userId, automationId);
  getDatabase().prepare("delete from automations where id = ? and user_id = ?").run(automationId, userId);
  recordAudit({
    userId,
    category: "automations",
    action: "delete",
    entityType: "automation",
    entityId: automationId,
    message: "Automação excluída."
  });
  return { id: automationId, deleted: true };
}

function insertNotification(userId: string, input: { type: string; title: string; message: string }) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into notifications (id, user_id, type, title, message, status, scheduled_for, channel)
       values (?, ?, ?, ?, ?, 'scheduled', ?, 'automation')`
    )
    .run(id, userId, input.type, input.title, input.message, new Date().toISOString());
  return id;
}

function executeAction(row: AutomationRow) {
  const action = safeJsonParse<Record<string, any>>(row.action_json, {});
  const title = cleanText(action.title || row.name, row.name);
  const message = cleanText(action.message || action.description || `Automação executada: ${row.name}`, `Automação executada: ${row.name}`);
  const result: Record<string, unknown> = { type: row.type, title, message };

  if (row.type === "reminder") {
    const reminderId = uuid();
    getDatabase()
      .prepare(
        `insert into reminders (id, user_id, title, message, scheduled_at, recurrence, status, updated_at)
         values (?, ?, ?, ?, ?, ?, 'pending', current_timestamp)`
      )
      .run(reminderId, row.user_id, title, message, new Date().toISOString(), row.schedule_expression || "none");
    result.reminderId = reminderId;
  }

  if (row.type === "recurring_task" && action.projectId) {
    const project = getDatabase()
      .prepare("select id from projects where id = ? and user_id = ?")
      .get(String(action.projectId), row.user_id) as { id: string } | undefined;
    if (project) {
      const taskId = uuid();
      getDatabase()
        .prepare(
          `insert into project_tasks (id, user_id, project_id, title, description, priority, due_date, updated_at)
           values (?, ?, ?, ?, ?, ?, ?, current_timestamp)`
        )
        .run(taskId, row.user_id, project.id, title, message, action.priority || "medium", action.dueDate || null);
      result.taskId = taskId;
    }
  }

  result.notificationId = insertNotification(row.user_id, {
    type: `automation_${row.type}`,
    title,
    message
  });
  return result;
}

export function runAutomation(userId: string, automationId: string) {
  const automation = assertAutomationOwner(userId, automationId);
  const executionId = uuid();
  const startedAt = new Date();
  getDatabase()
    .prepare(
      `insert into automation_executions (id, automation_id, user_id, status, result_json, started_at)
       values (?, ?, ?, 'running', '{}', ?)`
    )
    .run(executionId, automation.id, userId, startedAt.toISOString());

  try {
    const result = executeAction(automation);
    const nextRunAt = nextRunFrom(automation.schedule_expression, startedAt);
    const nextStatus = nextRunAt ? "active" : automation.status === "active" ? "completed" : automation.status;
    getDatabase()
      .prepare(
        `update automations
         set last_run_at = ?, next_run_at = ?, status = ?, updated_at = current_timestamp
         where id = ? and user_id = ?`
      )
      .run(new Date().toISOString(), nextRunAt, nextStatus, automation.id, userId);
    getDatabase()
      .prepare(
        `update automation_executions
         set status = 'success', result_json = ?, finished_at = current_timestamp
         where id = ? and user_id = ?`
      )
      .run(JSON.stringify(result), executionId, userId);
    recordAudit({
      userId,
      category: "automations",
      action: "execute",
      entityType: "automation",
      entityId: automation.id,
      message: "Automação executada.",
      metadata: { executionId, result }
    });
    return { executionId, status: "success", result, automation: publicAutomation(assertAutomationOwner(userId, automation.id)) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao executar automação.";
    getDatabase()
      .prepare(
        `update automation_executions
         set status = 'failed', error = ?, finished_at = current_timestamp
         where id = ? and user_id = ?`
      )
      .run(message, executionId, userId);
    throw new Error(message);
  }
}

export function processDueAutomations(limit = 25) {
  const rows = getDatabase()
    .prepare(
      `select * from automations
       where status = 'active' and next_run_at is not null and next_run_at <= ?
       order by next_run_at asc
       limit ?`
    )
    .all(new Date().toISOString(), limit) as AutomationRow[];

  const results = [];
  for (const row of rows) {
    try {
      results.push(runAutomation(row.user_id, row.id));
    } catch (error) {
      results.push({ automationId: row.id, status: "failed", error: error instanceof Error ? error.message : "Falha." });
    }
  }
  return { processed: results.length, results };
}

export function startAutomationScheduler() {
  if (schedulerStarted || process.env.NODE_ENV === "test") return;
  schedulerStarted = true;
  const timer = setInterval(() => {
    try {
      processDueAutomations();
    } catch (error) {
      console.warn("[YARA automation]", error instanceof Error ? error.message : error);
    }
  }, 60_000);
  timer.unref?.();
}
