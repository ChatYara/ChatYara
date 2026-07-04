import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { generateExportFile } from "../services/exportService";
import {
  deleteFile,
  getFileForDownload,
  getFilePreview,
  listFiles,
  uploadFile
} from "../services/fileService";
import { parseMultipartUpload } from "../services/uploadService";
import { sendError } from "../utils/http";

export const fileRoutes = Router();

fileRoutes.use(authRequired);

fileRoutes.get("/files", (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  return res.json({ files: listFiles(req.user!.id, { query, type, category }) });
});

fileRoutes.post("/files/upload", async (req, res) => {
  try {
    const { fields, file } = await parseMultipartUpload(req);
    return res.status(201).json({
      file: uploadFile(req.user!.id, {
        originalName: file.originalName,
        fileType: file.fileType,
        buffer: file.buffer,
        conversationId: fields.conversationId || fields.conversation_id || null
      })
    });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível enviar este arquivo.");
  }
});

fileRoutes.get("/files/:id", (req, res) => {
  try {
    return res.json(getFilePreview(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Arquivo não encontrado.");
  }
});

fileRoutes.get("/files/:id/download", (req, res) => {
  try {
    const file = getFileForDownload(req.user!.id, req.params.id);
    const fileName = file.name.replace(/["\r\n]/g, "");
    const inline = req.query.inline === "1" || file.type.startsWith("image/") || file.type === "application/pdf";

    res.setHeader("Content-Type", file.type);
    res.setHeader("Content-Length", String(file.size));
    res.setHeader("Content-Disposition", `${inline ? "inline" : "attachment"}; filename="${fileName}"`);
    return res.sendFile(file.path);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Arquivo não encontrado.");
  }
});

fileRoutes.delete("/files/:id", (req, res) => {
  try {
    return res.json({ file: deleteFile(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Arquivo não encontrado.");
  }
});

const exportSchema = z.object({
  title: z.string().min(2).optional(),
  content: z.string().min(1),
  conversationId: z.string().optional().nullable()
});

function exportHandler(format: "pdf" | "docx" | "xlsx" | "txt") {
  return async (req: Request, res: Response) => {
    const parsed = exportSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, "Informe título e conteúdo para exportar.");
    }

    try {
      return res.status(201).json({
        file: await generateExportFile(req.user!.id, {
          format,
          title: parsed.data.title,
          content: parsed.data.content,
          conversationId: parsed.data.conversationId || null
        })
      });
    } catch (error) {
      return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível exportar arquivo.");
    }
  };
}

fileRoutes.post("/export/pdf", exportHandler("pdf"));
fileRoutes.post("/export/docx", exportHandler("docx"));
fileRoutes.post("/export/xlsx", exportHandler("xlsx"));
fileRoutes.post("/export/txt", exportHandler("txt"));
