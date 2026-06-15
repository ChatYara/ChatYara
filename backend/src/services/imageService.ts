import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";

type ImageFormat = "jpeg" | "png" | "webp";
type UploadedImageFile = {
  buffer: Buffer;
  originalName: string;
  fileType: string;
  fileSize: number;
};

type ImageRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  conversation_id: string | null;
  original_name: string;
  file_name: string;
  file_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  storage_path: string;
  created_at: string;
};

type AnalysisRow = {
  id: string;
  image_id: string;
  type: string;
  result_json: string;
  created_at: string;
};

type EditRow = {
  id: string;
  original_image_id: string;
  result_image_id: string | null;
  edit_type: string;
  prompt: string | null;
  status: string;
  provider: string;
  created_at: string;
};

const acceptedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const acceptedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const blockedExtensions = new Set([".exe", ".bat", ".cmd", ".sh", ".js", ".ts", ".html", ".htm", ".php", ".ps1", ".vbs", ".svg"]);
const maxImageSize = 10 * 1024 * 1024;

const formatMimeTypes: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

const formatExtensions: Record<ImageFormat, string> = {
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp"
};

function getImageDir() {
  if (env.imageDir) return path.resolve(env.imageDir);
  return path.resolve(__dirname, "..", "..", "images");
}

function sanitizeFileName(fileName: string) {
  return (
    path
      .basename(fileName)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.\- ()]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 120) || "imagem"
  );
}

function normalizeFormat(value?: string | null): ImageFormat | null {
  const format = value?.toLowerCase();
  if (format === "jpg" || format === "jpeg") return "jpeg";
  if (format === "png") return "png";
  if (format === "webp") return "webp";
  return null;
}

function imageTypeFromFormat(format: string | undefined) {
  const normalized = normalizeFormat(format);
  return normalized ? formatMimeTypes[normalized] : "";
}

function toPublicImage(row: ImageRow) {
  return {
    id: row.id,
    project_id: row.project_id,
    conversation_id: row.conversation_id,
    original_name: row.original_name,
    file_name: row.file_name,
    file_type: row.file_type,
    file_size: row.file_size,
    width: row.width,
    height: row.height,
    url: `/api/images/${row.id}/download`,
    created_at: row.created_at
  };
}

function toPublicAnalysis(row: AnalysisRow) {
  return {
    id: row.id,
    image_id: row.image_id,
    type: row.type,
    result: parseJson(row.result_json),
    created_at: row.created_at
  };
}

function toPublicEdit(row: EditRow) {
  return {
    id: row.id,
    original_image_id: row.original_image_id,
    result_image_id: row.result_image_id,
    edit_type: row.edit_type,
    prompt: row.prompt,
    status: row.status,
    provider: row.provider,
    created_at: row.created_at
  };
}

