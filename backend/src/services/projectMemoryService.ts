import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { recordAudit } from "./auditService";

type ProjectMemoryRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  current_pillar: string | null;
  current_phase: string | null;
  next_steps_json: string;
  metadata_json: string;
  created_at: string;
  updated_at: string;
};

type ChildTable =
  | "project_phases"
  | "project_decisions"
  | "project_milestones"
  | "project_pending_items"
  | "project_commits"
  | "project_timeline_events";

const defaultNextSteps = [
  "Validar deploy do Render após cada push.",
  "Manter Fase 7 congelada até credenciais externas estarem prontas.",
  "Concluir Fase 13 com memória de projetos e decisões em produção."
];

const defaultPhases = [
  { name: "Pilar 1", pillar: "Pilar 01", status: "completed", summary: "Núcleo profissional estabilizado até produção, segurança e automações.", order: 10 },
  { name: "Fase 7", pillar: "Pilar 01", status: "frozen", summary: "Integrações externas congeladas até configuração de credenciais reais.", order: 70 },
  { name: "Fase 8.1", pillar: "Pilar 01", status: "completed", summary: "Arquitetura de memória inteligente implementada.", order: 81 },
  { name: "Fase 8.2", pillar: "Pilar 01", status: "completed", summary: "Perfil cognitivo e preferências persistentes implementados.", order: 82 },
  { name: "Fase 10", pillar: "Pilar 01", status: "completed", summary: "Arquivos, exportação e anexos concluídos.", order: 100 },
  { name: "Fase 12", pillar: "Pilar 01", status: "completed", summary: "Produção final, segurança, auditoria, logs e backup concluídos.", order: 120 },
  { name: "Fase 13", pillar: "Pilar 01", status: "in_progress", summary: "Memória de projetos, decisões, pendências e linha do tempo em andamento.", order: 130 }
];

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function projectSelect() {
  return "id, user_id, name, description, status, current_pillar, current_phase, next_steps_json, metadata_json, created_at, updated_at";
}

function toProject(row: ProjectMemoryRow) {
  return {
    ...row,
    nextSteps: parseJson<string[]>(row.next_steps_json, []),
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {})
  };
}

function auditProjectMemory(userId: string, projectMemoryId: string | null, action: string, message: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into project_memory_audit_logs (id, user_id, project_memory_id, action, message, metadata_json)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, projectMemoryId, action, message, JSON.stringify(metadata));
}

function getProjectRow(userId: string, projectMemoryId: string) {
  const row = getDatabase()
    .prepare(`select ${projectSelect()} from project_memories where id = ? and user_id = ?`)
    .get(projectMemoryId, userId) as ProjectMemoryRow | undefined;
  if (!row) throw new Error("Memória de projeto não encontrada.");
  return row;
}

function insertTimeline(userId: string, projectMemoryId: string, type: string, title: string, description?: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into project_timeline_events (id, user_id, project_memory_id, event_type, title, description, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, projectMemoryId, type, title, description || null, JSON.stringify(metadata));
}

function insertDefaultPhase(userId: string, projectMemoryId: string, phase: (typeof defaultPhases)[number]) {
  getDatabase()
    .prepare(
      `insert or ignore into project_phases (id, user_id, project_memory_id, pillar, name, status, summary, completed_at, sort_order)
       values (?, ?, ?, ?, ?, ?, ?, case when ? = 'completed' then current_timestamp else null end, ?)`
    )
    .run(uuid(), userId, projectMemoryId, phase.pillar, phase.name, phase.status, phase.summary, phase.status, phase.order);
}

