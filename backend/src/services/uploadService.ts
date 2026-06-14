import type { Request } from "express";
import fs from "node:fs";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "audio/webm",
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".txt",
  ".csv",
  ".webm",
  ".wav",
  ".mp3",
  ".m4a",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx"
]);
const blockedExtensions = new Set([".exe", ".bat", ".cmd", ".sh", ".js", ".ts", ".html", ".htm", ".php", ".ps1", ".vbs"]);
const maxFileSize = 10 * 1024 * 1024;
const maxMultipartSize = maxFileSize + 1024 * 1024;

type MultipartFile = {
  buffer: Buffer;
  originalName: string;
  fileType: string;
  fileSize: number;
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

function getUploadDir() {
  return env.uploadDir
    ? path.resolve(env.uploadDir)
    : path.resolve(__dirname, "..", "..", "uploads");
}

function sanitizeFileName(fileName: string) {
  return path
    .basename(fileName)
    .replace(/[^\w.\- ()]/g, "")
    .trim()
    .slice(0, 160) || "arquivo";
}

function validateFile(originalName: string, fileType: string, fileSize: number) {
  const safeName = sanitizeFileName(originalName);
  const extension = path.extname(safeName).toLowerCase();

  if (blockedExtensions.has(extension) || !allowedExtensions.has(extension) || !allowedTypes.has(fileType)) {
    throw new Error("Tipo de arquivo não permitido.");
  }

  if (!Number.isInteger(fileSize) || fileSize <= 0 || fileSize > maxFileSize) {
    throw new Error("Arquivo muito grande.");
  }

  return { safeName, extension };
}

function parseHeaderValue(header: string, key: string) {
  const match = new RegExp(`${key}="([^"]*)"`).exec(header);
  return match?.[1] ?? "";
}

function splitBuffer(buffer: Buffer, separator: Buffer) {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buffer.indexOf(separator, start);

  while (index !== -1) {
    parts.push(buffer.subarray(start, index));
    start = index + separator.length;
    index = buffer.indexOf(separator, start);
  }

  parts.push(buffer.subarray(start));
  return parts;
}

async function readRequestBody(req: Request) {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const item = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += item.length;
    if (total > maxMultipartSize) {
      throw new Error("Arquivo muito grande.");
    }
    chunks.push(item);
  }

  return Buffer.concat(chunks);
}

export async function parseMultipartUpload(req: Request) {
  const contentType = req.headers["content-type"] || "";
  const boundaryMatch = /boundary=([^;]+)/i.exec(Array.isArray(contentType) ? contentType[0] : contentType);

  if (!boundaryMatch) {
    throw new Error("Envie o arquivo usando multipart/form-data.");
  }

  const boundaryToken = boundaryMatch[1].trim().replace(/^"|"$/g, "");
  const boundary = Buffer.from(`--${boundaryToken}`);
  const body = await readRequestBody(req);
  const parts = splitBuffer(body, boundary);
  const fields: Record<string, string> = {};
  let file: MultipartFile | null = null;

  for (const rawPart of parts) {
    let part = rawPart;
    if (part.length === 0 || part.equals(Buffer.from("--\r\n")) || part.equals(Buffer.from("--"))) {
      continue;
    }
    if (part.subarray(0, 2).toString() === "\r\n") {
      part = part.subarray(2);
    }
    if (part.subarray(part.length - 2).toString() === "\r\n") {
      part = part.subarray(0, part.length - 2);
    }
    if (part.subarray(part.length - 2).toString() === "--") {
      part = part.subarray(0, part.length - 2);
    }

    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd === -1) continue;

    const rawHeaders = part.subarray(0, headerEnd).toString("utf8");
    const value = part.subarray(headerEnd + 4);
    const disposition = rawHeaders.split("\r\n").find((line) => line.toLowerCase().startsWith("content-disposition"));
    if (!disposition) continue;

    const name = parseHeaderValue(disposition, "name");
    const filename = parseHeaderValue(disposition, "filename");

    if (filename) {
      const typeHeader = rawHeaders.split("\r\n").find((line) => line.toLowerCase().startsWith("content-type"));
      const fileType =
        typeHeader?.split(":").slice(1).join(":").trim().toLowerCase().split(";")[0].trim() ||
        "application/octet-stream";
      file = {
        buffer: value,
        originalName: filename,
        fileType,
        fileSize: value.length
      };
    } else if (name) {
      fields[name] = value.toString("utf8").trim();
    }
  }

  if (!file) {
    throw new Error("Nenhum arquivo enviado.");
  }

  return { fields, file };
}

export function createUploadFromFile(
  userId: string,
  input: { conversationId?: string | null; file: MultipartFile }
) {
  const db = getDatabase();
  const conversationId = input.conversationId?.trim() || null;
  const { safeName, extension } = validateFile(input.file.originalName, input.file.fileType, input.file.fileSize);

  if (conversationId) {
    const conversation = db
      .prepare("select id from conversations where id = ? and user_id = ?")
      .get(conversationId, userId);
    if (!conversation) {
      throw new Error("Conversa não encontrada para anexar o arquivo.");
    }
  }

  const id = uuid();
  const storedName = `${id}${extension}`;
  const uploadDir = getUploadDir();
  fs.mkdirSync(uploadDir, { recursive: true });
  const storagePath = path.join(uploadDir, storedName);
  fs.writeFileSync(storagePath, input.file.buffer, { flag: "wx" });

  db.prepare(
    `insert into uploads (id, user_id, conversation_id, file_name, original_name, file_type, file_size, storage_path)
     values (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, userId, conversationId, storedName, safeName, input.file.fileType, input.file.fileSize, storagePath);

  return toPublicUpload({
    id,
    user_id: userId,
    conversation_id: conversationId,
    message_id: null,
    file_name: storedName,
    original_name: safeName,
    file_type: input.file.fileType,
    file_size: input.file.fileSize,
    storage_path: storagePath,
    created_at: new Date().toISOString()
  });
}

export function toPublicUpload(upload: UploadRow) {
  return {
    id: upload.id,
    conversation_id: upload.conversation_id,
    message_id: upload.message_id,
    file_name: upload.file_name,
    original_name: upload.original_name || upload.file_name,
    file_type: upload.file_type,
    file_size: upload.file_size,
    url: `/api/uploads/${upload.id}/download`,
    created_at: upload.created_at
  };
}

export function listUploads(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, user_id, conversation_id, message_id, file_name, original_name, file_type, file_size, storage_path, created_at
       from uploads
       where user_id = ?
       order by created_at desc`
    )
    .all(userId) as UploadRow[];

  return rows.map(toPublicUpload);
}

export function getUploadForDownload(userId: string, uploadId: string) {
  const upload = getDatabase()
    .prepare(
      `select id, user_id, conversation_id, message_id, file_name, original_name, file_type, file_size, storage_path, created_at
       from uploads
       where id = ? and user_id = ?`
    )
    .get(uploadId, userId) as UploadRow | undefined;

  if (!upload || !fs.existsSync(upload.storage_path)) {
    throw new Error("Arquivo não encontrado.");
  }

  return upload;
}

export function deleteUpload(userId: string, uploadId: string) {
  const upload = getUploadForDownload(userId, uploadId);
  const result = getDatabase()
    .prepare("delete from uploads where id = ? and user_id = ?")
    .run(uploadId, userId);

  if (result.changes === 0) {
    throw new Error("Arquivo não encontrado.");
  }

  fs.rmSync(upload.storage_path, { force: true });
  return { id: uploadId };
}
