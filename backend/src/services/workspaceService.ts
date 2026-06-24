import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { askYara } from "./ai/aiService";
import { getUserById } from "./authService";
import { readMemory } from "./chatService";
import { deleteLearning, listUserLearning } from "./learningService";
import { toPublicUpload } from "./uploadService";

type MemoryListItem = {
  id: string;
  title: string;
  content: string;
  source: string;
  readonly: boolean;
  confidence?: number;
  created_at?: string;
  updated_at?: string;
};

type UploadRow = {
  id: string;
  user_id: string;
  conversation_id: string | null;
  message_id: string | null;
  file_name: string;
  original_name: string | null;
  file_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
};

function publicUploadSelect(alias = "uploads") {
  return `${alias}.id, ${alias}.user_id, ${alias}.conversation_id, ${alias}.message_id, ${alias}.file_name, ${alias}.original_name, ${alias}.file_type, ${alias}.file_size, ${alias}.storage_path, ${alias}.created_at`;
}

function assertProjectOwner(userId: string, projectId: string) {
  const project = getDatabase()
    .prepare("select id from projects where id = ? and user_id = ?")
    .get(projectId, userId);

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }
}

export function listMemories(userId: string) {
  const manual = getDatabase()
    .prepare("select id, title, content, created_at, updated_at from memories where user_id = ? order by updated_at desc")
    .all(userId)
    .map((memory) => ({ ...(memory as Omit<MemoryListItem, "source" | "readonly">), source: "manual", readonly: false }));
  const learned = listUserLearning(userId).map((item) => ({
    id: `learning:${item.id}`,
    title: "Aprendizado automático",
    content: `${item.key}: ${item.value}`,
    source: item.source,
    confidence: item.confidence,
    readonly: true,
    created_at: item.created_at,
    updated_at: item.updated_at
  })) satisfies MemoryListItem[];

  return [...manual, ...learned].sort((a, b) =>
    String(b.updated_at || "").localeCompare(String(a.updated_at || ""))
  );
}

export function saveMemory(userId: string, input: { title?: string; content: string }) {
  const id = uuid();
  const content = input.content.trim();
  const title = input.title?.trim() || "Memória";
  getDatabase()
    .prepare("insert into memories (id, user_id, title, content) values (?, ?, ?, ?)")
    .run(id, userId, title, content);
  return { id, title, content };
}

export function updateMemory(userId: string, memoryId: string, input: { title?: string; content?: string }) {
  if (memoryId.startsWith("learning:")) {
    throw new Error("Aprendizados automáticos podem ser removidos, mas não editados aqui.");
  }

  const db = getDatabase();
  const current = db
    .prepare("select id, title, content from memories where id = ? and user_id = ?")
    .get(memoryId, userId) as { id: string; title: string; content: string } | undefined;

  if (!current) {
    throw new Error("Memória não encontrada.");
  }

  const title = input.title?.trim() || current.title;
  const content = input.content?.trim() || current.content;

  db.prepare(
    `update memories
     set title = ?,
         content = ?,
         updated_at = current_timestamp
     where id = ? and user_id = ?`
  ).run(title, content, memoryId, userId);

  return { id: memoryId, title, content };
}

export function deleteMemory(userId: string, memoryId: string) {
  if (memoryId.startsWith("learning:")) {
    return deleteLearning(userId, memoryId.replace("learning:", ""));
  }

  const result = getDatabase()
    .prepare("delete from memories where id = ? and user_id = ?")
    .run(memoryId, userId);

  if (result.changes === 0) {
    throw new Error("Memória não encontrada.");
  }

  return { id: memoryId };
}

export function deleteAllMemories(userId: string) {
  const db = getDatabase();
  const manual = db.prepare("delete from memories where user_id = ?").run(userId);
  const learned = db.prepare("delete from user_learning where user_id = ?").run(userId);
  return { deleted: Number(manual.changes) + Number(learned.changes) };
}

export function listProjects(userId: string) {
  return getDatabase()
    .prepare(
      `select id, name, type, prompt, output, description, content, created_at, updated_at
       from projects
       where user_id = ?
       order by updated_at desc, created_at desc`
    )
    .all(userId);
}

