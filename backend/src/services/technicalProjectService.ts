import { v4 as uuid } from "uuid";
import { getDatabase } from "../db/connection";
import { generateExportFile } from "./exportService";
import { getFile, toPublicFile } from "./fileService";
import { readGraphContext } from "./graphService";
import { readIntelligentMemoryContext } from "./memoryService";
import { readSemanticSearchContext } from "./semanticSearchService";
import { generateCadBimExport } from "./technicalCadExportService";

type ExportFormat = "pdf" | "docx" | "txt" | "dxf" | "dwg" | "ifc";

type TechnicalProjectRow = {
  id: string;
  user_id: string;
  title: string;
  project_type: string;
  discipline: string;
  description: string;
  location: string | null;
  status: string;
  risk_level: string;
  summary: string | null;
  metadata_json: string;
  created_at: string;
  updated_at: string;
};

type TechnicalInspectionRow = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  diagnosis: string;
  risk_level: string;
  findings_json: string;
  recommendations_json: string;
  action_plan_json: string;
  status: string;
  metadata_json: string;
  created_at: string;
  updated_at: string;
};

type TechnicalFileRow = {
  id: string;
  user_id: string;
  project_id: string;
  file_id: string | null;
  upload_id: string | null;
  original_name: string;
  file_type: string;
  file_size: number;
  role: string;
  metadata_json: string;
  created_at: string;
};

type TechnicalExportRow = {
  id: string;
  user_id: string;
  project_id: string;
  export_type: string;
  requested_format: string;
  generated_format: string | null;
  status: string;
  file_id: string | null;
  storage_path: string | null;
  technical_error: string | null;
  metadata_json: string;
  created_at: string;
};

type TechnicalMessageRow = {
  id: string;
  user_id: string;
  session_id: string;
  project_id: string | null;
  role: "user" | "assistant" | "system";
  content: string;
  metadata_json: string;
  created_at: string;
};

const projectTypes = [
  "planta_baixa_inicial",
  "layout_industrial",
  "projeto_eletrico_basico",
  "projeto_hidraulico_basico",
  "projeto_iluminacao_basico",
  "fechamento_gradil",
  "sala_tecnica",
  "oficina",
  "area_manutencao",
  "reforma_simples",
  "ampliacao",
  "adequacao_operacional",
  "inspecao_tecnica"
];