function insertUniqueByTitle(table: "project_decisions" | "project_milestones" | "project_pending_items", userId: string, projectMemoryId: string, title: string, values: Record<string, string | null>) {
  const existing = getDatabase()
    .prepare(`select id from ${table} where user_id = ? and project_memory_id = ? and title = ? limit 1`)
    .get(userId, projectMemoryId, title);
  if (existing) return;

  if (table === "project_decisions") {
    getDatabase()
      .prepare(
        `insert into project_decisions (id, user_id, project_memory_id, title, content, impact, source)
         values (?, ?, ?, ?, ?, ?, 'system')`
      )
      .run(uuid(), userId, projectMemoryId, title, values.content || title, values.impact || null);
    return;
  }

  if (table === "project_milestones") {
    getDatabase()
      .prepare(
        `insert into project_milestones (id, user_id, project_memory_id, title, description, status)
         values (?, ?, ?, ?, ?, ?)`
      )
      .run(uuid(), userId, projectMemoryId, title, values.description || null, values.status || "completed");
    return;
  }

  getDatabase()
    .prepare(
      `insert into project_pending_items (id, user_id, project_memory_id, title, description, priority, status)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, projectMemoryId, title, values.description || null, values.priority || "medium", values.status || "open");
}

function insertDefaultCommit(userId: string, projectMemoryId: string, hash: string, message: string) {
  getDatabase()
    .prepare(
      `insert or ignore into project_commits (id, user_id, project_memory_id, hash, message, branch)
       values (?, ?, ?, ?, ?, 'main')`
    )
    .run(uuid(), userId, projectMemoryId, hash, message);
}

function seedDefaultYaraData(userId: string, projectMemoryId: string) {
  defaultPhases.forEach((phase) => insertDefaultPhase(userId, projectMemoryId, phase));

  insertUniqueByTitle("project_milestones", userId, projectMemoryId, "Pilar 1 concluído", {
    description: "Núcleo da plataforma, produtividade, arquivos, integrações e segurança chegaram ao fechamento do Pilar 01.",
    status: "completed"
  });
  insertUniqueByTitle("project_decisions", userId, projectMemoryId, "Fase 7 congelada", {
    content: "As integrações externas permanecem congeladas até credenciais reais serem configuradas no Render.",
    impact: "Evita simular integrações e preserva segurança operacional."
  });
  insertUniqueByTitle("project_pending_items", userId, projectMemoryId, "Concluir e validar Fase 13 em produção", {
    description: "Publicar memória de projetos, dashboard e respostas do chat baseadas em dados salvos.",
    priority: "high",
    status: "open"
  });

  insertDefaultCommit(userId, projectMemoryId, "8ef85be", "Add YARA AI integrations and automations phase 11");
  insertDefaultCommit(userId, projectMemoryId, "b99d049", "Complete YARA AI production security phase 12");

  const hasTimeline = getDatabase()
    .prepare("select id from project_timeline_events where user_id = ? and project_memory_id = ? limit 1")
    .get(userId, projectMemoryId);
  if (!hasTimeline) {
    insertTimeline(userId, projectMemoryId, "milestone", "Pilar 1 concluído", "Base de produção do Pilar 01 concluída.");
    insertTimeline(userId, projectMemoryId, "decision", "Fase 7 congelada", "Aguardando credenciais externas reais.");
    insertTimeline(userId, projectMemoryId, "phase", "Fase 13 em andamento", "Memória de projetos e decisões iniciada.");
  }
}

export function ensureDefaultYaraProjectMemory(userId: string) {
  const existing = getDatabase()
    .prepare(`select ${projectSelect()} from project_memories where user_id = ? and name = 'YARA AI'`)
    .get(userId) as ProjectMemoryRow | undefined;

  if (existing) {
    seedDefaultYaraData(userId, existing.id);
    return toProject(existing);
  }

  const id = uuid();
  getDatabase()
    .prepare(
      `insert into project_memories (
        id, user_id, name, description, status, current_pillar, current_phase, next_steps_json, metadata_json
      ) values (?, ?, 'YARA AI', ?, 'active', 'Pilar 01', 'Fase 13 em andamento', ?, ?)`
    )
    .run(
      id,
      userId,
      "Projeto principal da plataforma YARA AI, com histórico de fases, decisões, commits e próximos passos.",
      JSON.stringify(defaultNextSteps),
      JSON.stringify({ source: "system_seed", officialRepository: "ChatYara/ChatYara" })
    );

  seedDefaultYaraData(userId, id);
  auditProjectMemory(userId, id, "seed_default", "Projeto padrão YARA AI registrado automaticamente.");
  return toProject(getProjectRow(userId, id));
}

export function listProjectMemories(userId: string) {
  ensureDefaultYaraProjectMemory(userId);
  const rows = getDatabase()
    .prepare(`select ${projectSelect()} from project_memories where user_id = ? order by updated_at desc`)
    .all(userId) as ProjectMemoryRow[];
  return rows.map(toProject);
}

export function getProjectMemoryDetails(userId: string, projectMemoryId: string) {
  const project = toProject(getProjectRow(userId, projectMemoryId));
  return {
    project,
    phases: listProjectMemoryChildren(userId, projectMemoryId, "project_phases"),
    decisions: listProjectMemoryChildren(userId, projectMemoryId, "project_decisions"),
    milestones: listProjectMemoryChildren(userId, projectMemoryId, "project_milestones"),
    pending: listProjectMemoryChildren(userId, projectMemoryId, "project_pending_items"),
    commits: listProjectMemoryChildren(userId, projectMemoryId, "project_commits"),
    timeline: listProjectMemoryChildren(userId, projectMemoryId, "project_timeline_events")
  };
}

export function createProjectMemory(userId: string, input: { name: string; description?: string; status?: string; currentPillar?: string; currentPhase?: string; nextSteps?: string[] }) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into project_memories (id, user_id, name, description, status, current_pillar, current_phase, next_steps_json)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      userId,
      input.name.trim(),
      input.description?.trim() || null,
      input.status || "active",
      input.currentPillar || null,
      input.currentPhase || null,
      JSON.stringify(input.nextSteps || [])
    );
  insertTimeline(userId, id, "project", "Projeto inteligente criado", input.name);
  auditProjectMemory(userId, id, "create", "Memória de projeto criada.");
  return toProject(getProjectRow(userId, id));
}

export function updateProjectMemory(userId: string, projectMemoryId: string, input: { name?: string; description?: string | null; status?: string; currentPillar?: string | null; currentPhase?: string | null; nextSteps?: string[] }) {
  const current = getProjectRow(userId, projectMemoryId);
  getDatabase()
    .prepare(
      `update project_memories
       set name = ?, description = ?, status = ?, current_pillar = ?, current_phase = ?, next_steps_json = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      input.name?.trim() || current.name,
      input.description === undefined ? current.description : input.description,
      input.status || current.status,
      input.currentPillar === undefined ? current.current_pillar : input.currentPillar,
      input.currentPhase === undefined ? current.current_phase : input.currentPhase,
      JSON.stringify(input.nextSteps || parseJson(current.next_steps_json, [] as string[])),
      projectMemoryId,
      userId
    );
  insertTimeline(userId, projectMemoryId, "update", "Projeto inteligente atualizado", input.currentPhase || current.current_phase || current.name);
  auditProjectMemory(userId, projectMemoryId, "update", "Memória de projeto atualizada.");
  return toProject(getProjectRow(userId, projectMemoryId));
}