export function createProject(
  userId: string,
  input: { name: string; description?: string; content?: string; type?: string; prompt?: string }
) {
  const id = uuid();
  const name = input.name.trim();
  const description = input.description?.trim() || "";
  const content = input.content?.trim() || description || "Projeto criado na YARA AI.";
  const type = input.type?.trim() || "Projeto";
  const prompt = input.prompt?.trim() || description || name;

  getDatabase()
    .prepare(
      `insert into projects (id, user_id, name, type, prompt, output, description, content)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, name, type, prompt, content, description, content);

  return { id, name, type, prompt, output: content, description, content };
}

export function getProject(userId: string, projectId: string) {
  const project = getDatabase()
    .prepare(
      `select id, name, type, prompt, output, description, content, created_at, updated_at
       from projects
       where id = ? and user_id = ?`
    )
    .get(projectId, userId);

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  return project;
}

export function getProjectDetails(userId: string, projectId: string) {
  const db = getDatabase();
  const conversations = db
    .prepare(
      `select conversations.id, conversations.title, conversations.updated_at
       from conversation_projects
       join conversations on conversations.id = conversation_projects.conversation_id
       where conversation_projects.user_id = ? and conversation_projects.project_id = ?
       order by conversation_projects.created_at desc`
    )
    .all(userId, projectId);
  const history = db
    .prepare(
      `select 'task' as type, title as label, updated_at from project_tasks where user_id = ? and project_id = ?
       union all
       select 'note' as type, substr(content, 1, 80) as label, updated_at from project_notes where user_id = ? and project_id = ?
       union all
       select 'file' as type, coalesce(uploads.original_name, uploads.file_name) as label, project_uploads.created_at as updated_at
       from project_uploads
       join uploads on uploads.id = project_uploads.upload_id
       where project_uploads.user_id = ? and project_uploads.project_id = ?
       order by updated_at desc
       limit 8`
    )
    .all(userId, projectId, userId, projectId, userId, projectId);

  return {
    project: getProject(userId, projectId),
    tasks: listProjectTasks(userId, projectId),
    notes: listProjectNotes(userId, projectId),
    files: listProjectFiles(userId, projectId),
    conversations,
    history
  };
}

export function listProjectTasks(userId: string, projectId: string) {
  assertProjectOwner(userId, projectId);
  return getDatabase()
    .prepare(
      `select id, project_id, title, description, status, due_date, created_at, updated_at
       from project_tasks
       where user_id = ? and project_id = ?
       order by status asc, coalesce(due_date, '9999-12-31') asc, updated_at desc`
    )
    .all(userId, projectId);
}

export function createProjectTask(
  userId: string,
  projectId: string,
  input: { title: string; description?: string; dueDate?: string | null }
) {
  assertProjectOwner(userId, projectId);
  const id = uuid();
  const title = input.title.trim();
  const description = input.description?.trim() || "";
  const dueDate = input.dueDate?.trim() || null;

  getDatabase()
    .prepare(
      `insert into project_tasks (id, user_id, project_id, title, description, due_date)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, projectId, title, description || null, dueDate);

  return { id, project_id: projectId, title, description, status: "pending", due_date: dueDate };
}

export function updateProjectTask(
  userId: string,
  projectId: string,
  taskId: string,
  input: { title?: string; description?: string; status?: "pending" | "done"; dueDate?: string | null }
) {
  assertProjectOwner(userId, projectId);
  const current = getDatabase()
    .prepare(
      `select id, title, description, status, due_date
       from project_tasks
       where id = ? and project_id = ? and user_id = ?`
    )
    .get(taskId, projectId, userId) as
    | { id: string; title: string; description: string | null; status: "pending" | "done"; due_date: string | null }
    | undefined;

  if (!current) {
    throw new Error("Tarefa não encontrada.");
  }

  const title = input.title?.trim() || current.title;
  const description = input.description?.trim() ?? current.description ?? "";
  const status = input.status || current.status;
  const dueDate = input.dueDate === undefined ? current.due_date : input.dueDate?.trim() || null;

  getDatabase()
    .prepare(
      `update project_tasks
       set title = ?, description = ?, status = ?, due_date = ?, updated_at = current_timestamp
       where id = ? and project_id = ? and user_id = ?`
    )
    .run(title, description || null, status, dueDate, taskId, projectId, userId);

  return { id: taskId, project_id: projectId, title, description, status, due_date: dueDate };
}

