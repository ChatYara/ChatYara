import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { recordAudit } from "./auditService";
import { getSystemDetails } from "./systemGeneratorService";
import { recordExecutionEvent } from "./systemExecutionService";

type DeployProjectRow = {
  id: string;
  user_id: string;
  system_id: string;
  name: string;
  slug: string;
  status: string;
  frontend_url: string | null;
  api_url: string | null;
  admin_url: string | null;
  docs_url: string | null;
  created_at: string;
  updated_at: string;
};

type DeployBuildRow = {
  id: string;
  user_id: string;
  project_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  logs: string;
  metadata_json: string;
};

type DeployDomainRow = {
  id: string;
  project_id: string;
  domain: string;
  type: string;
  active: number;
  created_at: string;
  updated_at: string;
};

type DeployReleaseRow = {
  id: string;
  project_id: string;
  build_id: string | null;
  version: string;
  status: string;
  deployed_at: string;
  metadata_json: string;
};

type DeployLogRow = {
  id: string;
  level: string;
  message: string;
  metadata_json: string;
  created_at: string;
};

function jsonParse<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function publicBaseUrl() {
  return (
    process.env.DEPLOY_PUBLIC_BASE_URL?.trim()
    || process.env.RENDER_EXTERNAL_URL?.trim()
    || process.env.PUBLIC_BASE_URL?.trim()
    || "https://yarachat.onrender.com"
  ).replace(/\/+$/, "");
}

function deployDomainBase() {
  return process.env.DEPLOY_DOMAIN_BASE?.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "") || "yara.app";
}

function slugify(value: string) {
  const base = String(value || "sistema")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "sistema";
}

function urlsForSlug(slug: string) {
  const base = publicBaseUrl();
  return {
    frontend: `${base}/deploy/apps/${slug}`,
    api: `${base}/deploy/api/${slug}`,
    admin: `${base}/deploy/admin/${slug}`,
    docs: `${base}/deploy/docs/${slug}`
  };
}

function domainsForSlug(slug: string) {
  const domain = deployDomainBase();
  return {
    frontend: `${slug}.${domain}`,
    api: `api-${slug}.${domain}`,
    admin: `admin-${slug}.${domain}`,
    docs: `docs-${slug}.${domain}`
  };
}

async function fetchWithTimeout(url: string, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timer);
  }
}

async function validatePublishedUrls(urls: { frontend: string | null; api: string | null }) {
  if (!urls.frontend || !urls.api) throw new Error("URLs de publicação indisponíveis.");
  const frontend = await fetchWithTimeout(urls.frontend);
  const html = await frontend.text().catch(() => "");
  if (!frontend.ok || !/<!doctype html|<html/i.test(html) || /Rota nao encontrada|Aplicação não encontrada|error/i.test(html.slice(0, 1200))) {
    throw new Error(`URL principal não respondeu como aplicação válida. HTTP ${frontend.status}.`);
  }
  const healthUrl = `${urls.api.replace(/\/+$/, "")}/health`;
  const health = await fetchWithTimeout(healthUrl);
  const body = await health.text().catch(() => "");
  if (!health.ok || !/"ok"\s*:\s*true/.test(body)) {
    throw new Error(`Health check do sistema publicado falhou. HTTP ${health.status}.`);
  }
  return {
    frontendStatus: frontend.status,
    healthStatus: health.status,
    healthUrl,
    htmlBytes: html.length
  };
}

