import dns from "node:dns/promises";
import net from "node:net";
import { v4 as uuid } from "uuid";
import { env, type SearchProviderName } from "../config/env";
import { getDatabase } from "../db/connection";

export type SearchSource = {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
};

export type SearchResult = SearchSource & {
  content?: string;
};

type SearchHistoryRow = {
  id: string;
  query: string;
  provider: string;
  status: string;
  response: string;
  results_json: string;
  sources_json: string;
  created_at: string;
};

const notConfiguredMessage = "A pesquisa online ainda não foi configurada pelo administrador.";
const youtubeTranscriptMessage =
  "Consigo identificar o vídeo, mas a transcrição do YouTube ainda precisa ser configurada.";
const blockedExtensions = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".js",
  ".ts",
  ".php",
  ".ps1",
  ".vbs",
  ".msi",
  ".dmg",
  ".apk"
]);

function selectedProviderKey() {
  const keys: Record<SearchProviderName, string> = {
    tavily: env.tavilyApiKey,
    serpapi: env.serpapiApiKey,
    brave: env.braveSearchApiKey,
    firecrawl: env.firecrawlApiKey
  };

  return keys[env.searchProvider]?.trim() || "";
}

export function isSearchConfigured() {
  return selectedProviderKey().length > 0;
}

function normalizeQuery(query: string) {
  return query.replace(/\s+/g, " ").trim().slice(0, 500);
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string) {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  return decodeHtml(withoutNoise.replace(/<[^>]+>/g, " ")).slice(0, 8000);
}

function titleFromHtml(html: string) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? decodeHtml(match[1]).slice(0, 180) : "Página analisada";
}

function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function uniqueSources(results: SearchResult[]) {
  const seen = new Set<string>();
  const sources: SearchSource[] = [];

  for (const result of results) {
    if (!result.url || seen.has(result.url)) continue;
    seen.add(result.url);
    sources.push({
      title: result.title || result.url,
      url: result.url,
      domain: result.domain || domainFromUrl(result.url),
      snippet: result.snippet
    });
  }

  return sources.slice(0, 8);
}

function formatSources(sources: SearchSource[]) {
  if (!sources.length) return "";
  return [
    "Fontes:",
    ...sources.map((source, index) => `${index + 1}. ${source.title} — ${source.domain}`)
  ].join("\n");
}

function formatSearchResponse(query: string, results: SearchResult[]) {
  if (!results.length) {
    return `Não encontrei resultados confiáveis para "${query}" neste momento.`;
  }

  const summary = results
    .slice(0, 5)
    .map((result) => `- ${result.title}: ${result.snippet || result.content || "Fonte encontrada."}`)
    .join("\n");
  const sources = formatSources(uniqueSources(results));
  return [`Encontrei fontes para "${query}".`, summary, sources].filter(Boolean).join("\n\n");
}

