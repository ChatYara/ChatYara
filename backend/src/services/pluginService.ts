import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { recordAudit } from "./auditService";

type PluginCatalogItem = {
  name: string;
  slug: string;
  version: string;
  description: string;
  category: string;
  author: string;
  status: string;
  icon: string;
  permissions: string[];
  integrations: string[];
};

type PluginRow = {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  category: string;
  author: string;
  status: string;
  icon: string;
  metadata_json: string;
  created_at: string;
  updated_at: string;
};

type InstallationRow = {
  id: string;
  user_id: string;
  plugin_id: string;
  installed_at: string;
  enabled: number;
  settings_json: string;
  created_at: string;
  updated_at: string;
};

const INITIAL_PLUGINS: PluginCatalogItem[] = [
  {
    name: "CRM",
    slug: "crm",
    version: "1.0.0",
    description: "Organize clientes, oportunidades, contatos e histórico comercial.",
    category: "Comercial",
    author: "YARA AI",
    status: "available",
    icon: "users",
    permissions: ["projects:read", "files:read", "agents:use"],
    integrations: ["Sistemas", "Agentes", "Arquivos", "Agenda"]
  },
  {
    name: "Financeiro",
    slug: "financeiro",
    version: "1.0.0",
    description: "Controle orçamentos, despesas, previsões e relatórios financeiros.",
    category: "Gestão",
    author: "YARA AI",
    status: "available",
    icon: "chart",
    permissions: ["files:read", "exports:create", "agents:use"],
    integrations: ["Agentes", "Arquivos", "Automações"]
  },
  {
    name: "RH",
    slug: "rh",
    version: "1.0.0",
    description: "Gerencie pessoas, tarefas de RH, escalas e documentos internos.",
    category: "Operações",
    author: "YARA AI",
    status: "available",
    icon: "briefcase",
    permissions: ["documents:create", "calendar:write"],
    integrations: ["Documentos", "Agenda", "Gmail"]
  },
  {
    name: "Jurídico",
    slug: "juridico",
    version: "1.0.0",
    description: "Apoie análise de contratos, prazos, pareceres e organização jurídica.",
    category: "Especialista",
    author: "YARA AI",
    status: "available",
    icon: "shield",
    permissions: ["files:read", "documents:create", "agents:use"],
    integrations: ["Agentes", "Arquivos", "Memória"]
  },
  {
    name: "Estoque",
    slug: "estoque",
    version: "1.0.0",
    description: "Controle produtos, entradas, saídas, alertas e inventários.",
    category: "Operações",
    author: "YARA AI",
    status: "available",
    icon: "box",
    permissions: ["systems:create", "files:read"],
    integrations: ["Sistemas", "Arquivos", "Automações"]
  },
  {
    name: "Atendimento",
    slug: "atendimento",
    version: "1.0.0",
    description: "Centralize demandas, respostas, tickets e histórico de atendimento.",
    category: "Comercial",
    author: "YARA AI",
    status: "available",
    icon: "chat",
    permissions: ["agents:use", "memory:write"],
    integrations: ["Agentes", "Memória", "Gmail"]
  },
  {
    name: "Gestão de Obras",
    slug: "gestao-obras",
    version: "1.0.0",
    description: "Acompanhe obras, etapas, inspeções, arquivos técnicos e relatórios.",
    category: "Técnico",
    author: "YARA AI",
    status: "available",
    icon: "helmet",
    permissions: ["technical-projects:read", "files:read", "exports:create"],
    integrations: ["Projetos Técnicos", "Arquivos", "Agenda"]
  },
  {
    name: "Gestão de Contratos",
    slug: "gestao-contratos",
    version: "1.0.0",
    description: "Organize contratos, vencimentos, responsáveis e alertas automáticos.",
    category: "Jurídico",
    author: "YARA AI",
    status: "available",
    icon: "file",
    permissions: ["documents:create", "calendar:write", "memory:write"],
    integrations: ["Documentos", "Agenda", "Automações"]
  },
  {
    name: "Gestão de Frota",
    slug: "gestao-frota",
    version: "1.0.0",
    description: "Controle veículos, manutenções, custos, documentos e indicadores.",
    category: "Operações",
    author: "YARA AI",
    status: "available",
    icon: "truck",
    permissions: ["projects:read", "calendar:write", "exports:create"],
    integrations: ["Projetos", "Agenda", "Arquivos"]
  },
  {
    name: "Drive YARA",
    slug: "drive-yara",
    version: "0.9.0",
    description: "Pré-cadastro para organizar arquivos e integração futura com Google Drive.",
    category: "Arquivos",
    author: "YARA AI",
    status: "preview",
    icon: "drive",
    permissions: ["files:read", "drive:connect"],
    integrations: ["Arquivos", "Google Drive"]
  },
  {
    name: "Analytics",
    slug: "analytics",
    version: "1.0.0",
    description: "Acompanhe indicadores, uso por módulo, produtividade e relatórios.",
    category: "Dados",
    author: "YARA AI",
    status: "available",
    icon: "chart",
    permissions: ["audit:read", "reports:create"],
    integrations: ["Auditoria", "Arquivos", "Automações"]
  }
];

