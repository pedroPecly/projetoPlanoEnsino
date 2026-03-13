import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';
import { Upload, X, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Curso, Professor, ConteudoProgramatico, ObjetivosEspecificos, VisitaTecnica, RecursoUtilizado, CronogramaItem, CronogramaTopico } from '../tipos';

// Configura o worker do PDF.js via CDN para evitar problemas de bundling com Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos do processo de importação
// ─────────────────────────────────────────────────────────────────────────────

interface PlanoImportado {
  ano_periodo: string;
  disciplina: string;
  abreviatura: string;
  carga_horaria_total: number;
  carga_horaria_presencial: number;
  carga_horaria_presencial_percentual: number;
  carga_horaria_distancia: number;
  carga_horaria_distancia_percentual: number;
  carga_horaria_teorica: number;
  carga_horaria_teorica_percentual: number;
  carga_horaria_pratica: number;
  carga_horaria_pratica_percentual: number;
  carga_horaria_semanal: number;
  professor_nome: string;
  matricula_siape: string;
  curso_nome: string;
  curso_id: string;
  periodo: string;
  periodo_numero: number;
  ementa: string;
  objetivo_geral: string;
  objetivos_especificos: ObjetivosEspecificos[];
  conteudo_programatico: ConteudoProgramatico[];
  metodologia: string;
  justificativa_modalidade: string;
  atividades_extensao: string;
  recursos_utilizados: RecursoUtilizado[];
  visitas_tecnicas: VisitaTecnica[];
  cronograma: CronogramaItem[];
  bibliografia_basica: string[];
  bibliografia_complementar: string[];
  avisos: string[];
}

interface ImportPlanoProps {
  cursos: Curso[];
  professor: Professor;
  onClose: () => void;
  onImportSuccess: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários de parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseDisplayDate(dateStr: string): string {
  // Converte DD/MM/YYYY → YYYY-MM-DD
  const m = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function parseFloatSafe(str: string): number {
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

function parseIntSafe(str: string): number {
  const n = parseInt(str);
  return isNaN(n) ? 0 : n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Extração de texto bruto do PDF
// ─────────────────────────────────────────────────────────────────────────────

interface RawItem {
  str: string;
  x: number;
  y: number;
  page: number;
}

async function extractRawTextItems(file: File): Promise<RawItem[]> {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
  const raw: RawItem[] = [];

  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const tc = await page.getTextContent();
    for (const item of tc.items) {
      if (!('str' in item)) continue;
      const t = item as any;
      if (t.str && t.str.trim()) {
        raw.push({
          str: t.str,
          x: t.transform[4],
          y: t.transform[5],
          page: p,
        });
      }
    }
  }
  return raw;
}

/**
 * Agrupa itens em linhas visuais (mesmo página, Y próximos ≤ 3pt) e
 * reconstrói o texto de leitura (top-to-bottom, left-to-right).
 * Itens na mesma linha são separados por TAB quando há gap horizontal > 20pt.
 */
function buildPageText(items: RawItem[]): string {
  // Ordena: página asc, Y desc (topo da página = Y maior no PDF), X asc
  const sorted = [...items].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    const dy = b.y - a.y;
    if (Math.abs(dy) > 3) return dy;    // linhas diferentes
    return a.x - b.x;                   // mesma linha → esquerda primeiro
  });

  // Agrupa em linhas
  type Line = { page: number; y: number; items: RawItem[] };
  const lines: Line[] = [];
  for (const item of sorted) {
    const last = lines[lines.length - 1];
    if (last && last.page === item.page && Math.abs(last.y - item.y) <= 3) {
      last.items.push(item);
    } else {
      lines.push({ page: item.page, y: item.y, items: [item] });
    }
  }

  // Reconstrói o texto
  return lines
    .map(line => {
      const sortedItems = [...line.items].sort((a, b) => a.x - b.x);
      let lineText = '';
      sortedItems.forEach((item, i) => {
        if (i === 0) {
          lineText = item.str;
        } else {
          const gap = item.x - (sortedItems[i - 1].x + 5);
          lineText += gap > 20 ? '\t' + item.str : ' ' + item.str;
        }
      });
      return lineText.trim();
    })
    .filter(l => l.length > 0)
    .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Divisão em seções conforme os títulos conhecidos
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_PATTERNS: [string, RegExp][] = [
  ['s1',   /1\)\s*IDENTIFICA[CÇ][AÃ]O\s+DO\s+COMPONENTE\s+CURRICULAR/i],
  ['s2',   /2\)\s*Ementa/i],
  ['s3',   /3\)\s*Objetivos/i],
  ['s4',   /4\)\s*Conte[uú]do/i],
  ['s5',   /5\)\s*Metodologia/i],
  ['s6',   /6\)\s*Justificativa\s+da\s+Modalidade/i],
  ['s7',   /7\)\s*Atividades\s+de\s+Extens[aã]o/i],
  ['s8',   /8\)\s*Recursos\s+Utilizados/i],
  ['s9',   /9\)\s*Visitas\s+T[eé]cnicas/i],
  ['s10',  /10\)\s*Cronograma/i],
  ['s11',  /11\)\s*Bibliografia/i],
];

