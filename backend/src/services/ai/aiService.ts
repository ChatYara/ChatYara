import { env } from "../../config/env";
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import type { AIProvider, AIProviderRequest } from "./AIProvider";

let provider: AIProvider | null = null;

export function getAIProvider() {
  if (provider) {
    return provider;
  }

  provider = env.aiProvider === "openai" ? new OpenAIProvider() : new GeminiProvider();
  return provider;
}

export async function askYara(input: AIProviderRequest) {
  return getAIProvider().generate(input);
}

export async function testAIConnection() {
  return askYara({
    prompt: "Responda apenas: YARA Online."
  });
}

