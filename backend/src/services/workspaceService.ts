import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { askYara } from "./ai/aiService";
import { getUserById } from "./authService";

export function listMemories(userId: string) {
  return getDatabase()
    .prepare("select id, title, content, created_at, updated_at from memories where user_id = ? order by updated_at desc")
    .all(userId);
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

export function deleteMemory(userId: string, memoryId: string) {
  const result = getDatabase()
    .prepare("delete from memories where id = ? and user_id = ?")
    .run(memoryId, userId);

  if (result.changes === 0) {
    throw new Error("Memória não encontrada.");
  }

  return { id: memoryId };
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
      "Entregue um plano profissional em português com visão geral, módulos, telas, API, banco de dados, segurança e próximos passos."
    ].join("\n")
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
    .prepare("select user_id, display_name, theme, ai_style, updated_at from user_settings where user_id = ?")
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
    theme: "dark",
    ai_style: "balanced",
    updated_at: new Date().toISOString()
  };
}

export function updateSettings(
  userId: string,
  input: { displayName?: string; theme?: string; aiStyle?: string }
) {
  const current = getSettings(userId) as { display_name: string; theme: string; ai_style: string };
  const displayName = input.displayName?.trim() || current.display_name;
  const theme = input.theme?.trim() || current.theme;
  const aiStyle = input.aiStyle?.trim() || current.ai_style;

  getDatabase()
    .prepare(
      `insert into user_settings (user_id, display_name, theme, ai_style, updated_at)
       values (?, ?, ?, ?, current_timestamp)
       on conflict(user_id) do update set
         display_name = excluded.display_name,
         theme = excluded.theme,
         ai_style = excluded.ai_style,
         updated_at = current_timestamp`
    )
    .run(userId, displayName, theme, aiStyle);

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
