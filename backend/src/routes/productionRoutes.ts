import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { authRequired } from "../middleware/auth";
import { listAuditEvents, recordAudit, requestAuditContext } from "../services/auditService";
import { createBackup, getBackupForDownload, listBackups, cleanupTemporaryData } from "../services/backupService";
import { listApplicationLogs } from "../services/loggerService";
import { getPersistenceHealth } from "../services/persistenceService";
import { systemStatus } from "../services/statusService";
import { sendError } from "../utils/http";

export const productionRoutes = Router();

function numberQuery(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

productionRoutes.get("/status", (_req, res) => {
  const status = systemStatus();
  return res.json({
    ok: status.ok,
    api: status.api,
    database: status.database,
    persistence: {
      type: status.persistence.database.type,
      status: status.persistence.database.status,
      persistent: status.persistence.database.persistent
    },
    storage: { sizeBytes: status.storage.sizeBytes },
    automations: status.automations,
    counts: status.counts,
    timestamp: status.timestamp
  });
});

productionRoutes.use(authRequired);

productionRoutes.get("/status/details", (req, res) => {
  return res.json({ status: systemStatus(req.user!.id) });
});

productionRoutes.get("/status/persistence", (_req, res) => {
  return res.json({ persistence: getPersistenceHealth() });
});

productionRoutes.get("/audit", (req, res) => {
  return res.json(
    listAuditEvents({
      userId: req.user!.id,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      action: typeof req.query.action === "string" ? req.query.action : undefined,
      query: typeof req.query.query === "string" ? req.query.query : undefined,
      page: numberQuery(req.query.page, 1),
      pageSize: numberQuery(req.query.pageSize, 25)
    })
  );
});

productionRoutes.get("/logs", (req, res) => {
  return res.json(
    listApplicationLogs({
      level: typeof req.query.level === "string" ? req.query.level : undefined,
      channel: typeof req.query.channel === "string" ? req.query.channel : undefined,
      page: numberQuery(req.query.page, 1),
      pageSize: numberQuery(req.query.pageSize, 25)
    })
  );
});

productionRoutes.get("/backups", (_req, res) => {
  return res.json({ backups: listBackups() });
});

productionRoutes.post("/backups", (req, res) => {
  try {
    const backup = createBackup(req.user!.id, "manual");
    return res.status(201).json({ backup });
  } catch (error) {
    return sendError(res, 500, error instanceof Error ? error.message : "Não foi possível criar backup.");
  }
});

productionRoutes.get("/backups/:id/download", (req, res) => {
  try {
    const backup = getBackupForDownload(req.params.id);
    const manifestPath = path.join(backup.storage_path, "manifest.json");
    if (!fs.existsSync(manifestPath)) throw new Error("Manifesto de backup não encontrado.");
    recordAudit({
      userId: req.user!.id,
      category: "backup",
      action: "download_manifest",
      entityType: "backup",
      entityId: req.params.id,
      message: "Manifesto de backup baixado.",
      ...requestAuditContext(req)
    });
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${backup.file_name}-manifest.json"`);
    return res.sendFile(manifestPath);
  } catch (error) {
    return sendError(res, 404, error instanceof Error ? error.message : "Backup não encontrado.");
  }
});

productionRoutes.post("/recovery/cleanup", (req, res) => {
  const result = cleanupTemporaryData();
  recordAudit({
    userId: req.user!.id,
    category: "recovery",
    action: "cleanup",
    message: "Limpeza de dados temporários executada.",
    metadata: result,
    ...requestAuditContext(req)
  });
  return res.json({ cleanup: result });
});

productionRoutes.get("/reports/pilar-01", (_req, res) => {
  return res.json({
    report: {
      title: "Relatório Final do Pilar 01 — YARA AI",
      generatedAt: new Date().toISOString(),
      architecture: {
        backend: "Node.js + Express + TypeScript",
        mobile: "React Native + Expo + TypeScript",
        database: "SQLite com compatibilidade incremental para PostgreSQL/pgvector",
        ai: "Arquitetura de provedores com Gemini ativo e OpenAI preparado",
        deploy: "Render + GitHub main"
      },
      features: [
        "Landing page profissional",
        "Autenticação JWT",
        "Chat com IA, streaming visual, anexos e voz",
        "Pesquisa inteligente",
        "Workspace, projetos, tarefas, documentos, arquivos e imagens",
        "Agenda, lembretes, integrações e automações",
        "Memória inteligente e perfil cognitivo",
        "Auditoria, logs, backup, status e segurança de produção"
      ],
      security: [
        "JWT obrigatório nas rotas privadas",
        "Rate limiting",
        "Proteção brute force no login",
        "Tokens OAuth criptografados",
        "Uploads validados e downloads protegidos",
        "Scan de segredos no CI"
      ],
      endpoints: {
        status: ["/api/health", "/api/status", "/api/status/details"],
        audit: ["/api/audit", "/api/logs"],
        backup: ["/api/backups", "/api/backups/:id/download"],
        recovery: ["/api/recovery/cleanup"]
      }
    }
  });
});
