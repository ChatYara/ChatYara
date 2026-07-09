import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { getDatabase, getDatabaseInfo } from "../db/connection";

type PreMigrationSnapshot = {
  id: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  createdAt: string;
} | null;

function backupRoot() {
  const configured = process.env.BACKUP_DIR?.trim();
  if (configured) return path.resolve(configured);

  const info = getDatabaseInfo();
  if (info.type === "sqlite" && info.absolutePath && isPersistentSqlitePath(info.absolutePath)) {
    return path.join(path.dirname(info.absolutePath), "backups");
  }

  return path.resolve(__dirname, "..", "..", "backups");
}

function renderPersistentRoots() {
  return [process.env.RENDER_DISK_MOUNT_PATH, process.env.PERSISTENT_DATA_DIR, "/data"]
    .filter((item): item is string => Boolean(item && item.trim()))
    .map((item) => path.resolve(item));
}

function isExplicitRenderPersistentSqliteUrl(url: string) {
  return url.startsWith("sqlite:/data/") || url === "sqlite:/data";
}

function isPathInside(target: string, root: string) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function isPersistentSqlitePath(absolutePath: string) {
  if (process.env.RENDER) {
    return renderPersistentRoots().some((root) => isPathInside(absolutePath, root));
  }

  const tempRoot = path.resolve(os.tmpdir());
  return !isPathInside(absolutePath, tempRoot);
}

export function validatePersistenceConfiguration() {
  const info = getDatabaseInfo();
  const errors: string[] = [];
  const roots = renderPersistentRoots();
  const explicitPersistentSqlite = info.type === "sqlite" && isExplicitRenderPersistentSqliteUrl(info.url);
  console.log(`Persistence check: DATABASE_URL original=${databaseUrlForLog(process.env.DATABASE_URL?.trim() || "")}`);
  console.log(`Persistence check: using DATABASE_URL=${databaseUrlForLog(info.url)}`);
  console.log(`Persistence check: sqlitePath=${info.sqlitePath || "(none)"}`);
  console.log(`Persistence check: resolvedPath=${info.absolutePath || "(none)"}`);
  console.log(`Persistence check: mountPaths=${roots.join(",") || "(none)"}`);
  console.log(`Persistence check: env=${JSON.stringify({ render: Boolean(process.env.RENDER), nodeEnv: process.env.NODE_ENV || "", cwd: process.cwd() })}`);

  if (info.type === "missing") {
    errors.push("DATABASE_URL não foi configurado. No Render configure DATABASE_URL=sqlite:/data/yara.sqlite.");
  }

  if (info.type === "invalid") {
    errors.push("DATABASE_URL inválido. Use sqlite:/data/yara.sqlite no Render ou sqlite:./data/yara.sqlite localmente.");
  }

  if (info.type === "postgres") {
    errors.push(
      "DATABASE_URL PostgreSQL foi configurado, mas o adapter atual ainda é SQLite. Para não perder dados agora, configure DATABASE_URL=sqlite:/data/yara.sqlite com Persistent Disk no Render."
    );
  }

  if (
    info.type === "sqlite" &&
    info.absolutePath &&
    process.env.RENDER &&
    !explicitPersistentSqlite &&
    !isPersistentSqlitePath(info.absolutePath)
  ) {
    errors.push(
      `SQLite em caminho efêmero detectado no Render (${info.absolutePath}). Configure um Persistent Disk montado em /data e use DATABASE_URL=sqlite:/data/yara.sqlite.`
    );
  }

  if (process.env.RENDER && (!env.jwtSecret || env.jwtSecret.length < 32)) {
    errors.push("JWT_SECRET em produção deve ser fixo no Render e ter pelo menos 32 caracteres.");
  }

  if (errors.length) {
    throw new Error(["Persistência insegura da YARA AI detectada.", ...errors].join("\n"));
  }
}

function databaseUrlForLog(url: string) {
  if (!url) return "(missing)";

  try {
    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      const parsed = new URL(url);
      if (parsed.password) parsed.password = "***";
      return parsed.toString();
    }
  } catch {
    return "(invalid)";
  }

  return url;
}

function fileSize(target: string) {
  return fs.existsSync(target) ? fs.statSync(target).size : 0;
}

