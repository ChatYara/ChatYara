import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env";
import { getDatabase } from "../db/connection";
import { getIntegrationStatus } from "./integrationService";

function count(sql: string) {
  try {
    return Number((getDatabase().prepare(sql).get() as { total: number } | undefined)?.total || 0);
  } catch {
    return 0;
  }
}

function dirSize(target: string): number {
  if (!fs.existsSync(target)) return 0;
  const stat = fs.statSync(target);
  if (stat.isFile()) return stat.size;
  return fs.readdirSync(target).reduce((sum, item) => sum + dirSize(path.join(target, item)), 0);
}

function storageStatus() {
  const roots = [
    env.uploadDir ? path.resolve(env.uploadDir) : path.resolve(__dirname, "..", "..", "uploads"),
    env.imageDir ? path.resolve(env.imageDir) : path.resolve(__dirname, "..", "..", "images"),
    process.env.FILES_DIR?.trim() ? path.resolve(process.env.FILES_DIR) : path.resolve(__dirname, "..", "..", "files"),
    process.env.BACKUP_DIR?.trim() ? path.resolve(process.env.BACKUP_DIR) : path.resolve(__dirname, "..", "..", "backups")
  ];
  const sizeBytes = roots.reduce((sum, root) => sum + dirSize(root), 0);
  return { roots: roots.map((root) => ({ path: root, exists: fs.existsSync(root) })), sizeBytes };
}

export function systemStatus(userId?: string) {
  const database = (() => {
    try {
      getDatabase().prepare("select 1 as ok").get();
      return true;
    } catch {
      return false;
    }
  })();
  const integrations = userId ? getIntegrationStatus(userId) : null;
  const pendingAutomations = userId
    ? count(`select count(*) as total from automations where user_id = '${userId.replace(/'/g, "''")}' and status = 'active'`)
    : count("select count(*) as total from automations where status = 'active'");
  return {
    ok: true,
    api: true,
    database,
    storage: storageStatus(),
    integrations,
    automations: {
      active: pendingAutomations,
      executions: count("select count(*) as total from automation_executions")
    },
    counts: {
      users: count("select count(*) as total from users"),
      conversations: count("select count(*) as total from conversations"),
      projects: count("select count(*) as total from projects"),
      files: count("select count(*) as total from files") + count("select count(*) as total from uploads"),
      auditEvents: count("select count(*) as total from audit_events"),
      backups: count("select count(*) as total from backups")
    },
    timestamp: new Date().toISOString()
  };
}
