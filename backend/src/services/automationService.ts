import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { recordAudit } from "./auditService";

type AutomationRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  type: string;
  trigger_type: string;
  trigger_config_json: string;
  schedule_expression: string | null;
  next_run_at: string | null;
  action_json: string;
  status: string;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

type AutomationActionInput = {
  type?: string;
  actionType?: string;
  config?: Record<string, unknown>;
  actionConfig?: Record<string, unknown>;
};

export type AutomationInput = {
  name: string;
  description?: string;
  type: string;
  triggerType?: string;
  triggerConfig?: Record<string, unknown>;
  scheduleExpression?: string | null;
  nextRunAt?: string | null;
  action?: Record<string, unknown>;
  actions?: AutomationActionInput[];
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

function normalizeStatus(value?: string) {
  const status = cleanText(value || "active").toLowerCase();
  if (["active", "paused", "completed", "failed", "disabled"].includes(status)) return status;
  return "active";
}

function normalizeTriggerType(value?: string) {
  const trigger = cleanText(value || "scheduled").toLowerCase();
  const aliases: Record<string, string> = {
    horario: "scheduled",
    "horário": "scheduled",
    agenda: "scheduled",
    criacao: "creation",
    "criação": "creation",
    atualizacao: "update",
    "atualização": "update",
    projeto: "project",
    "projeto técnico": "technical_project",
    tecnico: "technical_project",
    técnico: "technical_project",
    arquivo: "file",
    memoria: "memory",
    memória: "memory"
  };
  return aliases[trigger] || trigger;
}

function publicAutomation(row: AutomationRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || "",
    type: row.type,
    triggerType: row.trigger_type,
    triggerConfig: safeJsonParse(row.trigger_config_json, {}),
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

function listActions(userId: string, automationId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, action_type, action_config_json, sort_order, status, created_at, updated_at
       from automation_actions
       where user_id = ? and automation_id = ?
       order by sort_order asc, created_at asc`
    )
    .all(userId, automationId) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: row.id,
    type: row.action_type,
    config: safeJsonParse(String(row.action_config_json || "{}"), {}),
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function listTriggers(userId: string, automationId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, trigger_type, trigger_config_json, status, created_at, updated_at
       from automation_triggers
       where user_id = ? and automation_id = ?
       order by created_at asc`
    )
    .all(userId, automationId) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: row.id,
    type: row.trigger_type,
    config: safeJsonParse(String(row.trigger_config_json || "{}"), {}),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

function insertAutomationLog(input: {
  userId: string;
  automationId?: string;
  runId?: string;
  level?: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into automation_logs (id, user_id, automation_id, run_id, level, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.userId,
      input.automationId || null,
      input.runId || null,
      input.level || "info",
      cleanText(input.message, "Evento de automação."),
      JSON.stringify(input.metadata || {})
    );
  return id;
}

function insertAutomationAudit(input: {
  userId: string;
  automationId?: string;
  action: string;
  status?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into automation_audit_logs (id, user_id, automation_id, action, status, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.userId,
      input.automationId || null,
      input.action,
      input.status || "success",
      input.message || "",
      JSON.stringify(input.metadata || {})
    );
  return id;
}

function upsertAutomationTriggers(userId: string, automationId: string, triggerType: string, triggerConfig: Record<string, unknown>) {
  getDatabase().prepare("delete from automation_triggers where automation_id = ? and user_id = ?").run(automationId, userId);
  getDatabase()
    .prepare(
      `insert into automation_triggers (id, user_id, automation_id, trigger_type, trigger_config_json, status)
       values (?, ?, ?, ?, ?, 'active')`
    )
    .run(uuid(), userId, automationId, triggerType, JSON.stringify(triggerConfig || {}));
}

function upsertAutomationActions(userId: string, automationId: string, action: Record<string, unknown>, actions?: AutomationActionInput[]) {
  const normalizedActions =
    actions && actions.length
      ? actions
      : [
          {
            type: cleanText(action.type || action.actionType || "notify", "notify"),
            config: action
          }
        ];
  getDatabase().prepare("delete from automation_actions where automation_id = ? and user_id = ?").run(automationId, userId);
  normalizedActions.forEach((item, index) => {
    const actionType = cleanText(item.actionType || item.type || "notify", "notify").toLowerCase();
    const config = item.actionConfig || item.config || action || {};
    getDatabase()
      .prepare(
        `insert into automation_actions (id, user_id, automation_id, action_type, action_config_json, sort_order, status)
         values (?, ?, ?, ?, ?, ?, 'active')`
      )
      .run(uuid(), userId, automationId, actionType, JSON.stringify(config), index);
  });
}

function dashboardFor(userId: string) {
  const db = getDatabase();
  const count = (sql: string, ...params: unknown[]) =>
    Number((db.prepare(sql).get(...(params as any[])) as { total?: number } | undefined)?.total || 0);
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: count("select count(*) as total from automations where user_id = ?", userId),
    active: count("select count(*) as total from automations where user_id = ? and status = 'active'", userId),
    runsToday: count("select count(*) as total from automation_runs where user_id = ? and created_at >= ?", userId, today),
    failures: count("select count(*) as total from automation_runs where user_id = ? and status = 'failed'", userId),
    consumption: count("select count(*) as total from automation_logs where user_id = ?", userId)
  };
}

export function listAutomations(userId: string) {
  const rows = getDatabase()
    .prepare("select * from automations where user_id = ? order by coalesce(next_run_at, updated_at) asc")
    .all(userId) as AutomationRow[];
  return rows.map(publicAutomation);
}

export function getAutomation(userId: string, automationId: string) {
  const row = assertAutomationOwner(userId, automationId);
  return {
    ...publicAutomation(row),
    triggers: listTriggers(userId, automationId),
    actions: listActions(userId, automationId),
    runs: listAutomationHistory(userId, automationId).slice(0, 20),
    logs: listAutomationLogs(userId, automationId).slice(0, 20)
  };
}

export function listAutomationWorkspace(userId: string) {
  return {
    automations: listAutomations(userId),
    dashboard: dashboardFor(userId),
    history: listAutomationHistory(userId).slice(0, 10),
    logs: listAutomationLogs(userId).slice(0, 10)
  };
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

export function listAutomationHistory(userId: string, automationId?: string) {
  const sql = automationId
    ? "select * from automation_runs where user_id = ? and automation_id = ? order by created_at desc limit 120"
    : "select * from automation_runs where user_id = ? order by created_at desc limit 120";
  const rows = automationId
    ? getDatabase().prepare(sql).all(userId, automationId)
    : getDatabase().prepare(sql).all(userId);
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: row.id,
    automationId: row.automation_id,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration_ms,
    result: safeJsonParse(String(row.result_json || "{}"), {}),
    logs: safeJsonParse(String(row.logs_json || "[]"), []),
    createdAt: row.created_at
  }));
}

export function listAutomationLogs(userId: string, automationId?: string) {
  const sql = automationId
    ? "select * from automation_logs where user_id = ? and automation_id = ? order by created_at desc limit 150"
    : "select * from automation_logs where user_id = ? order by created_at desc limit 150";
  const rows = automationId
    ? getDatabase().prepare(sql).all(userId, automationId)
    : getDatabase().prepare(sql).all(userId);
  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: row.id,
    automationId: row.automation_id,
    runId: row.run_id,
    level: row.level,
    message: row.message,
    metadata: safeJsonParse(String(row.metadata_json || "{}"), {}),
    createdAt: row.created_at
  }));
}

