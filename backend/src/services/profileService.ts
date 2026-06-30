import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { getUserById } from "./authService";
import { getSettings, updateSettings } from "./workspaceService";

type CognitiveProfileInput = {
  preferredName?: string;
  profession?: string;
  studies?: string;
  projects?: string[];
  interests?: string[];
  goals?: {
    shortTerm?: string;
    mediumTerm?: string;
    longTerm?: string;
  };
  confidenceScore?: number;
  source?: string;
};

type CognitivePreferencesInput = {
  communicationStyle?: string;
  language?: string;
  responseStyle?: string;
  responseLength?: string;
  personalSettings?: Record<string, unknown>;
  confidenceScore?: number;
  source?: string;
};

type PublicCognitiveProfile = {
  preferredName: string;
  profession: string;
  studies: string;
  projects: string[];
  interests: string[];
  goals: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  history: Array<Record<string, unknown>>;
  confidenceScore: unknown;
  source: unknown;
  updated_at: unknown;
};

type PublicCognitivePreferences = {
  communicationStyle: string;
  language: string;
  responseStyle: string;
  responseLength: string;
  personalSettings: Record<string, unknown>;
  confidenceScore: unknown;
  source: unknown;
  updated_at: unknown;
};

function cleanText(value?: string | null, max = 240) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanExtractedFact(value: string) {
  return cleanText(value, 180)
    .replace(/^(?:é|sou|de|em|a|o)\s+/i, "")
    .replace(/\s+(?:e meu objetivo|e minha meta|e quero|e preciso).*/i, "")
    .replace(/[.,;:]+$/g, "")
    .trim();
}

function cleanList(value?: string[]) {
  return Array.from(new Set((value || []).map((item) => cleanText(item, 120)).filter(Boolean))).slice(0, 24);
}

function confidence(value?: number, fallback = 0.72) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0.1, Number(value)));
}

function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function audit(userId: string, action: string, message: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into cognitive_profile_audit_logs (id, user_id, action, message, metadata_json)
       values (?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, action, message, JSON.stringify(metadata));
}

function ensureProfile(userId: string) {
  const existing = getDatabase()
    .prepare("select * from cognitive_profiles where user_id = ?")
    .get(userId) as Record<string, unknown> | undefined;
  if (existing) return existing;

  const user = getUserById(userId);
  const settings = getSettings(userId) as { display_name?: string };
  getDatabase()
    .prepare(
      `insert into cognitive_profiles (user_id, preferred_name, source, confidence_score, updated_at)
       values (?, ?, 'settings', 0.7, current_timestamp)`
    )
    .run(userId, settings.display_name || user?.name || "Usuário");
  audit(userId, "create_profile", "Perfil cognitivo inicial criado.");
  return getDatabase().prepare("select * from cognitive_profiles where user_id = ?").get(userId) as Record<string, unknown>;
}

function ensurePreferences(userId: string) {
  const existing = getDatabase()
    .prepare("select * from cognitive_preferences where user_id = ?")
    .get(userId) as Record<string, unknown> | undefined;
  if (existing) return existing;

  const settings = getSettings(userId) as {
    ai_style?: string;
    language?: string;
    response_length?: string;
  };
  getDatabase()
    .prepare(
      `insert into cognitive_preferences (
         user_id, communication_style, language, response_style, response_length,
         personal_settings_json, confidence_score, source, updated_at
       )
       values (?, 'equilibrada', ?, ?, ?, '{}', 0.7, 'settings', current_timestamp)`
    )
    .run(userId, settings.language || "pt-BR", settings.ai_style || "balanced", settings.response_length || "medium");
  return getDatabase().prepare("select * from cognitive_preferences where user_id = ?").get(userId) as Record<string, unknown>;
}