function saveSearch(input: {
  userId: string;
  query: string;
  provider: string;
  status: string;
  response: string;
  results: SearchResult[];
  sources?: SearchSource[];
}) {
  const id = uuid();
  const sources = input.sources || uniqueSources(input.results);
  getDatabase()
    .prepare(
      `insert into search_history (id, user_id, query, provider, status, response, results_json, sources_json)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.userId,
      input.query,
      input.provider,
      input.status,
      input.response,
      JSON.stringify(input.results),
      JSON.stringify(sources)
    );

  return {
    id,
    query: input.query,
    provider: input.provider,
    status: input.status,
    response: input.response,
    results: input.results,
    sources,
    providerConfigured: isSearchConfigured(),
    created_at: new Date().toISOString()
  };
}

function parseJsonArray<T>(value: string, fallback: T[] = []) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function extractUrls(message: string) {
  const matches = message.match(/https?:\/\/[^\s<>"')\]]+/gi) || [];
  return Array.from(new Set(matches.map((url) => url.replace(/[.,;:!?]+$/g, "")))).slice(0, 3);
}

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    );
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80");
  }

  return false;
}

async function assertSafeUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("URL inválida.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Somente links HTTP/HTTPS são permitidos.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Links com credenciais não são permitidos.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    throw new Error("Links locais não são permitidos.");
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("Links para redes privadas não são permitidos.");
  }

  const extension = parsed.pathname.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || "";
  if (blockedExtensions.has(extension)) {
    throw new Error("Este tipo de link não pode ser baixado pela YARA.");
  }

  const addresses = await dns.lookup(hostname, { all: true }).catch(() => []);
  if (addresses.some((item) => isPrivateIp(item.address))) {
    throw new Error("O destino do link aponta para rede local ou privada.");
  }

  return parsed;
}

export function isYouTubeUrl(rawUrl: string) {
  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
    return hostname === "youtube.com" || hostname === "youtu.be" || hostname.endsWith(".youtube.com");
  } catch {
    return false;
  }
}

export function shouldUseOnlineSearch(message: string, forced = false) {
  if (forced) return true;
  if (extractUrls(message).length > 0) return true;
  return /\b(pesquise|pesquisar|procure na internet|busque|buscar|not[ií]cias?|pre[cç]o atual|informa[cç][aã]o atualizada|atualizado|cotação|cotacao)\b/i.test(
    message
  );
}

async function searchTavily(query: string) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.tavilyApiKey,
      query,
      search_depth: "basic",
      max_results: 5
    })
  });
  const data = await response.json() as {
    results?: Array<{ title?: string; url?: string; content?: string; snippet?: string }>;
  };
  if (!response.ok) throw new Error("Falha ao consultar Tavily.");
  return (data.results || []).map((item) => ({
    title: item.title || item.url || "Resultado",
    url: item.url || "",
    domain: domainFromUrl(item.url || ""),
    snippet: item.content || item.snippet || "",
    content: item.content || ""
  })).filter((item) => item.url);
}

async function searchSerpApi(query: string) {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", env.serpapiApiKey);
  const response = await fetch(url);
  const data = await response.json() as {
    organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  };
  if (!response.ok) throw new Error("Falha ao consultar SerpAPI.");
  return (data.organic_results || []).slice(0, 5).map((item) => ({
    title: item.title || item.link || "Resultado",
    url: item.link || "",
    domain: domainFromUrl(item.link || ""),
    snippet: item.snippet || ""
  })).filter((item) => item.url);
}

async function searchBrave(query: string) {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "5");
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": env.braveSearchApiKey
    }
  });
  const data = await response.json() as {
    web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
  };
  if (!response.ok) throw new Error("Falha ao consultar Brave Search.");
  return (data.web?.results || []).map((item) => ({
    title: item.title || item.url || "Resultado",
    url: item.url || "",
    domain: domainFromUrl(item.url || ""),
    snippet: item.description || ""
  })).filter((item) => item.url);
}

async function searchFirecrawl(query: string) {
  const response = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.firecrawlApiKey}`
    },
    body: JSON.stringify({ query, limit: 5 })
  });
  const data = await response.json() as {
    data?: Array<{ title?: string; url?: string; description?: string; markdown?: string }>;
  };
  if (!response.ok) throw new Error("Falha ao consultar Firecrawl.");
  return (data.data || []).map((item) => ({
    title: item.title || item.url || "Resultado",
    url: item.url || "",
    domain: domainFromUrl(item.url || ""),
    snippet: item.description || "",
    content: item.markdown || ""
  })).filter((item) => item.url);
}

async function runConfiguredProvider(query: string) {
  if (env.searchProvider === "tavily") return searchTavily(query);
  if (env.searchProvider === "serpapi") return searchSerpApi(query);
  if (env.searchProvider === "brave") return searchBrave(query);
  return searchFirecrawl(query);
}