function clean(value: unknown, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function truncate(value: string, limit: number) {
  const text = clean(value);
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function audit(userId: string, projectId: string | null, action: string, message: string, metadata: Record<string, unknown> = {}, status = "success") {
  getDatabase()
    .prepare(
      `insert into technical_project_audit_logs (id, user_id, project_id, action, status, message, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(uuid(), userId, projectId, action, status, message, JSON.stringify(metadata));
}

function inferProjectType(text: string) {
  const value = normalize(text);
  if (/layout|fluxo|industrial|linha|processo|operacional/.test(value)) return "layout_industrial";
  if (/eletric|quadro|circuito|tomada|iluminacao|luminaria/.test(value)) return /iluminacao|luminaria/.test(value) ? "projeto_iluminacao_basico" : "projeto_eletrico_basico";
  if (/hidraul|agua|esgoto|tubulacao|dreno/.test(value)) return "projeto_hidraulico_basico";
  if (/gradil|fechamento|cerca|alambrado/.test(value)) return "fechamento_gradil";
  if (/sala tecnica|servidor|compressor|painel/.test(value)) return "sala_tecnica";
  if (/oficina|bancada|ferramenta/.test(value)) return "oficina";
  if (/manutencao|manutenção/.test(value)) return "area_manutencao";
  if (/reforma/.test(value)) return "reforma_simples";
  if (/ampliacao|ampliação|expandir/.test(value)) return "ampliacao";
  if (/inspec|trinca|rachadura|infiltracao|corrosao|risco|nao conformidade/.test(value)) return "inspecao_tecnica";
  if (/planta|baixa|ambiente|comodo|cômodo/.test(value)) return "planta_baixa_inicial";
  return "adequacao_operacional";
}

function inferDiscipline(text: string) {
  const value = normalize(text);
  if (/eletric|circuito|quadro|energia|iluminacao/.test(value)) return "engenharia_eletrica";
  if (/mecan|maquina|equipamento|tubulacao|manutencao/.test(value)) return "engenharia_mecanica";
  if (/seguranca|risco|nr-|nr |epi|incendio|rota/.test(value)) return "engenharia_seguranca";
  if (/arquitet|planta|layout|ambiente|fachada/.test(value)) return "arquitetura";
  if (/obra|trinca|rachadura|concreto|estrutura|reforma/.test(value)) return "engenharia_civil";
  return "multidisciplinar";
}

function extractMeasures(text: string) {
  const matches = text.match(/\b\d+(?:[,.]\d+)?\s?(?:m²|m2|m|cm|mm|metros?|centimetros?|centímetros?)\b/gi) || [];
  return Array.from(new Set(matches.map((item) => item.replace(/\s+/g, " ").trim()))).slice(0, 16);
}

function riskFromText(text: string) {
  const value = normalize(text);
  if (/risco grave|colapso|choque|incendio|desabamento|vazamento de gas|estrutura comprometida/.test(value)) return "alto";
  if (/trinca|rachadura|infiltracao|corrosao|aquecimento|umidade|nao conformidade|falha/.test(value)) return "medio";
  if (/preventiv|melhoria|adequacao|layout|estudo preliminar/.test(value)) return "baixo";
  return "indefinido";
}

function formatType(value: string) {
  return value.replace(/_/g, " ");
}

function technicalSections(input: { title: string; description: string; projectType: string; discipline: string; location?: string | null }) {
  const measures = extractMeasures(input.description);
  const risk = riskFromText(input.description);
  const type = formatType(input.projectType);
  const discipline = formatType(input.discipline);
  return [
    `# ${input.title}`,
    "",
    "## Resumo técnico",
    `Projeto técnico preliminar de ${type}, com abordagem de ${discipline}. ${input.location ? `Local informado: ${input.location}.` : "Local não informado."}`,
    "",
    "## Diagnóstico inicial",
    risk === "alto"
      ? "Há indícios de risco elevado. Recomenda-se vistoria técnica presencial antes de execução."
      : risk === "medio"
        ? "Há pontos que exigem verificação técnica, validação de medidas e priorização de ações corretivas."
        : "Não foram identificados sinais críticos no texto inicial. O projeto segue como estudo preliminar.",
    "",
    "## Escopo",
    "- Levantamento das informações recebidas.",
    "- Organização das premissas técnicas.",
    "- Definição de solução preliminar.",
    "- Lista inicial de materiais e quantitativos.",
    "- Recomendações e próximos passos.",
    "",
    "## Medidas utilizadas",
    measures.length ? measures.map((item) => `- ${item}`).join("\n") : "- Nenhuma medida objetiva informada. É necessário levantar dimensões no local.",
    "",
    "## Premissas adotadas",
    "- Informações baseadas no texto e arquivos enviados pelo usuário.",
    "- Quantitativos são preliminares e precisam de conferência em campo.",
    "- Projetos executivos devem ser assinados por profissional habilitado quando aplicável.",
    "",
    "## Layout descritivo",
    buildLayoutDescription(input.projectType),
    "",
    "## Lista de materiais",
    buildMaterials(input.projectType).map((item) => `- ${item}`).join("\n"),
    "",
    "## Quantitativos preliminares",
    buildQuantities(input.projectType, measures).map((item) => `- ${item}`).join("\n"),
    "",
    "## Orçamento preliminar",
    "- Classe A: levantamento e projeto detalhado pendentes.",
    "- Classe B: materiais principais definidos em caráter preliminar.",
    "- Classe C: mão de obra, mobilização e margem técnica devem ser cotadas localmente.",
    "",
    "## Recomendações",
    "- Confirmar medidas reais.",
    "- Registrar fotos dos pontos críticos.",
    "- Validar interferências elétricas, hidráulicas, estruturais e operacionais.",
    "- Elaborar desenho técnico quando houver execução.",
    "",
    "## Riscos identificados",
    risk === "indefinido" ? "- Riscos dependem de vistoria e dados complementares." : `- Classificação preliminar: risco ${risk}.`,
    "",
    "## Próximos passos",
    "- Complementar dados e anexos.",
    "- Realizar inspeção técnica quando necessário.",
    "- Refinar quantitativos.",
    "- Exportar relatório para validação."
  ].join("\n");
}

function buildLayoutDescription(projectType: string) {
  if (projectType === "layout_industrial") return "Organizar fluxo de entrada, processamento, manutenção, circulação, estoque e saída, reduzindo cruzamentos operacionais.";
  if (projectType === "planta_baixa_inicial") return "Distribuir ambientes por função, circulação, acessos, ventilação, iluminação e áreas técnicas.";
  if (projectType.includes("eletrico") || projectType.includes("iluminacao")) return "Mapear pontos de carga, comando, iluminação, quadro, circuitos e rotas de infraestrutura.";
  if (projectType.includes("hidraulico")) return "Mapear pontos de consumo, alimentação, descarte, drenos e shafts técnicos.";
  if (projectType === "fechamento_gradil") return "Definir perímetro, acessos, portões, bases, modulação do gradil e pontos de fixação.";
  return "Organizar áreas por função, acesso, segurança, manutenção e operação.";
}

function buildMaterials(projectType: string) {
  if (projectType.includes("eletrico") || projectType.includes("iluminacao")) return ["Cabos conforme carga", "Eletrodutos ou perfilados", "Disjuntores", "Quadro elétrico", "Tomadas/interruptores", "Luminárias"];
  if (projectType.includes("hidraulico")) return ["Tubos e conexões", "Registros", "Caixas de inspeção", "Ralos/drenos", "Suportes", "Vedantes"];
  if (projectType === "fechamento_gradil") return ["Gradil", "Postes", "Chumbadores", "Concreto para bases", "Portão", "Fechaduras e acessórios"];
  if (projectType === "layout_industrial") return ["Demarcação de piso", "Placas de sinalização", "Proteções físicas", "Bancadas ou racks", "Iluminação de apoio"];
  return ["Materiais de acabamento", "Fixadores", "Infraestrutura de apoio", "Sinalização", "Itens de segurança"];
}

function buildQuantities(projectType: string, measures: string[]) {
  const base = measures.length ? `Base inicial: ${measures.join(", ")}` : "Sem medidas informadas.";
  if (projectType === "fechamento_gradil") return [base, "Metros lineares de perímetro a confirmar.", "Quantidade de postes conforme modulação.", "Volume de concreto conforme base adotada."];
  if (projectType.includes("eletrico")) return [base, "Pontos elétricos a confirmar por ambiente.", "Circuitos conforme carga instalada.", "Metragem de cabos conforme rota."];
  if (projectType === "layout_industrial") return [base, "Áreas operacionais por setor.", "Corredores e zonas de segurança.", "Pontos de apoio e manutenção."];
  return [base, "Área de intervenção a confirmar.", "Itens por ambiente/setor.", "Perdas e margem técnica a definir."];
}

function inspectionFindings(text: string) {
  const value = normalize(text);
  const findings: string[] = [];
  if (/trinca|rachadura/.test(value)) findings.push("Trincas ou rachaduras reportadas.");
  if (/infiltracao|umidade|mofo|vazamento/.test(value)) findings.push("Indícios de infiltração ou umidade.");
  if (/corrosao|ferrugem|oxida/.test(value)) findings.push("Indícios de corrosão ou oxidação.");
  if (/layout|fluxo|gargalo|circulacao|circulação/.test(value)) findings.push("Possível problema de layout ou fluxo operacional.");
  if (/risco|seguranca|queda|choque|incendio|nr/.test(value)) findings.push("Possível risco de segurança ou não conformidade.");
  if (/manutencao|falha|parada|vibracao|ruido/.test(value)) findings.push("Possível falha ou oportunidade de manutenção.");
  return findings.length ? findings : ["Não há anomalia específica identificada no texto. É necessário complementar com fotos, medidas ou vistoria."];
}

function inspectionRecommendations(riskLevel: string) {
  const recommendations = [
    "Registrar fotos amplas e próximas do ponto analisado.",
    "Confirmar medidas e localização exata.",
    "Verificar interferências com elétrica, hidráulica, estrutura e operação."
  ];
  if (riskLevel === "alto") recommendations.unshift("Isolar preventivamente a área até avaliação técnica presencial.");
  if (riskLevel === "medio") recommendations.unshift("Priorizar vistoria e correção planejada.");
  return recommendations;
}

function inspectionActionPlan(riskLevel: string) {
  return [
    riskLevel === "alto" ? "Ação imediata: sinalizar/isolar área crítica." : "Ação inicial: registrar evidências e validar informações.",
    "Levantar causa provável e extensão do problema.",
    "Definir correção técnica com responsável habilitado quando aplicável.",
    "Reinspecionar após execução."
  ];
}

function publicProject(row: TechnicalProjectRow) {
  return {
    id: row.id,
    title: row.title,
    projectType: row.project_type,
    discipline: row.discipline,
    description: row.description,
    location: row.location,
    status: row.status,
    riskLevel: row.risk_level,
    summary: row.summary,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicInspection(row: TechnicalInspectionRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    diagnosis: row.diagnosis,
    riskLevel: row.risk_level,
    findings: parseJson<string[]>(row.findings_json, []),
    recommendations: parseJson<string[]>(row.recommendations_json, []),
    actionPlan: parseJson<string[]>(row.action_plan_json, []),
    status: row.status,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function publicTechnicalFile(row: TechnicalFileRow) {
  let file: ReturnType<typeof getFile> | null = null;
  if (row.file_id) {
    try {
      file = getFile(row.user_id, row.file_id);
    } catch {
      file = null;
    }
  }
  return {
    id: row.id,
    projectId: row.project_id,
    fileId: row.file_id,
    uploadId: row.upload_id,
    originalName: row.original_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    role: row.role,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    file,
    createdAt: row.created_at
  };
}

function publicTechnicalExport(row: TechnicalExportRow) {
  let file: ReturnType<typeof getFile> | null = null;
  if (row.file_id) {
    try {
      file = getFile(row.user_id, row.file_id);
    } catch {
      file = null;
    }
  }
  return {
    id: row.id,
    projectId: row.project_id,
    exportType: row.export_type,
    requestedFormat: row.requested_format,
    generatedFormat: row.generated_format,
    status: row.status,
    fileId: row.file_id,
    technicalError: row.technical_error,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    file,
    createdAt: row.created_at
  };
}

function publicMessage(row: TechnicalMessageRow) {
  return {
    id: row.id,
    sessionId: row.session_id,
    projectId: row.project_id,
    role: row.role,
    content: row.content,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    createdAt: row.created_at
  };
}

function getProjectRow(userId: string, projectId: string) {
  const row = getDatabase()
    .prepare("select * from technical_projects where id = ? and user_id = ?")
    .get(projectId, userId) as TechnicalProjectRow | undefined;
  if (!row) throw new Error("Projeto técnico não encontrado.");
  return row;
}

function insertOutput(userId: string, projectId: string, outputType: string, title: string, content: string, fileId: string | null = null) {
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into technical_project_outputs (id, user_id, project_id, output_type, title, content, file_id, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, projectId, outputType, title, content, fileId, JSON.stringify({ generatedBy: "yara-technical" }));
  return id;
}

export function createTechnicalProject(userId: string, input: { title?: string; description: string; projectType?: string; discipline?: string; location?: string | null; metadata?: Record<string, unknown> }) {
  const description = truncate(input.description, 8000);
  const projectType = projectTypes.includes(input.projectType || "") ? input.projectType! : inferProjectType(`${input.title || ""}\n${description}`);
  const discipline = input.discipline || inferDiscipline(`${input.title || ""}\n${description}`);
  const title = truncate(input.title || `Projeto técnico - ${formatType(projectType)}`, 140);
  const riskLevel = riskFromText(description);
  const summary = truncate(`Projeto ${formatType(projectType)} em ${formatType(discipline)}. Risco preliminar: ${riskLevel}.`, 320);
  const id = uuid();
  const output = technicalSections({ title, description, projectType, discipline, location: input.location || null });
  const db = getDatabase();

  db.prepare(
    `insert into technical_projects (
       id, user_id, title, project_type, discipline, description, location, status, risk_level, summary, metadata_json, updated_at
     ) values (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, current_timestamp)`
  ).run(id, userId, title, projectType, discipline, description, input.location || null, riskLevel, summary, JSON.stringify(input.metadata || {}));
  db.prepare(
    `insert into technical_project_inputs (id, user_id, project_id, input_type, content, metadata_json)
     values (?, ?, ?, 'text', ?, ?)`
  ).run(uuid(), userId, id, description, JSON.stringify({ source: "create" }));
  insertOutput(userId, id, "technical_scope", "Estrutura técnica inicial", output);
  audit(userId, id, "create_project", "Projeto técnico criado.", { projectType, discipline, riskLevel });
  return getTechnicalProject(userId, id);
}

export function listTechnicalProjects(userId: string, filters: { query?: string; status?: string } = {}) {
  const rows = getDatabase()
    .prepare("select * from technical_projects where user_id = ? order by datetime(updated_at) desc")
    .all(userId) as TechnicalProjectRow[];
  const query = normalize(filters.query || "");
  const status = normalize(filters.status || "");
  return rows
    .filter((row) => !query || normalize(`${row.title} ${row.description} ${row.project_type} ${row.discipline}`).includes(query))
    .filter((row) => !status || normalize(row.status) === status)
    .map(publicProject);
}

export function getTechnicalDashboard(userId: string) {
  const db = getDatabase();
  const total = (sql: string, ...params: unknown[]) => (db.prepare(sql).get(...params as any[]) as { total: number }).total;
  const latestProjects = db.prepare("select * from technical_projects where user_id = ? order by datetime(updated_at) desc limit 5").all(userId) as TechnicalProjectRow[];
  const latestInspections = db.prepare("select * from technical_project_inspections where user_id = ? order by datetime(created_at) desc limit 5").all(userId) as TechnicalInspectionRow[];
  const riskRows = db.prepare("select risk_level as riskLevel, count(*) as total from technical_projects where user_id = ? group by risk_level").all(userId);
  return {
    totals: {
      projects: total("select count(*) as total from technical_projects where user_id = ?", userId),
      inspections: total("select count(*) as total from technical_project_inspections where user_id = ?", userId),
      files: total("select count(*) as total from technical_project_files where user_id = ?", userId),
      reports: total("select count(*) as total from technical_project_outputs where user_id = ?", userId),
      chatSessions: total("select count(*) as total from technical_project_chat_sessions where user_id = ?", userId)
    },
    riskRows,
    latestProjects: latestProjects.map(publicProject),
    latestInspections: latestInspections.map(publicInspection)
  };
}

export function getTechnicalProject(userId: string, projectId: string) {
  const db = getDatabase();
  const project = getProjectRow(userId, projectId);
  const inputs = db.prepare("select * from technical_project_inputs where user_id = ? and project_id = ? order by datetime(created_at) desc").all(userId, projectId);
  const outputs = db.prepare("select * from technical_project_outputs where user_id = ? and project_id = ? order by datetime(created_at) desc").all(userId, projectId) as any[];
  const exports = db.prepare("select * from technical_project_exports where user_id = ? and project_id = ? order by datetime(created_at) desc").all(userId, projectId) as TechnicalExportRow[];
  const inspections = db.prepare("select * from technical_project_inspections where user_id = ? and project_id = ? order by datetime(created_at) desc").all(userId, projectId) as TechnicalInspectionRow[];
  const files = db.prepare("select * from technical_project_files where user_id = ? and project_id = ? order by datetime(created_at) desc").all(userId, projectId) as TechnicalFileRow[];
  return {
    project: publicProject(project),
    inputs: inputs.map((row: any) => ({ id: row.id, inputType: row.input_type, content: row.content, fileId: row.file_id, uploadId: row.upload_id, metadata: parseJson(row.metadata_json, {}), createdAt: row.created_at })),
    outputs: outputs.map((row) => ({ id: row.id, outputType: row.output_type, title: row.title, content: row.content, fileId: row.file_id, metadata: parseJson(row.metadata_json, {}), createdAt: row.created_at })),
    exports: exports.map(publicTechnicalExport),
    inspections: inspections.map(publicInspection),
    files: files.map(publicTechnicalFile)
  };
}

export function updateTechnicalProject(userId: string, projectId: string, input: { title?: string; description?: string; projectType?: string; discipline?: string; location?: string | null; status?: string; metadata?: Record<string, unknown> }) {
  const current = getProjectRow(userId, projectId);
  const title = truncate(input.title || current.title, 140);
  const description = truncate(input.description ?? current.description, 8000);
  const projectType = projectTypes.includes(input.projectType || "") ? input.projectType! : current.project_type;
  const discipline = input.discipline || current.discipline;
  const riskLevel = riskFromText(description);
  const summary = truncate(`Projeto ${formatType(projectType)} em ${formatType(discipline)}. Risco preliminar: ${riskLevel}.`, 320);
  getDatabase()
    .prepare(
      `update technical_projects
       set title = ?, project_type = ?, discipline = ?, description = ?, location = ?, status = ?, risk_level = ?, summary = ?, metadata_json = ?, updated_at = current_timestamp
       where id = ? and user_id = ?`
    )
    .run(title, projectType, discipline, description, input.location ?? current.location, input.status || current.status, riskLevel, summary, JSON.stringify(input.metadata || parseJson(current.metadata_json, {})), projectId, userId);
  audit(userId, projectId, "update_project", "Projeto técnico atualizado.", { projectType, discipline, riskLevel });
  return getTechnicalProject(userId, projectId);
}

export function deleteTechnicalProject(userId: string, projectId: string) {
  getProjectRow(userId, projectId);
  audit(userId, projectId, "delete_project", "Projeto técnico excluído.");
  getDatabase().prepare("delete from technical_projects where id = ? and user_id = ?").run(projectId, userId);
  return { id: projectId };
}

export async function exportTechnicalProject(userId: string, projectId: string, format: ExportFormat) {
  const details = getTechnicalProject(userId, projectId);
  const project = details.project;
  if (["dxf", "dwg", "ifc"].includes(format)) {
    const result = await generateCadBimExport(userId, {
      id: project.id,
      title: project.title,
      projectType: project.projectType,
      discipline: project.discipline,
      description: project.description,
      location: project.location,
      riskLevel: project.riskLevel
    }, format as "dxf" | "dwg" | "ifc");
    const exportId = uuid();
    getDatabase()
      .prepare(
        `insert into technical_project_exports (
           id, user_id, project_id, export_type, requested_format, generated_format, status, file_id, storage_path, technical_error, metadata_json
         ) values (?, ?, ?, 'cad_bim', ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        exportId,
        userId,
        projectId,
        result.requestedFormat,
        result.generatedFormat,
        result.status,
        result.file.id,
        null,
        result.technicalError || null,
        JSON.stringify({ source: "technical-cad-export", fallback: result.status === "fallback" })
      );
    insertOutput(userId, projectId, `export_${result.requestedFormat}`, `Exportação ${result.requestedFormat.toUpperCase()}`, result.technicalError || `Arquivo ${result.generatedFormat.toUpperCase()} gerado.`, result.file.id);
    audit(userId, projectId, "export_project", "Exportação CAD/BIM criada.", { requestedFormat: result.requestedFormat, generatedFormat: result.generatedFormat, status: result.status, fileId: result.file.id });
    return { file: result.file, project, export: publicTechnicalExport(getDatabase().prepare("select * from technical_project_exports where id = ? and user_id = ?").get(exportId, userId) as TechnicalExportRow) };
  }
  const content = [
    technicalSections({
      title: details.project.title,
      description: details.project.description,
      projectType: details.project.projectType,
      discipline: details.project.discipline,
      location: details.project.location
    }),
    "",
    "## Inspeções registradas",
    details.inspections.length
      ? details.inspections.map((item: ReturnType<typeof publicInspection>) => `- ${item.title}: risco ${item.riskLevel}. ${item.diagnosis}`).join("\n")
      : "- Nenhuma inspeção registrada."
  ].join("\n");
  const file = await generateExportFile(userId, {
    format: format as "pdf" | "docx" | "txt",
    title: `${details.project.title}.${format}`,
    content
  });
  const exportId = uuid();
  getDatabase()
    .prepare(
      `insert into technical_project_exports (
         id, user_id, project_id, export_type, requested_format, generated_format, status, file_id, metadata_json
       ) values (?, ?, ?, 'document', ?, ?, 'completed', ?, ?)`
    )
    .run(exportId, userId, projectId, format, format, file.id, JSON.stringify({ source: "technical-document-export" }));
  insertOutput(userId, projectId, `export_${format}`, `Exportação ${format.toUpperCase()}`, content, file.id);
  audit(userId, projectId, "export_project", "Projeto técnico exportado.", { format, fileId: file.id });
  return { file, project: getTechnicalProject(userId, projectId).project, export: publicTechnicalExport(getDatabase().prepare("select * from technical_project_exports where id = ? and user_id = ?").get(exportId, userId) as TechnicalExportRow) };
}

export function inspectTechnicalProject(userId: string, projectId: string, input: { title?: string; observations: string; fileIds?: string[] }) {
  const project = getProjectRow(userId, projectId);
  const observations = truncate(input.observations, 8000);
  const riskLevel = riskFromText(`${project.description}\n${observations}`);
  const findings = inspectionFindings(observations || project.description);
  const recommendations = inspectionRecommendations(riskLevel);
  const actionPlan = inspectionActionPlan(riskLevel);
  const diagnosis = [
    `Diagnóstico preliminar para ${project.title}.`,
    `Classificação de risco: ${riskLevel}.`,
    `Base analisada: ${observations || "descrição atual do projeto"}.`
  ].join(" ");
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into technical_project_inspections (
         id, user_id, project_id, title, diagnosis, risk_level, findings_json, recommendations_json, action_plan_json, metadata_json, updated_at
       ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`
    )
    .run(id, userId, projectId, truncate(input.title || "Inspeção técnica", 140), diagnosis, riskLevel, JSON.stringify(findings), JSON.stringify(recommendations), JSON.stringify(actionPlan), JSON.stringify({ fileIds: input.fileIds || [] }));
  getDatabase().prepare("update technical_projects set risk_level = ?, updated_at = current_timestamp where id = ? and user_id = ?").run(riskLevel, projectId, userId);
  audit(userId, projectId, "inspect_project", "Inspeção técnica registrada.", { riskLevel, findings: findings.length });
  return { inspection: publicInspection(getDatabase().prepare("select * from technical_project_inspections where id = ? and user_id = ?").get(id, userId) as TechnicalInspectionRow), project: getTechnicalProject(userId, projectId).project };
}

export function linkTechnicalProjectFile(userId: string, projectId: string, fileId: string, role = "input") {
  getProjectRow(userId, projectId);
  const file = getFile(userId, fileId);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into technical_project_files (id, user_id, project_id, file_id, original_name, file_type, file_size, role, metadata_json)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(id, userId, projectId, file.id, file.name, file.type, file.size, role, JSON.stringify({ source: file.source }));
  getDatabase()
    .prepare(
      `insert into technical_project_inputs (id, user_id, project_id, input_type, content, file_id, metadata_json)
       values (?, ?, ?, 'file', ?, ?, ?)`
    )
    .run(uuid(), userId, projectId, `Arquivo técnico: ${file.name}`, file.id, JSON.stringify({ type: file.type, size: file.size }));
  audit(userId, projectId, "link_file", "Arquivo vinculado ao projeto técnico.", { fileId, role });
  return publicTechnicalFile(getDatabase().prepare("select * from technical_project_files where id = ? and user_id = ?").get(id, userId) as TechnicalFileRow);
}

function getOrCreateTechnicalSession(userId: string, input: { sessionId?: string; projectId?: string | null; title?: string }) {
  if (input.sessionId) {
    const existing = getDatabase()
      .prepare("select id, project_id, title from technical_project_chat_sessions where id = ? and user_id = ?")
      .get(input.sessionId, userId) as { id: string; project_id: string | null; title: string } | undefined;
    if (!existing) throw new Error("Sessão técnica não encontrada.");
    return existing;
  }
  if (input.projectId) getProjectRow(userId, input.projectId);
  const id = uuid();
  getDatabase()
    .prepare(
      `insert into technical_project_chat_sessions (id, user_id, project_id, title, updated_at)
       values (?, ?, ?, ?, current_timestamp)`
    )
    .run(id, userId, input.projectId || null, truncate(input.title || "Chat Técnico", 120));
  return { id, project_id: input.projectId || null, title: input.title || "Chat Técnico" };
}

function buildTechnicalChatResponse(userId: string, message: string, projectId: string | null) {
  const memoryContext = readIntelligentMemoryContext(userId, message, undefined);
  const graphContext = readGraphContext(userId, message);
  const semanticContext = readSemanticSearchContext(userId, message);
  const contextNotes = [memoryContext, graphContext, semanticContext].filter(Boolean).length
    ? "Usei memória, GraphRAG e busca vetorial para recuperar contexto relacionado."
    : "Não encontrei contexto anterior relevante; respondi com base na solicitação atual.";
  const project = projectId ? getProjectRow(userId, projectId) : null;
  const projectLine = project ? `Projeto vinculado: ${project.title} (${formatType(project.project_type)}).` : "Sem projeto vinculado; posso criar um projeto técnico para registrar a evolução.";
  const type = inferProjectType(message);
  const risk = riskFromText(message);
  return [
    "Resposta do Chat Técnico",
    "",
    projectLine,
    contextNotes,
    "",
    `Classificação preliminar: ${formatType(type)} · risco ${risk}.`,
    "",
    "Encaminhamento técnico:",
    "- Registrar medidas, fotos, croquis ou plantas disponíveis.",
    "- Separar premissas de fatos verificados.",
    "- Gerar diagnóstico, escopo, quantitativos e recomendações.",
    "- Exportar relatório quando o conteúdo estiver validado.",
    "",
    "Resposta objetiva:",
    technicalSections({
      title: project?.title || `Estudo técnico - ${formatType(type)}`,
      description: message,
      projectType: type,
      discipline: inferDiscipline(message),
      location: project?.location || null
    }).split("\n").slice(0, 24).join("\n")
  ].join("\n");
}

function detectTechnicalExportFormat(message: string): ExportFormat | null {
  const value = normalize(message);
  if (/\bdwg\b/.test(value)) return "dwg";
  if (/\bdxf\b|cad|planta em cad/.test(value)) return "dxf";
  if (/\bifc\b|bim/.test(value)) return "ifc";
  if (/\bpdf\b/.test(value)) return "pdf";
  if (/\bdocx\b|word/.test(value)) return "docx";
  if (/\btxt\b|texto/.test(value)) return "txt";
  return null;
}

export async function sendTechnicalChatMessage(userId: string, input: { message: string; sessionId?: string; projectId?: string | null; fileIds?: string[] }) {
  const message = truncate(input.message, 8000);
  if (!message && !(input.fileIds || []).length) throw new Error("Digite uma mensagem técnica.");
  let projectId = input.projectId || null;
  if (!projectId && detectTechnicalIntent(message) && /crie|criar|faça|faca|gere|monte|projeto|planta|layout|inspec/i.test(message)) {
    const created = createTechnicalProject(userId, {
      title: `Projeto técnico - ${formatType(inferProjectType(message))}`,
      description: message
    });
    projectId = created.project.id;
  }
  const session = getOrCreateTechnicalSession(userId, { sessionId: input.sessionId, projectId, title: "Chat Técnico" });
  const db = getDatabase();
  const userMessageId = uuid();
  db.prepare(
    `insert into technical_project_messages (id, user_id, session_id, project_id, role, content, metadata_json)
     values (?, ?, ?, ?, 'user', ?, ?)`
  ).run(userMessageId, userId, session.id, projectId, message || "Arquivos técnicos enviados.", JSON.stringify({ fileIds: input.fileIds || [] }));

  if (projectId && input.fileIds?.length) {
    for (const fileId of input.fileIds) {
      linkTechnicalProjectFile(userId, projectId, fileId, "chat_attachment");
    }
  }

  const requestedExport = projectId ? detectTechnicalExportFormat(message) : null;
  let assistantContent = buildTechnicalChatResponse(userId, message, projectId);
  if (projectId && requestedExport && /\b(exporte|exportar|gere|gerar|baixar|arquivo|cad|bim|planta)\b/i.test(message)) {
    const exported = await exportTechnicalProject(userId, projectId, requestedExport);
    assistantContent = [
      `Exportação técnica solicitada: ${requestedExport.toUpperCase()}.`,
      exported.export?.status === "fallback" ? exported.export.technicalError : `Arquivo ${String(exported.export?.generatedFormat || requestedExport).toUpperCase()} gerado.`,
      `Baixar: ${exported.file.url}`
    ].filter(Boolean).join("\n");
  }
  const assistantMessageId = uuid();
  db.prepare(
    `insert into technical_project_messages (id, user_id, session_id, project_id, role, content, metadata_json)
     values (?, ?, ?, ?, 'assistant', ?, ?)`
  ).run(assistantMessageId, userId, session.id, projectId, assistantContent, JSON.stringify({ model: "yara-technical-deterministic" }));
  db.prepare("update technical_project_chat_sessions set project_id = coalesce(project_id, ?), context_summary = ?, updated_at = current_timestamp where id = ? and user_id = ?")
    .run(projectId, truncate(message, 500), session.id, userId);
  db.prepare(
    `insert into technical_project_chat_memory (id, user_id, project_id, session_id, key, content, importance, metadata_json, updated_at)
     values (?, ?, ?, ?, ?, ?, 4, ?, current_timestamp)`
  ).run(uuid(), userId, projectId, session.id, "technical_context", truncate(message, 1200), JSON.stringify({ source: "chat" }));
  audit(userId, projectId, "technical_chat", "Mensagem processada no Chat Técnico.", { sessionId: session.id });
  return {
    session: { id: session.id, projectId, title: session.title },
    project: projectId ? getTechnicalProject(userId, projectId).project : null,
    messages: getTechnicalSessionMessages(userId, session.id)
  };
}

export function getTechnicalSessionMessages(userId: string, sessionId: string) {
  const rows = getDatabase()
    .prepare("select * from technical_project_messages where user_id = ? and session_id = ? order by datetime(created_at) asc")
    .all(userId, sessionId) as TechnicalMessageRow[];
  return rows.map(publicMessage);
}

export function listTechnicalChatHistory(userId: string) {
  const db = getDatabase();
  const sessions = db
    .prepare(
      `select id, project_id, title, status, context_summary, created_at, updated_at
       from technical_project_chat_sessions
       where user_id = ?
       order by datetime(updated_at) desc
       limit 30`
    )
    .all(userId) as any[];
  return {
    sessions: sessions.map((session) => ({
      id: session.id,
      projectId: session.project_id,
      title: session.title,
      status: session.status,
      contextSummary: session.context_summary,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }))
  };
}

export function detectTechnicalIntent(message: string) {
  return /\b(projeto tecnico|projeto técnico|planta baixa|layout industrial|projeto eletrico|projeto elétrico|hidraulico|hidráulico|iluminacao|iluminação|gradil|sala tecnica|sala técnica|oficina|manutencao|manutenção|inspecao|inspeção|trinca|rachadura|infiltracao|infiltração|corrosao|corrosão|obra|reforma|quantitativo|orcamento|orçamento|croqui|arquitetura|engenharia)\b/i.test(message);
}

export async function answerTechnicalIntentFromMainChat(userId: string, message: string) {
  if (!detectTechnicalIntent(message)) return null;
  const result = await sendTechnicalChatMessage(userId, { message });
  const projectLine = result.project ? `Projeto técnico criado: ${result.project.title}` : "Chat Técnico iniciado.";
  return [
    projectLine,
    "Encaminhei esta solicitação para a área independente Projetos Técnicos.",
    "",
    result.messages[result.messages.length - 1]?.content || "Abra Projetos Técnicos para continuar com histórico e arquivos próprios."
  ].join("\n");
}

export function getTechnicalProjectFiles(userId: string, projectId: string) {
  getProjectRow(userId, projectId);
  const rows = getDatabase()
    .prepare("select * from technical_project_files where user_id = ? and project_id = ? order by datetime(created_at) desc")
    .all(userId, projectId) as TechnicalFileRow[];
  return rows.map(publicTechnicalFile);
}

export function listTechnicalProjectExports(userId: string, projectId: string) {
  getProjectRow(userId, projectId);
  const rows = getDatabase()
    .prepare("select * from technical_project_exports where user_id = ? and project_id = ? order by datetime(created_at) desc")
    .all(userId, projectId) as TechnicalExportRow[];
  return rows.map(publicTechnicalExport);
}
