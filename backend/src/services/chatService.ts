import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { askYara } from "./openaiService";

type ConversationRow = {
  id: string;
  title: string;
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
      "select id, title, created_at, updated_at from conversations where user_id = ? order by updated_at desc"
    )
    .all(userId) as ConversationRow[];
}

export function createConversation(userId: string, title = "Nova conversa") {
  const id = uuid();
  getDatabase()
    .prepare("insert into conversations (id, user_id, title) values (?, ?, ?)")
    .run(id, userId, title);
  return { id, title };
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

function readMemory(userId: string) {
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

