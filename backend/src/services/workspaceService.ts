import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { askYara } from "./ai/aiService";

export function listMemories(userId: string) {
  return getDatabase()
    .prepare("select id, title, content, updated_at from memories where user_id = ? order by updated_at desc")
    .all(userId);
}

export function saveMemory(userId: string, input: { title: string; content: string }) {
  const id = uuid();
  getDatabase()
    .prepare("insert into memories (id, user_id, title, content) values (?, ?, ?, ?)")
    .run(id, userId, input.title.trim(), input.content.trim());
  return { id, ...input };
}

export function listProjects(userId: string) {
  return getDatabase()
    .prepare("select id, name, type, prompt, output, created_at from projects where user_id = ? order by created_at desc")
    .all(userId);
}

export async function generateSystem(userId: string, input: { type: string; prompt: string }) {
  const ai = await askYara({
    prompt: [
      `Tipo de sistema: ${input.type}`,
      `Briefing: ${input.prompt}`,
      "Entregue uma arquitetura objetiva, modulos principais, modelo de dados e proximos passos."
    ].join("\n")
  });

  const id = uuid();
  const name = `${input.type} - ${new Date().toISOString().slice(0, 10)}`;

  getDatabase()
    .prepare(
      "insert into projects (id, user_id, name, type, prompt, output) values (?, ?, ?, ?, ?, ?)"
    )
    .run(id, userId, name, input.type, input.prompt, ai.response);

  return {
    id,
    name,
    type: input.type,
    prompt: input.prompt,
    output: ai.response,
    provider: ai.provider,
    model: ai.model
  };
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
