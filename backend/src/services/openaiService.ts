import OpenAI from "openai";
import { env } from "../config/env";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: env.openaiApiKey
    });
  }

  return client;
}

const developerInstructions = [
  "Voce e YARA AI, uma assistente futurista, objetiva e util.",
  "Responda em portugues do Brasil por padrao.",
  "Nunca solicite, exiba ou tente inferir chaves de API.",
  "Ajude o usuario a criar sistemas, APIs, dashboards, bancos de dados e apps mobile com passos claros."
].join(" ");

export async function askYara(input: {
  prompt: string;
  memory?: string;
  context?: string;
}) {
  const response = await getClient().responses.create({
    model: env.openaiModel,
    instructions: input.memory
      ? `${developerInstructions}\nMemoria do usuario:\n${input.memory}`
      : developerInstructions,
    input: input.context ? `${input.context}\n\nUsuario: ${input.prompt}` : input.prompt
  });

  return {
    model: response.model ?? env.openaiModel,
    response: response.output_text || "YARA recebeu a mensagem, mas nao retornou conteudo."
  };
}

export async function testOpenAIConnection() {
  return askYara({
    prompt: "Responda apenas: YARA Online."
  });
}
