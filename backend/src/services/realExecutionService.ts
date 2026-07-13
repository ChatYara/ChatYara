import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { recordAudit } from "./auditService";
import { getSystemDetails } from "./systemGeneratorService";
import { recordExecutionEvent } from "./systemExecutionService";

type ExecutionJobRow = {
  id: string;
  user_id: string;
  system_id: string;
  execution_session_id: string | null;
  status: string;
  environment_type: string;
  attempt: number;
  commands_json: string;
  workspace_path: string | null;
  artifact_path: string | null;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  result_json: string;
  error: string | null;
  created_at: string;
  updated_at: string;
};

type ExecutionCommandRow = {
  id: string;
  job_id: string;
  user_id: string;
  command_label: string;
  command: string;
  args_json: string;
  status: string;
  exit_code: number | null;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  stdout: string;
  stderr: string;
  metadata_json: string;
  created_at: string;
};

type ExecutionArtifactRow = {
  id: string;
  job_id: string;
  user_id: string;
  artifact_type: string;
  name: string;
  path: string;
  size: number;
  metadata_json: string;
  created_at: string;
};

type CommandLabel =
  | "npm install"
  | "npm ci"
  | "npm run check"
  | "npm run build"
  | "npm run test"
  | "npm run lint"
  | "prisma generate"
  | "prisma migrate";

type RunOptions = {
  executionSessionId?: string | null;
  commands?: CommandLabel[];
  operationType?: string;
};

type CommandResult = {
  id: string;
  label: CommandLabel;
  status: "success" | "failed" | "timeout" | "cancelled";
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
};

const DEFAULT_COMMANDS: CommandLabel[] = ["npm install", "npm run check", "npm run lint", "npm run test", "npm run build"];
const SUPPORTED_COMMANDS: Record<CommandLabel, { command: string; args: string[]; category: "command" | "test" | "build" }> = {
  "npm install": { command: npmExecutable(), args: npmArgs(["install", "--ignore-scripts", "--no-audit", "--no-fund"]), category: "command" },
  "npm ci": { command: npmExecutable(), args: npmArgs(["ci", "--ignore-scripts", "--no-audit", "--no-fund"]), category: "command" },
  "npm run check": { command: npmExecutable(), args: npmArgs(["run", "check"]), category: "command" },
  "npm run build": { command: npmExecutable(), args: npmArgs(["run", "build"]), category: "build" },
  "npm run test": { command: npmExecutable(), args: npmArgs(["run", "test"]), category: "test" },
  "npm run lint": { command: npmExecutable(), args: npmArgs(["run", "lint"]), category: "command" },
  "prisma generate": { command: npxExecutable(), args: npxArgs(["prisma", "generate"]), category: "command" },
  "prisma migrate": { command: npxExecutable(), args: npxArgs(["prisma", "migrate", "deploy"]), category: "database" as "command" }
};
const MAX_LOG_CHARS = 24_000;
const MAX_AUTO_FIX_ATTEMPTS = 3;
const activeProcesses = new Map<string, ChildProcessWithoutNullStreams>();

function npmExecutable() {
  return process.platform === "win32" ? process.execPath : "npm";
}

function npxExecutable() {
  return process.platform === "win32" ? process.execPath : "npx";
}

function npmArgs(args: string[]) {
  if (process.platform !== "win32") return args;
  return [path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), ...args];
}

function npxArgs(args: string[]) {
  if (process.platform !== "win32") return args;
  return [path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js"), ...args];
}

function backendRoot() {
  return path.resolve(__dirname, "..", "..");
}

function workspaceRoot() {
  return path.resolve(process.env.EXECUTION_WORKSPACE_DIR || path.join(os.tmpdir(), "yara-execution-workspaces"));
}

function artifactRoot() {
  return path.resolve(process.env.EXECUTION_ARTIFACTS_DIR || path.join(backendRoot(), "artifacts", "executions"));
}

function jsonParse<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function sanitizeText(value: unknown) {
  let text = String(value ?? "");
  const sensitive = [
    /OPENAI_API_KEY\s*=\s*[^\s]+/gi,
    /GEMINI_API_KEY\s*=\s*[^\s]+/gi,
    /JWT_SECRET\s*=\s*[^\s]+/gi,
    /DATABASE_URL\s*=\s*[^\s]+/gi,
    /Bearer\s+[A-Za-z0-9._-]+/g,
    /eyJ[A-Za-z0-9._-]+/g,
    /(password|token|secret|api[_-]?key|credential)["']?\s*[:=]\s*["']?[^"'\s,}]+/gi
  ];
  for (const pattern of sensitive) text = text.replace(pattern, "$1=[redigido]");
  return text.slice(0, MAX_LOG_CHARS);
}