export function createPreMigrationSnapshot(): PreMigrationSnapshot {
  const info = getDatabaseInfo();
  if (info.type !== "sqlite" || !info.absolutePath || !fs.existsSync(info.absolutePath)) return null;

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const safeDate = createdAt.replace(/[:.]/g, "-");
  const fileName = `pre-migration-${safeDate}`;
  const storagePath = path.join(backupRoot(), fileName);
  const databaseDir = path.join(storagePath, "database");

  fs.mkdirSync(databaseDir, { recursive: true });
  const baseName = path.basename(info.absolutePath);
  fs.copyFileSync(info.absolutePath, path.join(databaseDir, baseName));

  for (const suffix of ["-wal", "-shm"]) {
    const source = `${info.absolutePath}${suffix}`;
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(databaseDir, `${baseName}${suffix}`));
  }

  const manifest = {
    id,
    type: "pre_migration",
    createdAt,
    database: {
      type: "sqlite",
      fileName: baseName,
      persistent: isPersistentSqlitePath(info.absolutePath)
    },
    excluded: [".env", "tokens", "secrets", "password_hash"]
  };
  fs.writeFileSync(path.join(storagePath, "manifest.json"), JSON.stringify(manifest, null, 2));

  const size = fileSize(path.join(databaseDir, baseName)) + fileSize(`${path.join(databaseDir, baseName)}-wal`) + fileSize(`${path.join(databaseDir, baseName)}-shm`);
  return { id, fileName, storagePath, fileSize: size, createdAt };
}

export function registerPreMigrationSnapshot(snapshot: PreMigrationSnapshot) {
  if (!snapshot) return;

  try {
    getDatabase()
      .prepare(
        `insert into backups (id, user_id, type, status, file_name, file_size, storage_path, metadata_json)
         values (?, null, 'automatic', 'completed', ?, ?, ?, ?)`
      )
      .run(
        snapshot.id,
        snapshot.fileName,
        snapshot.fileSize,
        snapshot.storagePath,
        JSON.stringify({ reason: "pre_migration", safe: true })
      );

    getDatabase()
      .prepare("insert into application_logs (id, level, channel, message, context_json) values (?, 'info', 'migration', ?, ?)")
      .run(randomUUID(), "Backup pré-migração criado.", JSON.stringify({ backupId: snapshot.id, size: snapshot.fileSize }));
  } catch {
    // Migration backups must not break a schema update after the snapshot is already written.
  }
}

function countUsers() {
  try {
    return Number((getDatabase().prepare("select count(*) as total from users").get() as { total: number } | undefined)?.total || 0);
  } catch {
    return 0;
  }
}

function lastBackup() {
  try {
    const row = getDatabase()
      .prepare("select id, type, status, file_name, file_size, created_at from backups order by created_at desc limit 1")
      .get() as Record<string, unknown> | undefined;
    return row || null;
  } catch {
    return null;
  }
}

export function getPersistenceHealth() {
  const info = getDatabaseInfo();
  const sqlitePersistent = info.type === "sqlite" && info.absolutePath ? isPersistentSqlitePath(info.absolutePath) : false;
  const unsupportedPostgres = info.type === "postgres";

  return {
    database: {
      type: info.type,
      configured: Boolean(process.env.DATABASE_URL?.trim()),
      sqlitePath: info.type === "sqlite" ? info.absolutePath : null,
      persistent: info.type === "sqlite" ? sqlitePersistent : false,
      status: unsupportedPostgres ? "unsupported" : sqlitePersistent ? "persistent" : "ephemeral",
      warning: unsupportedPostgres
        ? "PostgreSQL está configurado, mas o adapter atual ainda é SQLite."
        : info.type === "sqlite" && !sqlitePersistent
          ? "SQLite não está em caminho persistente para produção Render."
          : null
    },
    auth: {
      jwtSecretConfigured: Boolean(env.jwtSecret),
      jwtSecretStrong: env.jwtSecret.length >= 32,
      passwordHashing: "bcrypt"
    },
    totals: {
      users: countUsers()
    },
    backup: {
      directory: backupRoot(),
      lastBackup: lastBackup()
    }
  };
}
