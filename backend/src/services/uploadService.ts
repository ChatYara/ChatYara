import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const maxFileSize = 10 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.\- ()]/g, "").trim().slice(0, 160) || "arquivo";
}

export function createUpload(
  userId: string,
  input: { conversationId?: string | null; fileName: string; fileType: string; fileSize: number }
) {
  const db = getDatabase();
  const fileName = sanitizeFileName(input.fileName);
  const fileType = input.fileType.trim().toLowerCase();
  const fileSize = Number(input.fileSize);
  const conversationId = input.conversationId?.trim() || null;

  if (!allowedTypes.has(fileType)) {
    throw new Error("Tipo de arquivo não permitido.");
  }

  if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > maxFileSize) {
    throw new Error("Arquivo acima do limite permitido de 10 MB.");
  }

  if (conversationId) {
    const conversation = db
      .prepare("select id from conversations where id = ? and user_id = ?")
      .get(conversationId, userId);
    if (!conversation) {
      throw new Error("Conversa não encontrada para anexar o arquivo.");
    }
  }

  const id = uuid();
  const storagePath = `pending://${userId}/${id}/${fileName}`;

  db.prepare(
    `insert into uploads (id, user_id, conversation_id, file_name, file_type, file_size, storage_path)
     values (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, userId, conversationId, fileName, fileType, fileSize, storagePath);

  return {
    id,
    conversation_id: conversationId,
    file_name: fileName,
    file_type: fileType,
    file_size: fileSize,
    storage_path: storagePath,
    status: "pending_storage"
  };
}
