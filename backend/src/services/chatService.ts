import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { askYara } from "./ai/aiService";

type ConversationRow = {
  id: string;
  title: string;
  is_pinned: number;
  is_archived: number;
  pinned_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

function conversationTitle(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}...` : clean || "Nova conversa";
}

export function listConversations(userId: string) {
  return getDatabase()
    .prepare(
      `select id, title, is_pinned, is_archived, pinned_at, sort_order, created_at, updated_at
       from conversations
       where user_id = ? and is_archived = 0
       order by is_pinned desc, sort_order desc, updated_at desc`
    )
    .all(userId) as ConversationRow[];
}

export function createConversation(userId: string, title = "Nova conversa") {
  const id = uuid();
  getDatabase()
    .prepare("insert into conversations (id, user_id, title, sort_order) values (?, ?, ?, ?)")
    .run(id, userId, title, Date.now());
  return { id, title, is_pinned: 0, is_archived: 0, sort_order: Date.now() };
}

export function getConversation(userId: string, conversationId: string) {
  const conversation = getDatabase()
    .prepare(
      `select id, title, is_pinned, is_archived, pinned_at, sort_order, created_at, updated_at
       from conversations
       where id = ? and user_id = ?`
    )
    .get(conversationId, userId) as ConversationRow | undefined;

  if (!conversation) {
    throw new Error("Conversa nao encontrada.");
  }

  return {
    conversation,
    messages: getMessages(userId, conversationId)
  };
}

export function renameConversation(userId: string, conversationId: string, title: string) {
  const cleanTitle = title.replace(/\s+/g, " ").trim();
  if (!cleanTitle) {
    throw new Error("Informe um nome para a conversa.");
  }

  const result = getDatabase()
    .prepare(
      "update conversations set title = ?, updated_at = current_timestamp where id = ? and user_id = ?"
    )
    .run(cleanTitle, conversationId, userId);

  if (result.changes === 0) {
    throw new Error("Conversa nao encontrada.");
  }

  return { id: conversationId, title: cleanTitle };
}

export function deleteConversation(userId: string, conversationId: string) {
  const result = getDatabase()
    .prepare("delete from conversations where id = ? and user_id = ?")
    .run(conversationId, userId);

  if (result.changes === 0) {
    throw new Error("Conversa nao encontrada.");
  }

  return { id: conversationId };
}

export function pinConversation(userId: string, conversationId: string, pinned: boolean) {
  const result = getDatabase()
    .prepare(
      `update conversations
       set is_pinned = ?,
           pinned_at = case when ? = 1 then current_timestamp else null end,
           sort_order = case when ? = 1 then ? else sort_order end,
           updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(pinned ? 1 : 0, pinned ? 1 : 0, pinned ? 1 : 0, Date.now(), conversationId, userId);

  if (result.changes === 0) {
    throw new Error("Conversa nao encontrada.");
  }

  return { id: conversationId, is_pinned: pinned ? 1 : 0 };
}

export function archiveConversation(userId: string, conversationId: string, archived: boolean) {
  const result = getDatabase()
    .prepare(
      `update conversations
       set is_archived = ?,
           updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(archived ? 1 : 0, conversationId, userId);

  if (result.changes === 0) {
    throw new Error("Conversa nao encontrada.");
  }

  return { id: conversationId, is_archived: archived ? 1 : 0 };
}

export function moveConversationToTop(userId: string, conversationId: string) {
  const result = getDatabase()
    .prepare(
      `update conversations
       set sort_order = ?,
           updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(Date.now(), conversationId, userId);

  if (result.changes === 0) {
    throw new Error("Conversa nao encontrada.");
  }

  return { id: conversationId };
}

export function listConversationFiles(userId: string, conversationId: string) {
  const conversation = getDatabase()
    .prepare("select id from conversations where id = ? and user_id = ?")
    .get(conversationId, userId);

  if (!conversation) {
    throw new Error("Conversa nao encontrada.");
  }

  return getDatabase()
    .prepare(
      `select id, file_name, file_type, file_size, storage_path, created_at
       from uploads
       where user_id = ? and conversation_id = ?
       order by created_at desc`
    )
    .all(userId, conversationId);
}

export function addConversationToProject(userId: string, conversationId: string, projectId: string) {
  const db = getDatabase();
  const conversation = db
    .prepare("select id from conversations where id = ? and user_id = ?")
    .get(conversationId, userId);
  const project = db.prepare("select id from projects where id = ? and user_id = ?").get(projectId, userId);

  if (!conversation) {
    throw new Error("Conversa nao encontrada.");
  }

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  db.prepare(
    "insert or ignore into conversation_projects (conversation_id, project_id, user_id) values (?, ?, ?)"
  ).run(conversationId, projectId, userId);

  return { conversationId, projectId };
}

export function getMessages(userId: string, conversationId: string) {
  const conversation = getDatabase()
    .prepare("select id from conversations where id = ? and user_id = ?")
    .get(conversationId, userId);

  if (!conversation) {
    throw new Error("Conversa nao encontrada.");
  }

  return getDatabase()
    .prepare(
      "select id, conversation_id, role, content, created_at from messages where conversation_id = ? order by created_at asc"
    )
    .all(conversationId) as MessageRow[];
}

export function readMemory(userId: string) {
  const rows = getDatabase()
    .prepare("select title, content from memories where user_id = ? order by updated_at desc limit 8")
    .all(userId) as Array<{ title: string; content: string }>;

  return rows.map((row) => `${row.title}: ${row.content}`).join("\n");
}

function readRecentContext(conversationId: string) {
  const rows = getDatabase()
    .prepare(
      "select role, content from messages where conversation_id = ? order by created_at desc limit 12"
    )
    .all(conversationId) as Array<{ role: string; content: string }>;

  return rows
    .reverse()
    .map((row) => `${row.role === "user" ? "Usuario" : "YARA"}: ${row.content}`)
    .join("\n");
}

export async function sendMessage(userId: string, input: { conversationId?: string; message: string }) {
  const db = getDatabase();
  const message = input.message.trim();

  if (!message) {
    throw new Error("Digite uma mensagem para a YARA.");
  }

  let conversationId = input.conversationId;

  if (conversationId) {
    const existing = db
      .prepare("select id from conversations where id = ? and user_id = ?")
      .get(conversationId, userId);

    if (!existing) {
      throw new Error("Conversa nao encontrada.");
    }
  } else {
    const conversation = createConversation(userId, conversationTitle(message));
    conversationId = conversation.id;
  }

  const userMessageId = uuid();
  db.prepare("insert into messages (id, conversation_id, role, content) values (?, ?, 'user', ?)")
    .run(userMessageId, conversationId, message);

  const ai = await askYara({
    prompt: message,
    memory: readMemory(userId),
    context: readRecentContext(conversationId)
  });

  const assistantMessageId = uuid();
  db.prepare("insert into messages (id, conversation_id, role, content) values (?, ?, 'assistant', ?)")
    .run(assistantMessageId, conversationId, ai.response);

  db.prepare("update conversations set updated_at = current_timestamp where id = ?").run(conversationId);

  return {
    conversationId,
    provider: ai.provider,
    model: ai.model,
    messages: [
      {
        id: userMessageId,
        role: "user",
        content: message
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: ai.response
      }
    ]
  };
}
