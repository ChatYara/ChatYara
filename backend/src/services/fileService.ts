import fs from "node:fs";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

export type StoredFileRow = {
  id: string;
  user_id: string;
  conversation_id: string | null;
  message_id: string | null;
  name: string;
  type: string;
  size: number;
  path: string;
  category: string;
  status: string;
  is_favorite: number;
  is_shared: number;
  created_at: string;
  updated_at: string;
};

type FileSourceRow = {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  category: string;
  source: "file" | "upload" | "document" | "image";
  conversation_id?: string | null;
  message_id?: string | null;
  is_favorite?: number;
  is_shared?: number;
  created_at: string;
  updated_at?: string;
};

const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/dxf",
  "application/ifc",
  "application/acad",
  "application/x-dwg",
  "image/png",
  "image/jpeg"
]);
const allowedExtensions = new Set([".pdf", ".docx", ".xlsx", ".txt", ".csv", ".dxf", ".dwg", ".ifc", ".png", ".jpg", ".jpeg"]);
const blockedExtensions = new Set([".exe", ".bat", ".cmd", ".sh", ".js", ".ts", ".html", ".htm", ".php", ".ps1", ".vbs", ".msi", ".apk"]);

export function getFilesDir() {
  if (process.env.FILES_DIR?.trim()) {
    return path.resolve(process.env.FILES_DIR.trim());
  }

  return path.resolve(__dirname, "..", "..", "files");
}

export function sanitizeFileName(value: string) {
  return (
    path
      .basename(value || "arquivo")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.\- ()]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 140) || "arquivo"
  );
}

function ensureAllowedFile(name: string, mimeType: string, size: number) {
  const safeName = sanitizeFileName(name);
  const extension = path.extname(safeName).toLowerCase();

  if (blockedExtensions.has(extension) || !allowedExtensions.has(extension) || !allowedTypes.has(mimeType)) {
    throw new Error("Tipo de arquivo não permitido.");
  }

  if (!Number.isInteger(size) || size <= 0 || size > maxFileSize) {
    throw new Error("Arquivo muito grande.");
  }

  return { safeName, extension };
}

export function toPublicFile(row: FileSourceRow | StoredFileRow) {
  const source = "source" in row ? row.source : "file";
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    size: row.size,
    category: row.category,
    source,
    conversation_id: row.conversation_id || null,
    message_id: row.message_id || null,
    is_favorite: Number(row.is_favorite || 0) === 1,
    is_shared: Number(row.is_shared || 0) === 1,
    url: `/api/files/${row.id}/download`,
    preview_url: `/api/files/${row.id}`,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at
  };
}

