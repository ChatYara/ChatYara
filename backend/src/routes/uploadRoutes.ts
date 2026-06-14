import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { createUpload, deleteUpload, listUploads } from "../services/uploadService";
import { sendError } from "../utils/http";

export const uploadRoutes = Router();

uploadRoutes.use(authRequired);

uploadRoutes.get("/uploads", (req, res) => {
  return res.json({ uploads: listUploads(req.user!.id) });
});

uploadRoutes.post("/uploads", (req, res) => {
  const parsed = z
    .object({
      conversationId: z.string().optional().nullable(),
      fileName: z.string().min(1),
      fileType: z.string().min(3),
      fileSize: z.number().int().positive()
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Dados do arquivo inválidos.");
  }

  try {
    return res.status(201).json({ upload: createUpload(req.user!.id, parsed.data) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível preparar o upload.");
  }
});

uploadRoutes.delete("/uploads/:id", (req, res) => {
  try {
    return res.json({ upload: deleteUpload(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Arquivo não encontrado.");
  }
});