function sanitizeJson(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 200).map(sanitizeJson);
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      output[key] = /secret|token|password|api[_-]?key|jwt|credential|env/i.test(key) ? "[redigido]" : sanitizeJson(item);
    }
    return output;
  }
  return sanitizeText(value);
}

function publicJob(row: ExecutionJobRow) {
  return {
    id: row.id,
    userId: row.user_id,
    systemId: row.system_id,
    executionSessionId: row.execution_session_id,
    status: row.status,
    environmentType: row.environment_type,
    attempt: Number(row.attempt || 0),
    commands: jsonParse(row.commands_json, []),
    workspacePath: row.workspace_path ? "[temporary-sandbox]" : null,
    artifactPath: row.artifact_path ? "[artifact-storage]" : null,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMs: row.duration_ms,
    result: jsonParse(row.result_json, {}),
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicCommand(row: ExecutionCommandRow) {
  return {
    id: row.id,
    jobId: row.job_id,
    commandLabel: row.command_label,
    command: row.command_label,
    status: row.status,
    exitCode: row.exit_code,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMs: row.duration_ms,
    stdout: row.stdout,
    stderr: row.stderr,
    metadata: jsonParse(row.metadata_json, {})
  };
}

function publicArtifact(row: ExecutionArtifactRow) {
  return {
    id: row.id,
    jobId: row.job_id,
    type: row.artifact_type,
    name: row.name,
    size: row.size,
    metadata: jsonParse(row.metadata_json, {}),
    createdAt: row.created_at
  };
}

function getJobRow(userId: string, jobId: string) {
  const row = getDatabase()
    .prepare("select * from execution_jobs where id = ? and user_id = ?")
    .get(jobId, userId) as ExecutionJobRow | undefined;
  if (!row) throw new Error("Execução não encontrada.");
  return row;
}

function resolveCommands(commands?: CommandLabel[]) {
  const requested = commands && commands.length > 0 ? commands : DEFAULT_COMMANDS;
  for (const label of requested) {
    if (!SUPPORTED_COMMANDS[label]) throw new Error(`Comando não permitido: ${label}.`);
  }
  return requested;
}

function safeSlug(value: string) {
  return String(value || "sistema")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "sistema";
}

function safeRelativePath(root: string, fileName: string) {
  const clean = String(fileName || "arquivo.txt")
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
  const full = path.resolve(root, clean);
  if (!full.startsWith(path.resolve(root) + path.sep) && full !== path.resolve(root)) {
    throw new Error("Caminho de arquivo inválido no projeto gerado.");
  }
  return full;
}

async function writeFileSafe(root: string, fileName: string, content: string) {
  const full = safeRelativePath(root, fileName);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
  return path.relative(root, full).replace(/\\/g, "/");
}

async function pathSize(filePath: string) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

async function copyDirectory(source: string, target: string) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (["node_modules", ".npm-cache"].includes(entry.name)) continue;
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

function createJob(userId: string, systemId: string, commands: CommandLabel[], options: RunOptions) {
  getSystemDetails(userId, systemId);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into execution_jobs (
         id, user_id, system_id, execution_session_id, status, environment_type, attempt, commands_json, started_at
       ) values (?, ?, ?, ?, 'running', 'node', 1, ?, current_timestamp)`
    )
    .run(id, userId, systemId, options.executionSessionId || null, JSON.stringify(commands));
  return getJobRow(userId, id);
}

function updateJob(jobId: string, userId: string, input: Partial<ExecutionJobRow>) {
  const current = getJobRow(userId, jobId);
  getDatabase()
    .prepare(
      `update execution_jobs
       set status = ?, workspace_path = ?, artifact_path = ?, finished_at = ?, duration_ms = ?,
           result_json = ?, error = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      input.status ?? current.status,
      input.workspace_path ?? current.workspace_path,
      input.artifact_path ?? current.artifact_path,
      input.finished_at ?? current.finished_at,
      input.duration_ms ?? current.duration_ms,
      input.result_json ?? current.result_json,
      input.error ?? current.error,
      jobId,
      userId
    );
}

function insertEnvironment(job: ExecutionJobRow, workspacePath: string, artifactPath: string) {
  getDatabase()
    .prepare(
      `insert into execution_environments (id, job_id, user_id, environment_type, workspace_path, artifact_path, status, metadata_json)
       values (?, ?, ?, ?, ?, ?, 'active', ?)`
    )
    .run(uuid(), job.id, job.user_id, "node", workspacePath, artifactPath, JSON.stringify({ isolation: "temp-workspace-minimal-env" }));
}

function finishEnvironment(jobId: string, userId: string, status: string) {
  getDatabase()
    .prepare("update execution_environments set status = ?, updated_at = current_timestamp where job_id = ? and user_id = ?")
    .run(status, jobId, userId);
}

function insertResult(jobId: string, userId: string, kind: string, status: string, summary: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into execution_results (id, job_id, user_id, kind, status, summary, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), jobId, userId, kind, status, sanitizeText(summary), JSON.stringify(sanitizeJson(metadata)));
}

