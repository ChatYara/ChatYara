import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "dist", ".expo", ".eas", "data", "backend/data", "backend/uploads"]);
const ignoredFiles = new Set(["package-lock.json"]);
const secretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /sk-proj-[A-Za-z0-9_-]{20,}/,
  /ghp_[A-Za-z0-9_]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /GEMINI_API_KEY[^\S\r\n]*=[^\S\r\n]*[^\s#]+/,
  /OPENAI_API_KEY[^\S\r\n]*=[^\S\r\n]*[^\s#]+/,
  /JWT_SECRET[^\S\r\n]*=[^\S\r\n]*[^\s#]+/
];

function shouldIgnore(filePath) {
  const relative = path.relative(root, filePath).replaceAll("\\", "/");
  if (ignoredFiles.has(path.basename(relative))) {
    return true;
  }

  return relative.split("/").some((part, index, parts) => {
    const joined = parts.slice(0, index + 1).join("/");
    return ignoredDirs.has(part) || ignoredDirs.has(joined);
  });
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (shouldIgnore(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

const findings = [];

for (const file of walk(root)) {
  const relative = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");

  if (relative === ".env.example") {
    continue;
  }

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      findings.push(relative);
      break;
    }
  }
}

if (findings.length > 0) {
  throw new Error(`Possiveis segredos encontrados: ${findings.join(", ")}`);
}

console.log("Nenhum segredo conhecido encontrado nos arquivos versionaveis.");
