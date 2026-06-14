import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  createDocument,
  deleteDocument,
  getDocumentForDownload,
  listDocuments,
  listDocumentTemplates
} from "../services/documentService";
import { sendError } from "../utils/http";

export const documentRoutes = Router();

documentRoutes.use(authRequired);

documentRoutes.get("/documents/templates", (_req, res) => {
  return res.json({ templates: listDocumentTemplates() });
});

documentRoutes.get("/documents", (req, res) => {
  return res.json({ documents: listDocuments(req.user!.id) });
});

documentRoutes.post("/documents", (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(2),
      template: z.string().min(2),
      format: z.enum(["pdf", "csv"]).default("pdf"),
      fields: z.record(z.unknown()).optional().default({})
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados inválidos para gerar documento.");
  }

  try {
    return res.status(201).json({ document: createDocument(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível gerar documento.");
  }
});

documentRoutes.get("/documents/:id/download", (req, res) => {
  try {
    const document = getDocumentForDownload(req.user!.id, req.params.id);
    const fileName = document.file_name.replace(/["\r\n]/g, "");

    res.setHeader("Content-Type", document.file_type);
    res.setHeader("Content-Length", String(document.file_size));
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.sendFile(document.storage_path);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Documento não encontrado.");
  }
});

documentRoutes.delete("/documents/:id", (req, res) => {
  try {
    return res.json({ document: deleteDocument(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Documento não encontrado.");
  }
});