export function createAutomation(userId: string, input: AutomationInput) {
  const name = cleanText(input.name, "Automação YARA");
  const description = cleanText(input.description || "", "");
  const type = cleanText(input.type, "reminder").toLowerCase();
  const triggerType = normalizeTriggerType(input.triggerType || "scheduled");
  const triggerConfig = input.triggerConfig || {};
  const schedule = normalizeSchedule(input.scheduleExpression);
  const nextRunAt = normalizeDate(input.nextRunAt) || (schedule === "manual" ? null : new Date(Date.now() + 60_000).toISOString());
  const action = input.action || {};
  const status = normalizeStatus(input.status);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into automations (
         id, user_id, name, description, type, trigger_type, trigger_config_json,
         schedule_expression, next_run_at, action_json, status, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(
      id,
      userId,
      name,
      description,
      type,
      triggerType,
      JSON.stringify(triggerConfig),
      schedule,
      nextRunAt,
      JSON.stringify(action),
      status
    );
  upsertAutomationTriggers(userId, id, triggerType, triggerConfig);
  upsertAutomationActions(userId, id, action, input.actions);
  insertAutomationAudit({
    userId,
    automationId: id,
    action: "create",
    message: "Automação criada.",
    metadata: { type, triggerType, schedule }
  });
  recordAudit({
    userId,
    category: "automations",
    action: "create",
    entityType: "automation",
    entityId: id,
    message: "Automação criada.",
    metadata: { type, triggerType, schedule }
  });
  return publicAutomation(assertAutomationOwner(userId, id));
}

export function updateAutomation(userId: string, automationId: string, input: Partial<AutomationInput>) {
  const current = assertAutomationOwner(userId, automationId);
  const action = input.action === undefined ? safeJsonParse(current.action_json, {}) : input.action || {};
  const triggerConfig =
    input.triggerConfig === undefined ? safeJsonParse<Record<string, unknown>>(current.trigger_config_json, {}) : input.triggerConfig || {};
  const schedule = input.scheduleExpression === undefined ? current.schedule_expression : normalizeSchedule(input.scheduleExpression);
  const nextRunAt = input.nextRunAt === undefined ? current.next_run_at : normalizeDate(input.nextRunAt);
  const triggerType = input.triggerType ? normalizeTriggerType(input.triggerType) : current.trigger_type;
  getDatabase()
    .prepare(
      `update automations
       set name = ?, description = ?, type = ?, trigger_type = ?, trigger_config_json = ?,
           schedule_expression = ?, next_run_at = ?, action_json = ?, status = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      input.name ? cleanText(input.name, current.name) : current.name,
      input.description === undefined ? current.description || "" : cleanText(input.description, ""),
      input.type ? cleanText(input.type, current.type).toLowerCase() : current.type,
      triggerType,
      JSON.stringify(triggerConfig),
      schedule,
      nextRunAt,
      JSON.stringify(action),
      input.status ? normalizeStatus(input.status) : current.status,
      automationId,
      userId
    );
  upsertAutomationTriggers(userId, automationId, triggerType, triggerConfig);
  if (input.action !== undefined || input.actions !== undefined) upsertAutomationActions(userId, automationId, action, input.actions);
  insertAutomationAudit({
    userId,
    automationId,
    action: "update",
    message: "Automação atualizada.",
    metadata: { triggerType, schedule }
  });
  return publicAutomation(assertAutomationOwner(userId, automationId));
}

export function deleteAutomation(userId: string, automationId: string) {
  assertAutomationOwner(userId, automationId);
  getDatabase()
    .prepare("update automation_audit_logs set automation_id = null where automation_id = ? and user_id = ?")
    .run(automationId, userId);
  getDatabase().prepare("delete from automations where id = ? and user_id = ?").run(automationId, userId);
  recordAudit({
    userId,
    category: "automations",
    action: "delete",
    entityType: "automation",
    entityId: automationId,
    message: "Automação excluída."
  });
  insertAutomationAudit({
    userId,
    action: "delete",
    message: "Automação excluída.",
    metadata: { automationId }
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

function executeAction(row: AutomationRow, options: { test?: boolean } = {}) {
  const action = safeJsonParse<Record<string, any>>(row.action_json, {});
  const actions = listActions(row.user_id, row.id);
  const title = cleanText(action.title || row.name, row.name);
  const message = cleanText(action.message || action.description || `Automação executada: ${row.name}`, `Automação executada: ${row.name}`);
  const result: Record<string, unknown> = {
    type: row.type,
    triggerType: row.trigger_type,
    title,
    message,
    test: Boolean(options.test),
    actions: actions.map((item) => item.type)
  };

  if (options.test) {
    result.preview = "Teste executado sem alterar dados do workspace.";
    return result;
  }

  if (row.type === "reminder" || actions.some((item) => item.type === "create_reminder")) {
    const reminderId = uuid();
    getDatabase()
      .prepare(
        `insert into reminders (id, user_id, title, message, scheduled_at, recurrence, status, updated_at)
         values (?, ?, ?, ?, ?, ?, 'pending', current_timestamp)`
      )
      .run(reminderId, row.user_id, title, message, new Date().toISOString(), row.schedule_expression || "none");
    result.reminderId = reminderId;
  }

  if ((row.type === "recurring_task" || actions.some((item) => item.type === "create_task")) && action.projectId) {
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

  if (actions.some((item) => item.type === "index_memory")) {
    result.memoryIndexQueued = true;
  }
  if (actions.some((item) => item.type === "generate_pdf" || item.type === "generate_docx" || item.type === "generate_xlsx")) {
    result.exportQueued = true;
  }
  if (actions.some((item) => item.type === "export_dxf" || item.type === "export_ifc")) {
    result.technicalExportQueued = true;
  }
  if (actions.some((item) => item.type === "send_to_agent")) {
    result.agentDispatchQueued = true;
  }

  result.notificationId = insertNotification(row.user_id, {
    type: `automation_${row.type}`,
    title,
    message
  });
  return result;
}

function runAutomationInternal(userId: string, automationId: string, options: { test?: boolean } = {}) {
  const automation = assertAutomationOwner(userId, automationId);
  const executionId = uuid();
  const runId = uuid();
  const startedAt = new Date();
  const db = getDatabase();
  db.prepare(
    `insert into automation_executions (id, automation_id, user_id, status, result_json, started_at)
     values (?, ?, ?, 'running', '{}', ?)`
  ).run(executionId, automation.id, userId, startedAt.toISOString());
  db.prepare(
    `insert into automation_runs (id, automation_id, user_id, status, result_json, logs_json, start_time)
     values (?, ?, ?, 'running', '{}', '[]', ?)`
  ).run(runId, automation.id, userId, startedAt.toISOString());
  insertAutomationLog({
    userId,
    automationId: automation.id,
    runId,
    message: options.test ? "Teste de automação iniciado." : "Execução de automação iniciada."
  });

  try {
    const result = executeAction(automation, options);
    const finishedAt = new Date();
    const duration = finishedAt.getTime() - startedAt.getTime();
    const nextRunAt = options.test ? automation.next_run_at : nextRunFrom(automation.schedule_expression, startedAt);
    const nextStatus = options.test
      ? automation.status
      : nextRunAt
        ? "active"
        : automation.status === "active"
          ? "completed"
          : automation.status;
    if (!options.test) {
      db.prepare(
        `update automations
         set last_run_at = ?, next_run_at = ?, status = ?, updated_at = current_timestamp
         where id = ? and user_id = ?`
      ).run(finishedAt.toISOString(), nextRunAt, nextStatus, automation.id, userId);
    }
    db.prepare(
      `update automation_executions
       set status = 'success', result_json = ?, finished_at = current_timestamp
       where id = ? and user_id = ?`
    ).run(JSON.stringify(result), executionId, userId);
    db.prepare(
      `update automation_runs
       set status = 'success', end_time = ?, duration_ms = ?, result_json = ?, logs_json = ?
       where id = ? and user_id = ?`
    ).run(
      finishedAt.toISOString(),
      duration,
      JSON.stringify(result),
      JSON.stringify(["Automação processada com sucesso."]),
      runId,
      userId
    );
    insertAutomationLog({
      userId,
      automationId: automation.id,
      runId,
      message: options.test ? "Teste de automação concluído." : "Automação executada com sucesso.",
      metadata: result
    });
    insertAutomationAudit({
      userId,
      automationId: automation.id,
      action: options.test ? "test" : "execute",
      message: options.test ? "Teste de automação executado." : "Automação executada.",
      metadata: { executionId, runId, result }
    });
    recordAudit({
      userId,
      category: "automations",
      action: options.test ? "test" : "execute",
      entityType: "automation",
      entityId: automation.id,
      message: options.test ? "Teste de automação executado." : "Automação executada.",
      metadata: { executionId, runId, result }
    });
    return {
      executionId,
      runId,
      status: "success",
      result,
      automation: publicAutomation(assertAutomationOwner(userId, automation.id))
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao executar automação.";
    const finishedAt = new Date();
    const duration = finishedAt.getTime() - startedAt.getTime();
    db.prepare(
      `update automation_executions
       set status = 'failed', error = ?, finished_at = current_timestamp
       where id = ? and user_id = ?`
    ).run(message, executionId, userId);
    db.prepare(
      `update automation_runs
       set status = 'failed', end_time = ?, duration_ms = ?, result_json = ?, logs_json = ?
       where id = ? and user_id = ?`
    ).run(
      finishedAt.toISOString(),
      duration,
      JSON.stringify({ error: message }),
      JSON.stringify([message]),
      runId,
      userId
    );
    insertAutomationLog({ userId, automationId: automation.id, runId, level: "error", message });
    insertAutomationAudit({ userId, automationId: automation.id, action: options.test ? "test" : "execute", status: "failed", message });
    throw new Error(message);
  }
}

export function runAutomation(userId: string, automationId: string) {
  return runAutomationInternal(userId, automationId);
}

export function testAutomation(userId: string, automationId: string) {
  return runAutomationInternal(userId, automationId, { test: true });
}

export function setAutomationStatus(userId: string, automationId: string, status: "active" | "paused" | "disabled") {
  assertAutomationOwner(userId, automationId);
  getDatabase()
    .prepare("update automations set status = ?, updated_at = current_timestamp where id = ? and user_id = ?")
    .run(status, automationId, userId);
  insertAutomationAudit({
    userId,
    automationId,
    action: status === "active" ? "enable" : "disable",
    message: status === "active" ? "Automação habilitada." : "Automação desabilitada."
  });
  return publicAutomation(assertAutomationOwner(userId, automationId));
}

function parseAutomationIntent(message: string) {
  const text = message.toLowerCase();
  const daily = /todo dia|diariamente|todos os dias|às \d|as \d|\d{1,2}h/.test(text);
  const technicalProject = /projeto técnico|dxf|ifc|cad|planta/.test(text);
  const system = /sistema|app|aplicativo|plataforma/.test(text);
  const agent = /agente|financeiro|comercial|jurídico|juridico|marketing|engenharia/.test(text);
  const upload = /documento|arquivo|upload|memória|memoria|indexe/.test(text);
  const report = /relatório|relatorio|resumo/.test(text);

  let triggerType = daily ? "scheduled" : "event";
  if (technicalProject) triggerType = "technical_project";
  else if (system) triggerType = "system";
  else if (agent) triggerType = "agent";
  else if (upload) triggerType = "upload";

  let type = daily ? "daily_summary" : "auto_report";
  if (/lembre|lembrar|lembrete/.test(text)) type = "reminder";
  if (/tarefa/.test(text)) type = "recurring_task";
  if (report) type = "auto_report";

  let actionType = "notify";
  if (/pdf/.test(text)) actionType = "generate_pdf";
  if (/docx|word/.test(text)) actionType = "generate_docx";
  if (/xlsx|excel|planilha/.test(text)) actionType = "generate_xlsx";
  if (/dxf|cad/.test(text)) actionType = "export_dxf";
  if (/ifc|bim/.test(text)) actionType = "export_ifc";
  if (agent) actionType = "send_to_agent";
  if (upload) actionType = "index_memory";
  if (/tarefa/.test(text)) actionType = "create_task";

  return {
    name: cleanText(message.slice(0, 72), "Automação criada pelo chat"),
    description: message,
    type,
    triggerType,
    triggerConfig: { source: "automation_chat", intent: message },
    scheduleExpression: daily ? "daily" : "manual",
    action: {
      type: actionType,
      title: cleanText(message.slice(0, 80), "Automação YARA"),
      message
    },
    actions: [{ type: actionType, config: { instruction: message } }],
    status: "active"
  };
}

export function createAutomationFromChat(userId: string, message: string) {
  const instruction = cleanText(message);
  if (instruction.length < 6) throw new Error("Descreva a automação com um pouco mais de detalhe.");
  if (instruction.length > 2000) throw new Error("A automação precisa ter até 2000 caracteres.");
  const automation = createAutomation(userId, parseAutomationIntent(instruction));
  insertAutomationLog({
    userId,
    automationId: automation.id,
    message: "Automação criada a partir de linguagem natural.",
    metadata: { instruction }
  });
  return {
    automation,
    reply:
      "Automação criada. Gatilho: " +
      automation.triggerType +
      ". Ação principal: " +
      String((automation.action as Record<string, unknown>).type || "notify") +
      "."
  };
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
