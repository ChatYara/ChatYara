import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth";
import {
  getCognitivePreferences,
  getCognitiveProfile,
  updateCognitivePreferences,
  updateCognitiveProfile
} from "../services/profileService";
import { sendError } from "../utils/http";

export const profileRoutes = Router();

profileRoutes.use(authRequired);

const profileSchema = z.object({
  preferredName: z.string().optional(),
  profession: z.string().optional(),
  studies: z.string().optional(),
  projects: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  goals: z.object({
    shortTerm: z.string().optional(),
    mediumTerm: z.string().optional(),
    longTerm: z.string().optional()
  }).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  source: z.string().optional()
});

const preferencesSchema = z.object({
  communicationStyle: z.string().optional(),
  language: z.string().optional(),
  responseStyle: z.string().optional(),
  responseLength: z.string().optional(),
  personalSettings: z.record(z.unknown()).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  source: z.string().optional()
});

profileRoutes.get("/profile", (req, res) => {
  return res.json(getCognitiveProfile(req.user!.id));
});

profileRoutes.put("/profile", (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Perfil cognitivo inválido.");
  return res.json(updateCognitiveProfile(req.user!.id, parsed.data));
});

profileRoutes.get("/profile/preferences", (req, res) => {
  return res.json({ preferences: getCognitivePreferences(req.user!.id) });
});

profileRoutes.put("/profile/preferences", (req, res) => {
  const parsed = preferencesSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Preferências cognitivas inválidas.");
  return res.json({ preferences: updateCognitivePreferences(req.user!.id, parsed.data) });
});