function cleanText(value: unknown, fallback = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function publicPlugin(row: PluginRow, installation?: InstallationRow | null, permissions: string[] = []) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    version: row.version,
    description: row.description,
    category: row.category,
    author: row.author,
    status: row.status,
    icon: row.icon,
    metadata: safeJsonParse(row.metadata_json, {}),
    installed: Boolean(installation),
    installationId: installation?.id || null,
    enabled: installation ? Boolean(installation.enabled) : false,
    installedAt: installation?.installed_at || null,
    settings: installation ? safeJsonParse(installation.settings_json, {}) : {},
    permissions,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getPluginByIdOrSlug(idOrSlug: string) {
  ensurePluginCatalog();
  const plugin = getDatabase()
    .prepare("select * from plugins where id = ? or slug = ?")
    .get(idOrSlug, idOrSlug) as PluginRow | undefined;
  if (!plugin) throw new Error("Plugin não encontrado.");
  return plugin;
}

function getInstallation(userId: string, pluginId: string) {
  return getDatabase()
    .prepare("select * from plugin_installations where user_id = ? and plugin_id = ?")
    .get(userId, pluginId) as InstallationRow | undefined;
}

function pluginPermissions(userId: string, pluginId: string) {
  const rows = getDatabase()
    .prepare("select permission from plugin_permissions where user_id = ? and plugin_id = ? and granted = 1 order by permission")
    .all(userId, pluginId) as Array<{ permission: string }>;
  return rows.map((row) => row.permission);
}

function writePluginLog(input: {
  userId: string;
  pluginId?: string;
  installationId?: string;
  level?: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into plugin_logs (id, user_id, plugin_id, installation_id, level, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.userId,
      input.pluginId || null,
      input.installationId || null,
      input.level || "info",
      cleanText(input.message, "Evento de plugin."),
      JSON.stringify(input.metadata || {})
    );
  return id;
}

function writePluginAudit(input: {
  userId: string;
  pluginId?: string;
  installationId?: string;
  action: string;
  status?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = uuid();
  const auditStatus = input.status === "failed" || input.status === "warning" ? input.status : "success";
  getDatabase()
    .prepare(
      `insert into plugin_audit_logs (id, user_id, plugin_id, installation_id, action, status, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.userId,
      input.pluginId || null,
      input.installationId || null,
      input.action,
      auditStatus,
      input.message || "",
      JSON.stringify(input.metadata || {})
    );
  recordAudit({
    userId: input.userId,
    category: "plugins",
    action: input.action,
    entityType: "plugin",
    entityId: input.pluginId,
    status: auditStatus,
    message: input.message || "Evento de plugin.",
    metadata: input.metadata || {}
  });
  return id;
}

export function ensurePluginCatalog() {
  const db = getDatabase();
  for (const item of INITIAL_PLUGINS) {
    const existing = db.prepare("select id from plugins where slug = ?").get(item.slug) as { id: string } | undefined;
    const metadata = JSON.stringify({ permissions: item.permissions, integrations: item.integrations });
    if (existing) {
      db.prepare(
        `update plugins
         set name = ?, version = ?, description = ?, category = ?, author = ?, status = ?, icon = ?,
             metadata_json = ?, updated_at = current_timestamp
         where slug = ?`
      ).run(item.name, item.version, item.description, item.category, item.author, item.status, item.icon, metadata, item.slug);
      continue;
    }
    db.prepare(
      `insert into plugins (id, name, slug, version, description, category, author, status, icon, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(uuid(), item.name, item.slug, item.version, item.description, item.category, item.author, item.status, item.icon, metadata);
  }
}

export function listMarketplacePlugins(userId: string) {
  ensurePluginCatalog();
  const db = getDatabase();
  const rows = db.prepare("select * from plugins order by category asc, name asc").all() as PluginRow[];
  return rows.map((plugin) => publicPlugin(plugin, getInstallation(userId, plugin.id), pluginPermissions(userId, plugin.id)));
}

export function listInstalledPlugins(userId: string) {
  ensurePluginCatalog();
  const rows = getDatabase()
    .prepare(
      `select p.*
       from plugins p
       join plugin_installations i on i.plugin_id = p.id
       where i.user_id = ?
       order by i.updated_at desc`
    )
    .all(userId) as PluginRow[];
  return rows.map((plugin) => publicPlugin(plugin, getInstallation(userId, plugin.id), pluginPermissions(userId, plugin.id)));
}

export function getPlugin(userId: string, idOrSlug: string) {
  const plugin = getPluginByIdOrSlug(idOrSlug);
  return publicPlugin(plugin, getInstallation(userId, plugin.id), pluginPermissions(userId, plugin.id));
}

export function pluginDashboard(userId: string) {
  ensurePluginCatalog();
  const db = getDatabase();
  const count = (sql: string, ...params: unknown[]) =>
    Number((db.prepare(sql).get(...(params as any[])) as { total?: number } | undefined)?.total || 0);
  const latest = db
    .prepare(
      `select p.name, p.slug, i.enabled, i.installed_at
       from plugin_installations i
       join plugins p on p.id = i.plugin_id
       where i.user_id = ?
       order by i.installed_at desc
       limit 6`
    )
    .all(userId);
  return {
    installed: count("select count(*) as total from plugin_installations where user_id = ?", userId),
    active: count("select count(*) as total from plugin_installations where user_id = ? and enabled = 1", userId),
    updates: count("select count(*) as total from plugins where status = 'preview'"),
    usage: count("select count(*) as total from plugin_logs where user_id = ?", userId),
    latest
  };
}

export function pluginCategories() {
  ensurePluginCatalog();
  const rows = getDatabase()
    .prepare("select category, count(*) as total from plugins group by category order by category asc")
    .all() as Array<{ category: string; total: number }>;
  return rows.map((row) => ({ name: row.category, total: row.total }));
}

export function pluginLogs(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select l.*, p.name as plugin_name, p.slug as plugin_slug
       from plugin_logs l
       left join plugins p on p.id = l.plugin_id
       where l.user_id = ?
       order by l.created_at desc
       limit 120`
    )
    .all(userId) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: row.id,
    pluginId: row.plugin_id,
    pluginName: row.plugin_name || "Plugin",
    pluginSlug: row.plugin_slug || null,
    installationId: row.installation_id,
    level: row.level,
    message: row.message,
    metadata: safeJsonParse(String(row.metadata_json || "{}"), {}),
    createdAt: row.created_at
  }));
}

export function installPlugin(userId: string, pluginIdOrSlug: string, settings: Record<string, unknown> = {}) {
  const plugin = getPluginByIdOrSlug(pluginIdOrSlug);
  const existing = getInstallation(userId, plugin.id);
  if (existing) {
    getDatabase()
      .prepare("update plugin_installations set enabled = 1, settings_json = ?, updated_at = current_timestamp where id = ? and user_id = ?")
      .run(JSON.stringify(settings || safeJsonParse(existing.settings_json, {})), existing.id, userId);
    writePluginLog({ userId, pluginId: plugin.id, installationId: existing.id, message: "Plugin reativado." });
    writePluginAudit({ userId, pluginId: plugin.id, installationId: existing.id, action: "install", message: "Plugin reativado." });
    return getPlugin(userId, plugin.id);
  }

  const installationId = uuid();
  getDatabase()
    .prepare(
      `insert into plugin_installations (id, user_id, plugin_id, enabled, settings_json, updated_at)
       values (?, ?, ?, 1, ?, current_timestamp)`
    )
    .run(installationId, userId, plugin.id, JSON.stringify(settings || {}));

  const metadata = safeJsonParse<{ permissions?: string[] }>(plugin.metadata_json, {});
  for (const permission of metadata.permissions || []) {
    getDatabase()
      .prepare(
        `insert into plugin_permissions (id, user_id, plugin_id, permission, granted, updated_at)
         values (?, ?, ?, ?, 1, current_timestamp)
         on conflict(user_id, plugin_id, permission) do update set granted = 1, updated_at = current_timestamp`
      )
      .run(uuid(), userId, plugin.id, permission);
  }

  writePluginLog({ userId, pluginId: plugin.id, installationId, message: "Plugin instalado." });
  writePluginAudit({ userId, pluginId: plugin.id, installationId, action: "install", message: "Plugin instalado." });
  return getPlugin(userId, plugin.id);
}

export function uninstallPlugin(userId: string, pluginIdOrSlug: string) {
  const plugin = getPluginByIdOrSlug(pluginIdOrSlug);
  const installation = getInstallation(userId, plugin.id);
  if (!installation) throw new Error("Plugin não está instalado.");
  getDatabase()
    .prepare("update plugin_logs set installation_id = null where user_id = ? and installation_id = ?")
    .run(userId, installation.id);
  getDatabase()
    .prepare("update plugin_audit_logs set installation_id = null where user_id = ? and installation_id = ?")
    .run(userId, installation.id);
  getDatabase().prepare("delete from plugin_installations where id = ? and user_id = ?").run(installation.id, userId);
  getDatabase().prepare("delete from plugin_permissions where user_id = ? and plugin_id = ?").run(userId, plugin.id);
  writePluginLog({ userId, pluginId: plugin.id, message: "Plugin desinstalado." });
  writePluginAudit({ userId, pluginId: plugin.id, action: "uninstall", message: "Plugin desinstalado.", metadata: { installationId: installation.id } });
  return { id: installation.id, pluginId: plugin.id, uninstalled: true };
}

export function setPluginEnabled(userId: string, pluginIdOrSlug: string, enabled: boolean) {
  const plugin = getPluginByIdOrSlug(pluginIdOrSlug);
  const installation = getInstallation(userId, plugin.id);
  if (!installation) throw new Error("Instale o plugin antes de alterar o status.");
  getDatabase()
    .prepare("update plugin_installations set enabled = ?, updated_at = current_timestamp where id = ? and user_id = ?")
    .run(enabled ? 1 : 0, installation.id, userId);
  writePluginLog({
    userId,
    pluginId: plugin.id,
    installationId: installation.id,
    message: enabled ? "Plugin ativado." : "Plugin desativado."
  });
  writePluginAudit({
    userId,
    pluginId: plugin.id,
    installationId: installation.id,
    action: enabled ? "enable" : "disable",
    message: enabled ? "Plugin ativado." : "Plugin desativado."
  });
  return getPlugin(userId, plugin.id);
}

function findPluginFromText(message: string) {
  ensurePluginCatalog();
  const text = message.toLowerCase();
  const plugins = getDatabase().prepare("select * from plugins").all() as PluginRow[];
  return plugins.find((plugin) => text.includes(plugin.slug) || text.includes(plugin.name.toLowerCase()));
}

export function handlePluginChat(userId: string, message: string) {
  const instruction = cleanText(message);
  if (instruction.length < 3) throw new Error("Informe o comando do marketplace.");
  const text = instruction.toLowerCase();
  if (/quais|listar|tenho|instalados/.test(text)) {
    const installed = listInstalledPlugins(userId);
    return {
      reply: installed.length
        ? "Plugins instalados: " + installed.map((item) => `${item.name} (${item.enabled ? "ativo" : "inativo"})`).join(", ") + "."
        : "Você ainda não tem plugins instalados.",
      plugins: installed
    };
  }

  const plugin = findPluginFromText(instruction);
  if (!plugin) {
    return {
      reply: "Não encontrei esse plugin no marketplace. Tente CRM, Financeiro, RH, Jurídico, Estoque, Atendimento, Obras, Contratos, Frota, Drive YARA ou Analytics.",
      plugins: []
    };
  }

  if (/desative|desativar|pausar|pause/.test(text)) {
    const updated = setPluginEnabled(userId, plugin.id, false);
    return { reply: `${plugin.name} desativado.`, plugin: updated };
  }

  if (/ative|ativar|habilite|habilitar/.test(text)) {
    const installed = getInstallation(userId, plugin.id) ? setPluginEnabled(userId, plugin.id, true) : installPlugin(userId, plugin.id);
    return { reply: `${plugin.name} ativado.`, plugin: installed };
  }

  if (/remova|remover|desinstale|desinstalar/.test(text)) {
    const result = uninstallPlugin(userId, plugin.id);
    return { reply: `${plugin.name} desinstalado.`, result };
  }

  const installed = installPlugin(userId, plugin.id);
  return { reply: `${plugin.name} instalado e ativado.`, plugin: installed };
}
