import fs from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

type DocumentFormat = "pdf" | "csv" | "xlsx" | "txt" | "html";
type DocumentStatus = "ready" | "analyzed" | "failed";
type DocumentKind = "generated" | "uploaded" | "converted" | "analysis";

type DocumentRow = {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  type?: DocumentKind;
  template: string;
  status?: DocumentStatus;
  format: DocumentFormat;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  original_file_id?: string | null;
  metadata_json: string;
  created_at: string;
  updated_at?: string;
};

type UploadedDocumentFile = {
  buffer: Buffer;
  originalName: string;
  fileType: string;
  fileSize: number;
};

const documentFormats: Record<DocumentFormat, { mime: string; extension: string }> = {
  pdf: { mime: "application/pdf", extension: ".pdf" },
  csv: { mime: "text/csv", extension: ".csv" },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: ".xlsx" },
  txt: { mime: "text/plain; charset=utf-8", extension: ".txt" },
  html: { mime: "text/html; charset=utf-8", extension: ".html" }
};

const templates = {
  technical_report: {
    label: "Relatório técnico",
    description: "Relatório com contexto, análise técnica, riscos, recomendações e próximos passos.",
    fields: ["objetivo", "contexto", "analise", "riscos", "recomendacoes", "proximosPassos"]
  },
  executive_report: {
    label: "Relatório executivo",
    description: "Resumo executivo com indicadores, decisões e plano de ação.",
    fields: ["resumo", "indicadores", "decisoes", "impacto", "planoDeAcao"]
  },
  budget: {
    label: "Orçamento",
    description: "Orçamento com cliente, itens, valores, validade e observações.",
    fields: ["cliente", "itens", "total", "validade", "observacoes"]
  },
  employee_schedule: {
    label: "Escala de funcionários",
    description: "Escala profissional com equipe, período, turnos e responsáveis.",
    fields: ["equipe", "periodo", "turnos", "responsavel", "observacoes"]
  },
  finance_control: {
    label: "Controle financeiro",
    description: "Controle com receitas, despesas, saldo, totais e recomendações.",
    fields: ["periodo", "receitas", "despesas", "saldo", "recomendacoes"]
  },
  inventory: {
    label: "Inventário",
    description: "Inventário com itens, quantidades, localização e status.",
    fields: ["responsavel", "itens", "local", "status"]
  },
  work_order: {
    label: "Ordem de serviço",
    description: "Ordem de serviço com cliente, escopo, prazos, materiais e assinatura.",
    fields: ["cliente", "servico", "prazo", "materiais", "responsavel", "observacoes"]
  },
  timeline: {
    label: "Cronograma",
    description: "Cronograma com etapas, datas, responsáveis e status.",
    fields: ["projeto", "etapas", "inicio", "fim", "responsaveis"]
  },
  meeting_minutes: {
    label: "Ata de reunião",
    description: "Ata com participantes, pauta, decisões, pendências e responsáveis.",
    fields: ["participantes", "pauta", "decisoes", "pendencias", "proximaReuniao"]
  },
  checklist: {
    label: "Checklist",
    description: "Checklist operacional com etapas, critérios e responsáveis.",
    fields: ["objetivo", "itens", "criterios", "responsavel", "prazo"]
  }
} as const;

type TemplateName = keyof typeof templates;

const uploadExtensions = new Set([".pdf", ".txt", ".csv", ".xlsx", ".docx"]);
const uploadMimeTypes = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
const blockedExtensions = new Set([".exe", ".bat", ".cmd", ".sh", ".js", ".ts", ".php", ".ps1", ".vbs", ".msi", ".apk"]);
const maxDocumentSize = 10 * 1024 * 1024;

function getDocumentsDir() {
  if (process.env.DOCUMENTS_DIR?.trim()) {
    return path.resolve(process.env.DOCUMENTS_DIR.trim());
  }

  return path.resolve(__dirname, "..", "..", "documents");
}

function sanitizeFileName(value: string) {
  return (
    path
      .basename(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.\- ()]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 120) || "documento"
  );
}

function sanitizeTitle(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length < 2) throw new Error("Informe um título válido.");
  return clean.slice(0, 160);
}