export function deleteProjectTask(userId: string, projectId: string, taskId: string) {
  assertProjectOwner(userId, projectId);
  const result = getDatabase()
    .prepare("delete from project_tasks where id = ? and project_id = ? and user_id = ?")
    .run(taskId, projectId, userId);

  if (result.changes === 0) {
    throw new Error("Tarefa não encontrada.");
  }

  return { id: taskId };
}

export function listProjectNotes(userId: string, projectId: string) {
  assertProjectOwner(userId, projectId);
  return getDatabase()
    .prepare(
      `select id, project_id, content, created_at, updated_at
       from project_notes
       where user_id = ? and project_id = ?
       order by updated_at desc, created_at desc`
    )
    .all(userId, projectId);
}

export function createProjectNote(userId: string, projectId: string, input: { content: string }) {
  assertProjectOwner(userId, projectId);
  const id = uuid();
  const content = input.content.trim();

  getDatabase()
    .prepare("insert into project_notes (id, user_id, project_id, content) values (?, ?, ?, ?)")
    .run(id, userId, projectId, content);

  return { id, project_id: projectId, content };
}

export function updateProjectNote(userId: string, projectId: string, noteId: string, input: { content: string }) {
  assertProjectOwner(userId, projectId);
  const content = input.content.trim();
  const result = getDatabase()
    .prepare(
      `update project_notes
       set content = ?, updated_at = current_timestamp
       where id = ? and project_id = ? and user_id = ?`
    )
    .run(content, noteId, projectId, userId);

  if (result.changes === 0) {
    throw new Error("Nota não encontrada.");
  }

  return { id: noteId, project_id: projectId, content };
}

export function deleteProjectNote(userId: string, projectId: string, noteId: string) {
  assertProjectOwner(userId, projectId);
  const result = getDatabase()
    .prepare("delete from project_notes where id = ? and project_id = ? and user_id = ?")
    .run(noteId, projectId, userId);

  if (result.changes === 0) {
    throw new Error("Nota não encontrada.");
  }

  return { id: noteId };
}

export function listProjectFiles(userId: string, projectId: string) {
  assertProjectOwner(userId, projectId);
  const rows = getDatabase()
    .prepare(
      `select ${publicUploadSelect("uploads")}
       from project_uploads
       join uploads on uploads.id = project_uploads.upload_id
       where project_uploads.user_id = ? and project_uploads.project_id = ?
       order by project_uploads.created_at desc`
    )
    .all(userId, projectId) as UploadRow[];

  return rows.map(toPublicUpload);
}

export function addProjectFile(userId: string, projectId: string, uploadId: string) {
  assertProjectOwner(userId, projectId);
  const upload = getDatabase()
    .prepare("select id from uploads where id = ? and user_id = ?")
    .get(uploadId, userId);

  if (!upload) {
    throw new Error("Arquivo não encontrado.");
  }

  getDatabase()
    .prepare("insert or ignore into project_uploads (project_id, upload_id, user_id) values (?, ?, ?)")
    .run(projectId, uploadId, userId);

  return { projectId, uploadId };
}

