import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  addConversationToProject,
  archiveConversation,
  createConversation,
  deleteConversation,
  getConversation,
  getMessages,
  listConversationFiles,
  listConversations,
  moveConversationToTop,
  pinConversation,
  renameConversation,
  sendMessage
} from "../services/chatService";
import { sendError } from "../utils/http";

export const chatRoutes = Router();

chatRoutes.use(authRequired);

chatRoutes.get("/conversations", (req, res) => {
  return res.json({ conversations: listConversations(req.user!.id) });
});

chatRoutes.post("/conversations", (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title : "Nova conversa";
  return res.status(201).json({ conversation: createConversation(req.user!.id, title) });
});

chatRoutes.get("/conversations/:id", (req, res) => {
  try {
    return res.json(getConversation(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.patch("/conversations/:id", (req, res) => {
  const parsed = z.object({ title: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Informe um nome para a conversa.");
  }

  try {
    return res.json({ conversation: renameConversation(req.user!.id, req.params.id, parsed.data.title) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.delete("/conversations/:id", (req, res) => {
  try {
    return res.json({ conversation: deleteConversation(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.patch("/conversations/:id/pin", (req, res) => {
  const parsed = z.object({ pinned: z.boolean().optional() }).safeParse(req.body);

  try {
    return res.json({
      conversation: pinConversation(req.user!.id, req.params.id, parsed.success ? parsed.data.pinned !== false : true)
    });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.patch("/conversations/:id/archive", (req, res) => {
  const parsed = z.object({ archived: z.boolean().optional() }).safeParse(req.body);

  try {
    return res.json({
      conversation: archiveConversation(req.user!.id, req.params.id, parsed.success ? parsed.data.archived !== false : true)
    });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.patch("/conversations/:id/move-top", (req, res) => {
  try {
    return res.json({ conversation: moveConversationToTop(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.get("/conversations/:id/files", (req, res) => {
  try {
    return res.json({ files: listConversationFiles(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.post("/conversations/:id/projects", (req, res) => {
  const parsed = z.object({ projectId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Informe um projeto para vincular.");
  }

  try {
    return res.status(201).json({
      link: addConversationToProject(req.user!.id, req.params.id, parsed.data.projectId)
    });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Não foi possível vincular ao projeto.");
  }
});

chatRoutes.get("/conversations/:id/messages", (req, res) => {
  try {
    return res.json({ messages: getMessages(req.user!.id, req.params.id) });
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Conversa nao encontrada.");
  }
});

chatRoutes.post("/chat", async (req, res) => {
  const parsed = z
    .object({
      conversationId: z.string().optional(),
      message: z.string().min(1)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Mensagem invalida.");
  }

  try {
    return res.json(await sendMessage(req.user!.id, parsed.data));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao conversar com YARA.");
  }
});