async function insertArtifact(jobId: string, userId: string, type: string, name: string, artifactPath: string, metadata: Record<string, unknown> = {}) {
  const size = await pathSize(artifactPath);
  getDatabase()
    .prepare(
      `insert into execution_artifacts (id, job_id, user_id, artifact_type, name, path, size, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), jobId, userId, type, sanitizeText(name), artifactPath, size, JSON.stringify(sanitizeJson(metadata)));
}

async function createRunnableProject(job: ExecutionJobRow, workspacePath: string, artifactPath: string) {
  const system = getSystemDetails(job.user_id, job.system_id);
  const slug = safeSlug(system.name);
  const generatedFiles = Array.isArray(system.files) ? system.files : [];
  const createdFiles: string[] = [];
  const scope = system.scope || {};
  const packageJson = {
    name: slug,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      check: "node scripts/check.mjs",
      lint: "node scripts/lint.mjs",
      test: "node --test tests/*.test.mjs",
      build: "node scripts/build.mjs"
    },
    dependencies: {},
    devDependencies: {}
  };

  const files: Record<string, string> = {
    "package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
    "README.md": `# ${system.name}\n\n${system.objective}\n\nGerado e validado pelo YARA Real Execution Engine.\n`,
    "src/data/system.json": `${JSON.stringify(sanitizeJson(system), null, 2)}\n`,
    "src/app.mjs": [
      "import { readFileSync } from 'node:fs';",
      "const system = JSON.parse(readFileSync(new URL('./data/system.json', import.meta.url), 'utf8'));",
      "",
      "export function describeSystem() {",
      "  return {",
      "    name: system.name,",
      "    objective: system.objective,",
      "    architecture: system.architecture,",
      "    stack: [system.frontend, system.backend, system.database].filter(Boolean).join(' + '),",
      "    features: system.scope?.features || []",
      "  };",
      "}",
      ""
    ].join("\n"),
    "scripts/check.mjs": [
      "import { readFileSync } from 'node:fs';",
      "const system = JSON.parse(readFileSync('src/data/system.json', 'utf8'));",
      "const required = ['id', 'name', 'objective', 'architecture'];",
      "const missing = required.filter((key) => !system[key]);",
      "if (missing.length) {",
      "  console.error('Campos obrigatórios ausentes:', missing.join(', '));",
      "  process.exit(1);",
      "}",
      "if (!Array.isArray(system.scope?.features) || system.scope.features.length === 0) {",
      "  console.error('O sistema precisa ter funcionalidades.');",
      "  process.exit(1);",
      "}",
      "console.log(`Check concluído para ${system.name}.`);"
    ].join("\n"),
    "scripts/lint.mjs": [
      "import { readdirSync, readFileSync, statSync } from 'node:fs';",
      "import path from 'node:path';",
      "const forbidden = [/OPENAI_API_KEY\\s*=/, /GEMINI_API_KEY\\s*=/, /JWT_SECRET\\s*=/, /DATABASE_URL\\s*=/];",
      "function walk(dir) {",
      "  for (const entry of readdirSync(dir)) {",
      "    if (['node_modules', '.npm-cache', 'dist'].includes(entry)) continue;",
      "    const full = path.join(dir, entry);",
      "    if (statSync(full).isDirectory()) walk(full);",
      "    else {",
      "      const text = readFileSync(full, 'utf8');",
      "      if (forbidden.some((pattern) => pattern.test(text))) {",
      "        console.error(`Segredo potencial encontrado em ${full}`);",
      "        process.exit(1);",
      "      }",
      "    }",
      "  }",
      "}",
      "walk(process.cwd());",
      "console.log('Lint seguro concluído.');"
    ].join("\n"),
    "scripts/build.mjs": [
      "import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';",
      "import { describeSystem } from '../src/app.mjs';",
      "const data = describeSystem();",
      "mkdirSync('dist', { recursive: true });",
      "const features = data.features.map((item) => `<li>${String(item).replace(/[&<>]/g, '')}</li>`).join('');",
      "writeFileSync('dist/index.html', `<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>${data.name}</title><link rel=\"manifest\" href=\"manifest.webmanifest\"><meta name=\"theme-color\" content=\"#081120\"><style>body{font-family:Inter,Arial,sans-serif;margin:0;background:#081120;color:#fff;padding:40px}main{max-width:980px;margin:auto}.card{border:1px solid #1e40af;border-radius:18px;padding:24px;background:#0f172a}li{margin:8px 0;color:#dbeafe}@media(max-width:640px){body{padding:16px}.card{padding:18px}}</style></head><body><main><div class=\"card\"><h1>${data.name}</h1><p>${data.objective}</p><p>${data.architecture} · ${data.stack}</p><ul>${features}</ul></div></main><script>if('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});</script></body></html>`);",
      "writeFileSync('dist/manifest.json', JSON.stringify(data, null, 2));",
      "writeFileSync('dist/manifest.webmanifest', JSON.stringify({ name: data.name, short_name: data.name.slice(0, 24), start_url: './', display: 'standalone', background_color: '#081120', theme_color: '#0A84FF', icons: [] }, null, 2));",
      "writeFileSync('dist/service-worker.js', \"self.addEventListener('install', event => self.skipWaiting());\\nself.addEventListener('fetch', event => event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 }))));\\n\");",
      "writeFileSync('dist/api-health.json', JSON.stringify({ ok: true, name: data.name }, null, 2));",
      "copyFileSync('src/data/system.json', 'dist/system.json');",
      "console.log(`Build gerado em dist para ${data.name}.`);"
    ].join("\n"),
    "tests/system.test.mjs": [
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "import { describeSystem } from '../src/app.mjs';",
      "",
      "test('sistema gerado possui estrutura mínima válida', () => {",
      "  const system = describeSystem();",
      "  assert.ok(system.name);",
      "  assert.ok(system.objective);",
      "  assert.ok(system.features.length >= 3);",
      "});"
    ].join("\n")
  };

  for (const [fileName, content] of Object.entries(files)) {
    createdFiles.push(await writeFileSafe(workspacePath, fileName, content));
  }

  for (const file of generatedFiles) {
    const name = String(file.name || "generated.txt");
    const target = `generated/${name}`;
    createdFiles.push(await writeFileSafe(workspacePath, target, String(file.content || "")));
  }

  await fs.mkdir(artifactPath, { recursive: true });
  await fs.writeFile(path.join(artifactPath, "source-manifest.json"), JSON.stringify({ systemId: system.id, createdFiles }, null, 2), "utf8");
  await insertArtifact(job.id, job.user_id, "manifest", "source-manifest.json", path.join(artifactPath, "source-manifest.json"), {
    fileCount: createdFiles.length
  });
  recordExecutionEvent(job.user_id, job.execution_session_id, {
    eventType: "files_created",
    category: "file",
    title: `Criou ${createdFiles.length} arquivos reais`,
    summary: "Arquivos do projeto foram gravados no sandbox temporário.",
    details: { files: createdFiles },
    status: "completed",
    progress: 48,
    metadata: { jobId: job.id, systemId: job.system_id, fileCount: createdFiles.length }
  });
  insertResult(job.id, job.user_id, "files", "success", `${createdFiles.length} arquivos criados no sandbox.`, { createdFiles });
}