export function deleteProjectMemory(userId: string, projectMemoryId: string) {
  const project = getProjectRow(userId, projectMemoryId);
  getDatabase().prepare("delete from project_memories where id = ? and user_id = ?").run(projectMemoryId, userId);
  auditProjectMemory(userId, projectMemoryId, "delete", "Memória de projeto excluída.", { name: project.name });
  return { id: projectMemoryId };
}

export function listProjectMemoryChildren(userId: string, projectMemoryId: string, table: ChildTable) {
  getProjectRow(userId, projectMemoryId);
  const orderBy: Record<ChildTable, string> = {
    project_phases: "sort_order asc, created_at asc",
    project_decisions: "decided_at desc, created_at desc",
    project_milestones: "milestone_date desc, created_at desc",
    project_pending_items: "case status when 'open' then 0 else 1 end asc, created_at desc",
    project_commits: "committed_at desc, created_at desc",
    project_timeline_events: "event_at desc, created_at desc"
  };
  return getDatabase()
    .prepare(`select * from ${table} where user_id = ? and project_memory_id = ? order by ${orderBy[table]}`)
    .all(userId, projectMemoryId);
}

export function addProjectDecision(userId: string, projectMemoryId: string, input: { title: string; content: string; impact?: string; source?: string }) {
  getProjectRow(userId, projectMemoryId);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into project_decisions (id, user_id, project_memory_id, title, content, impact, source)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, projectMemoryId, input.title.trim(), input.content.trim(), input.impact?.trim() || null, input.source || "manual");
  insertTimeline(userId, projectMemoryId, "decision", input.title, input.content);
  auditProjectMemory(userId, projectMemoryId, "decision_create", "Decisão registrada.", { decisionId: id });
  return getDatabase().prepare("select * from project_decisions where id = ?").get(id);
}

