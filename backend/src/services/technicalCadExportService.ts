import { saveFileBuffer } from "./fileService";

type CadExportFormat = "dxf" | "dwg" | "ifc";

type CadProjectInput = {
  id: string;
  title: string;
  projectType: string;
  discipline: string;
  description: string;
  location?: string | null;
  riskLevel?: string | null;
};

type CadExportResult = {
  requestedFormat: CadExportFormat;
  generatedFormat: "dxf" | "ifc";
  status: "completed" | "fallback";
  file: ReturnType<typeof saveFileBuffer>;
  technicalError?: string;
};

function normalizeName(value: string) {
  return (value || "projeto-tecnico")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .toLowerCase() || "projeto-tecnico";
}

function extractNumbers(description: string) {
  const values = Array.from(description.matchAll(/\b(\d+(?:[,.]\d+)?)\s?(m|m2|m²|metros?)\b/gi))
    .map((match) => Number(match[1].replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value > 0);
  const width = values[0] || 12;
  const height = values[1] || Math.max(6, Math.round(width * 0.65));
  return { width, height };
}

function dxfPair(code: number, value: string | number) {
  return `${code}\n${value}`;
}

function dxfLine(x1: number, y1: number, x2: number, y2: number, layer = "WALLS") {
  return [
    dxfPair(0, "LINE"),
    dxfPair(8, layer),
    dxfPair(10, x1),
    dxfPair(20, y1),
    dxfPair(30, 0),
    dxfPair(11, x2),
    dxfPair(21, y2),
    dxfPair(31, 0)
  ].join("\n");
}

function dxfText(text: string, x: number, y: number, height = 0.28, layer = "TEXT") {
  return [
    dxfPair(0, "TEXT"),
    dxfPair(8, layer),
    dxfPair(10, x),
    dxfPair(20, y),
    dxfPair(30, 0),
    dxfPair(40, height),
    dxfPair(1, text.slice(0, 240))
  ].join("\n");
}

export function createDxfContent(project: CadProjectInput) {
  const { width, height } = extractNumbers(project.description);
  const midX = Number((width * 0.55).toFixed(2));
  const midY = Number((height * 0.48).toFixed(2));
  const lines = [
    dxfLine(0, 0, width, 0),
    dxfLine(width, 0, width, height),
    dxfLine(width, height, 0, height),
    dxfLine(0, height, 0, 0),
    dxfLine(midX, 0, midX, height, "PARTITIONS"),
    dxfLine(0, midY, midX, midY, "PARTITIONS"),
    dxfLine(width * 0.18, 0, width * 0.34, 0, "OPENINGS"),
    dxfLine(width, height * 0.34, width, height * 0.52, "OPENINGS")
  ];
  const dimensions = [
    dxfLine(0, -0.8, width, -0.8, "DIMENSIONS"),
    dxfLine(-0.8, 0, -0.8, height, "DIMENSIONS"),
    dxfText(`${width} m`, width / 2 - 0.6, -1.25, 0.25, "DIMENSIONS"),
    dxfText(`${height} m`, -1.7, height / 2, 0.25, "DIMENSIONS")
  ];
  const labels = [
    dxfText(project.title, 0.4, height + 0.6, 0.35),
    dxfText(`Tipo: ${project.projectType}`, 0.4, height + 0.15, 0.25),
    dxfText("Ambiente 01", midX / 2 - 0.8, midY / 2, 0.25),
    dxfText("Ambiente 02", midX / 2 - 0.8, midY + (height - midY) / 2, 0.25),
    dxfText("Área técnica / operação", midX + (width - midX) / 2 - 1.2, height / 2, 0.25),
    dxfText("Arquivo DXF preliminar gerado pela YARA AI. Validar medidas em campo.", 0.4, -1.8, 0.22)
  ];
  return [
    dxfPair(0, "SECTION"),
    dxfPair(2, "HEADER"),
    dxfPair(9, "$ACADVER"),
    dxfPair(1, "AC1009"),
    dxfPair(0, "ENDSEC"),
    dxfPair(0, "SECTION"),
    dxfPair(2, "TABLES"),
    dxfPair(0, "ENDSEC"),
    dxfPair(0, "SECTION"),
    dxfPair(2, "ENTITIES"),
    ...lines,
    ...dimensions,
    ...labels,
    dxfPair(0, "ENDSEC"),
    dxfPair(0, "EOF")
  ].join("\n");
}

function ifcGuid(seed: string) {
  const clean = seed.replace(/[^A-Za-z0-9]/g, "").padEnd(22, "0").slice(0, 22);
  return clean;
}

export function createIfcContent(project: CadProjectInput) {
  const { width, height } = extractNumbers(project.description);
  const area = Number((width * height).toFixed(2));
  const title = project.title.replace(/'/g, " ");
  const wallProps = [
    `#40=IFCWALL('${ifcGuid(project.id + "wall1")}',#10,'Parede Norte',$,$,#31,#35,$);`,
    `#41=IFCWALL('${ifcGuid(project.id + "wall2")}',#10,'Parede Sul',$,$,#31,#35,$);`,
    `#42=IFCWALL('${ifcGuid(project.id + "wall3")}',#10,'Parede Leste',$,$,#31,#35,$);`,
    `#43=IFCWALL('${ifcGuid(project.id + "wall4")}',#10,'Parede Oeste',$,$,#31,#35,$);`
  ];
  return [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0]'),'2;1');",
    `FILE_NAME('${normalizeName(title)}.ifc','${new Date().toISOString()}',('YARA AI'),('YARA AI'),'YARA AI','YARA AI','');`,
    "FILE_SCHEMA(('IFC4'));",
    "ENDSEC;",
    "DATA;",
    "#1=IFCPROJECT('YARA000000000000000001',#10,'YARA Technical Project',$,$,$,$,(#20),#30);",
    "#10=IFCOWNERHISTORY($,$,$,.ADDED.,$,$,$,0);",
    "#20=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#21,$);",
    "#21=IFCAXIS2PLACEMENT3D(#22,$,$);",
    "#22=IFCCARTESIANPOINT((0.,0.,0.));",
    "#30=IFCUNITASSIGNMENT((#32,#33));",
    "#32=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);",
    "#33=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);",
    `#50=IFCSITE('${ifcGuid(project.id + "site")}',#10,'${project.location || "Local não informado"}',$,$,#31,$,$,.ELEMENT.,$,$,$,$,$);`,
    `#60=IFCBUILDING('${ifcGuid(project.id + "building")}',#10,'${title}',$,$,#31,$,$,.ELEMENT.,$,$,$);`,
    `#70=IFCBUILDINGSTOREY('${ifcGuid(project.id + "storey")}',#10,'Pavimento técnico',$,$,#31,$,$,.ELEMENT.,0.);`,
    "#31=IFCLOCALPLACEMENT($,#21);",
    "#35=IFCPRODUCTDEFINITIONSHAPE($,$,(#36));",
    "#36=IFCSHAPEREPRESENTATION(#20,'Body','SweptSolid',());",
    `#80=IFCSPACE('${ifcGuid(project.id + "space")}',#10,'Ambiente técnico principal',$,$,#31,#35,$,.ELEMENT.,$,$);`,
    `#81=IFCQUANTITYAREA('Área preliminar',$,$,${area});`,
    `#82=IFCELEMENTQUANTITY('${ifcGuid(project.id + "qto")}',#10,'Quantitativos YARA',$,$,(#81));`,
    ...wallProps,
    `#90=IFCDOOR('${ifcGuid(project.id + "door")}',#10,'Abertura principal',$,$,#31,#35,$,2.10,0.90);`,
    `#100=IFCPROPERTYSET('${ifcGuid(project.id + "pset")}',#10,'YARA_TechnicalProperties',$,(#101,#102,#103,#104));`,
    `#101=IFCPROPERTYSINGLEVALUE('TipoProjeto',$,IFCTEXT('${project.projectType}'),$);`,
    `#102=IFCPROPERTYSINGLEVALUE('Disciplina',$,IFCTEXT('${project.discipline}'),$);`,
    `#103=IFCPROPERTYSINGLEVALUE('RiscoPreliminar',$,IFCTEXT('${project.riskLevel || "indefinido"}'),$);`,
    "#104=IFCPROPERTYSINGLEVALUE('Observacao',$,IFCTEXT('IFC preliminar gerado pela YARA AI. Validar geometria e propriedades em software BIM.'),$);",
    "ENDSEC;",
    "END-ISO-10303-21;"
  ].join("\n");
}

export function isDwgExporterAvailable() {
  return Boolean(process.env.DWG_EXPORTER_CMD?.trim());
}

export async function generateCadBimExport(userId: string, project: CadProjectInput, requestedFormat: CadExportFormat): Promise<CadExportResult> {
  if (requestedFormat === "ifc") {
    const content = createIfcContent(project);
    const file = saveFileBuffer(userId, {
      name: `${normalizeName(project.title)}.ifc`,
      mimeType: "application/ifc",
      buffer: Buffer.from(content, "utf8"),
      category: "technical-export"
    });
    return { requestedFormat, generatedFormat: "ifc", status: "completed", file };
  }

  const dxfContent = createDxfContent(project);
  const file = saveFileBuffer(userId, {
    name: `${normalizeName(project.title)}.dxf`,
    mimeType: "application/dxf",
    buffer: Buffer.from(dxfContent, "utf8"),
    category: "technical-export"
  });

  if (requestedFormat === "dwg" && !isDwgExporterAvailable()) {
    return {
      requestedFormat,
      generatedFormat: "dxf",
      status: "fallback",
      file,
      technicalError: "Exportação DWG real exige conversor/biblioteca CAD configurado no servidor. Foi gerado DXF compatível como fallback."
    };
  }

  return { requestedFormat, generatedFormat: "dxf", status: "completed", file };
}