export function saveFileBuffer(
  userId: string,
  input: {
    name: string;
    mimeType: string;
    buffer: Buffer;
    category?: string;
    conversationId?: string | null;
    messageId?: string | null;
  }
) {
  const { safeName, extension } = ensureAllowedFile(input.name, input.mimeType, input.buffer.length);
  const id = uuid();
  const storedName = `${id}${extension}`;
  const dir = getFilesDir();
  fs.mkdirSync(dir, { recursive: true });
  const storagePath = path.join(dir, storedName);
  fs.writeFileSync(storagePath, input.buffer, { flag: "wx" });

  getDatabase()
    .prepare(
      `insert into files (
         id, user_id, conversation_id, message_id, name, type, size, path, category, updated_at
       ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(
      id,
      userId,
      input.conversationId || null,
      input.messageId || null,
      safeName,
      input.mimeType,
      input.buffer.length,
      storagePath,
      input.category || "generated"
    );

  return getFile(userId, id);
}

export function updateFileMessage(userId: string, fileId: string, messageId: string) {
  getDatabase()
    .prepare("update files set message_id = ?, updated_at = current_timestamp where id = ? and user_id = ?")
    .run(messageId, fileId, userId);
  return getFile(userId, fileId);
}

function mapStoredFile(row: StoredFileRow): FileSourceRow {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    size: row.size,
    path: row.path,
    category: row.category,
    source: "file",
    conversation_id: row.conversation_id,
    message_id: row.message_id,
    is_favorite: row.is_favorite,
    is_shared: row.is_shared,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function findUnifiedFile(userId: string, fileId: string): FileSourceRow | undefined {
  const db = getDatabase();
  const file = db
    .prepare(
      `select id, user_id, conversation_id, message_id, name, type, size, path, category, status, is_favorite, is_shared, created_at, updated_at
       from files
       where id = ? and user_id = ?`
    )
    .get(fileId, userId) as StoredFileRow | undefined;
  if (file) return mapStoredFile(file);

  const upload = db
    .prepare(
      `select id, coalesce(original_name, file_name) as name, file_type as type, file_size as size, storage_path as path,
              'uploaded' as category, 'upload' as source, conversation_id, message_id, 0 as is_favorite, 0 as is_shared, created_at, created_at as updated_at
       from uploads
       where id = ? and user_id = ?`
    )
    .get(fileId, userId) as FileSourceRow | undefined;
  if (upload) return upload;

  const document = db
    .prepare(
      `select id, file_name as name, file_type as type, file_size as size, storage_path as path,
              type as category, 'document' as source, null as conversation_id, null as message_id,
              0 as is_favorite, 0 as is_shared, created_at, updated_at
       from documents
       where id = ? and user_id = ?`
    )
    .get(fileId, userId) as FileSourceRow | undefined;
  if (document) return document;

  const image = db
    .prepare(
      `select id, original_name as name, file_type as type, file_size as size, storage_path as path,
              'image' as category, 'image' as source, conversation_id, null as message_id,
              0 as is_favorite, 0 as is_shared, created_at, created_at as updated_at
       from images
       where id = ? and user_id = ?`
    )
    .get(fileId, userId) as FileSourceRow | undefined;
  return image;
}

export function getFile(userId: string, fileId: string) {
  const file = findUnifiedFile(userId, fileId);
  if (!file || !fs.existsSync(file.path)) {
    throw new Error("Arquivo não encontrado.");
  }

  return toPublicFile(file);
}

export function getFileForDownload(userId: string, fileId: string) {
  const file = findUnifiedFile(userId, fileId);
  if (!file || !fs.existsSync(file.path)) {
    throw new Error("Arquivo não encontrado.");
  }
  return file;
}

function readDocxText(storagePath: string) {
  const buffer = fs.readFileSync(storagePath);
  const marker = Buffer.from("word/document.xml");
  const index = buffer.indexOf(marker);
  if (index === -1) return "Visualização DOCX indisponível para este arquivo.";
  const xmlStart = buffer.indexOf(Buffer.from("<?xml"), index);
  if (xmlStart === -1) return "Visualização DOCX indisponível para este arquivo.";
  const xmlEnd = buffer.indexOf(Buffer.from("</w:document>"), xmlStart);
  if (xmlEnd === -1) return "Visualização DOCX indisponível para este arquivo.";
  const xml = buffer.subarray(xmlStart, xmlEnd + "</w:document>".length).toString("utf8");
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getFilePreview(userId: string, fileId: string) {
  const file = getFileForDownload(userId, fileId);
  const publicFile = toPublicFile(file);
  let preview: string | null = null;
  let previewType: "text" | "image" | "pdf" | "docx" | "binary" = "binary";

  if (file.type.startsWith("text/") || /\.(txt|csv)$/i.test(file.name)) {
    preview = fs.readFileSync(file.path, "utf8").slice(0, 8000);
    previewType = "text";
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    preview = readDocxText(file.path).slice(0, 8000);
    previewType = "docx";
  } else if (file.type === "application/pdf") {
    previewType = "pdf";
  } else if (file.type.startsWith("image/")) {
    previewType = "image";
  }

  return { file: publicFile, preview, previewType };
}

export function listFiles(userId: string, filters: { query?: string; type?: string; category?: string } = {}) {
  const db = getDatabase();
  const rows = [
    ...(db
      .prepare(
        `select id, name, type, size, path, category, 'file' as source, conversation_id, message_id,
                is_favorite, is_shared, created_at, updated_at
         from files
         where user_id = ?`
      )
      .all(userId) as FileSourceRow[]),
    ...(db
      .prepare(
        `select id, coalesce(original_name, file_name) as name, file_type as type, file_size as size, storage_path as path,
                'uploaded' as category, 'upload' as source, conversation_id, message_id,
                0 as is_favorite, 0 as is_shared, created_at, created_at as updated_at
         from uploads
         where user_id = ?`
      )
      .all(userId) as FileSourceRow[]),
    ...(db
      .prepare(
        `select id, file_name as name, file_type as type, file_size as size, storage_path as path,
                type as category, 'document' as source, null as conversation_id, null as message_id,
                0 as is_favorite, 0 as is_shared, created_at, updated_at
         from documents
         where user_id = ?`
      )
      .all(userId) as FileSourceRow[]),
    ...(db
      .prepare(
        `select id, original_name as name, file_type as type, file_size as size, storage_path as path,
                'image' as category, 'image' as source, conversation_id, null as message_id,
                0 as is_favorite, 0 as is_shared, created_at, created_at as updated_at
         from images
         where user_id = ?`
      )
      .all(userId) as FileSourceRow[])
  ];

  const query = filters.query?.trim().toLowerCase() || "";
  const type = filters.type?.trim().toLowerCase() || "";
  const category = filters.category?.trim().toLowerCase() || "";

  return rows
    .filter((item) => !query || item.name.toLowerCase().includes(query))
    .filter((item) => !type || item.type.toLowerCase().includes(type) || path.extname(item.name).toLowerCase().includes(type))
    .filter((item) => !category || item.category.toLowerCase() === category || item.source.toLowerCase() === category)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map(toPublicFile);
}

export function uploadFile(
  userId: string,
  input: { originalName: string; fileType: string; buffer: Buffer; conversationId?: string | null }
) {
  return saveFileBuffer(userId, {
    name: input.originalName,
    mimeType: input.fileType,
    buffer: input.buffer,
    conversationId: input.conversationId || null,
    category: "uploaded"
  });
}

export function deleteFile(userId: string, fileId: string) {
  const file = getFileForDownload(userId, fileId);
  const db = getDatabase();

  if (file.source === "file") {
    db.prepare("delete from files where id = ? and user_id = ?").run(fileId, userId);
  } else if (file.source === "upload") {
    db.prepare("delete from uploads where id = ? and user_id = ?").run(fileId, userId);
  } else if (file.source === "document") {
    db.prepare("delete from documents where id = ? and user_id = ?").run(fileId, userId);
  } else if (file.source === "image") {
    db.prepare("delete from images where id = ? and user_id = ?").run(fileId, userId);
  }

  fs.rmSync(file.path, { force: true });
  return { id: fileId };
}
