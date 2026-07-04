import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import {
  analyzeDocument,
  convertDocument,
  createDocument,
  deleteDocument,
  getDocument,
  getDocumentAnalysis,
  getDocumentForDownload,
  listDocuments,
  listDocumentTemplates,
  uploadDocument
} from "../services/documentService";
import { parseMultipartUpload } from "../services/uploadService";
import { sendError } from "../utils/http";

export const documentRoutes = Router();

documentRoutes.use(authRequired);

documentRoutes.get("/documents/templates", (_req, res) => {
  return res.json({ templates: listDocumentTemplates() });
});

documentRoutes.get("/documents", (req, res) => {
  return res.json({ documents: listDocuments(req.user!.id) });
});

documentRoutes.post("/documents", async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2),
      template: z.string().min(2),
      format: z.enum(["pdf", "csv", "xlsx", "txt", "html"]).default("pdf"),
      fields: z.record(z.unknown()).optional().default({}),
      projectId: z.string().optional().nullable()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados inválidos para gerar documento.");
  }

  try {
    const document = await createDocument(req.user!.id, parsed.data);
    recordAudit({
      userId: req.user!.id,
      category: "document",
      action: "create",
      entityType: "document",
      entityId: document.id,
      message: "Documento criado.",
      metadata: { format: parsed.data.format, template: parsed.data.template },
      ...requestAuditContext(req)
    });
    return res.status(201).json({ document });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível gerar documento.");
  }
});

documentRoutes.post("/documents/upload", async (req, res) => {
  try {
    const { fields, file } = await parseMultipartUpload(req);
    const document = await uploadDocument(req.user!.id, {
      projectId: fields.projectId || null,
      file
    });
    recordAudit({
      userId: req.user!.id,
      category: "document",
      action: "upload",
      entityType: "document",
      entityId: document.id,
      message: "Documento enviado.",
      metadata: { fileName: file.originalName, type: file.fileType, size: file.fileSize },
      ...requestAuditContext(req)
    });
    return res.status(201).json({
      document
    });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível enviar o documento.");
  }
});

documentRoutes.post("/documents/analyze", (req, res) => {
  const parsed = z
    .object({
      documentId: z.string().optional(),
      uploadId: z.string().optional()
    })
    .refine((data) => data.documentId || data.uploadId)
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Informe o documento para análise.");
  }

  try {
    return res.json(analyzeDocument(req.user!.id, parsed.data));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Documento não encontrado.");
  }
});

documentRoutes.post("/documents/convert", async (req, res) => {
  const parsed = z
    .object({
      documentId: z.string().min(1),
      toFormat: z.enum(["pdf", "csv", "xlsx", "txt", "html"])
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Informe o documento e o formato de destino.");
  }

  try {
    const result = await convertDocument(req.user!.id, parsed.data);
    recordAudit({
      userId: req.user!.id,
      category: "document",
      action: "convert",
      entityType: "document",
      entityId: parsed.data.documentId,
      message: "Documento convertido.",
      metadata: { toFormat: parsed.data.toFormat },
      ...requestAuditContext(req)
    });
    return res.json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível converter documento.");
  }
});

documentRoutes.get("/documents/:id/download", (req, res) => {
  try {
    const document = getDocumentForDownload(req.user!.id, req.params.id);
    const fileName = document.file_name.replace(/["\r\n]/g, "");
    recordAudit({
      userId: req.user!.id,
      category: "document",
      action: "download",
      entityType: "document",
      entityId: req.params.id,
      message: "Documento baixado.",
      metadata: { fileName, type: document.file_type, size: document.file_size },
      ...requestAuditContext(req)
    });

    res.setHeader("Content-Type", document.file_type);
    res.setHeader("Content-Length", String(document.file_size));
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.sendFile(document.storage_path);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Documento não encontrado.");
  }
});

documentRoutes.get("/documents/:id/analysis", (req, res) => {
  try {
    return res.json(getDocumentAnalysis(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Documento não encontrado.");
  }
});

documentRoutes.get("/documents/:id", (req, res) => {
  try {
    return res.json({ document: getDocument(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Documento não encontrado.");
  }
});

documentRoutes.delete("/documents/:id", (req, res) => {
  try {
    const document = deleteDocument(req.user!.id, req.params.id);
    recordAudit({
      userId: req.user!.id,
      category: "document",
      action: "delete",
      entityType: "document",
      entityId: req.params.id,
      message: "Documento excluído.",
      ...requestAuditContext(req)
    });
    return res.json({ document });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Documento não encontrado.");
  }
});
