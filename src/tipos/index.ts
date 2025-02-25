export interface Professor {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  matricula_siape: string;
}

export interface Curso {
  id: string;
  nome: string;
  created_at: string;
}

export interface PlanoEnsino {
  id: string;
  titulo: string;
  periodo: string;
  periodo_numero: number;
  curso_id: string;
  professor_id: string;
  professor_nome: string; // Adicione esta linha
  matricula_siape: string; // Adicione esta linha
  disciplina: string;
  carga_horaria_total: number;
  carga_horaria_presencial: number;
  carga_horaria_presencial_percentual: number;
  carga_horaria_teorica: number;
  carga_horaria_teorica_percentual: number;
  carga_horaria_pratica: number;
  carga_horaria_pratica_percentual: number;
  carga_horaria_semanal: number;
  carga_horaria_semanal_percentual: number;
  ementa: string;
  objetivo_geral: string;
  objetivos_especificos: ObjetivosEspecificos[];
  conteudo_programatico: ConteudoProgramatico[];
  metodologia: string;
  criterios_avaliacao: CriterioAvaliacao[];
  recuperacao_aprendizagem: string;
  bibliografia_basica: string[];
  bibliografia_complementar: string[];
  status: 'rascunho' | 'finalizado';
  finalizado: boolean;
  created_at: string;
  atualizado_em: string;
}

export interface ConteudoProgramatico {
  id: string;
  titulo: string;
  subtopicos: ConteudoProgramatico[];
  ordem: number;
}

export interface ObjetivosEspecificos {
  id: string;
  titulo: string;
  subtopicos: ObjetivosEspecificos[];
  ordem: number;
}

export interface CriterioAvaliacao {
  descricao: string;
  peso: number;
}

export const CRITERIOS_AVALIACAO_PADRAO: CriterioAvaliacao[] = [];

export const METODOLOGIA_PADRAO = '';