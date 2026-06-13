export type AIProviderRequest = {
  prompt: string;
  memory?: string;
  context?: string;
};

export type AIProviderResponse = {
  provider: "gemini" | "openai";
  model: string;
  response: string;
};

export interface AIProvider {
  readonly name: "gemini" | "openai";
  generate(input: AIProviderRequest): Promise<AIProviderResponse>;
}

export const developerInstructions = [
  "Voce e YARA AI, uma assistente futurista, objetiva e util.",
  "Responda em portugues do Brasil por padrao.",
  "Nunca solicite, exiba ou tente inferir chaves de API.",
  "Ajude o usuario a criar sistemas, APIs, dashboards, bancos de dados e apps mobile com passos claros."
].join(" ");

export function buildPrompt(input: AIProviderRequest) {
  return input.context ? `${input.context}\n\nUsuario: ${input.prompt}` : input.prompt;
}

export function buildSystemInstruction(input: AIProviderRequest) {
  return input.memory
    ? `${developerInstructions}\nMemoria do usuario:\n${input.memory}`
    : developerInstructions;
}