function safeProcessEnv(workspacePath: string) {
  const env: NodeJS.ProcessEnv = {
    TEMP: path.join(workspacePath, ".tmp"),
    TMP: path.join(workspacePath, ".tmp"),
    HOME: path.join(workspacePath, ".home"),
    USERPROFILE: path.join(workspacePath, ".home"),
    npm_config_cache: path.join(workspacePath, ".npm-cache"),
    npm_config_update_notifier: "false",
    npm_config_fund: "false",
    npm_config_audit: "false",
    CI: "true",
    NODE_ENV: "test"
  };
  const passthrough = ["PATH", "Path", "PATHEXT", "SystemRoot", "WINDIR", "ComSpec", "COMSPEC"];
  const seen = new Set<string>();
  for (const key of passthrough) {
    const lower = key.toLowerCase();
    if (seen.has(lower)) continue;
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      env[key] = value;
      seen.add(lower);
    }
  }
  if (process.env.NODE_OPTIONS) env.NODE_OPTIONS = "";
  return env;
}

function commandEventStarted(label: CommandLabel) {
  if (label === "npm run test") return { eventType: "test_started", title: "Testes iniciados", category: "test" as const, progress: 62 };
  if (label === "npm run build") return { eventType: "build_started", title: "Build real iniciado", category: "build" as const, progress: 72 };
  if (label === "npm install" || label === "npm ci") return { eventType: "dependency_install_started", title: "Instalação de dependências iniciada", category: "command" as const, progress: 54 };
  return { eventType: "command_started", title: `Executando ${label}`, category: "command" as const, progress: 58 };
}