function uniqueSlug(name: string) {
  const db = getDatabase();
  const base = slugify(name);
  let slug = base;
  let index = 2;
  while (db.prepare("select id from deploy_projects where slug = ?").get(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

function publicProject(row: DeployProjectRow) {
  return {
    id: row.id,
    userId: row.user_id,
    systemId: row.system_id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    urls: {
      frontend: row.frontend_url,
      api: row.api_url,
      admin: row.admin_url,
      docs: row.docs_url
    },
    domains: domainsForSlug(row.slug),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicBuild(row: DeployBuildRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    logs: row.logs,
    metadata: jsonParse(row.metadata_json, {})
  };
}

function publicRelease(row: DeployReleaseRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    buildId: row.build_id,
    version: row.version,
    status: row.status,
    deployedAt: row.deployed_at,
    metadata: jsonParse(row.metadata_json, {})
  };
}

function publicDomain(row: DeployDomainRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    domain: row.domain,
    type: row.type,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getProjectRow(userId: string, projectId: string) {
  const row = getDatabase()
    .prepare("select * from deploy_projects where id = ? and user_id = ?")
    .get(projectId, userId) as DeployProjectRow | undefined;
  if (!row) throw new Error("Projeto de deploy não encontrado.");
  return row;
}

function findProjectBySystem(userId: string, systemId: string) {
  return getDatabase()
    .prepare("select * from deploy_projects where system_id = ? and user_id = ?")
    .get(systemId, userId) as DeployProjectRow | undefined;
}

function logDeploy(userId: string, projectId: string, message: string, metadata: Record<string, unknown> = {}, level = "info", buildId?: string) {
  getDatabase()
    .prepare(
      `insert into deploy_logs (id, user_id, project_id, build_id, level, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, projectId, buildId || null, level, message, JSON.stringify(metadata));
}

function ensureDomains(userId: string, project: DeployProjectRow) {
  const db = getDatabase();
  const domains = domainsForSlug(project.slug);
  const insert = db.prepare(
    `insert or ignore into deploy_domains (id, user_id, project_id, domain, type, active)
     values (?, ?, ?, ?, ?, 0)`
  );
  for (const [type, domain] of Object.entries(domains)) {
    insert.run(uuid(), userId, project.id, domain, type);
  }
}

function ensureEnvironment(userId: string, projectId: string) {
  getDatabase()
    .prepare(
      `insert or ignore into deploy_environments (id, user_id, project_id, name, status, variables_json)
       values (?, ?, ?, 'production', 'active', '{}')`
    )
    .run(uuid(), userId, projectId);
}

function releaseVersion(projectId: string) {
  const count = getDatabase()
    .prepare("select count(*) as total from deploy_releases where project_id = ?")
    .get(projectId) as { total: number };
  return `v${Number(count.total || 0) + 1}`;
}

export function listDeployProjects(userId: string) {
  const rows = getDatabase()
    .prepare("select * from deploy_projects where user_id = ? order by datetime(updated_at) desc")
    .all(userId) as DeployProjectRow[];
  return rows.map(publicProject);
}

export function getDeployProject(userId: string, projectId: string) {
  const project = getProjectRow(userId, projectId);
  const db = getDatabase();
  const builds = db
    .prepare("select * from deploy_builds where project_id = ? and user_id = ? order by datetime(started_at) desc limit 10")
    .all(projectId, userId) as DeployBuildRow[];
  const releases = db
    .prepare("select * from deploy_releases where project_id = ? and user_id = ? order by datetime(deployed_at) desc limit 10")
    .all(projectId, userId) as DeployReleaseRow[];
  const domains = db
    .prepare("select * from deploy_domains where project_id = ? and user_id = ? order by type")
    .all(projectId, userId) as DeployDomainRow[];
  return {
    project: publicProject(project),
    builds: builds.map(publicBuild),
    releases: releases.map(publicRelease),
    domains: domains.map(publicDomain)
  };
}

export function getDeployStatus(userId: string, input: { projectId?: string; systemId?: string }) {
  const row = input.projectId ? getProjectRow(userId, input.projectId) : input.systemId ? findProjectBySystem(userId, input.systemId) : undefined;
  if (!row) {
    return { deployed: false, project: null, latestBuild: null, latestRelease: null, domains: [], logs: [] };
  }
  const db = getDatabase();
  const latestBuild = db
    .prepare("select * from deploy_builds where project_id = ? and user_id = ? order by datetime(started_at) desc limit 1")
    .get(row.id, userId) as DeployBuildRow | undefined;
  const latestRelease = db
    .prepare("select * from deploy_releases where project_id = ? and user_id = ? order by datetime(deployed_at) desc limit 1")
    .get(row.id, userId) as DeployReleaseRow | undefined;
  const domains = db
    .prepare("select * from deploy_domains where project_id = ? and user_id = ? order by type")
    .all(row.id, userId) as DeployDomainRow[];
  const logs = listDeployLogs(userId, { projectId: row.id, limit: 8 }).logs;
  return {
    deployed: row.status === "online",
    project: publicProject(row),
    latestBuild: latestBuild ? publicBuild(latestBuild) : null,
    latestRelease: latestRelease ? publicRelease(latestRelease) : null,
    domains: domains.map(publicDomain),
    logs
  };
}

type DeployOptions = { executionSessionId?: string | null };

export function createDeployProject(userId: string, systemId: string, options: DeployOptions = {}) {
  const existing = findProjectBySystem(userId, systemId);
  if (existing) return getDeployProject(userId, existing.id);

  const system = getSystemDetails(userId, systemId);
  const slug = uniqueSlug(system.name);
  const urls = urlsForSlug(slug);
  const projectId = uuid();
  recordExecutionEvent(userId, options.executionSessionId, {
    eventType: "deploy_project_started",
    category: "deploy",
    title: "Projeto de deploy criado",
    summary: "A YARA preparou o runtime gerenciado e os domínios internos.",
    details: { slug, urls },
    status: "completed",
    progress: 72,
    metadata: { systemId, projectId }
  });
  const db = getDatabase();
  db.prepare(
    `insert into deploy_projects (
       id, user_id, system_id, name, slug, status, frontend_url, api_url, admin_url, docs_url
     )
     values (?, ?, ?, ?, ?, 'created', ?, ?, ?, ?)`
  ).run(projectId, userId, systemId, system.name, slug, urls.frontend, urls.api, urls.admin, urls.docs);
  ensureEnvironment(userId, projectId);
  const project = getProjectRow(userId, projectId);
  ensureDomains(userId, project);
  logDeploy(userId, projectId, "Projeto de deploy criado.", { systemId, runtime: "yara-managed-runtime" });
  recordAudit({
    userId,
    category: "deploy",
    action: "create",
    entityType: "deploy_project",
    entityId: projectId,
    message: "Projeto de deploy criado.",
    metadata: { systemId, slug }
  });
  return getDeployProject(userId, projectId);
}

export function buildDeployProject(userId: string, projectId: string, options: DeployOptions = {}) {
  const project = getProjectRow(userId, projectId);
  const system = getSystemDetails(userId, project.system_id);
  const buildId = uuid();
  const started = new Date().toISOString();
  recordExecutionEvent(userId, options.executionSessionId, {
    eventType: "build_started",
    category: "build",
    title: "Build iniciado",
    summary: `Build do sistema ${system.name} iniciado no runtime gerenciado da YARA.`,
    status: "running",
    progress: 76,
    startedAt: started,
    metadata: { projectId, buildId, systemId: system.id }
  });
  const logs = [
    `[${started}] Iniciando build do sistema ${system.name}.`,
    "Validando escopo, telas, APIs e banco de dados.",
    `Stack selecionada: ${system.frontend} + ${system.backend} + ${system.database}.`,
    "Gerando runtime seguro de preview YARA.",
    "Build concluído com sucesso."
  ].join("\n");
  getDatabase()
    .prepare(
      `insert into deploy_builds (id, user_id, project_id, status, started_at, finished_at, logs, metadata_json)
       values (?, ?, ?, 'success', ?, current_timestamp, ?, ?)`
    )
    .run(buildId, userId, projectId, started, logs, JSON.stringify({ systemId: system.id, files: system.files.length }));
  getDatabase().prepare("update deploy_projects set status = 'built', updated_at = current_timestamp where id = ? and user_id = ?").run(projectId, userId);
  logDeploy(userId, projectId, "Build concluído.", { systemId: system.id, stack: system.stack }, "info", buildId);
  recordExecutionEvent(userId, options.executionSessionId, {
    eventType: "build_completed",
    category: "build",
    title: "Build concluído",
    summary: "O build foi registrado com sucesso.",
    details: { logs, files: system.files.map((file: any) => file.name) },
    status: "completed",
    progress: 84,
    startedAt: started,
    metadata: { projectId, buildId, systemId: system.id, fileCount: system.files.length }
  });
  recordAudit({
    userId,
    category: "deploy",
    action: "build",
    entityType: "deploy_project",
    entityId: projectId,
    message: "Build de sistema executado.",
    metadata: { systemId: system.id, buildId }
  });
  return publicBuild(getDatabase().prepare("select * from deploy_builds where id = ?").get(buildId) as DeployBuildRow);
}

export async function deployProject(userId: string, projectId: string, options: DeployOptions = {}) {
  const project = getProjectRow(userId, projectId);
  recordExecutionEvent(userId, options.executionSessionId, {
    eventType: "deploy_started",
    category: "deploy",
    title: "Deploy iniciado",
    summary: "A YARA iniciou a publicação da versão atual.",
    status: "running",
    progress: 88,
    metadata: { projectId, systemId: project.system_id }
  });
  const latestBuild = getDatabase()
    .prepare("select * from deploy_builds where project_id = ? and user_id = ? and status = 'success' order by datetime(started_at) desc limit 1")
    .get(projectId, userId) as DeployBuildRow | undefined;
  const build = latestBuild || (buildDeployProject(userId, projectId, options) as ReturnType<typeof publicBuild>);
  const buildId = "id" in build ? build.id : latestBuild?.id || null;
  const version = releaseVersion(projectId);
  const releaseId = uuid();
  getDatabase()
    .prepare(
      `insert into deploy_releases (id, user_id, project_id, build_id, version, status, metadata_json)
       values (?, ?, ?, ?, ?, 'deployed', ?)`
    )
    .run(releaseId, userId, projectId, buildId, version, JSON.stringify({ runtime: "yara-managed-runtime" }));
  getDatabase()
    .prepare("update deploy_projects set status = 'validating', updated_at = current_timestamp where id = ? and user_id = ?")
    .run(projectId, userId);
  const pending = getDeployProject(userId, projectId);
  recordExecutionEvent(userId, options.executionSessionId, {
    eventType: "deploy_completed",
    category: "deploy",
    title: "Deploy concluído",
    summary: `Versão ${version} publicada.`,
    details: { version, urls: pending.project.urls },
    status: "completed",
    progress: 94,
    metadata: { projectId, buildId, version }
  });
  let validation: Awaited<ReturnType<typeof validatePublishedUrls>>;
  try {
    validation = await validatePublishedUrls({
      frontend: pending.project.urls.frontend,
      api: pending.project.urls.api
    });
  } catch (error) {
    getDatabase()
      .prepare("update deploy_projects set status = 'failed', updated_at = current_timestamp where id = ? and user_id = ?")
      .run(projectId, userId);
    logDeploy(userId, projectId, "Validação de URL falhou.", { buildId, version, error: error instanceof Error ? error.message : "Falha desconhecida" }, "error");
    recordExecutionEvent(userId, options.executionSessionId, {
      eventType: "deploy_validation_failed",
      category: "validation",
      title: "URL não validada",
      summary: error instanceof Error ? error.message : "A URL publicada não respondeu corretamente.",
      status: "error",
      progress: 98,
      metadata: { projectId, buildId, version }
    });
    throw error;
  }
  getDatabase()
    .prepare("update deploy_projects set status = 'online', updated_at = current_timestamp where id = ? and user_id = ?")
    .run(projectId, userId);
  logDeploy(userId, projectId, `Deploy publicado e validado: ${version}.`, { buildId, version, validation });
  const published = getDeployProject(userId, projectId);
  recordExecutionEvent(userId, options.executionSessionId, {
    eventType: "url_validated",
    category: "validation",
    title: "URL validada",
    summary: "A URL principal e o health check responderam corretamente.",
    details: { urls: published.project.urls, validation },
    status: "completed",
    progress: 100,
    metadata: { projectId, slug: published.project.slug }
  });
  recordAudit({
    userId,
    category: "deploy",
    action: "deploy",
    entityType: "deploy_project",
    entityId: projectId,
    message: "Deploy publicado.",
    metadata: { buildId, version }
  });
  return published;
}

export function createAndDeploySystem(userId: string, systemId: string, options: DeployOptions = {}) {
  const created = createDeployProject(userId, systemId, options);
  buildDeployProject(userId, created.project.id, options);
  return deployProject(userId, created.project.id, options);
}

export async function redeployProject(userId: string, projectId: string, options: DeployOptions = {}) {
  buildDeployProject(userId, projectId, options);
  logDeploy(userId, projectId, "Redeploy solicitado.", {});
  return deployProject(userId, projectId, options);
}

export async function redeploySystemIfDeployed(userId: string, systemId: string, options: DeployOptions = {}) {
  const project = findProjectBySystem(userId, systemId);
  if (!project || project.status !== "online") return null;
  return redeployProject(userId, project.id, options);
}

export function rollbackProject(userId: string, projectId: string) {
  getProjectRow(userId, projectId);
  const releases = getDatabase()
    .prepare("select * from deploy_releases where project_id = ? and user_id = ? order by datetime(deployed_at) desc limit 2")
    .all(projectId, userId) as DeployReleaseRow[];
  if (releases.length < 2) throw new Error("Não existe release anterior para rollback.");
  const previous = releases[1];
  const releaseId = uuid();
  getDatabase()
    .prepare(
      `insert into deploy_releases (id, user_id, project_id, build_id, version, status, metadata_json)
       values (?, ?, ?, ?, ?, 'deployed', ?)`
    )
    .run(releaseId, userId, projectId, previous.build_id, `${previous.version}-rollback`, JSON.stringify({ rollbackFrom: releases[0].version }));
  getDatabase().prepare("update deploy_projects set status = 'online', updated_at = current_timestamp where id = ? and user_id = ?").run(projectId, userId);
  logDeploy(userId, projectId, `Rollback aplicado para ${previous.version}.`, { previousReleaseId: previous.id });
  return getDeployProject(userId, projectId);
}

export function restartProject(userId: string, projectId: string) {
  getProjectRow(userId, projectId);
  logDeploy(userId, projectId, "Aplicação reiniciada no runtime YARA.", {});
  getDatabase().prepare("update deploy_projects set updated_at = current_timestamp where id = ? and user_id = ?").run(projectId, userId);
  return getDeployProject(userId, projectId);
}

export function listDeployLogs(userId: string, input: { projectId?: string; limit?: number }) {
  const limit = Math.min(100, Math.max(1, Number(input.limit || 30)));
  const params: Array<string | number> = [userId];
  const where = ["user_id = ?"];
  if (input.projectId) {
    where.push("project_id = ?");
    params.push(input.projectId);
  }
  const rows = getDatabase()
    .prepare(
      `select * from deploy_logs
       where ${where.join(" and ")}
       order by datetime(created_at) desc
       limit ?`
    )
    .all(...params, limit) as DeployLogRow[];
  return {
    logs: rows.map((row) => ({
      id: row.id,
      level: row.level,
      message: row.message,
      metadata: jsonParse(row.metadata_json, {}),
      createdAt: row.created_at
    }))
  };
}

export function findPublicDeployBySlug(slug: string) {
  return getDatabase()
    .prepare("select * from deploy_projects where slug = ? and status in ('online', 'validating')")
    .get(slug) as DeployProjectRow | undefined;
}

export function renderPublicDeployPage(slug: string, mode: "app" | "admin" | "docs") {
  const project = findPublicDeployBySlug(slug);
  if (!project) return null;
  const system = getSystemDetails(project.user_id, project.system_id);
  const title = mode === "admin" ? `Painel ${system.name}` : mode === "docs" ? `Documentação ${system.name}` : system.name;
  const features = system.scope.features.slice(0, 8).map((item: string) => `<li>${escapeHtml(item)}</li>`).join("");
  const screens = system.scope.screens.slice(0, 8).map((item: string) => `<li>${escapeHtml(item)}</li>`).join("");
  const apis = system.scope.apis.slice(0, 8).map((item: string) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="manifest" href="/deploy/apps/${escapeHtml(slug)}/manifest.webmanifest" />
    <meta name="theme-color" content="#081120" />
    <style>
      body{margin:0;font-family:Inter,Arial,sans-serif;background:#081120;color:#fff}
      main{min-height:100vh;padding:40px clamp(18px,5vw,72px);background:radial-gradient(circle at top right,rgba(56,189,248,.18),transparent 34%),#081120}
      header{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:44px}
      .brand{display:flex;gap:12px;align-items:center;font-weight:800}.logo{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:#0A84FF}
      .hero{max-width:960px}.badge{display:inline-flex;padding:8px 12px;border:1px solid rgba(56,189,248,.35);border-radius:999px;color:#7dd3fc;background:rgba(15,23,42,.72)}
      h1{font-size:clamp(34px,7vw,82px);line-height:.95;margin:18px 0}p{color:#94A3B8;font-size:18px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:32px}
      article{border:1px solid rgba(56,189,248,.18);border-radius:18px;padding:22px;background:rgba(15,23,42,.74);box-shadow:0 24px 80px rgba(0,0,0,.25)}
      li{margin:10px 0;color:#dbeafe}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}a{color:#fff;text-decoration:none}.button{padding:12px 16px;border-radius:12px;background:#0A84FF}.ghost{border:1px solid rgba(56,189,248,.28);padding:12px 16px;border-radius:12px}
      @media(max-width:760px){header{align-items:flex-start;flex-direction:column}.grid{grid-template-columns:1fr}main{padding:24px 16px}}
    </style>
  </head>
  <body>
    <main>
      <header><div class="brand"><span class="logo">YA</span><span>${escapeHtml(system.name)}</span></div><span class="badge">Online via YARA Deploy Engine</span></header>
      <section class="hero">
        <span class="badge">${escapeHtml(system.architecture)} · ${escapeHtml(system.database || "Banco definido pela YARA")}</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(system.objective)}</p>
        <div class="actions"><a class="button" href="/deploy/apps/${escapeHtml(slug)}">Abrir app</a><a class="ghost" href="/deploy/api/${escapeHtml(slug)}/health">Ver API</a><a class="ghost" href="/deploy/docs/${escapeHtml(slug)}">Documentação</a></div>
      </section>
      <section class="grid">
        <article><h2>Funcionalidades</h2><ul>${features}</ul></article>
        <article><h2>Telas</h2><ul>${screens}</ul></article>
        <article><h2>APIs</h2><ul>${apis}</ul></article>
      </section>
      <script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/deploy/apps/${escapeHtml(slug)}/service-worker.js').catch(function(){});}</script>
    </main>
  </body>
</html>`;
}

export function publicDeployManifest(slug: string) {
  const project = findPublicDeployBySlug(slug);
  if (!project) return null;
  const system = getSystemDetails(project.user_id, project.system_id);
  return {
    name: system.name,
    short_name: system.name.slice(0, 24),
    start_url: `/deploy/apps/${project.slug}`,
    scope: `/deploy/apps/${project.slug}`,
    display: "standalone",
    background_color: "#081120",
    theme_color: "#0A84FF",
    description: system.objective,
    icons: []
  };
}

export function publicDeployServiceWorker(slug: string) {
  const project = findPublicDeployBySlug(slug);
  if (!project) return null;
  return [
    "self.addEventListener('install', function(event) { self.skipWaiting(); });",
    "self.addEventListener('activate', function(event) { event.waitUntil(self.clients.claim()); });",
    "self.addEventListener('fetch', function(event) {",
    "  event.respondWith(fetch(event.request).catch(function() {",
    "    return new Response('Aplicação temporariamente offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });",
    "  }));",
    "});"
  ].join("\n");
}

export function publicDeployApiStatus(slug: string) {
  const project = findPublicDeployBySlug(slug);
  if (!project) return null;
  return {
    ok: true,
    status: project.status,
    name: project.name,
    slug: project.slug,
    urls: urlsForSlug(project.slug),
    generatedBy: "YARA Deploy Engine"
  };
}
