import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envExamplePath = path.join(root, ".env.example");
const requiredKeys = ["OPENAI_API_KEY", "DATABASE_URL", "JWT_SECRET"];

if (!fs.existsSync(envExamplePath)) {
  throw new Error(".env.example nao encontrado.");
}

const content = fs.readFileSync(envExamplePath, "utf8");
const lines = content
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const values = new Map(
  lines
    .filter((line) => !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const missing = requiredKeys.filter((key) => !values.has(key));

if (missing.length > 0) {
  throw new Error(`.env.example sem variaveis obrigatorias: ${missing.join(", ")}`);
}

const filledSecrets = requiredKeys.filter((key) => {
  const value = values.get(key)?.trim() ?? "";
  return value.length > 0 && !value.startsWith("#");
});

if (filledSecrets.length > 0) {
  throw new Error(`.env.example nao deve conter valores reais: ${filledSecrets.join(", ")}`);
}

console.log(".env.example valido e sem segredos.");