function upsertObjective(userId: string, horizon: "short" | "medium" | "long", title: string, source: string, score: number) {
  const cleanTitle = cleanText(title, 180);
  if (!cleanTitle) return null;
  const current = getDatabase()
    .prepare("select id from cognitive_objectives where user_id = ? and horizon = ? and status = 'active' order by updated_at desc limit 1")
    .get(userId, horizon) as { id: string } | undefined;
  if (current) {
    getDatabase()
      .prepare(
        `update cognitive_objectives
         set title = ?, confidence_score = ?, source = ?, updated_at = current_timestamp
         where id = ? and user_id = ?`
      )
      .run(cleanTitle, score, source, current.id, userId);
    return current.id;
  }
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into cognitive_objectives (id, user_id, horizon, title, confidence_score, source, updated_at)
       values (?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(id, userId, horizon, cleanTitle, score, source);
  return id;
}

function addFact(
  userId: string,
  input: {
    factType: string;
    label: string;
    content: string;
    confidenceScore: number;
    source: string;
    status?: string;
    conversationId?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  const content = cleanText(input.content, 500);
  if (!content) return null;
  const exists = getDatabase()
    .prepare(
      `select id from cognitive_profile_facts
       where user_id = ? and fact_type = ? and lower(content) = lower(?)
       limit 1`
    )
    .get(userId, input.factType, content) as { id: string } | undefined;
  if (exists) {
    getDatabase()
      .prepare(
        `update cognitive_profile_facts
         set confidence_score = max(confidence_score, ?), source = ?, updated_at = current_timestamp
         where id = ? and user_id = ?`
      )
      .run(input.confidenceScore, input.source, exists.id, userId);
    return exists.id;
  }
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into cognitive_profile_facts (
         id, user_id, fact_type, label, content, confidence_score, source, status, conversation_id, metadata_json, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(
      id,
      userId,
      input.factType,
      cleanText(input.label, 80) || input.factType,
      content,
      input.confidenceScore,
      input.source,
      input.status || "suggested",
      input.conversationId || null,
      JSON.stringify(input.metadata || {})
    );
  return id;
}

function profileToPublic(row: Record<string, unknown>): PublicCognitiveProfile {
  return {
    preferredName: String(row.preferred_name || ""),
    profession: String(row.profession || ""),
    studies: String(row.studies || ""),
    projects: safeJson(String(row.projects_json || "[]"), [] as string[]),
    interests: safeJson(String(row.interests_json || "[]"), [] as string[]),
    goals: safeJson(String(row.goals_json || "{}"), { shortTerm: "", mediumTerm: "", longTerm: "" }),
    history: safeJson(String(row.history_json || "[]"), [] as Array<Record<string, unknown>>),
    confidenceScore: row.confidence_score,
    source: row.source,
    updated_at: row.updated_at
  };
}

function preferencesToPublic(row: Record<string, unknown>): PublicCognitivePreferences {
  return {
    communicationStyle: String(row.communication_style || ""),
    language: String(row.language || "pt-BR"),
    responseStyle: String(row.response_style || "balanced"),
    responseLength: String(row.response_length || "medium"),
    personalSettings: safeJson(String(row.personal_settings_json || "{}"), {}),
    confidenceScore: row.confidence_score,
    source: row.source,
    updated_at: row.updated_at
  };
}

export function getCognitiveProfile(userId: string) {
  const profile = ensureProfile(userId);
  const preferences = ensurePreferences(userId);
  const facts = getDatabase()
    .prepare(
      `select id, fact_type, label, content, confidence_score, source, status, conversation_id, created_at, updated_at
       from cognitive_profile_facts
       where user_id = ?
       order by status = 'suggested' desc, confidence_score desc, updated_at desc
       limit 80`
    )
    .all(userId);
  const objectives = getDatabase()
    .prepare(
      `select id, horizon, title, description, status, confidence_score, source, created_at, updated_at
       from cognitive_objectives
       where user_id = ?
       order by case horizon when 'short' then 1 when 'medium' then 2 else 3 end, updated_at desc`
    )
    .all(userId);
  const auditLogs = getDatabase()
    .prepare(
      `select action, status, message, created_at
       from cognitive_profile_audit_logs
       where user_id = ?
       order by created_at desc
       limit 10`
    )
    .all(userId);
  return {
    profile: profileToPublic(profile),
    preferences: preferencesToPublic(preferences),
    facts,
    objectives,
    auditLogs
  };
}

export function updateCognitiveProfile(userId: string, input: CognitiveProfileInput) {
  const current = profileToPublic(ensureProfile(userId));
  const preferredName = cleanText(input.preferredName ?? current.preferredName, 80);
  const profession = cleanText(input.profession ?? current.profession, 160);
  const studies = cleanText(input.studies ?? current.studies, 240);
  const projects = cleanList(input.projects ?? current.projects);
  const interests = cleanList(input.interests ?? current.interests);
  const goals = {
    shortTerm: cleanText(input.goals?.shortTerm ?? current.goals.shortTerm, 220),
    mediumTerm: cleanText(input.goals?.mediumTerm ?? current.goals.mediumTerm, 220),
    longTerm: cleanText(input.goals?.longTerm ?? current.goals.longTerm, 220)
  };
  const source = cleanText(input.source || "manual", 40);
  const score = confidence(input.confidenceScore, 0.9);
  const history = [
    ...(current.history || []),
    { event: "profile_update", source, at: new Date().toISOString() }
  ].slice(-30);

  getDatabase()
    .prepare(
      `insert into cognitive_profiles (
         user_id, preferred_name, profession, studies, projects_json, interests_json, goals_json,
         history_json, confidence_score, source, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
       on conflict(user_id) do update set
         preferred_name = excluded.preferred_name,
         profession = excluded.profession,
         studies = excluded.studies,
         projects_json = excluded.projects_json,
         interests_json = excluded.interests_json,
         goals_json = excluded.goals_json,
         history_json = excluded.history_json,
         confidence_score = excluded.confidence_score,
         source = excluded.source,
         updated_at = current_timestamp`
    )
    .run(
      userId,
      preferredName || null,
      profession || null,
      studies || null,
      JSON.stringify(projects),
      JSON.stringify(interests),
      JSON.stringify(goals),
      JSON.stringify(history),
      score,
      source
    );

  if (preferredName) updateSettings(userId, { displayName: preferredName });
  upsertObjective(userId, "short", goals.shortTerm, source, score);
  upsertObjective(userId, "medium", goals.mediumTerm, source, score);
  upsertObjective(userId, "long", goals.longTerm, source, score);
  audit(userId, "update_profile", "Perfil cognitivo atualizado.", { source });
  return getCognitiveProfile(userId);
}

export function getCognitivePreferences(userId: string) {
  return preferencesToPublic(ensurePreferences(userId));
}

export function updateCognitivePreferences(userId: string, input: CognitivePreferencesInput) {
  const current = getCognitivePreferences(userId);
  const communicationStyle = cleanText(input.communicationStyle ?? current.communicationStyle, 120) || "equilibrada";
  const language = cleanText(input.language ?? current.language, 20) || "pt-BR";
  const responseStyle = cleanText(input.responseStyle ?? current.responseStyle, 40) || "balanced";
  const responseLength = cleanText(input.responseLength ?? current.responseLength, 40) || "medium";
  const personalSettings = input.personalSettings ?? current.personalSettings ?? {};
  const score = confidence(input.confidenceScore, 0.86);
  const source = cleanText(input.source || "manual", 40);

  getDatabase()
    .prepare(
      `insert into cognitive_preferences (
         user_id, communication_style, language, response_style, response_length,
         personal_settings_json, confidence_score, source, updated_at
       )
       values (?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
       on conflict(user_id) do update set
         communication_style = excluded.communication_style,
         language = excluded.language,
         response_style = excluded.response_style,
         response_length = excluded.response_length,
         personal_settings_json = excluded.personal_settings_json,
         confidence_score = excluded.confidence_score,
         source = excluded.source,
         updated_at = current_timestamp`
    )
    .run(userId, communicationStyle, language, responseStyle, responseLength, JSON.stringify(personalSettings), score, source);

  updateSettings(userId, {
    language,
    aiStyle: responseStyle,
    responseLength
  });
  audit(userId, "update_preferences", "Preferências cognitivas atualizadas.", { source });
  return getCognitivePreferences(userId);
}

export function extractCognitiveFactsFromMessage(userId: string, conversationId: string, message: string) {
  const text = cleanText(message, 1000);
  if (text.length < 8) return [];
  const suggestions: string[] = [];
  const patterns: Array<{
    type: string;
    label: string;
    regex: RegExp;
    confidence: number;
  }> = [
    { type: "profession", label: "Profissão", regex: /\b(?:sou|trabalho como|atuo como)\s+([A-Za-zÀ-ÿ0-9 .'-]{3,80}?)(?=\s+e\s+|[.,;]|$)/i, confidence: 0.78 },
    { type: "studies", label: "Estudos", regex: /\b(?:estudo|curso|faculdade|universidade|faço)\s+([A-Za-zÀ-ÿ0-9 .,'-]{3,100}?)(?=\s+e\s+|[.,;]|$)/i, confidence: 0.72 },
    { type: "project", label: "Projeto", regex: /\b(?:meu projeto|estou criando|estamos criando|projeto)\s+([A-Za-zÀ-ÿ0-9 .,'-]{3,120}?)(?=\s+e\s+|[.,;]|$)/i, confidence: 0.7 },
    { type: "interest", label: "Interesse", regex: /\b(?:gosto de|tenho interesse em|me interesso por)\s+([A-Za-zÀ-ÿ0-9 .,'-]{3,100}?)(?=\s+e\s+|[.,;]|$)/i, confidence: 0.68 },
    { type: "goal", label: "Meta", regex: /\b(?:minha meta|meu objetivo|quero conseguir|preciso alcançar)\s+(?:é\s+|de\s+)?([A-Za-zÀ-ÿ0-9 .,'-]{3,140}?)(?=[.,;]|$)/i, confidence: 0.74 }
  ];

  for (const pattern of patterns) {
    const match = pattern.regex.exec(text);
    if (!match?.[1]) continue;
    const id = addFact(userId, {
      factType: pattern.type,
      label: pattern.label,
      content: cleanExtractedFact(match[1]),
      confidenceScore: pattern.confidence,
      source: "chat",
      status: "suggested",
      conversationId,
      metadata: { extraction: "rule", original: text.slice(0, 220) }
    });
    if (id) suggestions.push(id);
  }

  if (suggestions.length > 0) {
    audit(userId, "extract_facts", `${suggestions.length} sugestão(ões) cognitiva(s) extraída(s).`, { conversationId });
  }
  return suggestions;
}

export function readCognitiveProfileContext(userId: string) {
  const data = getCognitiveProfile(userId);
  const profile = data.profile;
  const preferences = data.preferences;
  const acceptedFacts = (data.facts as Array<{ status: string; label: string; content: string; confidence_score: number }>)
    .filter((fact) => fact.status === "accepted" || fact.confidence_score >= 0.78)
    .slice(0, 10);
  return [
    profile.preferredName ? `Nome preferido: ${profile.preferredName}` : "",
    profile.profession ? `Profissão: ${profile.profession}` : "",
    profile.studies ? `Estudos: ${profile.studies}` : "",
    profile.projects.length ? `Projetos: ${profile.projects.join(", ")}` : "",
    profile.interests.length ? `Interesses: ${profile.interests.join(", ")}` : "",
    profile.goals.shortTerm ? `Meta de curto prazo: ${profile.goals.shortTerm}` : "",
    profile.goals.mediumTerm ? `Meta de médio prazo: ${profile.goals.mediumTerm}` : "",
    profile.goals.longTerm ? `Meta de longo prazo: ${profile.goals.longTerm}` : "",
    preferences.communicationStyle ? `Comunicação preferida: ${preferences.communicationStyle}` : "",
    acceptedFacts.length ? `Fatos cognitivos:\n${acceptedFacts.map((fact) => `- ${fact.label}: ${fact.content}`).join("\n")}` : ""
  ].filter(Boolean).join("\n");
}
