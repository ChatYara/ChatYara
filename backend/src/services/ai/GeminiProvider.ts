import { env } from "../../config/env";
import {
  buildPrompt,
  buildSystemInstruction,
  maxOutputTokensForPrompt,
  type AIProvider,
  type AIProviderRequest,
  type AIProviderResponse
} from "./AIProvider";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

export class GeminiProvider implements AIProvider {
  readonly name = "gemini" as const;

  async generate(input: AIProviderRequest): Promise<AIProviderResponse> {
    const url = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.geminiModel}:generateContent`
    );
    url.searchParams.set("key", env.geminiApiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemInstruction(input) }]
        },
        generationConfig: {
          temperature: 0.55,
          topP: 0.9,
          maxOutputTokens: maxOutputTokensForPrompt(input.prompt)
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(input) }]
          }
        ]
      })
    });

    const data = (await response.json()) as GeminiGenerateContentResponse;

    if (!response.ok) {
      throw new Error(data.error?.message || "Falha ao chamar Gemini.");
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("") || "YARA recebeu a mensagem, mas nao retornou conteudo.";

    return {
      provider: this.name,
      model: env.geminiModel,
      response: text
    };
  }
}