interface Sections {
  header: string;
  s1: string; s2: string; s3: string; s4: string;
  s5: string; s6: string; s7: string; s8: string;
  s9: string; s10: string; s11: string;
}

function splitIntoSections(fullText: string): Sections {
  // Encontra a posição de cada seção no texto
  const positions: { key: string; idx: number }[] = [];
  for (const [key, re] of SECTION_PATTERNS) {
    const m = fullText.search(re);
    if (m !== -1) positions.push({ key, idx: m });
  }
  positions.sort((a, b) => a.idx - b.idx);

  const get = (key: string): string => {
    const pos = positions.find(p => p.key === key);
    if (!pos) return '';
    const end = positions.find(p => p.idx > pos.idx);
    return fullText.slice(pos.idx, end ? end.idx : undefined).trim();
  };

  const firstSection = positions[0]?.idx ?? fullText.length;
  return {
    header: fullText.slice(0, firstSection).trim(),
    s1: get('s1'), s2: get('s2'), s3: get('s3'), s4: get('s4'),
    s5: get('s5'), s6: get('s6'), s7: get('s7'), s8: get('s8'),
    s9: get('s9'), s10: get('s10'), s11: get('s11'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsers por seção
// ─────────────────────────────────────────────────────────────────────────────

function parseSection1(text: string, avisos: string[]) {
  const getTabValue = (labelRe: RegExp): string => {
    const m = text.match(labelRe);
    if (!m) return '';
    const rest = text.slice((m.index ?? 0) + m[0].length);
    // O valor vem após TAB ou espaços até o final da linha
    const lineEnd = rest.match(/^[\t ]*([^\n]+)/);
    return lineEnd ? lineEnd[1].trim() : '';
  };

  const disciplina   = getTabValue(/Componente\s+Curricular\s*:/i);
  const abreviatura  = getTabValue(/abreviatura\s*:/i);
  const professorNome = getTabValue(/Professor\s*:/i);
  const siape        = getTabValue(/Matr[ií]cula\s+SIAPE\s*:/i);
  const cursoNome    = getTabValue(/Curso\s*:/i);

  // Carga horária total
  const chTotalM = text.match(/Carga\s+horaria\s+Total\s*:[\t ]+(\d+)\s*h\/a/i);
  const carga_horaria_total = chTotalM ? parseIntSafe(chTotalM[1]) : 0;

  // Helper para "X h/a YY.YY%"
  const parseCH = (labelRe: RegExp): { value: number; pct: number } => {
    const m = text.match(labelRe);
    if (!m) return { value: 0, pct: 0 };
    const rest = text.slice((m.index ?? 0) + m[0].length);
    const vals = rest.match(/([\d.]+)\s*h\/a\s*([\d.]+)%/);
    return vals
      ? { value: parseFloatSafe(vals[1]), pct: parseFloatSafe(vals[2]) }
      : { value: 0, pct: 0 };
  };

  const chPres     = parseCH(/Carga\s+hor[aá]ria\s+presencial\s*:/i);
  const chTeorica  = parseCH(/Carga\s+horaria\s+de\s+atividades\s+Te[oó]rica\s*:/i);
  const chPratica  = parseCH(/Carga\s+horaria\s+de\s+atividades\s+Pr[aá]tica\s*:/i);

  // Distância (pode ser N/A)
  let carga_horaria_distancia = 0;
  let carga_horaria_distancia_percentual = 0;
  const chDistRow = text.match(/Carga\s+hor[aá]ria\s+a\s+distancia\s*:[\t ]+([^\n]+)/i);
  if (chDistRow && !/N\/A/i.test(chDistRow[1])) {
    const dv = chDistRow[1].match(/([\d.]+)\s*h\/a\s*([\d.]+)%/);
    if (dv) {
      carga_horaria_distancia = parseFloatSafe(dv[1]);
      carga_horaria_distancia_percentual = parseFloatSafe(dv[2]);
    }
  }

  // Semanal
  const chSemM = text.match(/Carga\s+hor[aá]ria\/Aula\s+Semanal\s*:[\t ]+(\d+)\s*h\/a/i);
  const carga_horaria_semanal = chSemM ? parseIntSafe(chSemM[1]) : 0;

  // Período
  const perM = text.match(/Per[ií]odo\s*:[\t ]+(\d+)[ºo°]\s*per[ií]odo/i);
  const periodo_numero = perM ? parseIntSafe(perM[1]) : 1;
  const periodo = perM ? `${periodo_numero}º Período` : '';

  if (!disciplina) avisos.push('Componente Curricular não encontrado');
  if (!cursoNome) avisos.push('Curso não encontrado');
  if (!periodo) avisos.push('Período não encontrado');

  return {
    disciplina, abreviatura, professor_nome: professorNome,
    matricula_siape: siape, curso_nome: cursoNome,
    carga_horaria_total,
    carga_horaria_presencial: chPres.value,
    carga_horaria_presencial_percentual: chPres.pct,
    carga_horaria_distancia, carga_horaria_distancia_percentual,
    carga_horaria_teorica: chTeorica.value,
    carga_horaria_teorica_percentual: chTeorica.pct,
    carga_horaria_pratica: chPratica.value,
    carga_horaria_pratica_percentual: chPratica.pct,
    carga_horaria_semanal,
    periodo, periodo_numero,
  };
}

function parseSimpleText(sectionText: string, titlePattern: RegExp): string {
  // Remove a primeira linha que contém o título da seção
  return sectionText
    .replace(titlePattern, '')
    .trim();
}

function parseObjetivos(sectionText: string): {
  objetivo_geral: string;
  objetivos_especificos: ObjetivosEspecificos[];
} {
  // Geral: entre "3.1 Geral:" e "3.2 Específicos:"
  const geralM = sectionText.match(/3\.1\s+Geral\s*:([\s\S]+?)(?=3\.2\s+Espec[ií]ficos:|$)/i);
  const objetivo_geral = geralM ? geralM[1].trim() : '';

  const espM = sectionText.match(/3\.2\s+Espec[ií]ficos\s*:([\s\S]+?)$/i);
  const espText = espM ? espM[1] : '';

  const objetivos_especificos: ObjetivosEspecificos[] = [];
  let current: ObjetivosEspecificos | null = null;
  const lines = espText.split('\n').map(l => l.trim()).filter(Boolean);

  const pushCurrent = () => {
    if (current) objetivos_especificos.push(current);
    current = null;
  };

  for (const line of lines) {
    // Sub-tópico: 3.2.X.Y
    const subM = line.match(/^3\.2\.(\d+)\.(\d+)\s+(.*)/);
    if (subM && current) {
      current.subtopicos.push({
        id: crypto.randomUUID(),
        titulo: subM[3].trim(),
        subtopicos: [],
        ordem: parseIntSafe(subM[2]) - 1,
      });
      continue;
    }
    // Item principal: 3.2.X
    const mainM = line.match(/^3\.2\.(\d+)\s+(.*)/);
    if (mainM) {
      pushCurrent();
      current = {
        id: crypto.randomUUID(),
        titulo: mainM[2].trim(),
        subtopicos: [],
        ordem: parseIntSafe(mainM[1]) - 1,
      };
    }
  }
  pushCurrent();

  return { objetivo_geral, objetivos_especificos };
}

function parseConteudo(sectionText: string): ConteudoProgramatico[] {
  const conteudos: ConteudoProgramatico[] = [];
  let current: ConteudoProgramatico | null = null;
  const lines = sectionText.split('\n').map(l => l.trim()).filter(Boolean);

  const pushCurrent = () => {
    if (current) conteudos.push(current);
    current = null;
  };

  for (const line of lines) {
    // Sub-tópico: 4.X.Y
    const subM = line.match(/^4\.(\d+)\.(\d+)\s+(.*)/);
    if (subM && current) {
      current.subtopicos.push({
        id: crypto.randomUUID(),
        titulo: subM[3].trim(),
        subtopicos: [],
        ordem: parseIntSafe(subM[2]) - 1,
      });
      continue;
    }
    // Item principal: 4.X
    const mainM = line.match(/^4\.(\d+)\s+(.*)/);
    if (mainM) {
      pushCurrent();
      current = {
        id: crypto.randomUUID(),
        titulo: mainM[2].trim(),
        subtopicos: [],
        ordem: parseIntSafe(mainM[1]) - 1,
      };
    }
  }
  pushCurrent();

  return conteudos;
}

function parseRecursos(sectionText: string): RecursoUtilizado[] {
  const recursos: RecursoUtilizado[] = [];
  const lines = sectionText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Formato: "8.X TipoCapitalizado: descricao (Quantidade: N)"
    const m = line.match(/^8\.\d+\s+(F[ií]sico|Material|Tecnologia)\s*:\s*(.+?)(?:\s*\(Quantidade\s*:\s*(\d+)\))?$/i);
    if (m) {
      recursos.push({
        id: crypto.randomUUID(),
        tipo: m[1].toLowerCase() as 'fisico' | 'material' | 'tecnologia',
        descricao: m[2].trim(),
        quantidade: m[3] ? parseIntSafe(m[3]) : undefined,
      });
    }
  }
  return recursos;
}

function parseVisitas(sectionText: string): VisitaTecnica[] {
  const visitas: VisitaTecnica[] = [];
  const lines = sectionText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Ignora a linha de cabeçalho
    if (/^Local|^Data\s+Prevista|^Materiais/i.test(line)) continue;
    // Cada linha de dado tem 3 colunas separadas por TAB
    const parts = line.split('\t');
    if (parts.length >= 3) {
      visitas.push({
        id: crypto.randomUUID(),
        local: parts[0].trim(),
        data_prevista: parseDisplayDate(parts[1].trim()),
        materiais_necessarios: parts[2].split(',').map(m => m.trim()).filter(Boolean),
      });
    } else if (parts.length === 2) {
      // Tenta detectar data no segundo campo mesmo sem terceiro
      const hasDate = /\d{2}\/\d{2}\/\d{4}/.test(parts[1]);
      if (hasDate) {
        visitas.push({
          id: crypto.randomUUID(),
          local: parts[0].trim(),
          data_prevista: parseDisplayDate(parts[1].trim()),
          materiais_necessarios: [],
        });
      }
    }
  }
  return visitas;
}

function buildCronogramaItem(
  dateFrom: string,
  dateTo: string,
  contentLines: string[],
  semana: number,
): CronogramaItem {
  const atividades: CronogramaTopico[] = [];
  const avaliacao: CronogramaTopico[] = [];
  let phase: 'atividades' | 'avaliacao' = 'atividades';
  let current: CronogramaTopico | null = null;

  const pushCurrent = () => {
    if (!current) return;
    (phase === 'atividades' ? atividades : avaliacao).push(current);
    current = null;
  };

  for (const raw of contentLines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^Atividades\s*:/i.test(line)) { pushCurrent(); phase = 'atividades'; continue; }
    if (/^Avalia[cç][aã]o\s*:/i.test(line)) { pushCurrent(); phase = 'avaliacao'; continue; }

    // Sub-item: X.Y. titulo
    const subM = line.match(/^(\d+)\.(\d+)\.\s+(.*)/);
    // Item principal: X. titulo
    const mainM = line.match(/^(\d+)\.\s+(.*)/);

    if (subM && current) {
      current.subtopicos.push({
        id: crypto.randomUUID(),
        titulo: subM[3].trim(),
        subtopicos: [],
        ordem: parseIntSafe(subM[2]) - 1,
      });
    } else if (mainM) {
      pushCurrent();
      current = {
        id: crypto.randomUUID(),
        titulo: mainM[2].trim(),
        subtopicos: [],
        ordem: parseIntSafe(mainM[1]) - 1,
      };
    } else if (current) {
      // Linha de continuação de texto
      current.titulo += ' ' + line;
    }
  }
  pushCurrent();

  return {
    id: crypto.randomUUID(),
    semana,
    data_inicio: dateFrom,
    data_fim: dateTo,
    atividades,
    avaliacao,
  };
}

