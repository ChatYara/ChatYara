import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "../config/env";

let instance: DatabaseSync | null = null;

function resolveDatabasePath() {
  const url = env.databaseUrl;

  if (url.startsWith("sqlite:")) {
    return url.replace("sqlite:", "");
  }

  if (url.endsWith(".sqlite") || url.endsWith(".db")) {
    return url;
  }

  throw new Error("DATABASE_URL invalido. Este starter usa SQLite. Exemplo: sqlite:./data/yara.sqlite");
}

export function getDatabase() {
  if (instance) {
    return instance;
  }

  const databasePath = resolveDatabasePath();
  const absolutePath = path.isAbsolute(databasePath)
    ? databasePath
    : path.resolve(process.cwd(), databasePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

  instance = new DatabaseSync(absolutePath);
  instance.exec("pragma journal_mode = WAL");
  instance.exec("pragma foreign_keys = ON");

  return instance;
}

export function checkDatabase() {
  const db = getDatabase();
  const result = db.prepare("select 1 as ok").get() as { ok: number };
  return result.ok === 1;
}
