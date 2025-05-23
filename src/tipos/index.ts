export interface Professor {
  id: string;
  nome: string;
  email: string;
  admin: boolean;
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
  abreviatura: string;
  periodo: string;
  periodo_numero: number;
  curso_id: string;
  professor_id: string;
  professor_nome: string;
  matricula_siape: string;
  disciplina: string;
  ano_periodo: string;
  carga_horaria_total: number;
  carga_horaria_presencial: number;
  carga_horaria_presencial_percentual: number;
  carga_horaria_teorica: number;
  carga_horaria_teorica_percentual: number;
  carga_horaria_pratica: number;
  carga_horaria_pratica_percentual: number;
  carga_horaria_semanal: number;
  carga_horaria_semanal_percentual: number;
  carga_horaria_distancia?: number;
  carga_horaria_distancia_percentual?: number;
  recursos_utilizados: any[];
  visitas_tecnicas: any[];
  cronograma: any[];
  ementa: string;
  atividades_extensao: string;
  justificativa_modalidade: string;
  objetivo_geral: string;
  objetivos_especificos: ObjetivosEspecificos[];
  conteudo_programatico: ConteudoProgramatico[];
  metodologia: string;
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
  /*data_prevista: string;
  carga_horaria: string;*/
  subtopicos: ConteudoProgramatico[];
  ordem: number;
}

export interface ObjetivosEspecificos {
  id: string;
  titulo: string;
  subtopicos: ObjetivosEspecificos[];
  ordem: number;
}

export interface VisitaTecnica {
  id: string;
  local: string;
  data_prevista: string;
  materiais_necessarios: string[];
  observacoes?: string;
}

export interface RecursoUtilizado {
  id: string;
  tipo: 'fisico' | 'material' | 'tecnologia';
  descricao: string;
  quantidade?: number;
  observacoes?: string;
}

export interface CronogramaItem {
  id: string;
  semana: number;
  data_inicio: string;
  data_fim: string;
  atividades: CronogramaTopico[];
  avaliacao: CronogramaTopico[];
}

export interface CronogramaTopico {
  id: string;
  titulo: string;
  subtopicos: CronogramaTopico[];
  ordem: number;
}