export function getDashboard(userId: string) {
  const db = getDatabase();
  const count = (sql: string) => Number((db.prepare(sql).get(userId) as { total: number } | undefined)?.total || 0);
  const pendingTasks = Number(
    (
      db
        .prepare("select count(*) as total from project_tasks where user_id = ? and status = 'pending'")
        .get(userId) as { total: number } | undefined
    )?.total || 0
  );

  const recentProjects = db
    .prepare(
      `select id, name, type, description, updated_at
       from projects
       where user_id = ?
       order by updated_at desc, created_at desc
       limit 4`
    )
    .all(userId);
  const recentTasks = db
    .prepare(
      `select project_tasks.id, project_tasks.title, project_tasks.status, project_tasks.due_date, projects.name as project_name
       from project_tasks
       join projects on projects.id = project_tasks.project_id
       where project_tasks.user_id = ?
       order by project_tasks.status asc, project_tasks.updated_at desc
       limit 5`
    )
    .all(userId);
  const recentConversations = db
    .prepare(
      `select id, title, updated_at
       from conversations
       where user_id = ? and is_archived = 0
       order by updated_at desc
       limit 5`
    )
    .all(userId);
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const todayEvents = db
    .prepare(
      `select id, title, event_date as date, event_time as time, status
       from calendar_events
       where user_id = ? and event_date = ?
       order by coalesce(event_time, '23:59') asc
       limit 5`
    )
    .all(userId, today);
  const weekEvents = db
    .prepare(
      `select id, title, event_date as date, event_time as time, status
       from calendar_events
       where user_id = ? and event_date between ? and ?
       order by event_date asc, coalesce(event_time, '23:59') asc
       limit 8`
    )
    .all(userId, today, weekEnd);
  const upcomingReminders = db
    .prepare(
      `select id, title, scheduled_at, status
       from reminders
       where user_id = ? and status <> 'done'
       order by scheduled_at asc
       limit 5`
    )
    .all(userId);

  const suggestions = [
    pendingTasks > 0 ? `Você tem ${pendingTasks} tarefa${pendingTasks === 1 ? "" : "s"} pendente${pendingTasks === 1 ? "" : "s"} para revisar.` : "Crie tarefas nos projetos para acompanhar execução com a YARA.",
    count("select count(*) as total from uploads where user_id = ?") > 0
      ? "Vincule arquivos importantes aos projetos para manter contexto organizado."
      : "Envie documentos, imagens ou áudio no chat para enriquecer o contexto.",
    "Use o Gerador de Sistemas para transformar conversas em projetos estruturados."
  ];

  return {
    stats: {
      conversations: count("select count(*) as total from conversations where user_id = ? and is_archived = 0"),
      projects: count("select count(*) as total from projects where user_id = ?"),
      memories: count("select count(*) as total from memories where user_id = ?"),
      uploads: count("select count(*) as total from uploads where user_id = ?"),
      documents: count("select count(*) as total from documents where user_id = ?"),
      events: count("select count(*) as total from calendar_events where user_id = ?"),
      reminders: count("select count(*) as total from reminders where user_id = ?"),
      pendingTasks
    },
    recentProjects,
    recentConversations,
    recentTasks,
    todayEvents,
    weekEvents,
    upcomingReminders,
    suggestions
  };
}

export function deleteProject(userId: string, projectId: string) {
  const result = getDatabase()
    .prepare("delete from projects where id = ? and user_id = ?")
    .run(projectId, userId);

  if (result.changes === 0) {
    throw new Error("Projeto não encontrado.");
  }

  return { id: projectId };
}

