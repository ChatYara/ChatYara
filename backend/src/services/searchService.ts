import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

const providerConfigured = false;

function saveSearch(userId: string, query: string, status: string, response: string) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into search_history (id, user_id, query, status, response)
       values (?, ?, ?, ?, ?)`
    )
    .run(id, userId, query, status, response);

  return {
    id,
    query,
    status,
    response,
    results: [],
    providerConfigured,
    created_at: new Date().toISOString()
  };
}

export function shouldUseOnlineSearch(message: string) {
  return /\b(pesquise|pesquisar|busque|buscar|internet|web|not[ií]cia|noticias|hoje|agora|atual|atualizado|pre[cç]o|cotação|cotacao|2026)\b/i.test(
    message
  );
}

export function runSearch(userId: string, query: string) {
  const cleanQuery = query.replace(/\s+/g, " ").trim();

  if (cleanQuery.length < 3) {
    throw new Error("Informe uma busca mais específica.");
  }

  const response = providerConfigured
    ? "Busca online executada."
    : "A busca online da YARA AI ainda precisa de um provedor configurado no servidor. Eu não vou fingir que pesquisei; posso ajudar com conhecimento geral ou você pode configurar um provedor de busca para resultados atualizados.";

  return saveSearch(userId, cleanQuery, providerConfigured ? "completed" : "provider_required", response);
}

export function listSearchHistory(userId: string) {
  return getDatabase()
    .prepare(
      `select id, query, status, response, created_at
       from search_history
       where user_id = ?
       order by created_at desc
       limit 30`
    )
    .all(userId);
}