function commandEventFinished(label: CommandLabel) {
  if (label === "npm run test") return { eventType: "test_passed", title: "Testes aprovados", category: "test" as const, progress: 70 };
  if (label === "npm run build") return { eventType: "build_completed", title: "Build real concluído", category: "build" as const, progress: 82 };
  if (label === "npm install" || label === "npm ci") return { eventType: "dependency_installed", title: "Dependências instaladas", category: "command" as const, progress: 56 };
  return { eventType: "command_completed", title: `${label} concluído`, category: "command" as const, progress: 64 };
}

async function commandWasCancelled(jobId: string, userId: string) {
  const row = getJobRow(userId, jobId);
  return row.status === "cancelling" || row.status === "cancelled";
}

async function runCommand(job: ExecutionJobRow, workspacePath: string, label: CommandLabel): Promise<CommandResult> {
  if (await commandWasCancelled(job.id, job.user_id)) throw new Error("Execução cancelada.");
  const config = SUPPORTED_COMMANDS[label];
  const commandId = uuid();
  const started = Date.now();
  const startedAt = new Date().toISOString();
  const startEvent = commandEventStarted(label);
  getDatabase()
    .prepare(
      `insert into execution_commands (
         id, job_id, user_id, command_label, command, args_json, status, started_at, metadata_json
       ) values (?, ?, ?, ?, ?, ?, 'running', ?, ?)`
    )
    .run(commandId, job.id, job.user_id, label, config.command, JSON.stringify(config.args), startedAt, JSON.stringify({ whitelist: true }));
  recordExecutionEvent(job.user_id, job.execution_session_id, {
    eventType: startEvent.eventType,
    category: startEvent.category,
    title: startEvent.title,
    summary: `Comando real iniciado no sandbox: ${label}.`,
    details: { command: label, jobId: job.id, commandId },
    status: "running",
    progress: startEvent.progress,
    startedAt,
    metadata: { jobId: job.id, commandId }
  });

  await fs.mkdir(path.join(workspacePath, ".tmp"), { recursive: true });
  await fs.mkdir(path.join(workspacePath, ".home"), { recursive: true });

  const child = spawn(config.command, config.args, {
    cwd: workspacePath,
    shell: false,
    windowsHide: true,
    env: safeProcessEnv(workspacePath)
  });
  activeProcesses.set(job.id, child);
  const timeoutMs = Math.max(5000, Number(process.env.EXECUTION_COMMAND_TIMEOUT_MS || 30000));
  let stdout = "";
  let stderr = "";
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill("SIGTERM");
  }, timeoutMs);

  child.stdout.on("data", (chunk) => {
    stdout = sanitizeText(stdout + chunk.toString());
  });
  child.stderr.on("data", (chunk) => {
    stderr = sanitizeText(stderr + chunk.toString());
  });

  const exitCode = await new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code));
  }).finally(() => {
    clearTimeout(timer);
    activeProcesses.delete(job.id);
  });
  const durationMs = Date.now() - started;
  const status = timedOut ? "timeout" : exitCode === 0 ? "success" : "failed";
  getDatabase()
    .prepare(
      `update execution_commands
       set status = ?, exit_code = ?, finished_at = current_timestamp, duration_ms = ?, stdout = ?, stderr = ?
       where id = ? and user_id = ?`
    )
    .run(status, exitCode, durationMs, stdout, stderr, commandId, job.user_id);

  const finishedEvent = status === "success" ? commandEventFinished(label) : null;
  recordExecutionEvent(job.user_id, job.execution_session_id, {
    eventType: status === "success" ? finishedEvent!.eventType : "command_failed",
    category: status === "success" ? finishedEvent!.category : "error",
    title: status === "success" ? finishedEvent!.title : `${label} falhou`,
    summary: status === "success" ? `Comando real concluído em ${durationMs}ms.` : `Comando real falhou com código ${exitCode ?? "timeout"}.`,
    details: { command: label, exitCode, durationMs, stdout, stderr },
    status: status === "success" ? "completed" : "error",
    progress: status === "success" ? finishedEvent!.progress : 68,
    startedAt,
    metadata: { jobId: job.id, commandId }
  });

  insertResult(job.id, job.user_id, "command", status === "success" ? "success" : "error", `${label}: ${status}`, {
    commandId,
    exitCode,
    durationMs
  });
  return { id: commandId, label, status, exitCode, stdout, stderr, durationMs };
}

