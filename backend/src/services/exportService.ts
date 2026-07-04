import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { saveFileBuffer, sanitizeFileName, updateFileMessage } from "./fileService";

type ExportFormat = "pdf" | "docx" | "xlsx" | "txt";

const mimeTypes: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain"
};

const extensions: Record<ExportFormat, string> = {
  pdf: ".pdf",
  docx: ".docx",
  xlsx: ".xlsx",
  txt: ".txt"
};

function titleOrDefault(title: string | undefined, format: ExportFormat) {
  const fallback = format === "xlsx" ? "planilha" : format === "docx" ? "documento" : "relatorio";
  return (title || fallback).replace(/\s+/g, " ").trim().slice(0, 100) || fallback;
}

function ensureExtension(name: string, format: ExportFormat) {
  const clean = sanitizeFileName(name);
  return clean.toLowerCase().endsWith(extensions[format]) ? clean : `${clean}${extensions[format]}`;
}

function normalizeContent(content?: string) {
  const clean = String(content || "").replace(/\r\n/g, "\n").trim();
  if (clean.length < 1) {
    throw new Error("Informe o conteúdo para exportar.");
  }
  return clean;
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createPdfBuffer(title: string, content: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true, info: { Title: title, Author: "YARA AI" } });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fillColor("#0A84FF").fontSize(12).text("YARA AI", { continued: true });
    doc.fillColor("#94A3B8").text(` · ${new Date().toLocaleDateString("pt-BR")}`);
    doc.moveDown(0.8);
    doc.fillColor("#0F172A").fontSize(22).text(title, { lineGap: 3 });
    doc.moveDown();
    doc.fillColor("#111827").fontSize(11).text(content, { lineGap: 4, align: "left" });

    const range = doc.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      doc.switchToPage(index);
      doc.fillColor("#94A3B8").fontSize(9).text(`YARA AI · Página ${index + 1} de ${range.count}`, 48, 790, {
        align: "center",
        width: 499
      });
    }

    doc.end();
  });
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { time, date: dosDate };
}

function zipStore(entries: Array<{ name: string; data: Buffer }>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const stamp = dosDateTime();

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = entry.data;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(stamp.time, 10);
    local.writeUInt16LE(stamp.date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(stamp.time, 12);
    central.writeUInt16LE(stamp.date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, central, end]);
}

function createDocxBuffer(title: string, content: string) {
  const paragraphs = [title, "", ...content.split(/\n{1,2}/)].map((paragraph) => {
    const text = xmlEscape(paragraph.trim() || " ");
    return `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
  });
  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;

  return zipStore([
    {
      name: "[Content_Types].xml",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
        "utf8"
      )
    },
    {
      name: "_rels/.rels",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
        "utf8"
      )
    },
    { name: "word/document.xml", data: Buffer.from(documentXml, "utf8") }
  ]);
}

async function createXlsxBuffer(title: string, content: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "YARA AI";
  const sheet = workbook.addWorksheet("YARA");
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.columns = [
    { header: "Item", key: "item", width: 12 },
    { header: "Conteúdo", key: "content", width: 80 }
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A84FF" } };
  content.split(/\r?\n/).filter(Boolean).forEach((line, index) => {
    sheet.addRow({ item: index + 1, content: line.trim() });
  });
  sheet.autoFilter = "A1:B1";
  sheet.addRow({});
  sheet.addRow({ item: "Título", content: title });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateExportFile(
  userId: string,
  input: {
    format: ExportFormat;
    title?: string;
    content?: string;
    conversationId?: string | null;
    messageId?: string | null;
  }
) {
  const title = titleOrDefault(input.title, input.format);
  const content = normalizeContent(input.content);
  const name = ensureExtension(title, input.format);
  const buffer =
    input.format === "pdf"
      ? await createPdfBuffer(title, content)
      : input.format === "docx"
        ? createDocxBuffer(title, content)
        : input.format === "xlsx"
          ? await createXlsxBuffer(title, content)
          : Buffer.from(content, "utf8");

  return saveFileBuffer(userId, {
    name,
    mimeType: mimeTypes[input.format],
    buffer,
    category: "generated",
    conversationId: input.conversationId || null,
    messageId: input.messageId || null
  });
}

export function attachExportToMessage(userId: string, fileId: string, messageId: string) {
  return updateFileMessage(userId, fileId, messageId);
}

export function detectExportRequest(message: string): ExportFormat | null {
  const normalized = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/\b(pdf)\b/.test(normalized) && /\b(coloque|gere|gerar|exporte|exportar|transforme|converter|salve)\b/.test(normalized)) return "pdf";
  if (/\b(word|docx|documento)\b/.test(normalized) && /\b(gere|gerar|exporte|exportar|transforme|converter|salve)\b/.test(normalized)) return "docx";
  if (/\b(excel|xlsx|planilha)\b/.test(normalized) && /\b(gere|gerar|exporte|exportar|transforme|converter|salve)\b/.test(normalized)) return "xlsx";
  if (/\b(txt|texto)\b/.test(normalized) && /\b(gere|gerar|exporte|exportar|transforme|converter|salve)\b/.test(normalized)) return "txt";
  return null;
}

export function extractExportContent(message: string, fallback = "") {
  const explicit = /(?:conte[uú]do|texto|relat[oó]rio|dados|arquivo)\s*[:\-]\s*([\s\S]+)/i.exec(message);
  if (explicit?.[1]?.trim()) return explicit[1].trim();
  const afterColon = /:\s*([\s\S]+)/.exec(message);
  if (afterColon?.[1]?.trim()) return afterColon[1].trim();
  return fallback.trim();
}