async function readPage(userId: string, rawUrl: string) {
  if (isYouTubeUrl(rawUrl)) {
    return saveSearch({
      userId,
      query: rawUrl,
      provider: "youtube",
      status: "youtube_transcript_not_configured",
      response: youtubeTranscriptMessage,
      results: [],
      sources: [{ title: "Vídeo do YouTube", url: rawUrl, domain: domainFromUrl(rawUrl) }]
    });
  }

  const parsed = await assertSafeUrl(rawUrl);
  const response = await fetch(parsed, {
    redirect: "follow",
    headers: {
      "User-Agent": "YARA-AI/1.0 (+https://yarachat.onrender.com)",
      Accept: "text/html,application/xhtml+xml,text/plain;q=0.9"
    }
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) throw new Error(`Não consegui ler este link: status ${response.status}.`);
  if (!/text\/html|text\/plain|application\/xhtml\+xml/i.test(contentType)) {
    throw new Error("A YARA só lê páginas de texto ou HTML nesta fase.");
  }

  const html = (await response.text()).slice(0, 200000);
  const title = contentType.includes("text/plain") ? parsed.hostname : titleFromHtml(html);
  const text = stripHtml(html);
  const result = {
    title,
    url: parsed.toString(),
    domain: domainFromUrl(parsed.toString()),
    snippet: text.slice(0, 360),
    content: text.slice(0, 4000)
  };
  const responseText = [`Li o link informado e extraí o conteúdo principal.`, result.content, formatSources([result])]
    .filter(Boolean)
    .join("\n\n");

  return saveSearch({
    userId,
    query: rawUrl,
    provider: "page-reader",
    status: "completed",
    response: responseText,
    results: [result],
    sources: [result]
  });
}

export async function runSearch(userId: string, query: string) {
  const cleanQuery = normalizeQuery(query);

  if (cleanQuery.length < 3) {
    throw new Error("Informe uma busca mais específica.");
  }

  const urls = extractUrls(cleanQuery);
  if (urls.length > 0) {
    try {
      return await readPage(userId, urls[0]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível ler este link.";
      return saveSearch({
        userId,
        query: cleanQuery,
        provider: "page-reader",
        status: "failed",
        response: `${message} Não vou inventar um resumo sem conseguir acessar a fonte.`,
        results: [],
        sources: []
      });
    }
  }

  if (!isSearchConfigured()) {
    return saveSearch({
      userId,
      query: cleanQuery,
      provider: env.searchProvider,
      status: "not_configured",
      response: notConfiguredMessage,
      results: [],
      sources: []
    });
  }

  try {
    const results = await runConfiguredProvider(cleanQuery);
    return saveSearch({
      userId,
      query: cleanQuery,
      provider: env.searchProvider,
      status: results.length ? "completed" : "empty",
      response: formatSearchResponse(cleanQuery, results),
      results
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não consegui acessar a pesquisa online agora.";
    return saveSearch({
      userId,
      query: cleanQuery,
      provider: env.searchProvider,
      status: "failed",
      response: `${message} Não vou fingir que pesquisei.`,
      results: [],
      sources: []
    });
  }
}

export function buildSearchContext(search: Awaited<ReturnType<typeof runSearch>>) {
  if (search.status === "not_configured" || search.status === "youtube_transcript_not_configured" || search.status === "failed") {
    return search.response;
  }

  return [
    `Pesquisa realizada por ${search.provider}.`,
    `Consulta: ${search.query}`,
    search.results
      .slice(0, 5)
      .map((result, index) => `${index + 1}. ${result.title}\nURL: ${result.url}\nResumo: ${result.snippet || result.content || ""}`)
      .join("\n\n"),
    formatSources(search.sources)
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function formatAnswerWithSources(answer: string, sources: SearchSource[]) {
  const sourceText = formatSources(sources);
  return sourceText ? `${answer.trim()}\n\n${sourceText}` : answer.trim();
}

export function listSearchHistory(userId: string) {
  const rows = getDatabase()
    .prepare(
      `select id, query, provider, status, response, results_json, sources_json, created_at
       from search_history
       where user_id = ?
       order by created_at desc
       limit 30`
    )
    .all(userId) as SearchHistoryRow[];

  return rows.map((row) => ({
    id: row.id,
    query: row.query,
    provider: row.provider,
    status: row.status,
    response: row.response,
    results: parseJsonArray<SearchResult>(row.results_json),
    sources: parseJsonArray<SearchSource>(row.sources_json),
    created_at: row.created_at
  }));
}

export function getSearchHistoryItem(userId: string, searchId: string) {
  const row = getDatabase()
    .prepare(
      `select id, query, provider, status, response, results_json, sources_json, created_at
       from search_history
       where id = ? and user_id = ?`
    )
    .get(searchId, userId) as SearchHistoryRow | undefined;

  if (!row) {
    throw new Error("Pesquisa não encontrada.");
  }

  return {
    id: row.id,
    query: row.query,
    provider: row.provider,
    status: row.status,
    response: row.response,
    results: parseJsonArray<SearchResult>(row.results_json),
    sources: parseJsonArray<SearchSource>(row.sources_json),
    created_at: row.created_at
  };
}