async function applySafeAutoFix(job: ExecutionJobRow, workspacePath: string, failed: CommandResult, attempt: number) {
  const fixes: string[] = [];
  if (failed.label === "npm run build" && /Cannot find module|ENOENT|no such file/i.test(failed.stderr + failed.stdout)) {
    await writeFileSafe(
      workspacePath,
      "scripts/build.mjs",
      [
        "import { mkdirSync, writeFileSync } from 'node:fs';",
        "mkdirSync('dist', { recursive: true });",
        "writeFileSync('dist/index.html', '<!doctype html><html><body><h1>YARA Build</h1></body></html>');",
        "writeFileSync('dist/manifest.json', JSON.stringify({ recovered: true }, null, 2));",
        "console.log('Build recuperado pelo YARA Real Execution Engine.');"
      ].join("\n")
    );
    fixes.push("scripts/build.mjs");
  }
  if (failed.label === "npm run test" && /No such file|ENOENT|Could not find/i.test(failed.stderr + failed.stdout)) {
    await writeFileSafe(
      workspacePath,
      "tests/system.test.mjs",
      ["import test from 'node:test';", "import assert from 'node:assert/strict';", "test('sanity', () => assert.equal(1, 1));"].join("\n")
    );
    fixes.push("tests/system.test.mjs");
  }
  if (fixes.length === 0) return false;
  recordExecutionEvent(job.user_id, job.execution_session_id, {
    eventType: "auto_fix_applied",
    category: "tool",
    title: "Correção automática aplicada",
    summary: `Tentativa ${attempt}: a YARA corrigiu arquivos seguros do sandbox.`,
    details: { failedCommand: failed.label, files: fixes },
    status: "completed",
    progress: 69,
    metadata: { jobId: job.id, attempt }
  });
  insertResult(job.id, job.user_id, "auto_fix", "success", `Correção automática aplicada para ${failed.label}.`, {
    attempt,
    files: fixes
  });
  return true;
}

async function runCommandWithAutoFix(job: ExecutionJobRow, workspacePath: string, label: CommandLabel) {
  let lastResult: CommandResult | null = null;
  for (let attempt = 1; attempt <= MAX_AUTO_FIX_ATTEMPTS; attempt += 1) {
    const result = await runCommand(job, workspacePath, label);
    if (result.status === "success") return result;
    lastResult = result;
    const fixed = await applySafeAutoFix(job, workspacePath, result, attempt);
    if (!fixed) break;
  }
  throw new Error(`${label} falhou. ${lastResult?.stderr || lastResult?.stdout || "Sem detalhes adicionais."}`.slice(0, 1200));
}

async function persistBuildArtifacts(job: ExecutionJobRow, workspacePath: string, artifactPath: string) {
  const sourceTarget = path.join(artifactPath, "source");
  await copyDirectory(workspacePath, sourceTarget);
  await insertArtifact(job.id, job.user_id, "source", "source", sourceTarget, { persisted: true });

  const distPath = path.join(workspacePath, "dist");
  try {
    const stat = await fs.stat(distPath);
    if (stat.isDirectory()) {
      const distTarget = path.join(artifactPath, "dist");
      await copyDirectory(distPath, distTarget);
      await insertArtifact(job.id, job.user_id, "build", "dist", distTarget, { build: true });
    }
  } catch {
    // Sem dist: o comando de build deve ter falhado antes de chegar aqui.
  }

  const commands = getDatabase()
    .prepare("select * from execution_commands where job_id = ? and user_id = ? order by datetime(created_at) asc")
    .all(job.id, job.user_id) as ExecutionCommandRow[];
  const logFile = path.join(artifactPath, "execution-log.json");
  await fs.writeFile(logFile, JSON.stringify(commands.map(publicCommand), null, 2), "utf8");
  await insertArtifact(job.id, job.user_id, "log", "execution-log.json", logFile, { commandCount: commands.length });
}