export function addProjectMilestone(userId: string, projectMemoryId: string, input: { title: string; description?: string; status?: string; milestoneDate?: string | null }) {
  getProjectRow(userId, projectMemoryId);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into project_milestones (id, user_id, project_memory_id, title, description, status, milestone_date)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, projectMemoryId, input.title.trim(), input.description?.trim() || null, input.status || "completed", input.milestoneDate || null);
  insertTimeline(userId, projectMemoryId, "milestone", input.title, input.description);
  auditProjectMemory(userId, projectMemoryId, "milestone_create", "Marco registrado.", { milestoneId: id });
  return getDatabase().prepare("select * from project_milestones where id = ?").get(id);
}

export function addProjectPendingItem(userId: string, projectMemoryId: string, input: { title: string; description?: string; priority?: string; status?: string; dueDate?: string | null }) {
  getProjectRow(userId, projectMemoryId);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into project_pending_items (id, user_id, project_memory_id, title, description, priority, status, due_date)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, projectMemoryId, input.title.trim(), input.description?.trim() || null, input.priority || "medium", input.status || "open", input.dueDate || null);
  insertTimeline(userId, projectMemoryId, "pending", input.title, input.description);
  auditProjectMemory(userId, projectMemoryId, "pending_create", "Pendência registrada.", { pendingId: id });
  return getDatabase().prepare("select * from project_pending_items where id = ?").get(id);
}

export function addProjectCommit(userId: string, projectMemoryId: string, input: { hash: string; message: string; branch?: string; committedAt?: string | null }) {
  getProjectRow(userId, projectMemoryId);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into project_commits (id, user_id, project_memory_id, hash, message, branch, committed_at)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, projectMemoryId, input.hash.trim(), input.message.trim(), input.branch || "main", input.committedAt || new Date().toISOString());
  insertTimeline(userId, projectMemoryId, "commit", input.hash, input.message, { branch: input.branch || "main" });
  auditProjectMemory(userId, projectMemoryId, "commit_create", "Commit registrado.", { commitId: id, hash: input.hash });
  return getDatabase().prepare("select * from project_commits where id = ?").get(id);
}

