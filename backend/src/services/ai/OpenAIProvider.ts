import OpenAI from "openai";
import { env } from "../../config/env";
import {
  buildPrompt,
  buildSystemInstruction,
  maxOutputTokensForPrompt,
  type AIProvider,
  type AIProviderRequest,
  type AIProviderResponse
} from "./AIProvider";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;
  private client: OpenAI | null = null;

  private getClient() {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: env.openaiApiKey
      });
    }

    return this.client;
  }

  async generate(input: AIProviderRequest): Promise<AIProviderResponse> {
    const response = await this.getClient().responses.create({
      model: env.openaiModel,
      instructions: buildSystemInstruction(input),
      input: buildPrompt(input),
      max_output_tokens: maxOutputTokensForPrompt(input.prompt)
    });

    return {
      provider: this.name,
      model: response.model ?? env.openaiModel,
      response: response.output_text || "YARA recebeu a mensagem, mas nao retornou conteudo."
    };
  }
}
