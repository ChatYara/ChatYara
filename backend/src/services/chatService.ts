import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { askYara } from "./ai/aiService";
import { tryCreateCalendarItemFromChat } from "./calendarService";
import { buildDocumentContextFromUploads } from "./documentService";
import { learnFromUserMessage, readLearningContext } from "./learningService";
import { buildSearchContext, formatAnswerWithSources, runSearch, shouldUseOnlineSearch } from "./searchService";
import { toPublicUpload } from "./uploadService";

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
  edited_at?: string | null;
  feedback?: "like" | "dislike" | null;
  created_at: string;
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

function conversationTitle(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}...` : clean || "Nova conversa";
}

function publicUploadSelect() {
  return "id, user_id, conversation_id, message_id, file_name, original_name, file_type, file_size, storage_path, created_at";
}

function attachUploadsToMessages(userId: string, messages: MessageRow[]) {
  if (messages.length === 0) return [];

  const ids = messages.map((message) => message.id);
  const placeholders = ids.map(() => "?").join(", ");
  const uploads = getDatabase()
    .prepare(
      `select ${publicUploadSelect()}
       from uploads
       where user_id = ? and message_id in (${placeholders})
       order by created_at asc`
    )
    .all(userId, ...ids) as UploadRow[];

  const byMessage = new Map<string, ReturnType<typeof toPublicUpload>[]>();
  uploads.forEach((upload) => {
    if (!upload.message_id) return;
    const current = byMessage.get(upload.message_id) || [];
    current.push(toPublicUpload(upload));
    byMessage.set(upload.message_id, current);
  });

  const feedback = getDatabase()
    .prepare(
      `select message_id, value
       from message_feedback
       where user_id = ? and message_id in (${placeholders})`
    )
    .all(userId, ...ids) as Array<{ message_id: string; value: "like" | "dislike" }>;
  const feedbackByMessage = new Map(feedback.map((item) => [item.message_id, item.value]));

  return messages.map((message) => ({
    ...message,
    feedback: feedbackByMessage.get(message.id) || null,
    uploads: byMessage.get(message.id) || []
  }));
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
      `select ${publicUploadSelect()}
       from uploads
       where user_id = ? and conversation_id = ?
       order by created_at desc`
    )
    .all(userId, conversationId)
    .map((upload) => toPublicUpload(upload as UploadRow));
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

  const messages = getDatabase()
    .prepare(
      "select id, conversation_id, role, content, edited_at, created_at from messages where conversation_id = ? order by created_at asc"
    )
    .all(conversationId) as MessageRow[];

  return attachUploadsToMessages(userId, messages);
}

export function readMemory(userId: string) {
  const rows = getDatabase()
    .prepare("select title, content from memories where user_id = ? order by updated_at desc limit 8")
    .all(userId) as Array<{ title: string; content: string }>;

  return rows.map((row) => `${row.title}: ${row.content}`).join("\n");
}

function readSettingsContext(userId: string) {
  const settings = getDatabase()
    .prepare(
      `select display_name, ai_style, language, response_length
       from user_settings
       where user_id = ?`
    )
    .get(userId) as
    | {
        display_name: string;
        ai_style: string;
        language: string;
        response_length: string;
      }
    | undefined;

  if (!settings) return "";

  return [
    `Nome preferido: ${settings.display_name}`,
    `Estilo preferido: ${settings.ai_style}`,
    `Idioma principal: ${settings.language}`,
    `Tamanho de resposta preferido: ${settings.response_length}`
  ].join("\n");
}

function readUserContext(userId: string) {
  return [
    readSettingsContext(userId),
    readMemory(userId) ? `Memórias manuais:\n${readMemory(userId)}` : "",
    readLearningContext(userId) ? `Aprendizados automáticos seguros:\n${readLearningContext(userId)}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
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

function directAnswer(message: string) {
  if (/\b(que horas s[aã]o|hor[aá]rio atual|hora agora)\b/i.test(message)) {
    const now = new Date();
    const time = new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(now);
    const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(now);
    return `Agora são ${time} de ${date}.`;
  }

  return null;
}

function providerFallback(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : String(error || "");
  const highDemand = /high demand|overloaded|temporar|try again later|quota|rate/i.test(rawMessage);
  const response = highDemand
    ? "Estou online e recebi sua mensagem, mas o provedor de IA está temporariamente instável ou em alta demanda. Tente enviar novamente em alguns instantes. Enquanto isso, suas conversas, arquivos, projetos e agenda continuam salvos normalmente."
    : "Estou online e recebi sua mensagem, mas não consegui concluir a resposta pelo provedor de IA agora. Tente novamente em alguns instantes.";

  return {
    provider: "gemini" as const,
    model: "provider-unavailable",
    response
  };
}

