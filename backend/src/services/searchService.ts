import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";

type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDuckDuckGoUrl(value: string) {
  const decoded = decodeHtml(value);
  try {
    const parsed = new URL(decoded);
    const uddg = parsed.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : decoded;
  } catch {
    return decoded;
  }
}

function parseDuckDuckGoResults(html: string) {
  const results: SearchResult[] = [];
  const resultRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match = resultRegex.exec(html);

  while (match && results.length < 5) {
    const title = decodeHtml(match[2]);
    const url = extractDuckDuckGoUrl(match[1]);
    const snippet = decodeHtml(match[3]);
    if (title && url) {
      results.push({ title, url, snippet });
    }
    match = resultRegex.exec(html);
  }

  return results;
}

function formatSearchResponse(query: string, results: SearchResult[]) {
  if (results.length === 0) {
    return `Não encontrei resultados confiáveis para "${query}" neste momento.`;
  }

  return [
    `Encontrei ${results.length} fonte${results.length === 1 ? "" : "s"} para "${query}":`,
    ...results.map((result, index) => `${index + 1}. ${result.title}\n${result.snippet}\nFonte: ${result.url}`)
  ].join("\n\n");
}

function saveSearch(userId: string, query: string, status: string, response: string, results: SearchResult[]) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into search_history (id, user_id, query, status, response, results_json)
       values (?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, query, status, response, JSON.stringify(results));

  return {
    id,
    query,
    status,
    response,
    results,
    providerConfigured: true,
    created_at: new Date().toISOString()
  };
}

export function shouldUseOnlineSearch(message: string) {
  return /\b(pesquise|pesquisar|busque|buscar|internet|web|not[ií]cia|noticias|hoje|agora|atual|atualizado|pre[cç]o|cotação|cotacao|2026)\b/i.test(
    message
  );
}

export async function runSearch(userId: string, query: string) {
  const cleanQuery = query.replace(/\s+/g, " ").trim();

  if (cleanQuery.length < 3) {
    throw new Error("Informe uma busca mais específica.");
  }

  try {
    const url = new URL("https://duckduckgo.com/html/");
    url.searchParams.set("q", cleanQuery);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "YARA-AI/1.0 (+https://yarachat.onrender.com)",
        Accept: "text/html"
      }
    });

    if (!response.ok) {
      throw new Error(`Busca retornou status ${response.status}.`);
    }

    const html = await response.text();
    const results = parseDuckDuckGoResults(html);
    const answer = formatSearchResponse(cleanQuery, results);
    return saveSearch(userId, cleanQuery, results.length ? "completed" : "empty", answer, results);
  } catch {
    const response =
      "Não consegui acessar a busca online agora. Não vou fingir que pesquisei; tente novamente em alguns instantes ou me envie uma fonte para eu analisar.";

    return saveSearch(userId, cleanQuery, "failed", response, []);
  }
}

export function listSearchHistory(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, query, status, response, results_json, created_at
       from search_history
       where user_id = ?
       order by created_at desc
       limit 30`
    )
    .all(userId) as Array<{ id: string; query: string; status: string; response: string; results_json: string; created_at: string }>;

  return rows.map((row) => ({
    id: row.id,
    query: row.query,
    status: row.status,
    response: row.response,
    results: JSON.parse(row.results_json || "[]") as SearchResult[],
    created_at: row.created_at
  }));
}
