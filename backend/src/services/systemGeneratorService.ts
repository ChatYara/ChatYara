import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { generateExportFile } from "./exportService";
import { refreshKnowledgeGraphSoon } from "./graphService";

type SystemAnalysis = {
  type: string;
  complexity: "baixa" | "media" | "alta";
  scalability: "local" | "pequena equipe" | "crescimento" | "alta escala";
  needsAuth: boolean;
  needsDatabase: boolean;
  needsMobile: boolean;
  needsAdmin: boolean;
  signals: string[];
};

type SystemStack = {
  frontend: string;
  backend: string;
  database: string;
  architecture: string;
  reason: string;
};

type SystemScope = {
  name: string;
  objective: string;
  features: string[];
  screens: string[];
  apis: string[];
  database: string[];
};

type SystemFile = {
  name: string;
  type: string;
  content: string;
};

type SystemRow = {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  type: string;
  complexity: string;
  scalability: string;
  architecture: string;
  frontend: string | null;
  backend: string | null;
  database_choice: string | null;
  needs_auth: number;
  needs_database: number;
  needs_mobile: number;
  needs_admin: number;
  objective: string;
  scope_json: string;
  stack_json: string;
  folder_structure_json: string;
  development_plan_json: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type SystemFileRow = {
  id: string;
  user_id: string;
  system_id: string;
  name: string;
  type: string;
  content: string;
  file_id: string | null;
  created_at: string;
  updated_at: string;
};

type SystemChatSessionRow = {
  id: string;
  user_id: string;
  system_id: string | null;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type SystemChatMessageRow = {
  id: string;
  user_id: string;
  session_id: string;
  system_id: string | null;
  role: "user" | "assistant" | "system";
  content: string;
  metadata_json: string;
  created_at: string;
};

const MAX_PROMPT_LENGTH = 4000;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function cleanPrompt(prompt: string) {
  const clean = String(prompt || "").replace(/\s+/g, " ").trim();
  if (clean.length < 8) throw new Error("Descreva melhor o sistema que deseja criar.");
  if (clean.length > MAX_PROMPT_LENGTH) throw new Error("O briefing é muito longo. Envie até 4000 caracteres.");
  return clean;
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function jsonParse<T>(value: string, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function detectSystemGenerationRequest(message: string) {
  const text = normalize(message);
  return /\b(crie|criar|faca|fazer|monte|montar|desenvolva|desenvolver|gere|gerar)\b/.test(text)
    && /\b(sistema|aplicativo|app|plataforma|crm|erp|dashboard|portal|api|controle|gestao)\b/.test(text);
}

function inferSystemType(text: string) {
  if (includesAny(text, ["estoque", "inventario", "almoxarifado", "produto"])) return "Sistema de Estoque";
  if (includesAny(text, ["crm", "cliente", "vendas", "leads"])) return "CRM";
  if (includesAny(text, ["funcionario", "colaborador", "equipe", "rh", "escala"])) return "Aplicativo de Funcionários";
  if (includesAny(text, ["logistica", "entrega", "rota", "transporte", "frete"])) return "Plataforma de Logística";
  if (includesAny(text, ["financeiro", "orcamento", "cobranca", "contas"])) return "Sistema Financeiro";
  if (includesAny(text, ["agenda", "consulta", "marcacao", "calendario"])) return "Sistema de Agenda";
  if (includesAny(text, ["dashboard", "indicador", "relatorio", "painel"])) return "Dashboard Analítico";
  if (includesAny(text, ["api", "integracao", "webhook"])) return "API REST";
  if (includesAny(text, ["mobile", "aplicativo", "app", "celular"])) return "Aplicativo Mobile";
  return "Sistema Full Stack";
}

function analyzeSystemPrompt(prompt: string): SystemAnalysis {
  const text = normalize(prompt);
  const type = inferSystemType(text);
  const signals: string[] = [];
  const needsMobile = includesAny(text, ["mobile", "aplicativo", "app", "celular", "android", "ios", "funcionario"]);
  const needsAdmin = !includesAny(text, ["sem painel", "sem admin"]);
  const needsAuth = !includesAny(text, ["sem login", "publico", "sem autenticacao"]);
  const needsDatabase = !includesAny(text, ["site estatico", "landing page", "sem banco"]);
  const highSignals = ["multiempresa", "alta escala", "milhares", "marketplace", "tempo real", "filiais", "saas", "pagamento"];
  const mediumSignals = ["relatorio", "dashboard", "admin", "usuarios", "estoque", "notificacao", "agenda", "arquivo"];
  const isHigh = includesAny(text, highSignals) || prompt.length > 900;
  const isMedium = isHigh || includesAny(text, mediumSignals) || prompt.length > 220;
  const complexity = isHigh ? "alta" : isMedium ? "media" : "baixa";
  const scalability = isHigh ? "alta escala" : isMedium ? "crescimento" : needsDatabase ? "pequena equipe" : "local";

  if (needsAuth) signals.push("autenticação");
  if (needsDatabase) signals.push("banco de dados");
  if (needsMobile) signals.push("mobile");
  if (needsAdmin) signals.push("painel administrativo");
  if (isHigh) signals.push("alta escalabilidade");

  return { type, complexity, scalability, needsAuth, needsDatabase, needsMobile, needsAdmin, signals };
}

function chooseStack(analysis: SystemAnalysis, prompt: string): SystemStack {
  const text = normalize(prompt);
  const database = !analysis.needsDatabase
    ? "Sem banco inicialmente"
    : analysis.complexity === "baixa" && !includesAny(text, ["equipe", "multiusuario", "cliente", "relatorio"])
      ? "SQLite"
      : includesAny(text, ["catalogo", "conteudo", "chat", "documento flexivel"])
        ? "MongoDB"
        : "PostgreSQL";
  const frontend = analysis.needsMobile
    ? "React Native com Expo"
    : analysis.type === "API REST"
      ? "Documentação API + painel administrativo leve"
      : analysis.complexity === "baixa" && !analysis.needsAuth
        ? "HTML, CSS e JavaScript"
        : "React";
  const backend = analysis.needsDatabase || analysis.needsAuth || analysis.type !== "Dashboard Analítico"
    ? "Node.js com Express"
    : "Node.js opcional para exportações e integrações";
  const architecture = analysis.needsMobile
    ? "Mobile App + API REST"
    : analysis.type === "API REST"
      ? "API REST"
      : analysis.needsDatabase || analysis.needsAuth
        ? "Full Stack Web"
        : "Web App";
  const reason = [
    `A YARA escolheu ${architecture} porque o pedido indica ${analysis.signals.join(", ") || "um fluxo simples"}.`,
    `${frontend} entrega a melhor experiência para este uso.`,
    `${backend} mantém regras de negócio e segurança no servidor.`,
    `${database} foi escolhido pelo nível de dados e escalabilidade esperada.`
  ].join(" ");

  return { frontend, backend, database, architecture, reason };
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function systemName(type: string, prompt: string) {
  const text = normalize(prompt);
  if (type === "Sistema de Estoque") return "YARA Estoque Pro";
  if (type === "CRM") return "YARA CRM Inteligente";
  if (type === "Aplicativo de Funcionários") return "YARA Equipe";
  if (type === "Plataforma de Logística") return "YARA Logística";
  if (type === "Sistema Financeiro") return "YARA Financeiro";
  if (type === "Sistema de Agenda") return "YARA Agenda";
  const match = /(?:sistema|plataforma|app|aplicativo)\s+(?:de|para)\s+([a-z0-9\s]{3,40})/i.exec(text);
  return match?.[1] ? `YARA ${titleCase(match[1].trim())}` : `YARA ${type}`;
}

function generateScope(prompt: string, analysis: SystemAnalysis, stack: SystemStack): SystemScope {
  const name = systemName(analysis.type, prompt);
  const baseFeatures = [
    "Autenticação segura de usuários",
    "Dashboard inicial com indicadores",
    "Cadastro, edição, busca e exclusão de registros",
    "Histórico de atividades",
    "Exportação de relatórios"
  ];
  const typeFeatures: Record<string, string[]> = {
    "Sistema de Estoque": ["Cadastro de produtos", "Entrada e saída de estoque", "Alertas de estoque mínimo", "Relatórios por período"],
    CRM: ["Cadastro de clientes", "Funil de vendas", "Registro de contatos", "Relatórios comerciais"],
    "Aplicativo de Funcionários": ["Perfil do funcionário", "Comunicados internos", "Escalas e tarefas", "Notificações"],
    "Plataforma de Logística": ["Cadastro de entregas", "Roteirização", "Status de transporte", "Comprovantes"],
    "Sistema Financeiro": ["Contas a pagar e receber", "Fluxo de caixa", "Categorias financeiras", "Relatórios com totais"],
    "Sistema de Agenda": ["Criação de eventos", "Lembretes", "Visualização diária/semanal", "Participantes"]
  };
  const screens = unique([
    "Login",
    "Dashboard",
    analysis.type.replace("Sistema de ", "").replace("Plataforma de ", ""),
    analysis.needsAdmin ? "Painel administrativo" : "",
    "Relatórios",
    "Configurações"
  ]);
  const apis = unique([
    analysis.needsAuth ? "POST /api/auth/login" : "",
    analysis.needsAuth ? "POST /api/auth/register" : "",
    "GET /api/dashboard",
    "GET /api/items",
    "POST /api/items",
    "PATCH /api/items/:id",
    "DELETE /api/items/:id",
    "GET /api/reports"
  ]);
  const database = stack.database === "Sem banco inicialmente"
    ? []
    : ["users", "items", "activity_logs", "reports", analysis.needsAdmin ? "settings" : ""].filter(Boolean);

  return {
    name,
    objective: `Criar ${analysis.type.toLowerCase()} para organizar processos, reduzir retrabalho e entregar uma operação clara para usuários finais e gestores.`,
    features: unique([...(analysis.needsAuth ? baseFeatures : baseFeatures.slice(1)), ...(typeFeatures[analysis.type] || ["Gestão de dados", "Painel operacional", "Relatórios"])]),
    screens,
    apis,
    database
  };
}

function folderStructure(stack: SystemStack) {
  if (stack.architecture.includes("Mobile")) {
    return ["mobile/", "mobile/src/screens/", "mobile/src/services/", "backend/", "backend/src/routes/", "backend/src/services/", "backend/src/db/", "docs/"];
  }
  if (stack.architecture === "API REST") {
    return ["backend/", "backend/src/routes/", "backend/src/services/", "backend/src/db/", "backend/tests/", "docs/"];
  }
  return ["frontend/", "frontend/src/pages/", "frontend/src/components/", "frontend/src/services/", "backend/", "backend/src/routes/", "backend/src/services/", "backend/src/db/", "docs/"];
}

function developmentPlan(analysis: SystemAnalysis) {
  return [
    "Validar regras de negócio e fluxos principais.",
    "Criar autenticação, banco de dados e permissões por usuário.",
    "Implementar telas essenciais e API REST.",
    "Adicionar dashboard, relatórios e exportações.",
    analysis.needsMobile ? "Publicar build mobile e testar em Android." : "Validar responsividade desktop e mobile.",
    "Executar testes, revisão de segurança e deploy."
  ];
}

function buildReadme(scope: SystemScope, stack: SystemStack, analysis: SystemAnalysis) {
  return [
    `# ${scope.name}`,
    "",
    scope.objective,
    "",
    "## Arquitetura escolhida pela YARA",
    `- Arquitetura: ${stack.architecture}`,
    `- Frontend: ${stack.frontend}`,
    `- Backend: ${stack.backend}`,
    `- Banco: ${stack.database}`,
    `- Complexidade: ${analysis.complexity}`,
    "",
    "## Por que essa stack",
    stack.reason,
    "",
    "## Funcionalidades",
    ...scope.features.map((feature) => `- ${feature}`),
    "",
    "## Telas",
    ...scope.screens.map((screen) => `- ${screen}`),
    "",
    "## APIs previstas",
    ...scope.apis.map((api) => `- ${api}`),
    "",
    "## Segurança",
    "- JWT obrigatório para áreas privadas.",
    "- Senhas criptografadas.",
    "- Isolamento de dados por usuário.",
    "- Validação de entradas no backend."
  ].join("\n");
}

function generateFiles(scope: SystemScope, stack: SystemStack, analysis: SystemAnalysis, folders: string[], plan: string[]): SystemFile[] {
  const packageJson = {
    name: scope.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    private: true,
    scripts: {
      dev: "npm run dev",
      build: "npm run build",
      test: "npm test"
    }
  };
  const apiExample = [
    "import express from \"express\";",
    "",
    "const app = express();",
    "app.use(express.json());",
    "",
    "app.get(\"/api/health\", (_req, res) => res.json({ ok: true }));",
    "",
    "app.listen(process.env.PORT || 3000);"
  ].join("\n");
  return [
    { name: "README.md", type: "markdown", content: buildReadme(scope, stack, analysis) },
    {
      name: "docs/architecture.md",
      type: "markdown",
      content: [
        `# Arquitetura - ${scope.name}`,
        "",
        stack.reason,
        "",
        "## Estrutura de pastas",
        ...folders.map((folder) => `- ${folder}`),
        "",
        "## Plano",
        ...plan.map((step, index) => `${index + 1}. ${step}`)
      ].join("\n")
    },
    { name: "package.json", type: "json", content: JSON.stringify(packageJson, null, 2) },
    { name: "backend/src/server.ts", type: "typescript", content: apiExample },
    {
      name: stack.architecture.includes("Mobile") ? "mobile/App.tsx" : "frontend/src/App.tsx",
      type: "typescript",
      content: [
        "export default function App() {",
        `  return <main><h1>${scope.name}</h1><p>${scope.objective}</p></main>;`,
        "}"
      ].join("\n")
    }
  ];
}

function publicSystem(row: SystemRow, files: SystemFileRow[] = []) {
  const scope = jsonParse<SystemScope>(row.scope_json, {
    name: row.name,
    objective: row.objective,
    features: [],
    screens: [],
    apis: [],
    database: []
  });
  const stack = jsonParse<SystemStack>(row.stack_json, {
    frontend: row.frontend || "",
    backend: row.backend || "",
    database: row.database_choice || "",
    architecture: row.architecture,
    reason: ""
  });
  return {
    id: row.id,
    name: row.name,
    prompt: row.prompt,
    type: row.type,
    complexity: row.complexity,
    scalability: row.scalability,
    architecture: row.architecture,
    frontend: row.frontend,
    backend: row.backend,
    database: row.database_choice,
    needsAuth: Boolean(row.needs_auth),
    needsDatabase: Boolean(row.needs_database),
    needsMobile: Boolean(row.needs_mobile),
    needsAdmin: Boolean(row.needs_admin),
    objective: row.objective,
    scope,
    stack,
    folderStructure: jsonParse<string[]>(row.folder_structure_json, []),
    developmentPlan: jsonParse<string[]>(row.development_plan_json, []),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    files: files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      content: file.content,
      fileId: file.file_id,
      createdAt: file.created_at,
      updatedAt: file.updated_at
    }))
  };
}

function auditSystem(userId: string, systemId: string | null, action: string, message: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into system_audit_logs (id, user_id, system_id, action, message, metadata_json)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, systemId, action, message, JSON.stringify(metadata));
}

function publicSystemChatSession(row: SystemChatSessionRow) {
  return {
    id: row.id,
    systemId: row.system_id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicSystemChatMessage(row: SystemChatMessageRow) {
  return {
    id: row.id,
    sessionId: row.session_id,
    systemId: row.system_id,
    role: row.role,
    content: row.content,
    metadata: jsonParse<Record<string, unknown>>(row.metadata_json, {}),
    createdAt: row.created_at
  };
}

function getSystemChatSession(userId: string, sessionId: string) {
  return getDatabase()
    .prepare("select * from system_chat_sessions where id = ? and user_id = ?")
    .get(sessionId, userId) as SystemChatSessionRow | undefined;
}

function createSystemChatSession(userId: string, systemId?: string | null) {
  const id = uuid();
  let title = "Chat de Sistemas";
  if (systemId) {
    try {
      title = getSystemDetails(userId, systemId).name;
    } catch {
      throw new Error("Sistema não encontrado.");
    }
  }

  getDatabase()
    .prepare("insert into system_chat_sessions (id, user_id, system_id, title) values (?, ?, ?, ?)")
    .run(id, userId, systemId || null, title);

  return getSystemChatSession(userId, id)!;
}

function resolveSystemChatSession(userId: string, input: { sessionId?: string; systemId?: string | null }) {
  if (input.sessionId) {
    const session = getSystemChatSession(userId, input.sessionId);
    if (!session) throw new Error("Conversa de sistemas não encontrada.");
    if (input.systemId && input.systemId !== session.system_id) {
      getSystemDetails(userId, input.systemId);
      getDatabase()
        .prepare("update system_chat_sessions set system_id = ?, updated_at = current_timestamp where id = ? and user_id = ?")
        .run(input.systemId, session.id, userId);
      return getSystemChatSession(userId, session.id)!;
    }
    return session;
  }

  return createSystemChatSession(userId, input.systemId || null);
}

function insertSystemChatMessage(
  userId: string,
  sessionId: string,
  systemId: string | null,
  role: "user" | "assistant" | "system",
  content: string,
  metadata: Record<string, unknown> = {}
) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into system_chat_messages (id, user_id, session_id, system_id, role, content, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, sessionId, systemId, role, content, JSON.stringify(metadata));
  return id;
}

function detectSystemExportFormat(message: string): "txt" | "pdf" | "docx" | null {
  const text = normalize(message);
  if (!/\b(exporte|exportar|gere|gerar|baixar|coloque|arquivo)\b/.test(text)) return null;
  if (/\bpdf\b/.test(text)) return "pdf";
  if (/\bdocx|word\b/.test(text)) return "docx";
  if (/\btxt|texto\b/.test(text)) return "txt";
  return null;
}

function updateSystemFromPrompt(userId: string, systemId: string, rawPrompt: string) {
  const current = getSystemDetails(userId, systemId);
  const prompt = cleanPrompt([current.prompt, `Alteração solicitada: ${rawPrompt}`].join("\n"));
  const analysis = analyzeSystemPrompt(prompt);
  const stack = chooseStack(analysis, prompt);
  const scope = generateScope(prompt, analysis, stack);
  const folders = folderStructure(stack);
  const plan = developmentPlan(analysis);
  const files = generateFiles(scope, stack, analysis, folders, plan);
  const output = systemOutput(scope, stack, analysis, folders, plan);
  const db = getDatabase();
  const now = new Date().toISOString();

  db.prepare(
    `update systems
     set name = ?, prompt = ?, type = ?, complexity = ?, scalability = ?, architecture = ?,
         frontend = ?, backend = ?, database_choice = ?, needs_auth = ?, needs_database = ?,
         needs_mobile = ?, needs_admin = ?, objective = ?, scope_json = ?, stack_json = ?,
         folder_structure_json = ?, development_plan_json = ?, updated_at = ?
     where id = ? and user_id = ?`
  ).run(
    scope.name,
    prompt,
    analysis.type,
    analysis.complexity,
    analysis.scalability,
    stack.architecture,
    stack.frontend,
    stack.backend,
    stack.database,
    analysis.needsAuth ? 1 : 0,
    analysis.needsDatabase ? 1 : 0,
    analysis.needsMobile ? 1 : 0,
    analysis.needsAdmin ? 1 : 0,
    scope.objective,
    JSON.stringify(scope),
    JSON.stringify(stack),
    JSON.stringify(folders),
    JSON.stringify(plan),
    now,
    systemId,
    userId
  );

  db.prepare("delete from system_files where system_id = ? and user_id = ?").run(systemId, userId);
  const insertFile = db.prepare(
    `insert into system_files (id, user_id, system_id, name, type, content, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const file of files) {
    insertFile.run(uuid(), userId, systemId, file.name, file.type, file.content, now, now);
  }

  db.prepare(
    `insert into system_generations (id, user_id, system_id, prompt, analysis_json, output_json)
     values (?, ?, ?, ?, ?, ?)`
  ).run(uuid(), userId, systemId, rawPrompt, JSON.stringify(analysis), JSON.stringify(output));

  auditSystem(userId, systemId, "chat_update", "Sistema atualizado pelo Chat de Sistemas.", { type: analysis.type, architecture: stack.architecture });
  refreshKnowledgeGraphSoon(userId);

  return getSystemDetails(userId, systemId);
}

function systemOutput(scope: SystemScope, stack: SystemStack, analysis: SystemAnalysis, folders: string[], plan: string[]) {
  return { analysis, stack, scope, folderStructure: folders, developmentPlan: plan };
}

export function generateSystemFromPrompt(userId: string, rawPrompt: string) {
  const prompt = cleanPrompt(rawPrompt);
  const analysis = analyzeSystemPrompt(prompt);
  const stack = chooseStack(analysis, prompt);
  const scope = generateScope(prompt, analysis, stack);
  const folders = folderStructure(stack);
  const plan = developmentPlan(analysis);
  const files = generateFiles(scope, stack, analysis, folders, plan);
  const id = uuid();
  const db = getDatabase();
  const now = new Date().toISOString();
  const output = systemOutput(scope, stack, analysis, folders, plan);

  db.prepare(
    `insert into systems (
      id, user_id, name, prompt, type, complexity, scalability, architecture, frontend, backend,
      database_choice, needs_auth, needs_database, needs_mobile, needs_admin, objective,
      scope_json, stack_json, folder_structure_json, development_plan_json, status, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)`
  ).run(
    id,
    userId,
    scope.name,
    prompt,
    analysis.type,
    analysis.complexity,
    analysis.scalability,
    stack.architecture,
    stack.frontend,
    stack.backend,
    stack.database,
    analysis.needsAuth ? 1 : 0,
    analysis.needsDatabase ? 1 : 0,
    analysis.needsMobile ? 1 : 0,
    analysis.needsAdmin ? 1 : 0,
    scope.objective,
    JSON.stringify(scope),
    JSON.stringify(stack),
    JSON.stringify(folders),
    JSON.stringify(plan),
    now,
    now
  );

  db.prepare(
    `insert into system_generations (id, user_id, system_id, prompt, analysis_json, output_json)
     values (?, ?, ?, ?, ?, ?)`
  ).run(uuid(), userId, id, prompt, JSON.stringify(analysis), JSON.stringify(output));

  const insertFile = db.prepare(
    `insert into system_files (id, user_id, system_id, name, type, content, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const file of files) {
    insertFile.run(uuid(), userId, id, file.name, file.type, file.content, now, now);
  }

  auditSystem(userId, id, "generate", "Sistema gerado pela YARA AI.", { type: analysis.type, architecture: stack.architecture });
  refreshKnowledgeGraphSoon(userId);

  return getSystemDetails(userId, id);
}

export function listSystems(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select * from systems
       where user_id = ?
       order by datetime(created_at) desc
       limit 80`
    )
    .all(userId) as SystemRow[];
  return rows.map((row) => publicSystem(row));
}

export function getSystemDetails(userId: string, systemId: string) {
  const db = getDatabase();
  const row = db.prepare("select * from systems where id = ? and user_id = ?").get(systemId, userId) as SystemRow | undefined;
  if (!row) throw new Error("Sistema não encontrado.");
  const files = db
    .prepare("select * from system_files where system_id = ? and user_id = ? order by datetime(created_at) asc")
    .all(systemId, userId) as SystemFileRow[];
  return publicSystem(row, files);
}

export function deleteSystem(userId: string, systemId: string) {
  auditSystem(userId, systemId, "delete", "Sistema excluído.");
  const result = getDatabase().prepare("delete from systems where id = ? and user_id = ?").run(systemId, userId);
  if (result.changes === 0) throw new Error("Sistema não encontrado.");
  refreshKnowledgeGraphSoon(userId);
  return { id: systemId };
}

export function publishSystem(userId: string, systemId: string) {
  getSystemDetails(userId, systemId);
  getDatabase()
    .prepare("update systems set status = 'published', updated_at = current_timestamp where id = ? and user_id = ?")
    .run(systemId, userId);
  auditSystem(userId, systemId, "publish", "Sistema marcado como publicado.");
  refreshKnowledgeGraphSoon(userId);
  return getSystemDetails(userId, systemId);
}

export function duplicateSystem(userId: string, systemId: string) {
  const original = getSystemDetails(userId, systemId);
  const id = uuid();
  const now = new Date().toISOString();
  const db = getDatabase();
  db.prepare(
    `insert into systems (
      id, user_id, name, prompt, type, complexity, scalability, architecture, frontend, backend,
      database_choice, needs_auth, needs_database, needs_mobile, needs_admin, objective,
      scope_json, stack_json, folder_structure_json, development_plan_json, status, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ready', ?, ?)`
  ).run(
    id,
    userId,
    `${original.name} (cópia)`,
    original.prompt,
    original.type,
    original.complexity,
    original.scalability,
    original.architecture,
    original.frontend,
    original.backend,
    original.database,
    original.needsAuth ? 1 : 0,
    original.needsDatabase ? 1 : 0,
    original.needsMobile ? 1 : 0,
    original.needsAdmin ? 1 : 0,
    original.objective,
    JSON.stringify(original.scope),
    JSON.stringify(original.stack),
    JSON.stringify(original.folderStructure),
    JSON.stringify(original.developmentPlan),
    now,
    now
  );
  const insertFile = db.prepare(
    `insert into system_files (id, user_id, system_id, name, type, content, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const file of original.files || []) {
    insertFile.run(uuid(), userId, id, file.name, file.type, file.content || "", now, now);
  }
  auditSystem(userId, id, "duplicate", "Sistema duplicado.", { sourceSystemId: systemId });
  refreshKnowledgeGraphSoon(userId);
  return getSystemDetails(userId, id);
}

export async function exportSystem(userId: string, systemId: string, format: "txt" | "pdf" | "docx") {
  const system = getSystemDetails(userId, systemId);
  const content = [
    `# ${system.name}`,
    "",
    system.objective,
    "",
    "## Arquitetura",
    `- ${system.architecture}`,
    `- Frontend: ${system.frontend}`,
    `- Backend: ${system.backend}`,
    `- Banco: ${system.database}`,
    "",
    "## Justificativa",
    system.stack.reason,
    "",
    "## Funcionalidades",
    ...system.scope.features.map((item: string) => `- ${item}`),
    "",
    "## Telas",
    ...system.scope.screens.map((item: string) => `- ${item}`),
    "",
    "## APIs",
    ...system.scope.apis.map((item: string) => `- ${item}`),
    "",
    "## Banco de dados",
    ...(system.scope.database.length ? system.scope.database.map((item: string) => `- ${item}`) : ["- Sem banco inicial"]),
    "",
    "## Estrutura de pastas",
    ...system.folderStructure.map((item: string) => `- ${item}`),
    "",
    "## Plano de desenvolvimento",
    ...system.developmentPlan.map((item: string, index: number) => `${index + 1}. ${item}`)
  ].join("\n");
  const file = await generateExportFile(userId, {
    format,
    title: system.name,
    content
  });
  getDatabase()
    .prepare("update system_files set file_id = ?, updated_at = current_timestamp where system_id = ? and user_id = ? and name = 'README.md'")
    .run(file.id, systemId, userId);
  auditSystem(userId, systemId, "export", `Sistema exportado em ${format.toUpperCase()}.`, { fileId: file.id });
  return { file };
}

export function systemChatResponse(system: ReturnType<typeof getSystemDetails>) {
  return [
    `Sistema criado: ${system.name}`,
    "",
    `Arquitetura: ${system.architecture}`,
    `Stack: ${system.frontend} + ${system.backend} + ${system.database}`,
    "",
    "Principais módulos:",
    ...system.scope.features.slice(0, 6).map((feature: string) => `- ${feature}`),
    "",
    "Decisão da YARA:",
    system.stack.reason,
    "",
    `ID do sistema: ${system.id}`
  ].join("\n");
}

export function answerSystemGeneration(userId: string, prompt: string) {
  const system = generateSystemFromPrompt(userId, prompt);
  return systemChatResponse(system);
}

export function listSystemChatHistory(userId: string) {
  const sessions = getDatabase()
    .prepare(
      `select * from system_chat_sessions
       where user_id = ?
       order by datetime(updated_at) desc
       limit 20`
    )
    .all(userId) as SystemChatSessionRow[];

  if (sessions.length === 0) {
    return { sessions: [], messages: [] };
  }

  const messages = getDatabase()
    .prepare(
      `select * from system_chat_messages
       where user_id = ? and session_id = ?
       order by datetime(created_at) asc`
    )
    .all(userId, sessions[0].id) as SystemChatMessageRow[];

  return {
    sessions: sessions.map(publicSystemChatSession),
    messages: messages.map(publicSystemChatMessage)
  };
}

export function getSystemChatHistory(userId: string, systemId: string) {
  getSystemDetails(userId, systemId);
  let session = getDatabase()
    .prepare(
      `select * from system_chat_sessions
       where user_id = ? and system_id = ?
       order by datetime(updated_at) desc
       limit 1`
    )
    .get(userId, systemId) as SystemChatSessionRow | undefined;
  if (!session) {
    session = createSystemChatSession(userId, systemId);
  }
  const messages = getDatabase()
    .prepare(
      `select * from system_chat_messages
       where user_id = ? and session_id = ?
       order by datetime(created_at) asc`
    )
    .all(userId, session.id) as SystemChatMessageRow[];
  return {
    session: publicSystemChatSession(session),
    messages: messages.map(publicSystemChatMessage)
  };
}

export async function sendSystemChatMessage(
  userId: string,
  input: { message: string; sessionId?: string; systemId?: string | null }
) {
  const message = String(input.message || "").replace(/\s+/g, " ").trim();
  if (message.length < 2) throw new Error("Descreva o que deseja criar ou alterar.");
  if (message.length > MAX_PROMPT_LENGTH) throw new Error("Mensagem muito longa. Envie até 4000 caracteres.");

  let session = resolveSystemChatSession(userId, input);
  let systemId = input.systemId || session.system_id || null;
  insertSystemChatMessage(userId, session.id, systemId, "user", message);

  const exportFormat = detectSystemExportFormat(message);
  let system = systemId ? getSystemDetails(userId, systemId) : null;
  let file: Awaited<ReturnType<typeof exportSystem>>["file"] | null = null;
  let response = "";
  let action: "created" | "updated" | "exported";

  if (exportFormat && systemId) {
    const exported = await exportSystem(userId, systemId, exportFormat);
    file = exported.file;
    action = "exported";
    response = `Arquivo ${exportFormat.toUpperCase()} gerado: ${file.name}\nBaixar: ${file.url}`;
  } else if (systemId) {
    system = updateSystemFromPrompt(userId, systemId, message);
    action = "updated";
    response = [
      `Atualizei o sistema: ${system.name}`,
      "",
      `Arquitetura: ${system.architecture}`,
      `Stack: ${system.frontend} + ${system.backend} + ${system.database}`,
      "",
      "Novos pontos principais:",
      ...system.scope.features.slice(0, 6).map((feature: string) => `- ${feature}`)
    ].join("\n");
  } else {
    system = generateSystemFromPrompt(userId, message);
    systemId = system.id;
    action = "created";
    response = systemChatResponse(system);
  }

  getDatabase()
    .prepare("update system_chat_sessions set system_id = ?, title = ?, updated_at = current_timestamp where id = ? and user_id = ?")
    .run(systemId, system?.name || session.title, session.id, userId);
  session = getSystemChatSession(userId, session.id)!;

  insertSystemChatMessage(userId, session.id, systemId, "assistant", response, {
    action,
    systemId,
    fileId: file?.id || null
  });

  auditSystem(userId, systemId, `chat_${action}`, "Chat de Sistemas processado.", { sessionId: session.id, fileId: file?.id || null });

  const messages = getDatabase()
    .prepare(
      `select * from system_chat_messages
       where user_id = ? and session_id = ?
       order by datetime(created_at) asc`
    )
    .all(userId, session.id) as SystemChatMessageRow[];

  return {
    session: publicSystemChatSession(session),
    messages: messages.map(publicSystemChatMessage),
    system,
    file
  };
}
