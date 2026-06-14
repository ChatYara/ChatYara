import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

type LearningRow = {
  id: string;
  key: string;
  value: string;
  confidence: number;
  source: string;
  created_at: string;
  updated_at: string;
};

const sensitivePatterns = [
  /\b(senha|password|token|jwt|api key|apikey|chave|segredo|secret|cpf|rg|cart[aã]o|pix)\b/i,
  /\b(sa[uú]de|diagn[oó]stico|doen[cç]a|rem[eé]dio|religião|religiao|religios[ao])\b/i,
  /\b(pol[ií]tica|partido|voto|sexual|[ií]ntim|trauma)\b/i
];

function isSensitive(value: string) {
  return sensitivePatterns.some((pattern) => pattern.test(value));
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 180);
}

function saveLearning(
  userId: string,
  input: { key: string; value: string; confidence: number; source: string }
) {
  const value = normalize(input.value);
  if (!value || isSensitive(value)) return null;

  const id = uuid();
  getDatabase()
    .prepare(
      `insert into user_learning (id, user_id, key, value, confidence, source, updated_at)
       values (?, ?, ?, ?, ?, ?, current_timestamp)
       on conflict(user_id, key, value) do update set
         confidence = max(user_learning.confidence, excluded.confidence),
         source = excluded.source,
         updated_at = current_timestamp`
    )
    .run(id, userId, input.key, value, input.confidence, input.source);

  return { key: input.key, value, confidence: input.confidence, source: input.source };
}

export function learnFromUserMessage(userId: string, message: string) {
  const text = normalize(message);
  const learned: Array<{ key: string; value: string; confidence: number; source: string }> = [];

  if (!text || isSensitive(text)) {
    return learned;
  }

  const displayName = /(?:me chame de|pode me chamar de|me chama de)\s+([A-Za-zÀ-ÿ0-9 .'-]{2,40})/i.exec(text);
  if (displayName?.[1]) {
    const item = saveLearning(userId, {
      key: "display_name_preference",
      value: displayName[1],
      confidence: 0.82,
      source: "chat"
    });
    if (item) learned.push(item);
  }

  const responseLength = /prefir[ao]?\s+respostas?\s+(curtas?|m[eé]dias?|detalhadas?|longas?)/i.exec(text);
  if (responseLength?.[1]) {
    const raw = responseLength[1].toLowerCase();
    const value = raw.includes("curt") ? "curta" : raw.includes("detalh") || raw.includes("long") ? "detalhada" : "média";
    const item = saveLearning(userId, {
      key: "response_length_preference",
      value,
      confidence: 0.78,
      source: "chat"
    });
    if (item) learned.push(item);
  }

  const style = /(?:gosto de|prefiro|responda de forma|seja)\s+(diret[ao]|t[eé]cnic[ao]|criativ[ao]|executiv[ao]|equilibrad[ao])/i.exec(text);
  if (style?.[1]) {
    const item = saveLearning(userId, {
      key: "response_style_preference",
      value: style[1].toLowerCase(),
      confidence: 0.74,
      source: "chat"
    });
    if (item) learned.push(item);
  }

  const language = /(?:prefiro|responda em|use)\s+(portugu[eê]s|ingl[eê]s|espanhol)/i.exec(text);
  if (language?.[1]) {
    const item = saveLearning(userId, {
      key: "language_preference",
      value: language[1].toLowerCase(),
      confidence: 0.76,
      source: "chat"
    });
    if (item) learned.push(item);
  }

  const recurringProject = /(?:meu projeto|projeto recorrente|trabalho com|estou criando)\s+(.{4,80})/i.exec(text);
  if (recurringProject?.[1]) {
    const item = saveLearning(userId, {
      key: "recurring_project",
      value: recurringProject[1],
      confidence: 0.58,
      source: "chat"
    });
    if (item) learned.push(item);
  }

  return learned;
}

export function listUserLearning(userId: string) {
  return getDatabase()
    .prepare(
      `select id, key, value, confidence, source, created_at, updated_at
       from user_learning
       where user_id = ?
       order by updated_at desc
       limit 24`
    )
    .all(userId) as LearningRow[];
}

export function deleteLearning(userId: string, learningId: string) {
  const result = getDatabase()
    .prepare("delete from user_learning where id = ? and user_id = ?")
    .run(learningId, userId);

  if (result.changes === 0) {
    throw new Error("Aprendizado não encontrado.");
  }

  return { id: learningId };
}

export function readLearningContext(userId: string) {
  const rows = listUserLearning(userId);
  return rows
    .map((row) => `${row.key}: ${row.value} (confiança ${Math.round(row.confidence * 100)}%)`)
    .join("\n");
}
