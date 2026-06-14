import fs from "node:fs";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

type DocumentFormat = "pdf" | "csv";
type DocumentRow = {
  id: string;
  user_id: string;
  title: string;
  template: string;
  format: DocumentFormat;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  metadata_json: string;
  created_at: string;
};

const templates = {
  budget: {
    label: "Orçamento",
    description: "Gera um orçamento com cliente, itens, valores e observações.",
    fields: ["cliente", "itens", "total", "validade", "observacoes"]
  },
  report: {
    label: "Relatório",
    description: "Gera relatório profissional com objetivo, resumo, pontos-chave e próximos passos.",
    fields: ["titulo", "objetivo", "resumo", "pontos", "proximosPassos"]
  },
  inventory: {
    label: "Inventário",
    description: "Gera controle de inventário com itens, quantidades, localização e status.",
    fields: ["responsavel", "itens", "local", "status"]
  },
  schedule: {
    label: "Escala",
    description: "Gera escala de trabalho com equipe, período, turnos e observações.",
    fields: ["equipe", "periodo", "turnos", "observacoes"]
  },
  finance: {
    label: "Controle Financeiro",
    description: "Gera controle financeiro com receitas, despesas, saldo e recomendações.",
    fields: ["periodo", "receitas", "despesas", "saldo", "recomendacoes"]
  }
} as const;

type TemplateName = keyof typeof templates;

function getDocumentsDir() {
  if (process.env.DOCUMENTS_DIR?.trim()) {
    return path.resolve(process.env.DOCUMENTS_DIR.trim());
  }

  return path.resolve(__dirname, "..", "..", "documents");
}

function sanitizeFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "documento"
  );
}

function ensureTemplate(template: string): TemplateName {
  if (template in templates) return template as TemplateName;
  throw new Error("Template de documento inválido.");
}

function stringifyField(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "").trim();
}

function buildDocumentLines(templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  const template = templates[templateName];
  const lines = [
    "YARA AI",
    template.label,
    title,
    `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
    ""
  ];

  for (const field of template.fields) {
    const value = stringifyField(fields[field]);
    lines.push(`${field}: ${value || "-"}`);
  }

  return lines;
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function createCsvBuffer(templateName: TemplateName, title: string, fields: Record<string, unknown>) {
  const template = templates[templateName];
  const rows = [
    ["Documento", title],
    ["Template", template.label],
    ["Gerado em", new Date().toISOString()],
    [],
    ["Campo", "Valor"],
    ...template.fields.map((field) => [field, stringifyField(fields[field])])
  ];

  return Buffer.from(rows.map((row) => row.map((cell) => csvEscape(String(cell ?? ""))).join(",")).join("\n"), "utf8");
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createPdfBuffer(lines: string[]) {
  const streamLines = ["BT", "/F1 12 Tf", "50 780 Td", "16 TL"];
  lines.slice(0, 44).forEach((line, index) => {
    if (index > 0) streamLines.push("T*");
    streamLines.push(`(${pdfEscape(line)}) Tj`);
  });
  streamLines.push("ET");
  const stream = streamLines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, "binary");
}

function toPublicDocument(row: DocumentRow) {
  return {
    id: row.id,
    title: row.title,
    template: row.template,
    format: row.format,
    file_name: row.file_name,
    file_type: row.file_type,
    file_size: row.file_size,
    metadata: JSON.parse(row.metadata_json || "{}") as Record<string, unknown>,
    url: `/api/documents/${row.id}/download`,
    created_at: row.created_at
  };
}

export function listDocumentTemplates() {
  return Object.entries(templates).map(([id, template]) => ({ id, ...template }));
}

export function createDocument(
  userId: string,
  input: { title: string; template: string; format: DocumentFormat; fields?: Record<string, unknown> }
) {
  const templateName = ensureTemplate(input.template);
  const format = input.format === "csv" ? "csv" : "pdf";
  const title = input.title.trim();
  const fields = input.fields || {};
  const id = uuid();
  const fileName = `${sanitizeFileName(title)}-${id.slice(0, 8)}.${format}`;
  const fileType = format === "pdf" ? "application/pdf" : "text/csv";
  const documentDir = getDocumentsDir();
  fs.mkdirSync(documentDir, { recursive: true });
  const storagePath = path.join(documentDir, `${id}.${format}`);
  const buffer =
    format === "pdf"
      ? createPdfBuffer(buildDocumentLines(templateName, title, fields))
      : createCsvBuffer(templateName, title, fields);

  fs.writeFileSync(storagePath, buffer, { flag: "wx" });
  getDatabase()
    .prepare(
      `insert into documents (id, user_id, title, template, format, file_name, file_type, file_size, storage_path, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, title, templateName, format, fileName, fileType, buffer.length, storagePath, JSON.stringify({ fields }));

  return toPublicDocument({
    id,
    user_id: userId,
    title,
    template: templateName,
    format,
    file_name: fileName,
    file_type: fileType,
    file_size: buffer.length,
    storage_path: storagePath,
    metadata_json: JSON.stringify({ fields }),
    created_at: new Date().toISOString()
  });
}

export function listDocuments(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, user_id, title, template, format, file_name, file_type, file_size, storage_path, metadata_json, created_at
       from documents
       where user_id = ?
       order by created_at desc`
    )
    .all(userId) as DocumentRow[];

  return rows.map(toPublicDocument);
}

export function getDocumentForDownload(userId: string, documentId: string) {
  const document = getDatabase()
    .prepare(
      `select id, user_id, title, template, format, file_name, file_type, file_size, storage_path, metadata_json, created_at
       from documents
       where id = ? and user_id = ?`
    )
    .get(documentId, userId) as DocumentRow | undefined;

  if (!document || !fs.existsSync(document.storage_path)) {
    throw new Error("Documento não encontrado.");
  }

  return document;
}

export function deleteDocument(userId: string, documentId: string) {
  const document = getDocumentForDownload(userId, documentId);
  const result = getDatabase()
    .prepare("delete from documents where id = ? and user_id = ?")
    .run(documentId, userId);

  if (result.changes === 0) {
    throw new Error("Documento não encontrado.");
  }

  fs.rmSync(document.storage_path, { force: true });
  return { id: documentId };
}
