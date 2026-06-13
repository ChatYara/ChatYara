import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import { createConversation, getMessages, listConversations, sendMessage } from "../services/chatService";
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