function parseCronograma(sectionText: string): CronogramaItem[] {
  const items: CronogramaItem[] = [];
  const lines = sectionText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentDateFrom = '';
  let currentDateTo = '';
  let currentContentLines: string[] = [];
  let semana = 1;

  const flush = () => {
    if (currentDateFrom) {
      items.push(buildCronogramaItem(currentDateFrom, currentDateTo, currentContentLines, semana++));
      currentDateFrom = '';
      currentDateTo = '';
      currentContentLines = [];
    }
  };

  for (const line of lines) {
    // Ignora cabeçalho
    if (/^Data\b|^Conte[uú]do/i.test(line)) continue;

    // Detecta data de início de linha de tabela: "DD/MM/YYYY a DD/MM/YYYY[\tconteudo...]"
    const dateM = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+a\s+(\d{2}\/\d{2}\/\d{4})([\t\s]+(.*))?$/);
    if (dateM) {
      flush();
      currentDateFrom = parseDisplayDate(dateM[1]);
      currentDateTo   = parseDisplayDate(dateM[2]);
      if (dateM[4]?.trim()) currentContentLines.push(dateM[4].trim());
    } else if (currentDateFrom) {
      // Linha de conteúdo pertencente à última data
      currentContentLines.push(line);
    }
  }
  flush();

  return items;
}

