import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { recordAudit, requestAuditContext } from "../services/auditService";
import {
  analyzeImage,
  createImageFromFile,
  deleteImage,
  editImage,
  getImage,
  getImageForDownload,
  getImageHistory,
  getImageOcr,
  linkImageToConversation,
  linkImageToProject,
  listImages,
  runOcr
} from "../services/imageService";
import { parseMultipartUpload } from "../services/uploadService";
import { sendError } from "../utils/http";

export const imageRoutes = Router();

imageRoutes.use(authRequired);

imageRoutes.get("/images", (req, res) => {
  return res.json({ images: listImages(req.user!.id) });
});

imageRoutes.get("/images/history", (req, res) => {
  return res.json({ history: getImageHistory(req.user!.id) });
});

imageRoutes.post("/images", async (req, res) => {
  try {
    const upload = await parseMultipartUpload(req);
    const image = await createImageFromFile(req.user!.id, {
      projectId: upload.fields.projectId || upload.fields.project_id,
      conversationId: upload.fields.conversationId || upload.fields.conversation_id,
      file: upload.file
    });
    recordAudit({
      userId: req.user!.id,
      category: "image",
      action: "upload",
      entityType: "image",
      entityId: image.id,
      message: "Imagem enviada.",
      metadata: { fileName: upload.file.originalName, type: upload.file.fileType, size: upload.file.fileSize },
      ...requestAuditContext(req)
    });
    return res.status(201).json({
      image
    });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
  }
});

imageRoutes.post("/images/upload", async (req, res) => {
  try {
    const upload = await parseMultipartUpload(req);
    const image = await createImageFromFile(req.user!.id, {
      projectId: upload.fields.projectId || upload.fields.project_id,
      conversationId: upload.fields.conversationId || upload.fields.conversation_id,
      file: upload.file
    });
    recordAudit({
      userId: req.user!.id,
      category: "image",
      action: "upload",
      entityType: "image",
      entityId: image.id,
      message: "Imagem enviada.",
      metadata: { fileName: upload.file.originalName, type: upload.file.fileType, size: upload.file.fileSize },
      ...requestAuditContext(req)
    });
    return res.status(201).json({
      image
    });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
  }
});

imageRoutes.post("/images/analyze", async (req, res) => {
  const parsed = z.object({ imageId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe a imagem para análise.");

  try {
    const result = await analyzeImage(req.user!.id, parsed.data.imageId);
    recordAudit({
      userId: req.user!.id,
      category: "image",
      action: "analyze",
      entityType: "image",
      entityId: parsed.data.imageId,
      message: "Imagem analisada.",
      ...requestAuditContext(req)
    });
    return res.json(result);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Imagem não encontrada.");
  }
});

imageRoutes.post("/images/ocr", (req, res) => {
  const parsed = z.object({ imageId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe a imagem para OCR.");

  try {
    const result = runOcr(req.user!.id, parsed.data.imageId);
    recordAudit({
      userId: req.user!.id,
      category: "image",
      action: "ocr",
      entityType: "image",
      entityId: parsed.data.imageId,
      message: "OCR de imagem solicitado.",
      ...requestAuditContext(req)
    });
    return res.json(result);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Imagem não encontrada.");
  }
});

imageRoutes.post("/images/edit", async (req, res) => {
  const parsed = z
    .object({
      imageId: z.string().min(1),
      width: z.number().int().min(32).max(5000).optional(),
      height: z.number().int().min(32).max(5000).optional(),
      format: z.enum(["jpeg", "png", "webp"]).optional(),
      brightness: z.number().min(0.5).max(1.8).optional(),
      contrast: z.number().min(0.5).max(1.8).optional(),
      saturation: z.number().min(0.2).max(2).optional(),
      optimize: z.boolean().optional(),
      prompt: z.string().max(500).optional()
    })
    .safeParse(req.body);

  if (!parsed.success) return sendError(res, 400, "Informe ajustes válidos para editar a imagem.");

  try {
    const result = await editImage(req.user!.id, parsed.data);
    recordAudit({
      userId: req.user!.id,
      category: "image",
      action: "edit",
      entityType: "image",
      entityId: parsed.data.imageId,
      message: "Imagem editada.",
      metadata: { format: parsed.data.format, width: parsed.data.width, height: parsed.data.height, optimize: parsed.data.optimize },
      ...requestAuditContext(req)
    });
    return res.json(result);
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível editar a imagem.");
  }
});

imageRoutes.get("/images/:id/ocr", (req, res) => {
  try {
    return res.json(getImageOcr(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Imagem não encontrada.");
  }
});

imageRoutes.post("/images/:id/project", (req, res) => {
  const parsed = z.object({ projectId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe o projeto para salvar a imagem.");

  try {
    return res.json({ image: linkImageToProject(req.user!.id, req.params.id, parsed.data.projectId) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível salvar a imagem no projeto.");
  }
});

imageRoutes.post("/images/:id/conversation", (req, res) => {
  const parsed = z.object({ conversationId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Informe a conversa para enviar a imagem.");

  try {
    return res.json({ image: linkImageToConversation(req.user!.id, req.params.id, parsed.data.conversationId) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível enviar a imagem para a conversa.");
  }
});

imageRoutes.get("/images/:id/download", (req, res) => {
  try {
    const image = getImageForDownload(req.user!.id, req.params.id);
    const fileName = (image.file_name || image.original_name).replace(/["\r\n]/g, "");
    recordAudit({
      userId: req.user!.id,
      category: "image",
      action: "download",
      entityType: "image",
      entityId: req.params.id,
      message: "Imagem baixada.",
      metadata: { fileName, type: image.file_type, size: image.file_size },
      ...requestAuditContext(req)
    });

    res.setHeader("Content-Type", image.file_type);
    res.setHeader("Content-Length", String(image.file_size));
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    return res.sendFile(image.storage_path);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Imagem não encontrada.");
  }
});

imageRoutes.get("/images/:id", (req, res) => {
  try {
    return res.json({ image: getImage(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Imagem não encontrada.");
  }
});

imageRoutes.delete("/images/:id", (req, res) => {
  try {
    const image = deleteImage(req.user!.id, req.params.id);
    recordAudit({
      userId: req.user!.id,
      category: "image",
      action: "delete",
      entityType: "image",
      entityId: req.params.id,
      message: "Imagem excluída.",
      ...requestAuditContext(req)
    });
    return res.json({ image });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Imagem não encontrada.");
  }
});