function ensureTemplate(template: string): TemplateName {
  if (template in templates) return template as TemplateName;
  throw new Error("Template de documento inválido.");
}

function ensureFormat(format: string): DocumentFormat {
  if (format in documentFormats) return format as DocumentFormat;
  throw new Error("Formato de documento inválido.");
}

function parseMetadata(row: Pick<DocumentRow, "metadata_json">) {
  try {
    return JSON.parse(row.metadata_json || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function stringifyField(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "").trim();
}

function fieldEntries(templateName: TemplateName, fields: Record<string, unknown>) {
  return templates[templateName].fields.map((field) => ({
    field,
    label: field.replace(/([A-Z])/g, " $1").replace(/^./, (item) => item.toUpperCase()),
    value: stringifyField(fields[field]) || "-"
  }));
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(text: string) {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(parseCsvLine);
}

function createCsvBuffer(templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  const rows = [
    ["Documento", title],
    ["Template", templates[templateName].label],
    ["Gerado em", new Date().toLocaleString("pt-BR")],
    [],
    ["Campo", "Valor"],
    ...fieldEntries(templateName, fields).map((item) => [item.label, item.value])
  ];

  return Buffer.from(rows.map((row) => row.map((cell) => csvEscape(String(cell ?? ""))).join(",")).join("\n"), "utf8");
}

function createTxtBuffer(templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  const lines = [
    "YARA AI",
    templates[templateName].label,
    title,
    `Gerado em ${new Date().toLocaleString("pt-BR")}`,
    "",
    ...fieldEntries(templateName, fields).flatMap((item) => [`${item.label}:`, item.value, ""])
  ];
  return Buffer.from(lines.join("\n"), "utf8");
}

function createHtmlBuffer(templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  const rows = fieldEntries(templateName, fields)
    .map((item) => `<tr><th>${escapeHtml(item.label)}</th><td>${escapeHtml(item.value)}</td></tr>`)
    .join("");
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 40px; color: #0f172a; }
    header { border-bottom: 3px solid #0A84FF; margin-bottom: 24px; padding-bottom: 16px; }
    h1 { margin: 0; color: #0A84FF; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #dbeafe; padding: 12px; text-align: left; vertical-align: top; }
    th { width: 240px; background: #eff6ff; }
    footer { margin-top: 32px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <header><strong>YARA AI</strong><h1>${escapeHtml(title)}</h1><p>${escapeHtml(templates[templateName].label)} · ${new Date().toLocaleDateString("pt-BR")}</p></header>
  <table>${rows}</table>
  <footer>Documento gerado pela YARA AI.</footer>
</body>
</html>`;
  return Buffer.from(html, "utf8");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function createXlsxBuffer(templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "YARA AI";
  workbook.created = new Date();
  workbook.modified = new Date();

  const summary = workbook.addWorksheet("Resumo");
  summary.views = [{ state: "frozen", ySplit: 1 }];
  summary.columns = [
    { header: "Campo", key: "field", width: 28 },
    { header: "Valor", key: "value", width: 70 }
  ];
  summary.addRow({ field: "Documento", value: title });
  summary.addRow({ field: "Template", value: templates[templateName].label });
  summary.addRow({ field: "Gerado em", value: new Date() });
  for (const item of fieldEntries(templateName, fields)) {
    summary.addRow({ field: item.label, value: item.value });
  }
  styleWorksheet(summary);

  const data = workbook.addWorksheet("Dados");
  data.views = [{ state: "frozen", ySplit: 1 }];
  data.autoFilter = "A1:D1";
  data.columns = [
    { header: "Item", key: "item", width: 30 },
    { header: "Quantidade", key: "quantity", width: 14 },
    { header: "Valor unitário", key: "unit", width: 16 },
    { header: "Total", key: "total", width: 16 }
  ];

  const items = normalizeItems(fields.itens || fields.items || fields.despesas || fields.receitas);
  items.forEach((item, index) => {
    const rowNumber = index + 2;
    data.addRow({
      item: item.name,
      quantity: item.quantity,
      unit: item.value,
      total: { formula: `B${rowNumber}*C${rowNumber}`, result: item.quantity * item.value }
    });
  });
  if (!items.length) {
    data.addRow({ item: "Exemplo", quantity: 1, unit: 0, total: { formula: "B2*C2", result: 0 } });
  }
  const totalRow = data.addRow({ item: "Total geral", quantity: "", unit: "", total: { formula: `SUM(D2:D${data.rowCount})` } });
  totalRow.font = { bold: true };
  data.getColumn("C").numFmt = '"R$" #,##0.00';
  data.getColumn("D").numFmt = '"R$" #,##0.00';
  styleWorksheet(data);

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function styleWorksheet(sheet: ExcelJS.Worksheet) {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A84FF" } };
  header.alignment = { vertical: "middle", horizontal: "center" };
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD7E3F5" } },
        left: { style: "thin", color: { argb: "FFD7E3F5" } },
        bottom: { style: "thin", color: { argb: "FFD7E3F5" } },
        right: { style: "thin", color: { argb: "FFD7E3F5" } }
      };
      cell.alignment = { vertical: "top", wrapText: true };
    });
  });
}

function normalizeItems(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item, index) => normalizeItem(item, index));
  }
  const text = stringifyField(value);
  if (!text) return [];
  return text.split(/[,;\n]/).filter(Boolean).map((item, index) => normalizeItem(item.trim(), index));
}

function normalizeItem(value: unknown, index: number) {
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return {
      name: stringifyField(item.nome || item.name || item.item || `Item ${index + 1}`),
      quantity: Number(item.quantidade || item.quantity || item.qtd || 1) || 1,
      value: Number(item.valor || item.value || item.preco || item.price || 0) || 0
    };
  }
  return { name: String(value || `Item ${index + 1}`), quantity: 1, value: 0 };
}

async function createPdfBuffer(templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true, info: { Title: title, Author: "YARA AI" } });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fillColor("#0A84FF").fontSize(12).text("YARA AI", { continued: true });
  doc.fillColor("#64748b").text(`  |  ${new Date().toLocaleDateString("pt-BR")}`, { align: "right" });
  doc.moveDown(0.8);
  doc.fillColor("#0f172a").fontSize(24).text(title);
  doc.fillColor("#475569").fontSize(13).text(templates[templateName].label);
  doc.moveDown();
  doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor("#0A84FF").lineWidth(2).stroke();
  doc.moveDown();

  for (const item of fieldEntries(templateName, fields)) {
    doc.fillColor("#0A84FF").fontSize(11).text(item.label.toUpperCase());
    doc.fillColor("#0f172a").fontSize(12).text(item.value, { width: 490, lineGap: 3 });
    doc.moveDown(0.75);
    if (doc.y > 720) doc.addPage();
  }

  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    doc.fillColor("#94a3b8").fontSize(9).text(`YARA AI · Página ${index + 1} de ${range.count}`, 48, 790, { align: "center", width: 499 });
  }

  doc.end();
  return done;
}

async function buildDocumentBuffer(format: DocumentFormat, templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  if (format === "pdf") return createPdfBuffer(templateName, title, fields);
  if (format === "xlsx") return createXlsxBuffer(templateName, title, fields);
  if (format === "txt") return createTxtBuffer(templateName, title, fields);
  if (format === "html") return createHtmlBuffer(templateName, title, fields);
  return createCsvBuffer(templateName, title, fields);
}

function toPublicDocument(row: DocumentRow) {
  return {
    id: row.id,
    project_id: row.project_id || null,
    title: row.title,
    type: row.type || "generated",
    template: row.template,
    status: row.status || "ready",
    format: row.format,
    file_name: row.file_name,
    file_type: row.file_type,
    file_size: row.file_size,
    metadata: parseMetadata(row),
    url: `/api/documents/${row.id}/download`,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at
  };
}

function insertDocument(input: {
  userId: string;
  projectId?: string | null;
  title: string;
  type: DocumentKind;
  template: string;
  status?: DocumentStatus;
  format: DocumentFormat;
  fileName: string;
  fileType: string;
  storagePath: string;
  buffer: Buffer;
  originalFileId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const documentId = typeof input.metadata?.id === "string" ? input.metadata.id : uuid();
  getDatabase()
    .prepare(
      `insert into documents (
         id, user_id, project_id, title, type, template, status, format, file_name,
         file_type, file_size, storage_path, original_file_id, metadata_json, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(
      documentId,
      input.userId,
      input.projectId || null,
      input.title,
      input.type,
      input.template,
      input.status || "ready",
      input.format,
      input.fileName,
      input.fileType,
      input.buffer.length,
      input.storagePath,
      input.originalFileId || null,
      JSON.stringify(input.metadata || {})
    );
}

function saveDocumentFile(format: DocumentFormat, title: string, buffer: Buffer) {
  const id = uuid();
  const documentDir = getDocumentsDir();
  fs.mkdirSync(documentDir, { recursive: true });
  const extension = documentFormats[format].extension;
  const fileName = `${sanitizeFileName(title)}-${id.slice(0, 8)}${extension}`;
  const storagePath = path.join(documentDir, `${id}${extension}`);
  fs.writeFileSync(storagePath, buffer, { flag: "wx" });
  return { id, fileName, storagePath };
}

export function listDocumentTemplates() {
  return Object.entries(templates).map(([id, template]) => ({ id, ...template }));
}

export async function createDocument(
  userId: string,
  input: { title: string; template: string; format: DocumentFormat; fields?: Record<string, unknown>; projectId?: string | null }
) {
  const templateName = ensureTemplate(input.template);
  const format = ensureFormat(input.format || "pdf");
  const title = sanitizeTitle(input.title);
  const fields = input.fields || {};
  const buffer = await buildDocumentBuffer(format, templateName, title, fields);
  const saved = saveDocumentFile(format, title, buffer);
  const metadata = { id: saved.id, fields, generatedBy: "YARA AI", template: templateName };

  insertDocument({
    userId,
    projectId: input.projectId,
    title,
    type: "generated",
    template: templateName,
    format,
    fileName: saved.fileName,
    fileType: documentFormats[format].mime,
    storagePath: saved.storagePath,
    buffer,
    metadata
  });

  return getDocument(userId, saved.id);
}

export function listDocuments(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, user_id, project_id, title, type, template, status, format, file_name, file_type, file_size,
              storage_path, original_file_id, metadata_json, created_at, updated_at
       from documents
       where user_id = ?
       order by created_at desc`
    )
    .all(userId) as DocumentRow[];

  return rows.map(toPublicDocument);
}

export function getDocument(userId: string, documentId: string) {
  const row = getDocumentRow(userId, documentId);
  return toPublicDocument(row);
}

function getDocumentRow(userId: string, documentId: string) {
  const row = getDatabase()
    .prepare(
      `select id, user_id, project_id, title, type, template, status, format, file_name, file_type, file_size,
              storage_path, original_file_id, metadata_json, created_at, updated_at
       from documents
       where id = ? and user_id = ?`
    )
    .get(documentId, userId) as DocumentRow | undefined;

  if (!row || !fs.existsSync(row.storage_path)) {
    throw new Error("Documento não encontrado.");
  }

  return row;
}

export function getDocumentForDownload(userId: string, documentId: string) {
  return getDocumentRow(userId, documentId);
}

export function deleteDocument(userId: string, documentId: string) {
  const document = getDocumentRow(userId, documentId);
  const result = getDatabase()
    .prepare("delete from documents where id = ? and user_id = ?")
    .run(documentId, userId);

  if (result.changes === 0) {
    throw new Error("Documento não encontrado.");
  }

  fs.rmSync(document.storage_path, { force: true });
  return { id: documentId };
}

export async function uploadDocument(
  userId: string,
  input: { projectId?: string | null; file: UploadedDocumentFile }
) {
  const safeName = sanitizeFileName(input.file.originalName);
  const extension = path.extname(safeName).toLowerCase();
  if (blockedExtensions.has(extension) || !uploadExtensions.has(extension) || !uploadMimeTypes.has(input.file.fileType)) {
    throw new Error("Tipo de arquivo não permitido para documentos.");
  }
  if (input.file.fileSize <= 0 || input.file.fileSize > maxDocumentSize) {
    throw new Error("Arquivo muito grande.");
  }

  const format = extension.replace(".", "") as DocumentFormat | "docx";
  const documentFormat = format === "docx" ? "txt" : format;
  const id = uuid();
  const documentDir = getDocumentsDir();
  fs.mkdirSync(documentDir, { recursive: true });
  const storagePath = path.join(documentDir, `${id}${extension}`);
  fs.writeFileSync(storagePath, input.file.buffer, { flag: "wx" });

  const metadata = {
    id,
    originalName: safeName,
    uploaded: true,
    analysis: analyzeBuffer(safeName, input.file.fileType, input.file.buffer)
  };

  insertDocument({
    userId,
    projectId: input.projectId,
    title: path.basename(safeName, extension),
    type: "uploaded",
    template: "uploaded_file",
    status: "analyzed",
    format: documentFormat,
    fileName: safeName,
    fileType: input.file.fileType,
    storagePath,
    buffer: input.file.buffer,
    metadata
  });

  return getDocument(userId, id);
}

export function getDocumentAnalysis(userId: string, documentId: string) {
  const document = getDocumentRow(userId, documentId);
  const metadata = parseMetadata(document);
  const analysis = metadata.analysis || analyzeStoredDocument(document);
  return {
    document: toPublicDocument(document),
    analysis
  };
}

export function analyzeDocument(userId: string, input: { documentId?: string; uploadId?: string }) {
  if (input.documentId) return getDocumentAnalysis(userId, input.documentId);
  if (input.uploadId) {
    const upload = getDatabase()
      .prepare("select original_name, file_name, file_type, file_size, storage_path from uploads where id = ? and user_id = ?")
      .get(input.uploadId, userId) as { original_name: string | null; file_name: string; file_type: string; file_size: number; storage_path: string } | undefined;
    if (!upload || !fs.existsSync(upload.storage_path)) throw new Error("Arquivo não encontrado.");
    return { analysis: analyzeBuffer(upload.original_name || upload.file_name, upload.file_type, fs.readFileSync(upload.storage_path)) };
  }
  throw new Error("Informe um documento ou arquivo para análise.");
}

function analyzeStoredDocument(document: DocumentRow) {
  return analyzeBuffer(document.file_name, document.file_type, fs.readFileSync(document.storage_path));
}

function analyzeBuffer(fileName: string, fileType: string, buffer: Buffer) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".txt" || fileType.startsWith("text/plain")) {
    const text = buffer.toString("utf8");
    return {
      status: "completed",
      kind: "text",
      summary: text.slice(0, 900),
      characters: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0
    };
  }
  if (extension === ".csv" || fileType === "text/csv") {
    const rows = parseCsv(buffer.toString("utf8"));
    return {
      status: "completed",
      kind: "csv",
      rows: rows.length,
      columns: rows[0]?.length || 0,
      headers: rows[0] || [],
      preview: rows.slice(0, 6)
    };
  }
  if (extension === ".xlsx") {
    return {
      status: "completed",
      kind: "xlsx",
      message: "Planilha XLSX recebida. A leitura detalhada é feita na rota de conversão/análise avançada.",
      bytes: buffer.length
    };
  }
  if (extension === ".pdf" || fileType === "application/pdf") {
    const text = buffer.toString("latin1");
    const version = /%PDF-([0-9.]+)/.exec(text)?.[1] || "desconhecida";
    const pages = Math.max(1, (text.match(/\/Type\s*\/Page\b/g) || []).length);
    return {
      status: "metadata_only",
      kind: "pdf",
      message: "Metadados extraídos. Leitura textual avançada de PDF será ativada em etapa futura.",
      version,
      pages,
      bytes: buffer.length
    };
  }
  if (extension === ".docx") {
    return {
      status: "structure_ready",
      kind: "docx",
      message: "DOCX recebido. Extração avançada de conteúdo será ativada em etapa futura.",
      bytes: buffer.length
    };
  }
  return { status: "unsupported", message: "Tipo de documento ainda não disponível para análise." };
}

export async function convertDocument(userId: string, input: { documentId: string; toFormat: DocumentFormat }) {
  const source = getDocumentRow(userId, input.documentId);
  const toFormat = ensureFormat(input.toFormat);
  const fromFormat = source.format;

  if (fromFormat === "csv" && toFormat === "xlsx") {
    const rows = parseCsv(fs.readFileSync(source.storage_path, "utf8"));
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Dados");
    rows.forEach((row) => sheet.addRow(row));
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = rows.length ? `A1:${String.fromCharCode(64 + Math.max(1, rows[0].length))}1` : undefined;
    styleWorksheet(sheet);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return saveConversion(userId, source, toFormat, buffer, "converted");
  }

  if (fromFormat === "xlsx" && toFormat === "csv") {
    const workbook = new ExcelJS.Workbook();
    const fileBuffer = fs.readFileSync(source.storage_path);
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
    await workbook.xlsx.load(arrayBuffer);
    const sheet = workbook.worksheets[0];
    const rows: string[] = [];
    sheet.eachRow((row) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      rows.push(values.map((value) => csvEscape(String(value ?? ""))).join(","));
    });
    return saveConversion(userId, source, toFormat, Buffer.from(rows.join("\n"), "utf8"), "converted");
  }

  if (fromFormat === "txt" && toFormat === "pdf") {
    const text = fs.readFileSync(source.storage_path, "utf8");
    const buffer = await createPdfBuffer("technical_report", source.title, { resumo: text, objetivo: "Conversão TXT para PDF" });
    return saveConversion(userId, source, toFormat, buffer, "converted");
  }

  if (fromFormat === "html" && toFormat === "pdf") {
    const html = fs.readFileSync(source.storage_path, "utf8");
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    const buffer = await createPdfBuffer("technical_report", source.title, { resumo: text, objetivo: "Conversão HTML para PDF" });
    return saveConversion(userId, source, toFormat, buffer, "converted");
  }

  const id = uuid();
  getDatabase()
    .prepare(
      `insert into document_conversions (id, user_id, source_document_id, from_type, to_type, status)
       values (?, ?, ?, ?, ?, 'unavailable')`
    )
    .run(id, userId, source.id, fromFormat, toFormat);
  return {
    success: false,
    status: "unavailable",
    message: "Conversão ainda não disponível.",
    from: fromFormat,
    to: toFormat
  };
}

function saveConversion(userId: string, source: DocumentRow, toFormat: DocumentFormat, buffer: Buffer, type: DocumentKind) {
  const saved = saveDocumentFile(toFormat, `${source.title}-convertido`, buffer);
  insertDocument({
    userId,
    title: `${source.title} convertido`,
    type,
    template: source.template,
    format: toFormat,
    fileName: saved.fileName,
    fileType: documentFormats[toFormat].mime,
    storagePath: saved.storagePath,
    buffer,
    originalFileId: source.id,
    metadata: { id: saved.id, sourceDocumentId: source.id, convertedFrom: source.format, convertedTo: toFormat }
  });
  const conversionId = uuid();
  getDatabase()
    .prepare(
      `insert into document_conversions (id, user_id, source_document_id, result_document_id, from_type, to_type, status)
       values (?, ?, ?, ?, ?, ?, 'completed')`
    )
    .run(conversionId, userId, source.id, saved.id, source.format, toFormat);
  return {
    success: true,
    status: "completed",
    conversionId,
    document: getDocument(userId, saved.id)
  };
}

export function buildDocumentContextFromUploads(uploads: Array<{ original_name: string | null; file_name: string; file_type: string; file_size: number; storage_path: string }>) {
  return uploads
    .filter((upload) => /\.(txt|csv|xlsx|pdf|docx)$/i.test(upload.original_name || upload.file_name))
    .map((upload) => {
      if (!fs.existsSync(upload.storage_path)) return "";
      const analysis = analyzeBuffer(upload.original_name || upload.file_name, upload.file_type, fs.readFileSync(upload.storage_path));
      return `Documento anexado: ${upload.original_name || upload.file_name}\nAnálise: ${JSON.stringify(analysis).slice(0, 1800)}`;
    })
    .filter(Boolean)
    .join("\n\n");
}
