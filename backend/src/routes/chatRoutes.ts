import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  addConversationToProject,
  archiveConversation,
  createConversation,
  deleteConversation,
  editUserMessage,
  getConversation,
  getMessages,
  listConversationFiles,
  listConversations,
  moveConversationToTop,
  pinConversation,
  regenerateAssistantMessage,
  renameConversation,
  sendMessage,
  setMessageFeedback
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
      message: z.string().optional().default(""),
      uploadIds: z.array(z.string().min(1)).max(5).optional().default([])
    })
    .refine((data) => data.message.trim().length > 0 || data.uploadIds.length > 0)
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

chatRoutes.post("/chat/stream", async (req, res) => {
  const parsed = z
    .object({
      conversationId: z.string().optional(),
      message: z.string().optional().default(""),
      uploadIds: z.array(z.string().min(1)).max(5).optional().default([])
    })
    .refine((data) => data.message.trim().length > 0 || data.uploadIds.length > 0)
    .safeParse(req.body);

  if (!parsed.success) {
    return sendError(res, 400, "Mensagem invalida.");
  }

  try {
    const data = await sendMessage(req.user!.id, parsed.data);
    const assistant = data.messages.find((message) => message.role === "assistant");
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const content = assistant?.content || "";
    for (let index = 0; index < content.length; index += 24) {
      res.write(`event: chunk\ndata: ${JSON.stringify({ text: content.slice(index, index + 24) })}\n\n`);
    }
    res.write(`event: done\ndata: ${JSON.stringify(data)}\n\n`);
    return res.end();
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Erro ao conversar com YARA.");
  }
});

chatRoutes.patch("/messages/:id", (req, res) => {
  const parsed = z.object({ content: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Mensagem inválida.");
  }

  try {
    return res.json({ message: editUserMessage(req.user!.id, req.params.id, parsed.data.content) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível editar a mensagem.");
  }
});

chatRoutes.post("/messages/:id/regenerate", async (req, res) => {
  try {
    return res.json(await regenerateAssistantMessage(req.user!.id, req.params.id));
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível regenerar a resposta.");
  }
});

chatRoutes.post("/messages/:id/feedback", (req, res) => {
  const parsed = z.object({ value: z.enum(["like", "dislike"]) }).safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Feedback inválido.");
  }

  try {
    return res.json({ feedback: setMessageFeedback(req.user!.id, req.params.id, parsed.data.value) });
  } catch (error) {
    return sendError(res, 400, error instanceof Error ? error.message : "Não foi possível registrar o feedback.");
  }
});
