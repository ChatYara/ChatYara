import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { readGraphContext } from "./graphService";
import { readIntelligentMemoryContext } from "./memoryService";
import { readCognitiveProfileContext } from "./profileService";
import { readProjectMemoryContext } from "./projectMemoryService";
import { readSemanticSearchContext } from "./semanticSearchService";

type AgentRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  specialty: string;
  base_prompt: string;
  status: string;
  settings_json: string;
  is_default: number;
  created_at: string;
  updated_at: string;
};

type AgentConversationRow = {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type AgentMessageRow = {
  id: string;
  user_id: string;
  agent_id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata_json: string;
  created_at: string;
};

const DEFAULT_AGENTS = [
  ["Agente Geral", "Coordena tarefas amplas, organização e estratégia.", "geral", "Atue como agente coordenador da YARA. Seja objetivo, organize próximos passos e acione especialistas quando necessário."],
  ["Agente Programação", "Cria sistemas, APIs, arquitetura, código e planos técnicos.", "programacao", "Atue como arquiteto de software. Escolha stack, APIs, banco, segurança, estrutura e plano de desenvolvimento."],
  ["Agente Engenharia", "Apoia engenharia, obras, inspeções, manutenção e layouts técnicos.", "engenharia", "Atue como especialista técnico em engenharia, inspeções, manutenção e projetos técnicos. Não assine ART nem substitua responsável técnico."],
  ["Agente Jurídico", "Analisa contratos, riscos, cláusulas e linguagem jurídica.", "juridico", "Atue como assistente jurídico informativo. Aponte riscos e perguntas para validação com advogado. Não ofereça parecer legal definitivo."],
  ["Agente Financeiro", "Organiza orçamento, custos, fluxo de caixa e análise financeira.", "financeiro", "Atue como analista financeiro. Estruture custos, orçamento, premissas, riscos e indicadores."],
  ["Agente RH", "Apoia recrutamento, comunicação interna, cargos e escalas.", "rh", "Atue como especialista em RH. Ajude com cargos, processos, comunicação, entrevistas, escalas e políticas internas."],
  ["Agente Comercial", "Apoia vendas, propostas, CRM, negociação e relacionamento.", "comercial", "Atue como consultor comercial. Organize proposta, argumentos, etapas de venda e follow-up."],
  ["Agente Marketing", "Cria campanhas, posicionamento, copy e planejamento de conteúdo.", "marketing", "Atue como estrategista de marketing. Crie campanhas, públicos, mensagens e canais com foco em conversão."],
  ["Agente Pesquisa", "Pesquisa, compara, sintetiza e organiza informações.", "pesquisa", "Atue como pesquisador. Seja claro sobre fontes disponíveis e não invente dados atuais sem pesquisa configurada."]
] as const;

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function publicAgent(row: AgentRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    specialty: row.specialty,
    basePrompt: row.base_prompt,
    status: row.status,
    settings: parseJson<Record<string, unknown>>(row.settings_json, {}),
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicConversation(row: AgentConversationRow) {
  return {
    id: row.id,
    agentId: row.agent_id,
    title: row.title,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicMessage(row: AgentMessageRow) {
  return {
    id: row.id,
    agentId: row.agent_id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    createdAt: row.created_at
  };
}

function auditAgent(userId: string, agentId: string | null, action: string, message: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into agent_audit_logs (id, user_id, agent_id, action, message, metadata_json)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, agentId, action, message, JSON.stringify(metadata));
}

export function ensureDefaultAgents(userId: string) {
  const existing = Number((getDatabase().prepare("select count(*) as total from agents where user_id = ?").get(userId) as { total: number }).total || 0);
  if (existing > 0) return;

  const insert = getDatabase().prepare(
    `insert into agents (id, user_id, name, description, specialty, base_prompt, status, settings_json, is_default)
     values (?, ?, ?, ?, ?, ?, 'active', ?, 1)`
  );

  for (const [name, description, specialty, prompt] of DEFAULT_AGENTS) {
    insert.run(uuid(), userId, name, description, specialty, prompt, JSON.stringify({ tone: "professional", language: "pt-BR" }));
  }
  auditAgent(userId, null, "seed_defaults", "Agentes iniciais criados.");
}

export function listAgents(userId: string) {
  ensureDefaultAgents(userId);
  const agents = getDatabase()
    .prepare("select * from agents where user_id = ? order by is_default desc, name asc")
    .all(userId) as AgentRow[];
  return { agents: agents.map(publicAgent), dashboard: agentDashboard(userId) };
}

export function getAgent(userId: string, agentId: string) {
  ensureDefaultAgents(userId);
  const agent = getDatabase().prepare("select * from agents where id = ? and user_id = ?").get(agentId, userId) as AgentRow | undefined;
  if (!agent) throw new Error("Agente não encontrado.");
  const memories = getDatabase()
    .prepare("select id, key, content, importance, metadata_json, created_at, updated_at from agent_memory where user_id = ? and agent_id = ? order by importance desc, updated_at desc limit 20")
    .all(userId, agentId);
  return { agent: publicAgent(agent), memories };
}

export function createAgent(userId: string, input: { name: string; description: string; specialty: string; basePrompt: string; status?: string; settings?: Record<string, unknown> }) {
  const id = uuid();
  const status = input.status === "inactive" ? "inactive" : "active";
  getDatabase()
    .prepare(
      `insert into agents (id, user_id, name, description, specialty, base_prompt, status, settings_json, is_default)
       values (?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
    .run(id, userId, input.name, input.description, input.specialty, input.basePrompt, status, JSON.stringify(input.settings || {}));
  auditAgent(userId, id, "create", "Agente criado.", { specialty: input.specialty });
  return getAgent(userId, id).agent;
}

export function updateAgent(userId: string, agentId: string, input: Partial<{ name: string; description: string; specialty: string; basePrompt: string; status: string; settings: Record<string, unknown> }>) {
  const current = getAgent(userId, agentId).agent;
  const status = input.status === "inactive" ? "inactive" : input.status === "active" ? "active" : current.status;
  getDatabase()
    .prepare(
      `update agents
       set name = ?, description = ?, specialty = ?, base_prompt = ?, status = ?, settings_json = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(
      input.name || current.name,
      input.description || current.description,
      input.specialty || current.specialty,
      input.basePrompt || current.basePrompt,
      status,
      JSON.stringify(input.settings || current.settings || {}),
      agentId,
      userId
    );
  auditAgent(userId, agentId, "update", "Agente atualizado.");
  return getAgent(userId, agentId).agent;
}

export function deleteAgent(userId: string, agentId: string) {
  const current = getAgent(userId, agentId).agent;
  const db = getDatabase();
  db.prepare("delete from agent_messages where user_id = ? and agent_id = ?").run(userId, agentId);
  db.prepare("delete from agent_conversations where user_id = ? and agent_id = ?").run(userId, agentId);
  db.prepare("delete from agent_memory where user_id = ? and agent_id = ?").run(userId, agentId);
  db.prepare("delete from agent_collaborations where user_id = ? and (source_agent_id = ? or target_agent_id = ?)").run(userId, agentId, agentId);
  db.prepare("update agent_audit_logs set agent_id = null where user_id = ? and agent_id = ?").run(userId, agentId);
  const result = getDatabase().prepare("delete from agents where id = ? and user_id = ?").run(agentId, userId);
  if (result.changes === 0) throw new Error("Agente não encontrado.");
  auditAgent(userId, null, "delete", "Agente excluído.", { name: current.name, agentId });
  return { id: agentId };
}

export function routeAgent(userId: string, message: string) {
  ensureDefaultAgents(userId);
  const text = normalize(message);
  const route = (() => {
    if (/\b(sistema|app|aplicativo|api|codigo|programa|software|plataforma|deploy|banco)\b/.test(text)) return "programacao";
    if (/\b(engenharia|obra|inspecao|manutencao|layout|planta|projeto tecnico|orcamento de obra)\b/.test(text)) return "engenharia";
    if (/\b(contrato|juridico|clausula|lei|processo|termo|politica de privacidade)\b/.test(text)) return "juridico";
    if (/\b(financeiro|orcamento|custo|fluxo de caixa|preco|faturamento|despesa)\b/.test(text)) return "financeiro";
    if (/\b(rh|funcionario|colaborador|entrevista|cargo|salario|escala)\b/.test(text)) return "rh";
    if (/\b(venda|comercial|cliente|proposta|negociacao|crm)\b/.test(text)) return "comercial";
    if (/\b(marketing|campanha|instagram|copy|conteudo|marca|anuncio)\b/.test(text)) return "marketing";
    if (/\b(pesquise|pesquisa|procure|noticia|fonte|compare|informacao atual)\b/.test(text)) return "pesquisa";
    return "geral";
  })();
  const agent = getDatabase()
    .prepare("select * from agents where user_id = ? and specialty = ? and status = 'active' order by is_default desc, updated_at desc limit 1")
    .get(userId, route) as AgentRow | undefined;
  if (!agent) {
    const fallback = getDatabase().prepare("select * from agents where user_id = ? and status = 'active' order by is_default desc limit 1").get(userId) as AgentRow | undefined;
    if (!fallback) throw new Error("Nenhum agente ativo encontrado.");
    return { agent: publicAgent(fallback), reason: "Fallback para agente ativo disponível." };
  }
  return { agent: publicAgent(agent), reason: `Roteado por especialidade: ${route}.` };
}

function conversationTitle(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean || "Conversa com agente";
}

function getOrCreateConversation(userId: string, agentId: string, conversationId: string | undefined, message: string) {
  if (conversationId) {
    const existing = getDatabase()
      .prepare("select * from agent_conversations where id = ? and user_id = ? and agent_id = ?")
      .get(conversationId, userId, agentId) as AgentConversationRow | undefined;
    if (!existing) throw new Error("Conversa do agente não encontrada.");
    return existing;
  }
  const id = uuid();
  getDatabase()
    .prepare("insert into agent_conversations (id, user_id, agent_id, title) values (?, ?, ?, ?)")
    .run(id, userId, agentId, conversationTitle(message));
  return getDatabase().prepare("select * from agent_conversations where id = ? and user_id = ?").get(id, userId) as AgentConversationRow;
}

function readAgentMemory(userId: string, agentId: string) {
  const rows = getDatabase()
    .prepare("select key, content from agent_memory where user_id = ? and agent_id = ? order by importance desc, updated_at desc limit 8")
    .all(userId, agentId) as Array<{ key: string; content: string }>;
  return rows.map((row) => `${row.key}: ${row.content}`).join("\n");
}

function buildAgentContext(userId: string, agentId: string, message: string) {
  return [
    readCognitiveProfileContext(userId),
    readIntelligentMemoryContext(userId, message),
    readProjectMemoryContext(userId, message),
    readGraphContext(userId, message),
    readSemanticSearchContext(userId, message),
    readAgentMemory(userId, agentId)
  ].filter(Boolean).join("\n\n");
}

function agentResponse(agent: ReturnType<typeof publicAgent>, message: string, context: string) {
  const text = normalize(message);
  const bullets: string[] = [];
  if (agent.specialty === "programacao") bullets.push("Arquitetura sugerida", "Banco de dados", "APIs principais", "Segurança e deploy");
  else if (agent.specialty === "engenharia") bullets.push("Diagnóstico técnico", "Riscos", "Materiais/quantitativos", "Plano de ação");
  else if (agent.specialty === "juridico") bullets.push("Pontos de atenção", "Riscos", "Cláusulas a revisar", "Validação profissional");
  else if (agent.specialty === "financeiro") bullets.push("Premissas", "Custos", "Indicadores", "Riscos financeiros");
  else if (agent.specialty === "marketing") bullets.push("Público", "Mensagem", "Canais", "Próxima campanha");
  else if (agent.specialty === "pesquisa") bullets.push("Pergunta central", "Critérios", "Fontes necessárias", "Síntese");
  else bullets.push("Resumo", "Ação recomendada", "Próximos passos");

  const compactContext = context ? "\n\nContexto usado: memória/perfil/grafo/busca do usuário." : "";
  const action = /\b(crie|criar|faca|fazer|analise|monte|gere|organize|pesquise)\b/.test(text) ? "Vou executar a solicitação em etapas." : "Vou organizar a resposta de forma objetiva.";
  return [
    `${agent.name}: ${action}`,
    "",
    ...bullets.map((item, index) => `${index + 1}. ${item}: ${buildAgentLine(agent.specialty, item, message)}`),
    "",
    "Próximo passo: confirme se quer que eu detalhe, gere um documento ou encaminhe para outro agente." + compactContext
  ].join("\n");
}

function buildAgentLine(specialty: string, topic: string, message: string) {
  const clean = message.length > 110 ? `${message.slice(0, 110)}...` : message;
  if (specialty === "programacao" && topic.includes("Arquitetura")) return "definir módulos, telas, API e banco com base no briefing.";
  if (specialty === "engenharia" && topic.includes("Riscos")) return "classificar riscos e separar recomendações técnicas.";
  if (specialty === "juridico" && topic.includes("Riscos")) return "mapear riscos informativos sem substituir advogado.";
  if (specialty === "financeiro" && topic.includes("Custos")) return "estruturar valores, categorias e premissas.";
  if (specialty === "pesquisa" && topic.includes("Fontes")) return "usar busca online quando configurada e citar fontes reais.";
  return clean;
}

function storeAgentMemory(userId: string, agentId: string, message: string, response: string) {
  const key = conversationTitle(message);
  getDatabase()
    .prepare(
      `insert into agent_memory (id, user_id, agent_id, key, content, importance, metadata_json)
       values (?, ?, ?, ?, ?, 3, ?)`
    )
    .run(uuid(), userId, agentId, key, response.slice(0, 900), JSON.stringify({ source: "agent_chat" }));
}

export function sendAgentChat(userId: string, input: { message: string; agentId?: string; conversationId?: string }) {
  const message = String(input.message || "").replace(/\s+/g, " ").trim();
  if (message.length < 2) throw new Error("Digite uma mensagem para o agente.");
  if (message.length > 4000) throw new Error("Mensagem muito longa. Envie até 4000 caracteres.");
  const routed = input.agentId ? { agent: getAgent(userId, input.agentId).agent, reason: "Agente selecionado manualmente." } : routeAgent(userId, message);
  if (routed.agent.status !== "active") throw new Error("Este agente está inativo.");
  const conversation = getOrCreateConversation(userId, routed.agent.id, input.conversationId, message);
  const context = buildAgentContext(userId, routed.agent.id, message);
  const response = agentResponse(routed.agent, message, context);
  const db = getDatabase();
  db.prepare("insert into agent_messages (id, user_id, agent_id, conversation_id, role, content, metadata_json) values (?, ?, ?, ?, 'user', ?, ?)")
    .run(uuid(), userId, routed.agent.id, conversation.id, message, JSON.stringify({ routeReason: routed.reason }));
  db.prepare("insert into agent_messages (id, user_id, agent_id, conversation_id, role, content, metadata_json) values (?, ?, ?, ?, 'assistant', ?, ?)")
    .run(uuid(), userId, routed.agent.id, conversation.id, response, JSON.stringify({ contextUsed: Boolean(context) }));
  db.prepare("update agent_conversations set updated_at = current_timestamp where id = ? and user_id = ?").run(conversation.id, userId);
  storeAgentMemory(userId, routed.agent.id, message, response);
  auditAgent(userId, routed.agent.id, "chat", "Mensagem processada pelo agente.", { conversationId: conversation.id, routeReason: routed.reason });
  return { agent: routed.agent, conversation: publicConversation(conversation), messages: listAgentMessages(userId, conversation.id), response, routeReason: routed.reason };
}

function listAgentMessages(userId: string, conversationId: string) {
  const rows = getDatabase()
    .prepare("select * from agent_messages where user_id = ? and conversation_id = ? order by datetime(created_at) asc")
    .all(userId, conversationId) as AgentMessageRow[];
  return rows.map(publicMessage);
}

export function listAgentChatHistory(userId: string, agentId?: string, conversationId?: string) {
  ensureDefaultAgents(userId);
  const rows = agentId
    ? getDatabase().prepare("select * from agent_conversations where user_id = ? and agent_id = ? order by datetime(updated_at) desc limit 30").all(userId, agentId)
    : getDatabase().prepare("select * from agent_conversations where user_id = ? order by datetime(updated_at) desc limit 30").all(userId);
  const conversations = (rows as AgentConversationRow[]).map(publicConversation);
  const selected = conversationId && conversations.some((item) => item.id === conversationId)
    ? conversationId
    : conversations[0]?.id;
  const messages = selected ? listAgentMessages(userId, selected) : [];
  return { conversations, messages };
}

export function collaborateAgents(userId: string, input: { sourceAgentId: string; targetAgentId: string; request: string; conversationId?: string }) {
  const source = getAgent(userId, input.sourceAgentId).agent;
  const target = getAgent(userId, input.targetAgentId).agent;
  const response = agentResponse(target, input.request, buildAgentContext(userId, target.id, input.request));
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into agent_collaborations (id, user_id, source_agent_id, target_agent_id, conversation_id, request, response)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, source.id, target.id, input.conversationId || null, input.request, response);
  auditAgent(userId, source.id, "collaborate", "Colaboração entre agentes registrada.", { targetAgentId: target.id });
  return { collaboration: { id, sourceAgent: source, targetAgent: target, request: input.request, response, status: "completed" } };
}

export function agentDashboard(userId: string) {
  ensureDefaultAgents(userId);
  const count = (sql: string, ...params: Array<string | number | null>) => Number((getDatabase().prepare(sql).get(...params) as { total: number } | undefined)?.total || 0);
  const recent = getDatabase()
    .prepare(
      `select agent_messages.content, agent_messages.role, agent_messages.created_at, agents.name as agent_name
       from agent_messages
       join agents on agents.id = agent_messages.agent_id
       where agent_messages.user_id = ?
       order by datetime(agent_messages.created_at) desc
       limit 8`
    )
    .all(userId);
  const usage = getDatabase()
    .prepare(
      `select agents.name, count(agent_messages.id) as total
       from agents
       left join agent_messages on agent_messages.agent_id = agents.id and agent_messages.user_id = agents.user_id
       where agents.user_id = ?
       group by agents.id
       order by total desc, agents.name asc`
    )
    .all(userId);
  return {
    totals: {
      agents: count("select count(*) as total from agents where user_id = ?", userId),
      activeAgents: count("select count(*) as total from agents where user_id = ? and status = 'active'", userId),
      conversations: count("select count(*) as total from agent_conversations where user_id = ?", userId),
      memories: count("select count(*) as total from agent_memory where user_id = ?", userId),
      collaborations: count("select count(*) as total from agent_collaborations where user_id = ?", userId)
    },
    recent,
    usage
  };
}

export function answerAgentIntent(userId: string, message: string) {
  const text = normalize(message);
  if (!/\b(agente|juridico|financeiro|marketing|comercial|rh|pesquise|contrato|campanha)\b/.test(text)) return null;
  const result = sendAgentChat(userId, { message });
  return result.response;
}
