import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const missing = (name: string) => !process.env[name] || process.env[name]?.trim() === "";

export function validateEnvironment() {
  const errors: string[] = [];

  if (missing("OPENAI_API_KEY")) {
    errors.push("OPENAI_API_KEY nao foi configurada.");
  }

  if (missing("JWT_SECRET")) {
    errors.push("JWT_SECRET nao foi configurado.");
  }

  if (errors.length > 0) {
    const message = [
      "YARA AI backend nao iniciou por falta de configuracao segura.",
      ...errors,
      "Crie uma chave no OpenAI Platform e adicione as variaveis no arquivo .env do servidor.",
      "Nunca coloque a chave no app mobile, no APK ou em arquivos versionados pelo Git."
    ].join("\n");

    throw new Error(message);
  }
}

export const env = {
  apiPort: Number(process.env.PORT ?? 3333),
  databaseUrl: process.env.DATABASE_URL?.trim() || "sqlite:./data/yara.sqlite",
  jwtSecret: process.env.JWT_SECRET ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-5.5",
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || "*"
};