function parseBibliografia(sectionText: string): {
  basica: string[];
  complementar: string[];
} {
  const basica: string[] = [];
  const complementar: string[] = [];
  let section: 'basica' | 'complementar' | null = null;

  const lines = sectionText.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/^11\.1\s+B[aá]sica\s*:/i.test(line)) { section = 'basica'; continue; }
    if (/^11\.2\s+Complementar\s*:/i.test(line)) { section = 'complementar'; continue; }

    // Linha numerada: 11.X.Y texto
    const refM = line.match(/^11\.\d+\.(\d+)\s+([\s\S]+)/);
    if (refM && section) {
      (section === 'basica' ? basica : complementar).push(refM[2].trim());
    }
  }
  return { basica, complementar };
}

// ─────────────────────────────────────────────────────────────────────────────
// Orquestra o parsing completo de uma página (= um plano de ensino)
// ─────────────────────────────────────────────────────────────────────────────

function parsePlanoFromText(fullPageText: string): PlanoImportado {
  const avisos: string[] = [];
  const secs = splitIntoSections(fullPageText);

  // Ano/período: primeira linha do cabeçalho
  const anoM = secs.header.match(/Ano\s+([\d\/]+)/i);
  const ano_periodo = anoM ? anoM[1].trim() : '';
  if (!ano_periodo) avisos.push('Ano/Período não encontrado no cabeçalho');

  // Seção 1
  const info = parseSection1(secs.s1, avisos);

  // Seção 2 – Ementa
  const ementa = parseSimpleText(secs.s2, /2\)\s*Ementa/i);

  // Seção 3 – Objetivos
  const { objetivo_geral, objetivos_especificos } = parseObjetivos(secs.s3);
  if (!objetivo_geral) avisos.push('Objetivo Geral não encontrado');

  // Seção 4 – Conteúdo
  const conteudo_programatico = parseConteudo(secs.s4);
  if (conteudo_programatico.length === 0) avisos.push('Conteúdo Programático não encontrado');

  // Seção 5 – Metodologia
  const metodologia = parseSimpleText(secs.s5, /5\)\s*Metodologia/i);

  // Seção 6 – Justificativa
  const justificativa_modalidade = parseSimpleText(secs.s6, /6\)\s*Justificativa\s+da\s+Modalidade/i);

  // Seção 7 – Atividades de Extensão
  const atividades_extensao = parseSimpleText(secs.s7, /7\)\s*Atividades\s+de\s+Extens[aã]o/i);

  // Seção 8 – Recursos
  const recursos_utilizados = parseRecursos(secs.s8);

  // Seção 9 – Visitas
  const visitas_tecnicas = parseVisitas(secs.s9);

  // Seção 10 – Cronograma
  const cronograma = parseCronograma(secs.s10);

  // Seção 11 – Bibliografia
  const { basica, complementar } = parseBibliografia(secs.s11);

  return {
    ano_periodo,
    ...info,
    curso_id: '',         // será resolvido depois
    ementa,
    objetivo_geral,
    objetivos_especificos,
    conteudo_programatico,
    metodologia,
    justificativa_modalidade,
    atividades_extensao,
    recursos_utilizados,
    visitas_tecnicas,
    cronograma,
    bibliografia_basica: basica,
    bibliografia_complementar: complementar,
    avisos,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Extrai planos do PDF (1 plano = 1 página)
// ─────────────────────────────────────────────────────────────────────────────

async function extractPlanosFromPDF(file: File): Promise<PlanoImportado[]> {
  const allItems = await extractRawTextItems(file);
  const pages = [...new Set(allItems.map(i => i.page))].sort((a, b) => a - b);

  const planos: PlanoImportado[] = [];
  for (const pageNum of pages) {
    const pageItems = allItems.filter(i => i.page === pageNum);
    const pageText = buildPageText(pageItems);
    if (!pageText.trim()) continue;

    // Só tenta parsear páginas que contenham a seção 1 (identificação)
    if (/1\)\s*IDENTIFICA/i.test(pageText)) {
      planos.push(parsePlanoFromText(pageText));
    }
  }
  return planos;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente React
// ─────────────────────────────────────────────────────────────────────────────

export function ImportPlano({ cursos, professor, onClose, onImportSuccess }: ImportPlanoProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'saving'>('upload');
  const [dragging, setDragging] = useState(false);
  const [planos, setPlanos] = useState<PlanoImportado[]>([]);
  const [cursoMap, setCursoMap] = useState<Record<number, string>>({}); // planoIndex → curso_id
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Resolver IDs de curso pelo nome ──────────────────────────────────────
  const resolveIds = (parsed: PlanoImportado[]): {
    planosResolvidos: PlanoImportado[];
    mapa: Record<number, string>;
  } => {
    const mapa: Record<number, string> = {};
    const planosResolvidos = parsed.map((p, i) => {
      const match = cursos.find(c =>
        c.nome.toLowerCase().trim() === p.curso_nome.toLowerCase().trim()
      );
      const cursoId = match?.id ?? '';
      mapa[i] = cursoId;
      return { ...p, curso_id: cursoId };
    });
    return { planosResolvidos, mapa };
  };

  // ── Processar arquivo ────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Selecione um arquivo PDF válido');
      return;
    }

    setStep('preview');
    try {
      const parsed = await extractPlanosFromPDF(file);
      if (parsed.length === 0) {
        toast.error('Nenhum plano de ensino encontrado no PDF. Verifique se o arquivo foi gerado por esta plataforma.');
        setStep('upload');
        return;
      }

      const { planosResolvidos, mapa } = resolveIds(parsed);
      setPlanos(planosResolvidos);
      setCursoMap(mapa);

      const naoEncontrados = planosResolvidos.filter(p => !p.curso_id).length;
      if (naoEncontrados > 0) {
        toast(`${naoEncontrados} plano(s) com curso não identificado — selecione manualmente.`, {
          icon: '⚠️',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar o PDF. Certifique-se de que é um PDF gerado por esta plataforma.');
      setStep('upload');
    }
  }, [cursos]);

  // ── Drag & Drop handlers ─────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Salvar planos no banco ───────────────────────────────────────────────
  const handleSalvar = async () => {
    const validos = planos.filter((_, i) => cursoMap[i]);
    if (validos.length === 0) {
      toast.error('Nenhum plano com curso definido para importar.');
      return;
    }

    setStep('saving');
    let salvos = 0;
    let erros = 0;

    for (let i = 0; i < planos.length; i++) {
      const p = planos[i];
      const cId = cursoMap[i];
      if (!cId) continue;

      try {
        const { error } = await supabase.from('planos_ensino').insert({
          titulo: p.disciplina || 'Plano Importado',
          disciplina: p.disciplina,
          abreviatura: p.abreviatura,
          ano_periodo: p.ano_periodo,
          periodo: p.periodo,
          periodo_numero: p.periodo_numero,
          curso_id: cId,
          professor_id: professor.id,
          professor_nome: professor.nome,
          matricula_siape: professor.matricula_siape,
          carga_horaria_total: p.carga_horaria_total,
          carga_horaria_presencial: p.carga_horaria_presencial,
          carga_horaria_presencial_percentual: p.carga_horaria_presencial_percentual,
          carga_horaria_distancia: p.carga_horaria_distancia || null,
          carga_horaria_distancia_percentual: p.carga_horaria_distancia_percentual || null,
          carga_horaria_teorica: p.carga_horaria_teorica,
          carga_horaria_teorica_percentual: p.carga_horaria_teorica_percentual,
          carga_horaria_pratica: p.carga_horaria_pratica,
          carga_horaria_pratica_percentual: p.carga_horaria_pratica_percentual,
          carga_horaria_semanal: p.carga_horaria_semanal,
          carga_horaria_semanal_percentual: 0,
          ementa: p.ementa,
          objetivo_geral: p.objetivo_geral,
          objetivos_especificos: JSON.stringify(p.objetivos_especificos),
          conteudo_programatico: JSON.stringify(p.conteudo_programatico),
          metodologia: p.metodologia,
          justificativa_modalidade: p.justificativa_modalidade,
          atividades_extensao: p.atividades_extensao,
          recursos_utilizados: JSON.stringify(p.recursos_utilizados),
          visitas_tecnicas: JSON.stringify(p.visitas_tecnicas),
          cronograma: JSON.stringify(p.cronograma),
          bibliografia_basica: JSON.stringify(p.bibliografia_basica),
          bibliografia_complementar: JSON.stringify(p.bibliografia_complementar),
          status: 'rascunho',
          finalizado: false,
        });

        if (error) throw error;
        salvos++;
      } catch (err) {
        console.error(`Erro ao salvar plano ${i + 1}:`, err);
        erros++;
      }
    }

    if (salvos > 0) {
      toast.success(`${salvos} plano(s) importado(s) com sucesso como rascunho!`);
      onImportSuccess();
      onClose();
    } else {
      toast.error('Nenhum plano pôde ser importado. Verifique os erros no console.');
      setStep('preview');
    }
  };

  // ── Render: tela de upload ───────────────────────────────────────────────
  const renderUpload = () => (
    <div className="p-8 flex flex-col items-center gap-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Importar Plano de Ensino via PDF</h3>
        <p className="text-sm text-gray-500">
          Selecione um PDF gerado por esta plataforma. Os dados serão extraídos automaticamente
          e salvos como rascunho para você revisar.
        </p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`w-full max-w-md border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all
          ${dragging
            ? 'border-[#2b9f3f] bg-[#2b9f3f]/5'
            : 'border-gray-300 hover:border-[#2b9f3f] hover:bg-gray-50'}`}
      >
        <Upload className={`h-10 w-10 ${dragging ? 'text-[#2b9f3f]' : 'text-gray-400'}`} />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Arraste o PDF aqui ou <span className="text-[#2b9f3f]">clique para selecionar</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Somente arquivos .pdf gerados por esta plataforma</p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );

  // ── Render: processando ──────────────────────────────────────────────────
  const renderLoading = () => (
    <div className="p-16 flex flex-col items-center gap-4 text-gray-600">
      <Loader2 className="h-10 w-10 animate-spin text-[#2b9f3f]" />
      <p className="text-sm font-medium">Extraindo e interpretando dados do PDF...</p>
      <p className="text-xs text-gray-400">Isso pode levar alguns segundos</p>
    </div>
  );

  // ── Render: preview dos dados extraídos ──────────────────────────────────
  const renderPreview = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {planos.map((plano, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Cabeçalho do card */}
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2b9f3f]" />
                <span className="font-semibold text-gray-800 text-sm">
                  Plano {i + 1}: {plano.disciplina || '(disciplina não identificada)'}
                </span>
                <span className="text-xs text-gray-400">{plano.ano_periodo}</span>
              </div>
              {plano.avisos.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  {plano.avisos.length} aviso{plano.avisos.length > 1 ? 's' : ''}
                </span>
              )}
              {plano.avisos.length === 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  OK
                </span>
              )}
            </div>

            {/* Avisos */}
            {plano.avisos.length > 0 && (
              <div className="bg-amber-50 border-b border-amber-100 px-5 py-2">
                <p className="text-xs font-medium text-amber-700 mb-1">Avisos de importação:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {plano.avisos.map((a, ai) => (
                    <li key={ai} className="text-xs text-amber-600">{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grid de dados */}
            <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <Field label="Componente Curricular" value={plano.disciplina} />
              <Field label="Abreviatura" value={plano.abreviatura} />
              <Field label="Ano/Período" value={plano.ano_periodo} />
              <Field label="Período" value={plano.periodo} />

              {/* Seletor de curso */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Curso
                  {!cursoMap[i] && (
                    <span className="ml-1 text-red-500">* selecione manualmente</span>
                  )}
                </label>
                <select
                  value={cursoMap[i] ?? ''}
                  onChange={e => setCursoMap(prev => ({ ...prev, [i]: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b9f3f] ${
                    !cursoMap[i] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">— Selecione o curso —</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                {plano.curso_nome && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Nome no PDF: "{plano.curso_nome}"
                  </p>
                )}
              </div>

              <Field label="CH Total" value={plano.carga_horaria_total ? `${plano.carga_horaria_total} h/a` : ''} />
              <Field label="CH Presencial" value={plano.carga_horaria_presencial ? `${plano.carga_horaria_presencial} h/a (${plano.carga_horaria_presencial_percentual}%)` : ''} />
              <Field label="CH Teórica" value={plano.carga_horaria_teorica ? `${plano.carga_horaria_teorica} h/a (${plano.carga_horaria_teorica_percentual}%)` : ''} />
              <Field label="CH Prática" value={plano.carga_horaria_pratica ? `${plano.carga_horaria_pratica} h/a (${plano.carga_horaria_pratica_percentual}%)` : ''} />
              <Field label="CH Semanal" value={plano.carga_horaria_semanal ? `${plano.carga_horaria_semanal} h/a` : ''} />
              {plano.carga_horaria_distancia > 0 && (
                <Field label="CH a Distância" value={`${plano.carga_horaria_distancia} h/a (${plano.carga_horaria_distancia_percentual}%)`} />
              )}

              <div className="col-span-2">
                <Field label="Ementa" value={plano.ementa} truncate />
              </div>
              <div className="col-span-2">
                <Field label="Objetivo Geral" value={plano.objetivo_geral} truncate />
              </div>

              <StatField label="Objetivos Específicos" count={plano.objetivos_especificos.length} />
              <StatField label="Itens de Conteúdo" count={plano.conteudo_programatico.length} />
              <StatField label="Semanas no Cronograma" count={plano.cronograma.length} />
              <StatField label="Recursos Utilizados" count={plano.recursos_utilizados.length} />
              <StatField label="Visitas Técnicas" count={plano.visitas_tecnicas.length} />
              <StatField label="Referências Básicas" count={plano.bibliografia_basica.length} />
              <StatField label="Referências Complementares" count={plano.bibliografia_complementar.length} />
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé com ações */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <p className="text-xs text-gray-400">
          {planos.length} plano{planos.length !== 1 ? 's' : ''} encontrado{planos.length !== 1 ? 's' : ''} · será{planos.length !== 1 ? 'ão' : ''} salvo{planos.length !== 1 ? 's' : ''} como rascunho
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setStep('upload')}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Voltar
          </button>
          <button
            onClick={handleSalvar}
            disabled={planos.every((_, i) => !cursoMap[i])}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#2b9f3f] rounded-lg hover:bg-[#248a35] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Importação
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render: salvando ─────────────────────────────────────────────────────
  const renderSaving = () => (
    <div className="p-16 flex flex-col items-center gap-4 text-gray-600">
      <Loader2 className="h-10 w-10 animate-spin text-[#2b9f3f]" />
      <p className="text-sm font-medium">Salvando planos...</p>
    </div>
  );

  // ── Modal wrapper ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header do modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#2b9f3f]" />
            <h2 className="text-base font-bold text-gray-900">Importar PDF</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-hidden">
          {step === 'upload' && renderUpload()}
          {step === 'preview' && planos.length === 0 && renderLoading()}
          {step === 'preview' && planos.length > 0 && renderPreview()}
          {step === 'saving' && renderSaving()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes auxiliares de UI
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  truncate = false,
}: {
  label: string;
  value: string | number;
  truncate?: boolean;
}) {
  const display = value !== undefined && value !== null && value !== '' ? String(value) : '—';
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p
        className={`text-sm text-gray-800 mt-0.5 ${truncate ? 'line-clamp-2' : ''} ${
          display === '—' ? 'text-gray-300 italic' : ''
        }`}
      >
        {display}
      </p>
    </div>
  );
}

function StatField({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
          count > 0 ? 'bg-[#2b9f3f]/10 text-[#2b9f3f]' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {count}
      </span>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