function parseJson(value: string) {
  try {
    return JSON.parse(value || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function ensureOwnedProject(userId: string, projectId?: string | null) {
  if (!projectId) return null;
  const project = getDatabase().prepare("select id from projects where id = ? and user_id = ?").get(projectId, userId);
  if (!project) throw new Error("Projeto não encontrado para vincular a imagem.");
  return projectId;
}

function ensureOwnedConversation(userId: string, conversationId?: string | null) {
  if (!conversationId) return null;
  const conversation = getDatabase()
    .prepare("select id from conversations where id = ? and user_id = ?")
    .get(conversationId, userId);
  if (!conversation) throw new Error("Conversa não encontrada para vincular a imagem.");
  return conversationId;
}

async function inspectImage(file: UploadedImageFile) {
  const safeName = sanitizeFileName(file.originalName);
  const extension = path.extname(safeName).toLowerCase();
  if (blockedExtensions.has(extension) || !acceptedExtensions.has(extension)) {
    throw new Error("Tipo de imagem não permitido.");
  }
  if (!acceptedMimeTypes.has(file.fileType)) {
    throw new Error("Tipo de imagem não permitido.");
  }
  if (!Number.isInteger(file.fileSize) || file.fileSize <= 0 || file.fileSize > maxImageSize) {
    throw new Error("Imagem muito grande.");
  }

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(file.buffer, { failOn: "error" }).metadata();
  } catch {
    throw new Error("Arquivo de imagem inválido.");
  }

  const format = normalizeFormat(metadata.format);
  if (!format) {
    throw new Error("Formato real da imagem não permitido.");
  }

  const realMime = formatMimeTypes[format];
  if (realMime !== file.fileType && !(format === "jpeg" && file.fileType === "image/jpg")) {
    throw new Error("O conteúdo do arquivo não corresponde ao tipo informado.");
  }

  return {
    safeName,
    format,
    mime: realMime,
    extension: formatExtensions[format],
    width: metadata.width || null,
    height: metadata.height || null,
    metadata
  };
}

function insertImage(input: {
  userId: string;
  projectId?: string | null;
  conversationId?: string | null;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  storagePath: string;
  id?: string;
}) {
  const id = input.id || uuid();
  getDatabase()
    .prepare(
      `insert into images (
         id, user_id, project_id, conversation_id, original_name, file_name, file_type,
         file_size, width, height, storage_path
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.userId,
      input.projectId || null,
      input.conversationId || null,
      input.originalName,
      input.fileName,
      input.fileType,
      input.fileSize,
      input.width || null,
      input.height || null,
      input.storagePath
    );
  return getImage(input.userId, id);
}

function saveImageBuffer(fileNamePrefix: string, format: ImageFormat, buffer: Buffer) {
  const id = uuid();
  const imageDir = getImageDir();
  fs.mkdirSync(imageDir, { recursive: true });
  const extension = formatExtensions[format];
  const storagePath = path.join(imageDir, `${id}${extension}`);
  fs.writeFileSync(storagePath, buffer, { flag: "wx" });
  return {
    id,
    storagePath,
    fileName: `${sanitizeFileName(path.basename(fileNamePrefix, path.extname(fileNamePrefix)))}-${id.slice(0, 8)}${extension}`
  };
}

export async function createImageFromFile(
  userId: string,
  input: { projectId?: string | null; conversationId?: string | null; file: UploadedImageFile }
) {
  const projectId = ensureOwnedProject(userId, input.projectId);
  const conversationId = ensureOwnedConversation(userId, input.conversationId);
  const inspected = await inspectImage(input.file);
  const saved = saveImageBuffer(inspected.safeName, inspected.format, input.file.buffer);

  return insertImage({
    id: saved.id,
    userId,
    projectId,
    conversationId,
    originalName: inspected.safeName,
    fileName: saved.fileName,
    fileType: inspected.mime,
    fileSize: input.file.buffer.length,
    width: inspected.width,
    height: inspected.height,
    storagePath: saved.storagePath
  });
}

export function listImages(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, user_id, project_id, conversation_id, original_name, file_name, file_type,
              file_size, width, height, storage_path, created_at
       from images
       where user_id = ?
       order by created_at desc`
    )
    .all(userId) as ImageRow[];
  return rows.map(toPublicImage);
}

export function getImage(userId: string, imageId: string) {
  return toPublicImage(getImageRow(userId, imageId));
}

export function getImageRow(userId: string, imageId: string) {
  const row = getDatabase()
    .prepare(
      `select id, user_id, project_id, conversation_id, original_name, file_name, file_type,
              file_size, width, height, storage_path, created_at
       from images
       where id = ? and user_id = ?`
    )
    .get(imageId, userId) as ImageRow | undefined;
  if (!row || !fs.existsSync(row.storage_path)) throw new Error("Imagem não encontrada.");
  return row;
}

export function getImageForDownload(userId: string, imageId: string) {
  return getImageRow(userId, imageId);
}

export function deleteImage(userId: string, imageId: string) {
  const image = getImageRow(userId, imageId);
  const result = getDatabase().prepare("delete from images where id = ? and user_id = ?").run(imageId, userId);
  if (result.changes === 0) throw new Error("Imagem não encontrada.");
  fs.rmSync(image.storage_path, { force: true });
  return { id: imageId };
}

export function linkImageToProject(userId: string, imageId: string, projectId: string) {
  getImageRow(userId, imageId);
  const ownedProjectId = ensureOwnedProject(userId, projectId);
  getDatabase()
    .prepare("update images set project_id = ? where id = ? and user_id = ?")
    .run(ownedProjectId, imageId, userId);
  return getImage(userId, imageId);
}

export function linkImageToConversation(userId: string, imageId: string, conversationId: string) {
  getImageRow(userId, imageId);
  const ownedConversationId = ensureOwnedConversation(userId, conversationId);
  getDatabase()
    .prepare("update images set conversation_id = ? where id = ? and user_id = ?")
    .run(ownedConversationId, imageId, userId);
  return getImage(userId, imageId);
}

function insertAnalysis(userId: string, imageId: string, type: string, result: Record<string, unknown>) {
  const id = uuid();
  getDatabase()
    .prepare("insert into image_analyses (id, user_id, image_id, type, result_json) values (?, ?, ?, ?, ?)")
    .run(id, userId, imageId, type, JSON.stringify(result));
  return {
    id,
    image_id: imageId,
    type,
    result,
    created_at: new Date().toISOString()
  };
}

function classifyImage(image: ImageRow, metadata: sharp.Metadata) {
  const ratio = image.width && image.height ? image.width / image.height : 1;
  const name = image.original_name.toLowerCase();
  if (/scan|document|documento|nota|recibo|print/.test(name)) return name.includes("print") ? "print" : "documento";
  if (ratio > 1.6 || ratio < 0.68) return "arte ou banner";
  if (metadata.pages && metadata.pages > 1) return "documento";
  return "foto ou imagem geral";
}

export async function analyzeImage(userId: string, imageId: string) {
  const image = getImageRow(userId, imageId);
  const metadata = await sharp(image.storage_path).metadata();
  const result = {
    status: "completed",
    format: metadata.format || image.file_type.replace("image/", ""),
    mime: image.file_type,
    width: image.width,
    height: image.height,
    size_bytes: image.file_size,
    channels: metadata.channels || null,
    density: metadata.density || null,
    has_alpha: Boolean(metadata.hasAlpha),
    has_text_detection: "unavailable",
    likely_type: classifyImage(image, metadata),
    message: "Metadados e classificação básica extraídos pela YARA AI."
  };
  return { image: toPublicImage(image), analysis: insertAnalysis(userId, imageId, "analysis", result) };
}

export function getImageOcr(userId: string, imageId: string) {
  const image = getImageRow(userId, imageId);
  const row = getDatabase()
    .prepare(
      `select id, image_id, type, result_json, created_at
       from image_analyses
       where user_id = ? and image_id = ? and type = 'ocr'
       order by created_at desc
       limit 1`
    )
    .get(userId, imageId) as AnalysisRow | undefined;

  if (row) return { image: toPublicImage(image), ocr: toPublicAnalysis(row) };
  return runOcr(userId, imageId);
}

export function runOcr(userId: string, imageId: string) {
  const image = getImageRow(userId, imageId);
  const result = {
    status: "unavailable",
    text: "",
    confidence: null,
    provider: "none",
    message: "OCR ainda não configurado neste ambiente."
  };
  return { image: toPublicImage(image), ocr: insertAnalysis(userId, imageId, "ocr", result) };
}

export async function editImage(
  userId: string,
  input: {
    imageId: string;
    width?: number;
    height?: number;
    format?: ImageFormat;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    optimize?: boolean;
    prompt?: string;
  }
) {
  const source = getImageRow(userId, input.imageId);
  const targetFormat = input.format || normalizeFormat(source.file_type.replace("image/", "")) || "jpeg";
  if (!formatMimeTypes[targetFormat]) throw new Error("Formato de destino inválido.");

  let pipeline = sharp(source.storage_path, { failOn: "error" });
  const width = input.width ? Math.round(input.width) : undefined;
  const height = input.height ? Math.round(input.height) : undefined;
  if ((width && (width < 32 || width > 5000)) || (height && (height < 32 || height > 5000))) {
    throw new Error("Dimensões inválidas para redimensionamento.");
  }
  if (width || height) {
    pipeline = pipeline.resize({ width, height, fit: "inside", withoutEnlargement: false });
  }

  const brightness = input.brightness ?? 1;
  const saturation = input.saturation ?? 1;
  if (brightness < 0.5 || brightness > 1.8 || saturation < 0.2 || saturation > 2) {
    throw new Error("Ajustes de brilho ou saturação fora do limite permitido.");
  }
  pipeline = pipeline.modulate({ brightness, saturation });

  const contrast = input.contrast ?? 1;
  if (contrast < 0.5 || contrast > 1.8) {
    throw new Error("Ajuste de contraste fora do limite permitido.");
  }
  if (contrast !== 1) {
    pipeline = pipeline.linear(contrast, -(128 * contrast) + 128);
  }

  if (targetFormat === "jpeg") {
    pipeline = pipeline.jpeg({ quality: input.optimize ? 82 : 92, mozjpeg: true });
  } else if (targetFormat === "png") {
    pipeline = pipeline.png({ compressionLevel: input.optimize ? 9 : 6 });
  } else {
    pipeline = pipeline.webp({ quality: input.optimize ? 82 : 90 });
  }

  const buffer = await pipeline.toBuffer();
  const metadata = await sharp(buffer).metadata();
  const saved = saveImageBuffer(`${source.original_name}-editado`, targetFormat, buffer);
  const image = insertImage({
    id: saved.id,
    userId,
    projectId: source.project_id,
    conversationId: source.conversation_id,
    originalName: source.original_name,
    fileName: saved.fileName,
    fileType: formatMimeTypes[targetFormat],
    fileSize: buffer.length,
    width: metadata.width || null,
    height: metadata.height || null,
    storagePath: saved.storagePath
  });

  const editId = uuid();
  const editType = [
    width || height ? "resize" : "",
    targetFormat !== normalizeFormat(source.file_type.replace("image/", "")) ? "convert" : "",
    brightness !== 1 || contrast !== 1 || saturation !== 1 ? "adjust" : "",
    input.optimize ? "optimize" : ""
  ]
    .filter(Boolean)
    .join("+") || "copy";
  getDatabase()
    .prepare(
      `insert into image_edits (id, user_id, original_image_id, result_image_id, edit_type, prompt, status, provider)
       values (?, ?, ?, ?, ?, ?, 'completed', 'sharp')`
    )
    .run(editId, userId, source.id, saved.id, editType, input.prompt || null);

  return {
    success: true,
    status: "completed",
    edit: {
      id: editId,
      original_image_id: source.id,
      result_image_id: saved.id,
      edit_type: editType,
      prompt: input.prompt || null,
      status: "completed",
      provider: "sharp",
      created_at: new Date().toISOString()
    },
    image
  };
}

export function getImageHistory(userId: string) {
  const analyses = getDatabase()
    .prepare(
      `select id, image_id, type, result_json, created_at
       from image_analyses
       where user_id = ?
       order by created_at desc
       limit 50`
    )
    .all(userId) as AnalysisRow[];
  const edits = getDatabase()
    .prepare(
      `select id, original_image_id, result_image_id, edit_type, prompt, status, provider, created_at
       from image_edits
       where user_id = ?
       order by created_at desc
       limit 50`
    )
    .all(userId) as EditRow[];

  return {
    analyses: analyses.map(toPublicAnalysis),
    edits: edits.map(toPublicEdit),
    advanced: [
      "Remover fundo",
      "Remover objetos",
      "Aumentar resolução",
      "Restaurar rosto",
      "Detecção de objetos",
      "Edição por prompt"
    ].map((name) => ({ name, status: "preparing", message: "Recurso avançado em preparação." }))
  };
}