function buildImageContextFromUploads(uploads: UploadRow[]) {
  const images = uploads.filter((upload) => upload.file_type.startsWith("image/"));
  if (images.length === 0) return "";

  return [
    "Imagens anexadas nesta mensagem:",
    ...images.map(
      (upload) =>
        `- ${upload.original_name || upload.file_name} (${upload.file_type}, ${upload.file_size} bytes). ` +
        "A YARA recebeu a imagem, mas a leitura visual avançada no chat ainda usa o módulo Imagens para análise, OCR e edição."
    ),
    "Se o usuário pedir leitura de texto, análise visual ou melhoria da imagem, responda com honestidade e oriente usar Imagens > Analisar/OCR/Editar."
  ].join("\n");
}

function getOwnedMessage(userId: string, messageId: string) {
  const message = getDatabase()
    .prepare(
      `select messages.id, messages.conversation_id, messages.role, messages.content, messages.edited_at, messages.created_at
       from messages
       join conversations on conversations.id = messages.conversation_id
       where messages.id = ? and conversations.user_id = ?`
    )
    .get(messageId, userId) as MessageRow | undefined;

  if (!message) {
    throw new Error("Mensagem não encontrada.");
  }

  return message;
}

export function editUserMessage(userId: string, messageId: string, content: string) {
  const message = getOwnedMessage(userId, messageId);
  const cleanContent = content.replace(/\s+/g, " ").trim();

  if (message.role !== "user") {
    throw new Error("Apenas mensagens do usuário podem ser editadas.");
  }

  if (cleanContent.length < 1) {
    throw new Error("A mensagem não pode ficar vazia.");
  }

  getDatabase()
    .prepare("update messages set content = ?, edited_at = current_timestamp where id = ?")
    .run(cleanContent, messageId);

  return { ...message, content: cleanContent, edited_at: new Date().toISOString() };
}

export function setMessageFeedback(userId: string, messageId: string, value: "like" | "dislike") {
  const message = getOwnedMessage(userId, messageId);
  if (message.role !== "assistant") {
    throw new Error("Feedback só pode ser aplicado a respostas da YARA.");
  }

  const id = uuid();
  getDatabase()
    .prepare(
      `insert into message_feedback (id, user_id, message_id, value, updated_at)
       values (?, ?, ?, ?, current_timestamp)
       on conflict(user_id, message_id) do update set
         value = excluded.value,
         updated_at = current_timestamp`
    )
    .run(id, userId, messageId, value);

  return { messageId, value };
}

export async function regenerateAssistantMessage(userId: string, messageId: string) {
  const assistant = getOwnedMessage(userId, messageId);
  if (assistant.role !== "assistant") {
    throw new Error("Selecione uma resposta da YARA para regenerar.");
  }

  const previousUser = getDatabase()
    .prepare(
      `select id, conversation_id, role, content, edited_at, created_at
       from messages
       where conversation_id = ? and role = 'user' and created_at <= ?
       order by created_at desc
       limit 1`
    )
    .get(assistant.conversation_id, assistant.created_at) as MessageRow | undefined;

  if (!previousUser) {
    throw new Error("Não encontrei a mensagem original para regenerar.");
  }

  const direct = directAnswer(previousUser.content);
  let ai: Awaited<ReturnType<typeof askYara>> | { provider: "gemini"; model: string; response: string };
  if (direct) {
    ai = {
      provider: "gemini" as const,
      model: "direct",
      response: direct
    };
  } else {
    try {
      ai = await askYara({
        prompt: previousUser.content,
        memory: readUserContext(userId),
        context: readRecentContext(assistant.conversation_id)
      });
    } catch (error) {
      ai = providerFallback(error);
    }
  }

  getDatabase()
    .prepare("update messages set content = ?, edited_at = current_timestamp where id = ?")
    .run(ai.response, messageId);

  return {
    message: { ...assistant, content: ai.response, edited_at: new Date().toISOString() },
    provider: ai.provider,
    model: ai.model
  };
}