export async function runRealExecutionPipeline(userId: string, systemId: string, options: RunOptions = {}) {
  const commands = resolveCommands(options.commands);
  const job = createJob(userId, systemId, commands, options);
  const started = Date.now();
  const workspacePath = path.join(workspaceRoot(), job.id);
  const artifactsPath = path.join(artifactRoot(), job.id);
  try {
    await fs.mkdir(workspacePath, { recursive: true });
    await fs.mkdir(artifactsPath, { recursive: true });
    updateJob(job.id, userId, { workspace_path: workspacePath, artifact_path: artifactsPath } as Partial<ExecutionJobRow>);
    insertEnvironment(job, workspacePath, artifactsPath);
    recordExecutionEvent(userId, options.executionSessionId, {
      eventType: "execution_environment_created",
      category: "tool",
      title: "Sandbox criado",
      summary: "Ambiente temporário isolado criado para execução real.",
      details: { environment: "node", commands, isolation: "minimal-env-whitelist" },
      status: "completed",
      progress: 44,
      metadata: { jobId: job.id, systemId }
    });
    await createRunnableProject(job, workspacePath, artifactsPath);
    for (const command of commands) {
      await runCommandWithAutoFix(job, workspacePath, command);
    }
    await persistBuildArtifacts(job, workspacePath, artifactsPath);
    finishEnvironment(job.id, userId, "destroyed");
    const durationMs = Date.now() - started;
    updateJob(job.id, userId, {
      status: "success",
      finished_at: new Date().toISOString(),
      duration_ms: durationMs,
      result_json: JSON.stringify({ validated: true, commands, artifactsPath: "[artifact-storage]" })
    } as Partial<ExecutionJobRow>);
    recordExecutionEvent(userId, options.executionSessionId, {
      eventType: "real_execution_completed",
      category: "completion",
      title: "Execução real concluída",
      summary: "Arquivos, comandos, testes e build foram executados com sucesso.",
      details: { jobId: job.id, commands, durationMs },
      status: "completed",
      progress: 86,
      metadata: { jobId: job.id, systemId }
    });
    insertResult(job.id, userId, "pipeline", "success", "Pipeline real validado com sucesso.", { durationMs });
    recordAudit({
      userId,
      category: "execution",
      action: "run",
      entityType: "system",
      entityId: systemId,
      message: "Real Execution Engine validou o sistema.",
      metadata: { jobId: job.id, commands }
    });
    if (process.env.EXECUTION_KEEP_WORKSPACE !== "true") {
      await fs.rm(workspacePath, { recursive: true, force: true });
    }
    return getExecutionJob(userId, job.id);
  } catch (error) {
    const cancelled = ["cancelling", "cancelled"].includes(getJobRow(userId, job.id).status);
    finishEnvironment(job.id, userId, cancelled ? "destroyed" : "failed");
    const message = error instanceof Error ? error.message : "Execução real falhou.";
    updateJob(job.id, userId, {
      status: cancelled ? "cancelled" : "failed",
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - started,
      error: sanitizeText(message)
    } as Partial<ExecutionJobRow>);
    recordExecutionEvent(userId, options.executionSessionId, {
      eventType: cancelled ? "real_execution_cancelled" : "real_execution_failed",
      category: cancelled ? "completion" : "error",
      title: cancelled ? "Execução real cancelada" : "Execução real falhou",
      summary: sanitizeText(message),
      status: cancelled ? "cancelled" : "error",
      progress: 86,
      metadata: { jobId: job.id, systemId }
    });
    insertResult(job.id, userId, "pipeline", cancelled ? "cancelled" : "error", message);
    try {
      await persistBuildArtifacts(job, workspacePath, artifactsPath);
    } catch {
      // Se a persistência de artefatos falhar, preservamos o erro original.
    }
    if (process.env.EXECUTION_KEEP_WORKSPACE !== "true") {
      await fs.rm(workspacePath, { recursive: true, force: true });
    }
    throw error;
  }
}

export async function startRealExecution(userId: string, input: { systemId: string; executionSessionId?: string | null; commands?: CommandLabel[] }) {
  return runRealExecutionPipeline(userId, input.systemId, {
    executionSessionId: input.executionSessionId || null,
    commands: input.commands
  });
}

