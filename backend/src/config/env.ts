import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const missing = (name: string) => !process.env[name] || process.env[name]?.trim() === "";
const allowedProviders = ["gemini", "openai"] as const;
const allowedSearchProviders = ["tavily", "serpapi", "brave", "firecrawl"] as const;
export type AIProviderName = (typeof allowedProviders)[number];
export type SearchProviderName = (typeof allowedSearchProviders)[number];

function readAIProvider(): AIProviderName {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || "gemini";

  if (!allowedProviders.includes(provider as AIProviderName)) {
    return "gemini";
  }

  return provider as AIProviderName;
}

const aiProvider = readAIProvider();

function readSearchProvider(): SearchProviderName {
  const provider = process.env.SEARCH_PROVIDER?.trim().toLowerCase() || "tavily";

  if (!allowedSearchProviders.includes(provider as SearchProviderName)) {
    return "tavily";
  }

  return provider as SearchProviderName;
}

export function validateEnvironment() {
  const errors: string[] = [];

  if (aiProvider === "gemini" && missing("GEMINI_API_KEY")) {
    errors.push("GEMINI_API_KEY nao foi configurada para AI_PROVIDER=gemini.");
  }

  if (aiProvider === "openai" && missing("OPENAI_API_KEY")) {
    errors.push("OPENAI_API_KEY nao foi configurada para AI_PROVIDER=openai.");
  }

  if (missing("JWT_SECRET")) {
    errors.push("JWT_SECRET nao foi configurado.");
  }

  if (errors.length > 0) {
    const message = [
      "YARA AI backend nao iniciou por falta de configuracao segura.",
      ...errors,
      "Configure a chave do provedor de IA escolhido no .env do servidor.",
      "Nunca coloque chaves de IA no app mobile, no APK ou em arquivos versionados pelo Git."
    ].join("\n");

    throw new Error(message);
  }
}

export const env = {
  apiPort: Number(process.env.PORT ?? 3333),
  aiProvider,
  databaseUrl: process.env.DATABASE_URL?.trim() || "sqlite:./data/yara.sqlite",
  jwtSecret: process.env.JWT_SECRET ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-5.5",
  searchProvider: readSearchProvider(),
  tavilyApiKey: process.env.TAVILY_API_KEY ?? "",
  serpapiApiKey: process.env.SERPAPI_API_KEY ?? "",
  braveSearchApiKey: process.env.BRAVE_SEARCH_API_KEY ?? "",
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? "",
  uploadDir: process.env.UPLOAD_DIR?.trim() || "",
  imageDir: process.env.IMAGE_DIR?.trim() || "",
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || "*"
};