export function readProjectMemoryContext(userId: string, query = "") {
  const project = ensureDefaultYaraProjectMemory(userId);
  const details = getProjectMemoryDetails(userId, project.id);
  const phases = details.phases as Array<{ name: string; status: string; summary?: string }>;
  const pending = details.pending as Array<{ title: string; status: string; priority: string }>;
  const commits = details.commits as Array<{ hash: string; message: string }>;
  const decisions = details.decisions as Array<{ title: string; content: string }>;
  const relevant = /yara|projeto|fase|pilar|commit|decis|pend[eê]ncia|paramos|status|falta/i.test(query);
  if (!relevant && !query) return "";
  if (!relevant) return "";
  return [
    "Memória do projeto YARA AI:",
    `Status: ${project.status}. Pilar atual: ${project.current_pillar || "não informado"}. Fase atual: ${project.current_phase || "não informada"}.`,
    `Fases: ${phases.map((phase) => `${phase.name} (${phase.status})`).join(", ")}.`,
    `Decisões recentes: ${decisions.slice(0, 4).map((item) => `${item.title}: ${item.content}`).join(" | ") || "nenhuma"}.`,
    `Pendências abertas: ${pending.filter((item) => item.status !== "done").slice(0, 5).map((item) => `${item.title} (${item.priority})`).join(" | ") || "nenhuma"}.`,
    `Últimos commits: ${commits.slice(0, 3).map((item) => `${item.hash} ${item.message}`).join(" | ") || "nenhum"}.`,
    `Próximos passos: ${project.nextSteps.join(" | ") || "não definidos"}.`
  ].join("\n");
}

export function answerProjectMemoryQuestion(userId: string, message: string) {
  if (!/(onde paramos|último commit|ultimo commit|fases? conclu[ií]das|o que falta|status do projeto|decisões|decisoes|pr[oó]ximos passos)/i.test(message)) {
    return null;
  }
  const project = ensureDefaultYaraProjectMemory(userId);
  const details = getProjectMemoryDetails(userId, project.id);
  const phases = details.phases as Array<{ name: string; status: string; summary?: string }>;
  const pending = details.pending as Array<{ title: string; status: string; priority: string }>;
  const commits = details.commits as Array<{ hash: string; message: string; branch?: string }>;
  const decisions = details.decisions as Array<{ title: string; content: string }>;

  if (/último commit|ultimo commit/i.test(message)) {
    const commit = commits[0];
    return commit ? `Último commit registrado: ${commit.hash} — ${commit.message} (${commit.branch || "main"}).` : "Ainda não há commits registrados na memória do projeto.";
  }

  if (/fases? conclu[ií]das/i.test(message)) {
    const done = phases.filter((phase) => phase.status === "completed").map((phase) => phase.name);
    return done.length ? `Fases concluídas: ${done.join(", ")}.` : "Ainda não há fases concluídas registradas.";
  }

  if (/decisões|decisoes/i.test(message)) {
    return decisions.length
      ? `Decisões registradas:\n${decisions.slice(0, 6).map((item, index) => `${index + 1}. ${item.title}: ${item.content}`).join("\n")}`
      : "Ainda não há decisões registradas na memória do projeto.";
  }

  if (/o que falta|pr[oó]ximos passos/i.test(message)) {
    const open = pending.filter((item) => item.status !== "done");
    return [
      open.length ? `Pendências abertas:\n${open.slice(0, 6).map((item, index) => `${index + 1}. ${item.title} (${item.priority})`).join("\n")}` : "Não há pendências abertas registradas.",
      project.nextSteps.length ? `Próximos passos: ${project.nextSteps.join(" ")}` : ""
    ].filter(Boolean).join("\n");
  }

  return [
    `Paramos em: ${project.current_phase || "fase não informada"} do ${project.current_pillar || "pilar atual"}.`,
    "Resumo: Pilar 1 concluído, Fase 7 congelada, Fases 8.1, 8.2, 10 e 12 concluídas, e Fase 13 em andamento.",
    pending.filter((item) => item.status !== "done").length
      ? `Pendência principal: ${pending.filter((item) => item.status !== "done")[0].title}.`
      : "Sem pendências abertas registradas.",
    commits[0] ? `Último commit registrado: ${commits[0].hash} — ${commits[0].message}.` : ""
  ].filter(Boolean).join("\n");
}
