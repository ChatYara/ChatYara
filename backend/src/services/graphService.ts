import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { ensureDefaultYaraProjectMemory, listProjectMemories } from "./projectMemoryService";

type NodeInput = {
  key: string;
  type: string;
  label: string;
  summary?: string | null;
  importance?: number;
  sourceTable?: string | null;
  sourceId?: string | null;
  metadata?: Record<string, unknown>;
};

type EdgeInput = {
  sourceKey: string;
  targetKey: string;
  relationType: string;
  weight?: number;
  evidence?: string | null;
  metadata?: Record<string, unknown>;
};

type KnowledgeNode = {
  id: string;
  user_id: string;
  node_key: string;
  type: string;
  label: string;
  summary: string | null;
  importance: number;
  source_table: string | null;
  source_id: string | null;
  metadata_json: string;
  created_at: string;
  updated_at: string;
};

type KnowledgeEdge = {
  id: string;
  user_id: string;
  source_node_id: string;
  target_node_id: string;
  relation_type: string;
  weight: number;
  evidence: string | null;
  metadata_json: string;
  created_at: string;
  updated_at: string;
  source_label?: string;
  target_label?: string;
  source_type?: string;
  target_type?: string;
};

function clean(value: unknown, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function safeJson(value: string | null | undefined) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function auditGraph(userId: string, action: string, message: string, metadata: Record<string, unknown> = {}) {
  getDatabase()
    .prepare(
      `insert into graph_audit_logs (id, user_id, action, message, metadata_json)
       values (?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, action, message, JSON.stringify(metadata));
}

function publicNode(row: KnowledgeNode) {
  return {
    id: row.id,
    key: row.node_key,
    type: row.type,
    label: row.label,
    summary: row.summary,
    importance: row.importance,
    sourceTable: row.source_table,
    sourceId: row.source_id,
    metadata: safeJson(row.metadata_json),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function publicEdge(row: KnowledgeEdge) {
  return {
    id: row.id,
    sourceNodeId: row.source_node_id,
    targetNodeId: row.target_node_id,
    relationType: row.relation_type,
    weight: row.weight,
    evidence: row.evidence,
    sourceLabel: row.source_label,
    targetLabel: row.target_label,
    sourceType: row.source_type,
    targetType: row.target_type,
    metadata: safeJson(row.metadata_json),
    created_at: row.created_at
  };
}

function upsertNode(userId: string, input: NodeInput) {
  const key = clean(input.key);
  const label = clean(input.label, key);
  if (!key || !label) throw new Error("Nó inválido.");
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into knowledge_nodes (
        id, user_id, node_key, type, label, summary, importance, source_table, source_id, metadata_json, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
      on conflict(user_id, node_key) do update set
        type = excluded.type,
        label = excluded.label,
        summary = excluded.summary,
        importance = excluded.importance,
        source_table = excluded.source_table,
        source_id = excluded.source_id,
        metadata_json = excluded.metadata_json,
        updated_at = current_timestamp`
    )
    .run(
      id,
      userId,
      key,
      input.type,
      label,
      input.summary || null,
      Math.max(0.1, Math.min(1, input.importance ?? 0.5)),
      input.sourceTable || null,
      input.sourceId || null,
      JSON.stringify(input.metadata || {})
    );
  return getNodeByKey(userId, key)!;
}

function getNodeByKey(userId: string, key: string) {
  return getDatabase()
    .prepare("select * from knowledge_nodes where user_id = ? and node_key = ?")
    .get(userId, key) as KnowledgeNode | undefined;
}

function upsertEdge(userId: string, input: EdgeInput) {
  const source = getNodeByKey(userId, input.sourceKey);
  const target = getNodeByKey(userId, input.targetKey);
  if (!source || !target || source.id === target.id) return null;
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into knowledge_edges (
        id, user_id, source_node_id, target_node_id, relation_type, weight, evidence, metadata_json, updated_at
      ) values (?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)
      on conflict(user_id, source_node_id, target_node_id, relation_type) do update set
        weight = excluded.weight,
        evidence = excluded.evidence,
        metadata_json = excluded.metadata_json,
        updated_at = current_timestamp`
    )
    .run(
      id,
      userId,
      source.id,
      target.id,
      input.relationType,
      Math.max(0.1, Math.min(1, input.weight ?? 0.5)),
      input.evidence || null,
      JSON.stringify(input.metadata || {})
    );
  return id;
}

function addProfileNodes(userId: string) {
  const profile = getDatabase()
    .prepare("select preferred_name, profession, studies, projects_json, interests_json, goals_json from cognitive_profiles where user_id = ?")
    .get(userId) as Record<string, string> | undefined;
  if (!profile) return;
  const userNode = upsertNode(userId, {
    key: `user:${userId}`,
    type: "user",
    label: profile.preferred_name || "Usuário YARA",
    summary: [profile.profession, profile.studies].filter(Boolean).join(" · "),
    importance: 1,
    sourceTable: "users",
    sourceId: userId
  });

  const goals = safeJson(profile.goals_json) as Record<string, string>;
  Object.entries(goals).forEach(([horizon, content]) => {
    if (!content) return;
    const key = `goal:${horizon}:${content.slice(0, 80)}`;
    upsertNode(userId, { key, type: "objective", label: `${horizon}: ${content}`, summary: content, importance: 0.78, sourceTable: "cognitive_profiles" });
    upsertEdge(userId, { sourceKey: userNode.node_key, targetKey: key, relationType: "has_goal", weight: 0.85, evidence: "Perfil cognitivo" });
  });

  const interests = safeJson(profile.interests_json) as string[];
  interests.slice(0, 20).forEach((interest) => {
    const key = `interest:${interest.toLowerCase()}`;
    upsertNode(userId, { key, type: "preference", label: interest, summary: "Interesse do usuário", importance: 0.55, sourceTable: "cognitive_profiles" });
    upsertEdge(userId, { sourceKey: userNode.node_key, targetKey: key, relationType: "is_interested_in", weight: 0.6 });
  });
}

function addProjectMemoryNodes(userId: string) {
  const workspaceProjects = getDatabase()
    .prepare("select id, name, description, type, updated_at from projects where user_id = ? and is_archived = 0 order by updated_at desc limit 120")
    .all(userId) as Array<Record<string, string>>;
  workspaceProjects.forEach((project) => {
    const key = `workspace_project:${project.id}`;
    upsertNode(userId, {
      key,
      type: "project",
      label: project.name,
      summary: project.description || project.type || "Projeto do workspace",
      importance: 0.68,
      sourceTable: "projects",
      sourceId: project.id
    });
    upsertEdge(userId, { sourceKey: `user:${userId}`, targetKey: key, relationType: "owns_project", weight: 0.72 });
  });

  const projects = listProjectMemories(userId);
  projects.forEach((project) => {
    const projectKey = `project_memory:${project.id}`;
    upsertNode(userId, {
      key: projectKey,
      type: "project",
      label: project.name,
      summary: project.description || `${project.current_pillar || ""} ${project.current_phase || ""}`.trim(),
      importance: project.name === "YARA AI" ? 1 : 0.75,
      sourceTable: "project_memories",
      sourceId: project.id
    });
    upsertEdge(userId, { sourceKey: `user:${userId}`, targetKey: projectKey, relationType: "owns_project", weight: 0.9 });

    const phases = getDatabase().prepare("select id, name, pillar, status, summary from project_phases where user_id = ? and project_memory_id = ?").all(userId, project.id) as Array<Record<string, string>>;
    phases.forEach((phase) => {
      const key = `phase:${phase.id}`;
      upsertNode(userId, { key, type: "phase", label: phase.name, summary: phase.summary, importance: phase.status === "in_progress" ? 0.85 : 0.65, sourceTable: "project_phases", sourceId: phase.id, metadata: { pillar: phase.pillar, status: phase.status } });
      upsertEdge(userId, { sourceKey: projectKey, targetKey: key, relationType: "has_phase", weight: 0.82, evidence: phase.status });
    });

    const decisions = getDatabase().prepare("select id, title, content from project_decisions where user_id = ? and project_memory_id = ?").all(userId, project.id) as Array<Record<string, string>>;
    decisions.forEach((decision) => {
      const key = `decision:${decision.id}`;
      upsertNode(userId, { key, type: "decision", label: decision.title, summary: decision.content, importance: 0.8, sourceTable: "project_decisions", sourceId: decision.id });
      upsertEdge(userId, { sourceKey: projectKey, targetKey: key, relationType: "has_decision", weight: 0.86, evidence: decision.content });
      phases.forEach((phase) => {
        if (decision.content?.toLowerCase().includes(String(phase.name).toLowerCase()) || decision.title?.toLowerCase().includes(String(phase.name).toLowerCase())) {
          upsertEdge(userId, { sourceKey: key, targetKey: `phase:${phase.id}`, relationType: "refers_to_phase", weight: 0.78 });
        }
      });
    });

    const commits = getDatabase().prepare("select id, hash, message from project_commits where user_id = ? and project_memory_id = ?").all(userId, project.id) as Array<Record<string, string>>;
    commits.forEach((commit) => {
      const key = `commit:${commit.id}`;
      upsertNode(userId, { key, type: "commit", label: commit.hash, summary: commit.message, importance: 0.62, sourceTable: "project_commits", sourceId: commit.id });
      upsertEdge(userId, { sourceKey: projectKey, targetKey: key, relationType: "has_commit", weight: 0.72, evidence: commit.message });
    });
  });
}

function addMemoryAndFileNodes(userId: string) {
  const memories = getDatabase().prepare("select id, title, category, importance, content, project_id, conversation_id from memories where user_id = ? order by updated_at desc limit 200").all(userId) as Array<Record<string, any>>;
  memories.forEach((memory) => {
    const key = `memory:${memory.id}`;
    upsertNode(userId, { key, type: "memory", label: memory.title, summary: memory.content, importance: Math.min(1, Number(memory.importance || 3) / 5), sourceTable: "memories", sourceId: memory.id, metadata: { category: memory.category } });
    upsertEdge(userId, { sourceKey: `user:${userId}`, targetKey: key, relationType: "remembers", weight: 0.58 });
  });

  const files = getDatabase()
    .prepare(
      `select id, name, type, category, conversation_id, message_id from files where user_id = ?
       union all select id, coalesce(original_name, file_name) as name, file_type as type, 'upload' as category, conversation_id, message_id from uploads where user_id = ?
       union all select id, title as name, file_type as type, 'document' as category, null as conversation_id, null as message_id from documents where user_id = ?
       union all select id, coalesce(original_name, file_name) as name, file_type as type, 'image' as category, conversation_id, null as message_id from images where user_id = ?`
    )
    .all(userId, userId, userId, userId) as Array<Record<string, any>>;
  files.slice(0, 250).forEach((file) => {
    const key = `file:${file.id}`;
    upsertNode(userId, { key, type: "file", label: file.name, summary: `${file.category} · ${file.type}`, importance: 0.5, sourceTable: "files", sourceId: file.id, metadata: { category: file.category, mime: file.type } });
    upsertEdge(userId, { sourceKey: `user:${userId}`, targetKey: key, relationType: "owns_file", weight: 0.45 });
    if (file.conversation_id) {
      const conversationKey = `conversation:${file.conversation_id}`;
      upsertNode(userId, { key: conversationKey, type: "conversation", label: "Conversa", summary: "Conversa com arquivo vinculado", importance: 0.45, sourceTable: "conversations", sourceId: file.conversation_id });
      upsertEdge(userId, { sourceKey: conversationKey, targetKey: key, relationType: "has_file", weight: 0.7 });
    }
  });
}

function addConversationNodes(userId: string) {
  const conversations = getDatabase()
    .prepare("select id, title from conversations where user_id = ? and is_archived = 0 order by updated_at desc limit 80")
    .all(userId) as Array<{ id: string; title: string }>;
  conversations.forEach((conversation) => {
    const key = `conversation:${conversation.id}`;
    upsertNode(userId, { key, type: "conversation", label: conversation.title || "Conversa", summary: "Histórico de chat com a YARA", importance: 0.45, sourceTable: "conversations", sourceId: conversation.id });
    upsertEdge(userId, { sourceKey: `user:${userId}`, targetKey: key, relationType: "had_conversation", weight: 0.42 });
  });
}

function createInsights(userId: string) {
  getDatabase().prepare("delete from graph_insights where user_id = ?").run(userId);
  const rows = getDatabase()
    .prepare(
      `select knowledge_nodes.id, knowledge_nodes.label, knowledge_nodes.type, count(knowledge_edges.id) as degree
       from knowledge_nodes
       left join knowledge_edges on knowledge_edges.user_id = knowledge_nodes.user_id
        and (knowledge_edges.source_node_id = knowledge_nodes.id or knowledge_edges.target_node_id = knowledge_nodes.id)
       where knowledge_nodes.user_id = ?
       group by knowledge_nodes.id
       order by degree desc, knowledge_nodes.importance desc
       limit 5`
    )
    .all(userId) as Array<{ label: string; type: string; degree: number }>;

  rows.forEach((row) => {
    getDatabase()
      .prepare(
        `insert into graph_insights (id, user_id, title, content, insight_type, confidence, metadata_json)
         values (?, ?, ?, ?, 'centrality', ?, ?)`
      )
      .run(
        uuid(),
        userId,
        `${row.label} é uma entidade central`,
        `${row.label} aparece com ${row.degree} conexões no grafo de conhecimento.`,
        Math.min(0.95, 0.55 + Number(row.degree || 0) / 20),
        JSON.stringify({ type: row.type, degree: row.degree })
      );
  });
}

export function rebuildKnowledgeGraph(userId: string) {
  ensureDefaultYaraProjectMemory(userId);
  getDatabase().prepare("delete from knowledge_edges where user_id = ?").run(userId);
  getDatabase().prepare("delete from knowledge_nodes where user_id = ?").run(userId);

  upsertNode(userId, { key: `user:${userId}`, type: "user", label: "Usuário YARA", summary: "Conta autenticada na YARA AI", importance: 1, sourceTable: "users", sourceId: userId });
  addProfileNodes(userId);
  addProjectMemoryNodes(userId);
  addMemoryAndFileNodes(userId);
  addConversationNodes(userId);
  createInsights(userId);
  auditGraph(userId, "rebuild", "Grafo reconstruído.");
  return graphDashboard(userId);
}

export function graphDashboard(userId: string) {
  const nodes = listGraphNodes(userId, 80);
  const edges = listGraphEdges(userId, 120);
  const insights = listGraphInsights(userId);
  const topNodes = [...nodes].sort((a, b) => Number(b.importance) - Number(a.importance)).slice(0, 10);
  return {
    totals: { nodes: nodes.length, edges: edges.length, insights: insights.length },
    topNodes,
    recentEdges: edges.slice(0, 12),
    insights,
    nodes,
    edges
  };
}

export function listGraphNodes(userId: string, limit = 120) {
  const rows = getDatabase()
    .prepare("select * from knowledge_nodes where user_id = ? order by importance desc, updated_at desc limit ?")
    .all(userId, limit) as KnowledgeNode[];
  return rows.map(publicNode);
}

export function listGraphEdges(userId: string, limit = 160) {
  const rows = getDatabase()
    .prepare(
      `select knowledge_edges.*, source.label as source_label, source.type as source_type, target.label as target_label, target.type as target_type
       from knowledge_edges
       join knowledge_nodes source on source.id = knowledge_edges.source_node_id
       join knowledge_nodes target on target.id = knowledge_edges.target_node_id
       where knowledge_edges.user_id = ?
       order by knowledge_edges.updated_at desc, knowledge_edges.weight desc
       limit ?`
    )
    .all(userId, limit) as KnowledgeEdge[];
  return rows.map(publicEdge);
}

export function listGraphInsights(userId: string) {
  return getDatabase()
    .prepare("select id, title, content, insight_type, confidence, metadata_json, created_at from graph_insights where user_id = ? order by confidence desc, updated_at desc limit 20")
    .all(userId)
    .map((row: any) => ({ ...row, metadata: safeJson(row.metadata_json) }));
}

export function queryKnowledgeGraph(userId: string, query: string) {
  const q = clean(query).slice(0, 500);
  if (q.length < 2) throw new Error("Informe uma consulta para o grafo.");
  const terms = Array.from(
    new Set(
      q
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9]+/i)
        .filter((term) => term.length >= 3 && !["que", "com", "dos", "das", "para", "sobre", "relacionado", "relacionada", "quais", "como", "meus", "minhas"].includes(term))
    )
  ).slice(0, 8);
  const likes = [`%${q.toLowerCase()}%`, ...terms.map((term) => `%${term}%`)];
  const conditions = likes.map(() => "(lower(label) like ? or lower(coalesce(summary, '')) like ? or lower(type) like ?)").join(" or ");
  const params = likes.flatMap((like) => [like, like, like]);
  let nodes = getDatabase()
    .prepare(
      `select * from knowledge_nodes
       where user_id = ? and (${conditions})
       order by importance desc, updated_at desc
       limit 20`
    )
    .all(userId, ...params) as KnowledgeNode[];
  if (nodes.length === 0) {
    rebuildKnowledgeGraph(userId);
    nodes = getDatabase()
      .prepare(
        `select * from knowledge_nodes
         where user_id = ? and (${conditions})
         order by importance desc, updated_at desc
         limit 20`
      )
      .all(userId, ...params) as KnowledgeNode[];
  }
  const ids = nodes.map((node) => node.id);
  const edges = ids.length
    ? getDatabase()
        .prepare(
          `select knowledge_edges.*, source.label as source_label, source.type as source_type, target.label as target_label, target.type as target_type
           from knowledge_edges
           join knowledge_nodes source on source.id = knowledge_edges.source_node_id
           join knowledge_nodes target on target.id = knowledge_edges.target_node_id
           where knowledge_edges.user_id = ?
             and (knowledge_edges.source_node_id in (${ids.map(() => "?").join(",")}) or knowledge_edges.target_node_id in (${ids.map(() => "?").join(",")}))
           order by knowledge_edges.weight desc
           limit 40`
        )
        .all(userId, ...ids, ...ids) as KnowledgeEdge[]
    : [];
  const result = { query: q, nodes: nodes.map(publicNode), edges: edges.map(publicEdge), insights: listGraphInsights(userId).slice(0, 5) };
  getDatabase()
    .prepare("insert into graph_queries (id, user_id, query, result_json) values (?, ?, ?, ?)")
    .run(uuid(), userId, q, JSON.stringify(result));
  auditGraph(userId, "query", "Consulta GraphRAG executada.", { query: q, nodes: result.nodes.length, edges: result.edges.length });
  return result;
}

export function readGraphContext(userId: string, query: string) {
  if (!/(relacionad|relaç|relac|conecta|conex|grafo|sabe sobre|ligad|metas?|estudos?|projetos?)/i.test(query)) return "";
  const result = queryKnowledgeGraph(userId, query);
  if (result.nodes.length === 0) return "";
  return [
    "Contexto do grafo de conhecimento:",
    `Nós relevantes: ${result.nodes.slice(0, 8).map((node) => `${node.label} (${node.type})`).join(", ")}.`,
    `Relações: ${result.edges.slice(0, 8).map((edge) => `${edge.sourceLabel} --${edge.relationType}--> ${edge.targetLabel}`).join(" | ") || "nenhuma relação direta encontrada"}.`,
    `Insights: ${result.insights.slice(0, 3).map((item: any) => item.title).join(" | ") || "sem insights"}`
  ].join("\n");
}

export function answerGraphQuestion(userId: string, message: string) {
  if (!/(o que est[aá] relacionado|decisões.*ligad|decisoes.*ligad|arquivos?.*relaç|o que voc[eê] sabe sobre meus projetos|metas?.*conectam|estudos?.*conectam|grafo|conhecimento)/i.test(message)) {
    return null;
  }
  const result = queryKnowledgeGraph(userId, message);
  if (result.nodes.length === 0) {
    return "Ainda não encontrei relações suficientes no grafo. Posso reconstruir o conhecimento conforme você adiciona projetos, memórias, arquivos e decisões.";
  }
  const relationLines = result.edges.slice(0, 8).map((edge, index) => `${index + 1}. ${edge.sourceLabel} → ${edge.relationType} → ${edge.targetLabel}`);
  return [
    "Encontrei estas conexões no grafo de conhecimento:",
    relationLines.length ? relationLines.join("\n") : "Ainda não há relações diretas suficientes, mas encontrei entidades relacionadas.",
    "",
    "Entidades principais:",
    result.nodes.slice(0, 6).map((node, index) => `${index + 1}. ${node.label} (${node.type})`).join("\n")
  ].join("\n");
}

export function refreshKnowledgeGraphSoon(userId: string) {
  try {
    rebuildKnowledgeGraph(userId);
  } catch {
    auditGraph(userId, "rebuild_failed", "Falha ao atualizar grafo automaticamente.");
  }
}
