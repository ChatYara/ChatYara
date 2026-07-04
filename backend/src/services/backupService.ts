import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";
import { recordAudit } from "./auditService";
import { structuredLog } from "./loggerService";

let backupSchedulerStarted = false;

function backupDir() {
  const configured = process.env.BACKUP_DIR?.trim();
  return configured ? path.resolve(configured) : path.resolve(__dirname, "..", "..", "backups");
}

function sqlitePath() {
  if (!env.databaseUrl.startsWith("sqlite:")) return null;
  const value = env.databaseUrl.replace(/^sqlite:/, "");
  return path.resolve(__dirname, "..", "..", value);
}

function directorySize(target: string): number {
  if (!fs.existsSync(target)) return 0;
  const stat = fs.statSync(target);
  if (stat.isFile()) return stat.size;
  return fs.readdirSync(target).reduce((sum, item) => sum + directorySize(path.join(target, item)), 0);
}

function copyDirectory(source: string, target: string) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(target, { recursive: true });
  for (const item of fs.readdirSync(source)) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) copyDirectory(sourcePath, targetPath);
    else fs.copyFileSync(sourcePath, targetPath);
  }
}

function copySafeConfigFiles(targetRoot: string) {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const configRoot = path.join(targetRoot, "config");
  const safeFiles = ["package.json", ".env.example", "render.yaml", "backend/package.json", "backend/tsconfig.json"];
  for (const relative of safeFiles) {
    const source = path.join(repoRoot, relative);
    if (!fs.existsSync(source)) continue;
    const target = path.join(configRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

export function createBackup(userId: string | null, type: "manual" | "automatic" = "manual") {
  const id = uuid();
  const created = new Date().toISOString().replace(/[:.]/g, "-");
  const name = `yara-backup-${created}`;
  const root = path.join(backupDir(), name);
  fs.mkdirSync(root, { recursive: true });

  const dbPath = sqlitePath();
  if (dbPath && fs.existsSync(dbPath)) {
    fs.mkdirSync(path.join(root, "database"), { recursive: true });
    fs.copyFileSync(dbPath, path.join(root, "database", path.basename(dbPath)));
    for (const suffix of ["-wal", "-shm"]) {
      if (fs.existsSync(`${dbPath}${suffix}`)) fs.copyFileSync(`${dbPath}${suffix}`, path.join(root, "database", `${path.basename(dbPath)}${suffix}`));
    }
  }

  const uploadRoot = env.uploadDir ? path.resolve(env.uploadDir) : path.resolve(__dirname, "..", "..", "uploads");
  const imageRoot = env.imageDir ? path.resolve(env.imageDir) : path.resolve(__dirname, "..", "..", "images");
  const filesRoot = process.env.FILES_DIR?.trim() ? path.resolve(process.env.FILES_DIR) : path.resolve(__dirname, "..", "..", "files");
  copyDirectory(uploadRoot, path.join(root, "uploads"));
  copyDirectory(imageRoot, path.join(root, "images"));
  copyDirectory(filesRoot, path.join(root, "files"));
  copySafeConfigFiles(root);

  fs.writeFileSync(
    path.join(root, "manifest.json"),
    JSON.stringify(
      {
        id,
        name,
        createdAt: new Date().toISOString(),
        host: os.hostname(),
        database: dbPath ? "sqlite" : "external",
        included: ["database", "uploads", "images", "files", "safe-config", "manifest"],
        excluded: [".env", "tokens", "secrets"]
      },
      null,
      2
    )
  );

  const size = directorySize(root);
  getDatabase()
    .prepare(
      `insert into backups (id, user_id, type, status, file_name, file_size, storage_path, metadata_json)
       values (?, ?, ?, 'completed', ?, ?, ?, ?)`
    )
    .run(id, userId, type, name, size, root, JSON.stringify({ database: dbPath ? "sqlite" : "external" }));

  recordAudit({
    userId,
    category: "backup",
    action: "create",
    entityType: "backup",
    entityId: id,
    message: "Backup criado.",
    metadata: { type, size }
  });

  return { id, type, status: "completed", fileName: name, fileSize: size, createdAt: new Date().toISOString() };
}

export function listBackups() {
  return getDatabase()
    .prepare("select id, user_id, type, status, file_name, file_size, created_at from backups order by created_at desc limit 50")
    .all();
}

function lastAutomaticBackupAt() {
  const row = getDatabase()
    .prepare("select created_at from backups where type = 'automatic' and status = 'completed' order by created_at desc limit 1")
    .get() as { created_at: string } | undefined;
  return row?.created_at ? new Date(row.created_at).getTime() : 0;
}

export function runAutomaticBackupIfDue() {
  const dayMs = 24 * 60 * 60 * 1000;
  if (Date.now() - lastAutomaticBackupAt() < dayMs) return { skipped: true };
  try {
    const backup = createBackup(null, "automatic");
    structuredLog("info", "backup", "Backup automático criado.", { backupId: backup.id, size: backup.fileSize });
    return { skipped: false, backup };
  } catch (error) {
    structuredLog("error", "backup", "Falha ao criar backup automático.", {
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
    return { skipped: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

export function startBackupScheduler() {
  if (backupSchedulerStarted) return;
  backupSchedulerStarted = true;
  runAutomaticBackupIfDue();
  const timer = setInterval(runAutomaticBackupIfDue, 60 * 60 * 1000);
  if (typeof timer.unref === "function") timer.unref();
}

export function getBackupForDownload(id: string) {
  const row = getDatabase()
    .prepare("select id, file_name, storage_path from backups where id = ?")
    .get(id) as { id: string; file_name: string; storage_path: string } | undefined;
  if (!row || !fs.existsSync(row.storage_path)) throw new Error("Backup não encontrado.");
  return row;
}

export function cleanupTemporaryData() {
  const targets = [
    path.resolve(__dirname, "..", "..", "tmp"),
    path.resolve(__dirname, "..", "..", "cache")
  ];
  let removed = 0;
  for (const target of targets) {
    if (!fs.existsSync(target)) continue;
    fs.rmSync(target, { recursive: true, force: true });
    removed += 1;
  }
  return { removed };
}