export async function generateSystem(userId: string, input: { type?: string; prompt: string }) {
  const type = input.type?.trim() || "Sistema completo";
  const ai = await askYara({
    prompt: [
      `Tipo de sistema: ${type}`,
      `Briefing: ${input.prompt}`,
      "Entregue um plano profissional em português com seções: Nome, Descrição, Tecnologias, Telas, APIs, Banco de dados e Próximos passos."
    ].join("\n"),
    memory: readMemory(userId)
  });

  const id = uuid();
  const name = `${type} - ${new Date().toISOString().slice(0, 10)}`;
  const description = input.prompt.trim().slice(0, 240);

  getDatabase()
    .prepare(
      `insert into projects (id, user_id, name, type, prompt, output, description, content)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, name, type, input.prompt, ai.response, description, ai.response);

  return {
    id,
    name,
    type,
    prompt: input.prompt,
    output: ai.response,
    description,
    content: ai.response,
    provider: ai.provider,
    model: ai.model
  };
}

export function getSettings(userId: string) {
  const db = getDatabase();
  const existing = db
    .prepare(
      `select user_id, display_name, full_name, avatar_url, theme, ai_style, language, response_length,
              voice_enabled, voice_language, voice_rate, voice_pitch, voice_gender, voice_auto_read, updated_at
       from user_settings
       where user_id = ?`
    )
    .get(userId);

  if (existing) {
    return existing;
  }

  const user = getUserById(userId);
  const displayName = user?.name || "Usuário";
  db.prepare("insert into user_settings (user_id, display_name) values (?, ?)").run(userId, displayName);

  return {
    user_id: userId,
    display_name: displayName,
    full_name: user?.name || "",
    avatar_url: null,
    theme: "dark",
    ai_style: "balanced",
    language: "pt-BR",
    response_length: "medium",
    voice_enabled: 1,
    voice_language: "pt-BR",
    voice_rate: 1,
    voice_pitch: 1,
    voice_gender: "auto",
    voice_auto_read: 0,
    updated_at: new Date().toISOString()
  };
}

export function updateSettings(
  userId: string,
  input: {
    displayName?: string;
    fullName?: string;
    avatarUrl?: string;
    theme?: string;
    aiStyle?: string;
    language?: string;
    responseLength?: string;
    voiceEnabled?: boolean;
    voiceLanguage?: string;
    voiceRate?: number;
    voicePitch?: number;
    voiceGender?: string;
    voiceAutoRead?: boolean;
  }
) {
  const current = getSettings(userId) as {
    display_name: string;
    full_name: string | null;
    avatar_url: string | null;
    theme: string;
    ai_style: string;
    language: string;
    response_length: string;
    voice_enabled: number;
    voice_language: string;
    voice_rate: number;
    voice_pitch: number;
    voice_gender: string;
    voice_auto_read: number;
  };
  const displayName = input.displayName?.trim() || current.display_name;
  const fullName = input.fullName?.trim() ?? current.full_name ?? "";
  const avatarUrl = input.avatarUrl?.trim() ?? current.avatar_url ?? "";
  const theme = input.theme?.trim() || current.theme;
  const aiStyle = input.aiStyle?.trim() || current.ai_style;
  const language = input.language?.trim() || current.language || "pt-BR";
  const responseLength = input.responseLength?.trim() || current.response_length || "medium";
  const voiceEnabled = typeof input.voiceEnabled === "boolean" ? (input.voiceEnabled ? 1 : 0) : current.voice_enabled;
  const voiceLanguage = input.voiceLanguage?.trim() || current.voice_language || "pt-BR";
  const voiceRate = Math.min(1.8, Math.max(0.6, Number(input.voiceRate ?? current.voice_rate ?? 1)));
  const voicePitch = Math.min(1.6, Math.max(0.6, Number(input.voicePitch ?? current.voice_pitch ?? 1)));
  const voiceGender = input.voiceGender?.trim() || current.voice_gender || "auto";
  const voiceAutoRead = typeof input.voiceAutoRead === "boolean" ? (input.voiceAutoRead ? 1 : 0) : current.voice_auto_read;

  getDatabase()
    .prepare(
      `insert into user_settings (
         user_id, display_name, full_name, avatar_url, theme, ai_style, language, response_length,
         voice_enabled, voice_language, voice_rate, voice_pitch, voice_gender, voice_auto_read, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
       on conflict(user_id) do update set
         display_name = excluded.display_name,
         full_name = excluded.full_name,
         avatar_url = excluded.avatar_url,
         theme = excluded.theme,
         ai_style = excluded.ai_style,
         language = excluded.language,
         response_length = excluded.response_length,
         voice_enabled = excluded.voice_enabled,
         voice_language = excluded.voice_language,
         voice_rate = excluded.voice_rate,
         voice_pitch = excluded.voice_pitch,
         voice_gender = excluded.voice_gender,
         voice_auto_read = excluded.voice_auto_read,
         updated_at = current_timestamp`
    )
    .run(
      userId,
      displayName,
      fullName,
      avatarUrl || null,
      theme,
      aiStyle,
      language,
      responseLength,
      voiceEnabled,
      voiceLanguage,
      voiceRate,
      voicePitch,
      voiceGender,
      voiceAutoRead
    );

  return getSettings(userId);
}

export function listFavorites(userId: string) {
  return getDatabase()
    .prepare(
      `select favorites.id, messages.content, messages.role, messages.created_at
       from favorites
       join messages on messages.id = favorites.message_id
       where favorites.user_id = ?
       order by favorites.created_at desc`
    )
    .all(userId);
}

export function addFavorite(userId: string, messageId: string) {
  const id = uuid();
  getDatabase()
    .prepare("insert or ignore into favorites (id, user_id, message_id) values (?, ?, ?)")
    .run(id, userId, messageId);
  return { id, messageId };
}
