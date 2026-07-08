import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "../config/env";

let instance: DatabaseSync | null = null;

function isPostgresUrl(url: string) {
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export function getDatabaseInfo() {
  const url = env.databaseUrl;

  if (isPostgresUrl(url)) {
    return {
      type: "postgres" as const,
      url,
      sqlitePath: null as string | null,
      absolutePath: null as string | null
    };
  }

  if (url.startsWith("sqlite:")) {
    const sqlitePath = url.replace("sqlite:", "");
    return {
      type: "sqlite" as const,
      url,
      sqlitePath,
      absolutePath: path.isAbsolute(sqlitePath) ? sqlitePath : path.resolve(process.cwd(), sqlitePath)
    };
  }

  if (url.endsWith(".sqlite") || url.endsWith(".db")) {
    return {
      type: "sqlite" as const,
      url,
      sqlitePath: url,
      absolutePath: path.isAbsolute(url) ? url : path.resolve(process.cwd(), url)
    };
  }

  return {
    type: "invalid" as const,
    url,
    sqlitePath: null as string | null,
    absolutePath: null as string | null
  };
}

export function getDatabase() {
  if (instance) {
    return instance;
  }

  const info = getDatabaseInfo();

  if (info.type === "postgres") {
    throw new Error(
      "DATABASE_URL PostgreSQL detectado. Este build da YARA ainda usa o adaptador SQLite síncrono. Use DATABASE_URL=sqlite:/data/yara.sqlite com Persistent Disk no Render até a migração de adapter PostgreSQL ser concluída."
    );
  }

  if (info.type !== "sqlite" || !info.absolutePath) {
    throw new Error("DATABASE_URL inválido. Use sqlite:/data/yara.sqlite no Render ou sqlite:./data/yara.sqlite no desenvolvimento local.");
  }

  fs.mkdirSync(path.dirname(info.absolutePath), { recursive: true });

  instance = new DatabaseSync(info.absolutePath);
  instance.exec("pragma journal_mode = WAL");
  instance.exec("pragma foreign_keys = ON");

  return instance;
}

export function checkDatabase() {
  const db = getDatabase();
  const result = db.prepare("select 1 as ok").get() as { ok: number };
  return result.ok === 1;
}

export function closeDatabase() {
  if (!instance) return;
  instance.close();
  instance = null;
}