export async function sendMessage(
  userId: string,
  input: { conversationId?: string; message?: string; uploadIds?: string[]; useWebSearch?: boolean }
) {
  const db = getDatabase();
  const message = (input.message || "").trim();
  const uploadIds = Array.from(new Set(input.uploadIds || [])).filter(Boolean);

  if (!message && uploadIds.length === 0) {
    throw new Error("Digite uma mensagem para a YARA.");
  }

  if (uploadIds.length > 5) {
    throw new Error("Envie no máximo 5 anexos por mensagem.");
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
    const conversation = createConversation(userId, conversationTitle(message || "Anexo enviado"));
    conversationId = conversation.id;
  }

  let uploads: UploadRow[] = [];
  if (uploadIds.length > 0) {
    const placeholders = uploadIds.map(() => "?").join(", ");
    uploads = db
      .prepare(
        `select ${publicUploadSelect()}
         from uploads
         where user_id = ? and id in (${placeholders})`
      )
      .all(userId, ...uploadIds) as UploadRow[];

    if (uploads.length !== uploadIds.length) {
      throw new Error("Não foi possível localizar todos os anexos.");
    }

    const blocked = uploads.some(
      (upload) => upload.conversation_id && upload.conversation_id !== conversationId
    );
    if (blocked) {
      throw new Error("Anexo não pertence a esta conversa.");
    }
  }

  const userMessageId = uuid();
  const storedMessage = message || "Anexo enviado.";
  db.prepare("insert into messages (id, conversation_id, role, content) values (?, ?, 'user', ?)")
    .run(userMessageId, conversationId, storedMessage);

  if (uploads.length > 0) {
    const placeholders = uploadIds.map(() => "?").join(", ");
    db.prepare(
      `update uploads
       set conversation_id = ?, message_id = ?
       where user_id = ? and id in (${placeholders})`
    ).run(conversationId, userMessageId, userId, ...uploadIds);
  }

  const attachmentContext = uploads
    .map((upload) => `Anexo: ${upload.original_name || upload.file_name} (${upload.file_type}, ${upload.file_size} bytes)`)
    .join("\n");
  const documentContext = buildDocumentContextFromUploads(uploads);
  const imageContext = buildImageContextFromUploads(uploads);
  const prompt = [storedMessage, attachmentContext, documentContext, imageContext].filter(Boolean).join("\n\n");

  learnFromUserMessage(userId, storedMessage);
  const calendarAction = tryCreateCalendarItemFromChat(userId, storedMessage);

  const searchNeeded = shouldUseOnlineSearch(storedMessage, Boolean(input.useWebSearch));
  const direct = directAnswer(storedMessage);
  const search = searchNeeded ? await runSearch(userId, storedMessage) : null;
  let ai: Awaited<ReturnType<typeof askYara>> | { provider: "gemini"; model: string; response: string };

  if (direct && !searchNeeded) {
    ai = {
      provider: "gemini",
      model: "direct",
      response: direct
    };
  } else if (calendarAction && !searchNeeded) {
    ai = {
      provider: "gemini",
      model: "calendar-action",
      response: "Pronto. Também deixei esse compromisso organizado na sua Agenda."
    };
  } else if (search && ["not_configured", "youtube_transcript_not_configured", "failed"].includes(search.status)) {
    ai = {
      provider: "gemini",
      model: "search-status",
      response: search.response
    };
  } else {
    try {
      ai = await askYara({
        prompt: search
          ? [
              prompt,
              "",
              "Use a pesquisa real abaixo para responder. Não invente fontes e cite apenas as fontes fornecidas.",
              buildSearchContext(search)
            ].join("\n")
          : prompt,
        memory: readUserContext(userId),
        context: readRecentContext(conversationId)
      });
    } catch (error) {
      ai = {
        provider: "gemini",
        model: search ? "search-fallback" : providerFallback(error).model,
        response: search ? search.response : providerFallback(error).response
      };
    }
  }

  const responseWithCalendar = calendarAction ? `${calendarAction.text}\n\n${ai.response}` : ai.response;
  const finalResponse = search && search.sources.length > 0 ? formatAnswerWithSources(responseWithCalendar, search.sources) : responseWithCalendar;

  const assistantMessageId = uuid();
  db.prepare("insert into messages (id, conversation_id, role, content) values (?, ?, 'assistant', ?)")
    .run(assistantMessageId, conversationId, finalResponse);

  db.prepare("update conversations set updated_at = current_timestamp where id = ?").run(conversationId);

  return {
    conversationId,
    provider: ai.provider,
    model: ai.model,
    messages: [
      {
        id: userMessageId,
        role: "user",
        content: storedMessage,
        uploads: uploads.map((upload) =>
          toPublicUpload({ ...upload, conversation_id: conversationId, message_id: userMessageId })
        )
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: finalResponse
      }
    ]
  };
}