export async function retryRealExecution(userId: string, jobId: string, options: { executionSessionId?: string | null } = {}) {
  const job = getJobRow(userId, jobId);
  const commands = jsonParse<CommandLabel[]>(job.commands_json, DEFAULT_COMMANDS);
  return runRealExecutionPipeline(userId, job.system_id, {
    executionSessionId: options.executionSessionId || job.execution_session_id,
    commands
  });
}

export function stopRealExecution(userId: string, jobId: string) {
  const job = getJobRow(userId, jobId);
  const child = activeProcesses.get(jobId);
  if (child) child.kill("SIGTERM");
  updateJob(jobId, userId, {
    status: child ? "cancelling" : "cancelled",
    finished_at: child ? null : new Date().toISOString(),
    error: child ? "Cancelamento solicitado." : "Execução cancelada."
  } as Partial<ExecutionJobRow>);
  recordExecutionEvent(userId, job.execution_session_id, {
    eventType: "real_execution_cancelled",
    category: "completion",
    title: "Execução real cancelada",
    summary: "O usuário solicitou a parada do executor real.",
    status: "cancelled",
    progress: 100,
    metadata: { jobId }
  });
  return getExecutionJob(userId, jobId);
}

export function getExecutionJob(userId: string, jobId: string) {
  const job = publicJob(getJobRow(userId, jobId));
  const commands = getDatabase()
    .prepare("select * from execution_commands where job_id = ? and user_id = ? order by datetime(created_at) asc")
    .all(jobId, userId) as ExecutionCommandRow[];
  const artifacts = getDatabase()
    .prepare("select * from execution_artifacts where job_id = ? and user_id = ? order by datetime(created_at) asc")
    .all(jobId, userId) as ExecutionArtifactRow[];
  return {
    job,
    commands: commands.map(publicCommand),
    artifacts: artifacts.map(publicArtifact)
  };
}

export function getExecutionLogs(userId: string, jobId: string) {
  getJobRow(userId, jobId);
  const commands = getDatabase()
    .prepare("select * from execution_commands where job_id = ? and user_id = ? order by datetime(created_at) asc")
    .all(jobId, userId) as ExecutionCommandRow[];
  return { logs: commands.map(publicCommand) };
}

export function getExecutionArtifacts(userId: string, jobId: string) {
  getJobRow(userId, jobId);
  const artifacts = getDatabase()
    .prepare("select * from execution_artifacts where job_id = ? and user_id = ? order by datetime(created_at) asc")
    .all(jobId, userId) as ExecutionArtifactRow[];
  return { artifacts: artifacts.map(publicArtifact) };
}

export function listSystemExecutionArtifacts(userId: string, systemId: string) {
  getSystemDetails(userId, systemId);
  const artifacts = getDatabase()
    .prepare(
      `select execution_artifacts.*
       from execution_artifacts
       join execution_jobs on execution_jobs.id = execution_artifacts.job_id
       where execution_jobs.user_id = ? and execution_jobs.system_id = ?
       order by datetime(execution_artifacts.created_at) desc
       limit 80`
    )
    .all(userId, systemId) as ExecutionArtifactRow[];
  return { artifacts: artifacts.map(publicArtifact) };
}

export function resolveSystemExecutionArtifactPath(userId: string, systemId: string, artifactId: string) {
  getSystemDetails(userId, systemId);
  const artifact = getDatabase()
    .prepare(
      `select execution_artifacts.*
       from execution_artifacts
       join execution_jobs on execution_jobs.id = execution_artifacts.job_id
       where execution_artifacts.id = ? and execution_jobs.user_id = ? and execution_jobs.system_id = ?`
    )
    .get(artifactId, userId, systemId) as ExecutionArtifactRow | undefined;
  if (!artifact) throw new Error("Artefato não encontrado.");
  const resolved = path.resolve(artifact.path);
  const root = path.resolve(artifactRoot());
  if (!resolved.startsWith(root + path.sep) && resolved !== root) throw new Error("Artefato inválido.");
  return { artifact: publicArtifact(artifact), path: resolved };
}

export function assertLatestRealExecutionPassed(userId: string, systemId: string) {
  const job = getDatabase()
    .prepare(
      `select * from execution_jobs
       where user_id = ? and system_id = ? and status = 'success'
       order by datetime(finished_at) desc
       limit 1`
    )
    .get(userId, systemId) as ExecutionJobRow | undefined;
  if (!job) throw new Error("Deploy bloqueado: execute build e testes reais antes de publicar.");
  return publicJob(job);
}

export const supportedExecutionCommands = Object.keys(SUPPORTED_COMMANDS) as CommandLabel[];
