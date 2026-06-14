import { Router } from "express";
import { authRequired } from "../middleware/auth";
import {
  createUploadFromFile,
  deleteUpload,
  getUploadForDownload,
  listUploads,
  parseMultipartUpload
} from "../services/uploadService";
import { sendError } from "../utils/http";

export const uploadRoutes = Router();

uploadRoutes.use(authRequired);

uploadRoutes.get("/uploads", (req, res) => {
  return res.json({ uploads: listUploads(req.user!.id) });
});

uploadRoutes.post("/uploads", async (req, res) => {
  try {
    const upload = await parseMultipartUpload(req);
    return res.status(201).json({
      upload: createUploadFromFile(req.user!.id, {
        conversationId: upload.fields.conversationId || upload.fields.conversation_id,
        file: upload.file
      })
    });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível enviar este arquivo.");
  }
});

uploadRoutes.get("/uploads/:id/download", (req, res) => {
  try {
    const upload = getUploadForDownload(req.user!.id, req.params.id);
    const originalName = (upload.original_name || upload.file_name).replace(/["\r\n]/g, "");
    const disposition = upload.file_type.startsWith("image/") ? "inline" : "attachment";

    res.setHeader("Content-Type", upload.file_type);
    res.setHeader("Content-Length", String(upload.file_size));
    res.setHeader("Content-Disposition", `${disposition}; filename="${originalName}"`);
    return res.sendFile(upload.storage_path);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Arquivo não encontrado.");
  }
});

uploadRoutes.delete("/uploads/:id", (req, res) => {
  try {
    return res.json({ upload: deleteUpload(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Arquivo não encontrado.");
  }
});
