-- =============================================================================
-- SISTEMA DE PLANOS DE ENSINO
-- Script completo de criação do banco de dados no Supabase
--
-- Como usar:
--   1. Acesse seu projeto no Supabase (https://supabase.com)
--   2. Vá em SQL Editor → New Query
--   3. Cole todo o conteúdo deste arquivo
--   4. Clique em "Run"
-- =============================================================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- =============================================================================
-- TABELA: professores
-- Armazena os dados dos professores (usuários do sistema).
-- O campo "id" é o mesmo UUID gerado pelo Supabase Auth (auth.users).
-- =============================================================================
create table if not exists public.professores (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text        not null,
  email       text        not null unique,
  admin       boolean     not null default false,
  matricula_siape text,
  created_at  timestamptz not null default now()
);

comment on table public.professores is 'Perfis dos professores cadastrados no sistema, vinculados ao auth.users.';


-- =============================================================================
-- TABELA: cursos
-- Armazena os cursos disponíveis na instituição.
-- =============================================================================
create table if not exists public.cursos (
  id         uuid primary key default uuid_generate_v4(),
  nome       text        not null,
  created_at timestamptz not null default now()
);

comment on table public.cursos is 'Cursos cadastrados na instituição.';


-- =============================================================================
-- TABELA: planos_ensino
-- Armazena os planos de ensino dos professores.
-- Campos complexos (listas, hierarquias) são armazenados como JSONB.
-- =============================================================================
create table if not exists public.planos_ensino (
  id                                 uuid primary key default uuid_generate_v4(),

  -- Identificação
  titulo                             text        not null default '',
  abreviatura                        text        not null default '',
  disciplina                         text        not null default '',
  ano_periodo                        text        not null default '',   -- Ex: "2024/1"
  periodo                            text        not null default '',   -- Ex: "1º Período"
  periodo_numero                     integer     not null default 1,

  -- Vínculos
  curso_id                           uuid        not null references public.cursos(id) on delete restrict,
  professor_id                       uuid        not null references auth.users(id) on delete cascade,
  professor_nome                     text        not null default '',
  matricula_siape                    text        not null default '',

  -- Carga horária
  carga_horaria_total                integer     not null default 0,
  carga_horaria_presencial           integer     not null default 0,
  carga_horaria_presencial_percentual numeric(5,2) not null default 0,
  carga_horaria_teorica              integer     not null default 0,
  carga_horaria_teorica_percentual   numeric(5,2) not null default 0,
  carga_horaria_pratica              integer     not null default 0,
  carga_horaria_pratica_percentual   numeric(5,2) not null default 0,
  carga_horaria_semanal              integer     not null default 0,
  carga_horaria_semanal_percentual   numeric(5,2) not null default 0,
  carga_horaria_distancia            integer,                           -- nullable (opcional)
  carga_horaria_distancia_percentual numeric(5,2),                      -- nullable (opcional)

  -- Conteúdo textual
  ementa                             text        not null default '',
  objetivo_geral                     text        not null default '',
  metodologia                        text        not null default '',
  atividades_extensao                text        not null default '',
  justificativa_modalidade           text        not null default '',

  -- Campos hierárquicos (JSON)
  -- Estrutura ObjetivosEspecificos[]: [ { id, titulo, subtopicos[], ordem } ]
  objetivos_especificos              jsonb       not null default '[]'::jsonb,

  -- Estrutura ConteudoProgramatico[]: [ { id, titulo, subtopicos[], ordem } ]
  conteudo_programatico              jsonb       not null default '[]'::jsonb,

  -- Estrutura CronogramaItem[]: [ { id, semana, data_inicio, data_fim, atividades[], avaliacao[] } ]
  cronograma                         jsonb       not null default '[]'::jsonb,

  -- Estrutura RecursoUtilizado[]: [ { id, tipo, descricao, quantidade, observacoes } ]
  -- tipo: 'fisico' | 'material' | 'tecnologia'
  recursos_utilizados                jsonb       not null default '[]'::jsonb,

  -- Estrutura VisitaTecnica[]: [ { id, local, data_prevista, materiais_necessarios[], observacoes } ]
  visitas_tecnicas                   jsonb       not null default '[]'::jsonb,

  -- Bibliografias: array de strings
  bibliografia_basica                jsonb       not null default '[]'::jsonb,
  bibliografia_complementar          jsonb       not null default '[]'::jsonb,

  -- Status do plano
  status                             text        not null default 'rascunho' check (status in ('rascunho', 'finalizado')),
  finalizado                         boolean     not null default false,

  -- Timestamps
  created_at                         timestamptz not null default now(),
  atualizado_em                      timestamptz not null default now()
);

comment on table public.planos_ensino is 'Planos de ensino criados pelos professores.';
comment on column public.planos_ensino.objetivos_especificos   is 'Array JSON de ObjetivosEspecificos hierárquicos.';
comment on column public.planos_ensino.conteudo_programatico   is 'Array JSON de ConteudoProgramatico hierárquico.';
comment on column public.planos_ensino.cronograma              is 'Array JSON de CronogramaItem com atividades semanais.';
comment on column public.planos_ensino.recursos_utilizados     is 'Array JSON de RecursoUtilizado (fisico, material, tecnologia).';
comment on column public.planos_ensino.visitas_tecnicas        is 'Array JSON de VisitaTecnica com local, data e materiais.';
comment on column public.planos_ensino.bibliografia_basica     is 'Array JSON de strings com referências básicas.';
comment on column public.planos_ensino.bibliografia_complementar is 'Array JSON de strings com referências complementares.';


-- =============================================================================
-- TRIGGER: atualiza automaticamente o campo "atualizado_em" a cada UPDATE
-- =============================================================================
create or replace function public.atualizar_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_planos_ensino_atualizado_em on public.planos_ensino;

create trigger trg_planos_ensino_atualizado_em
  before update on public.planos_ensino
  for each row
  execute function public.atualizar_timestamp();


-- =============================================================================
-- ÍNDICES de performance
-- =============================================================================
create index if not exists idx_planos_ensino_professor_id on public.planos_ensino(professor_id);
create index if not exists idx_planos_ensino_curso_id     on public.planos_ensino(curso_id);
create index if not exists idx_planos_ensino_status       on public.planos_ensino(status);
create index if not exists idx_planos_ensino_ano_periodo  on public.planos_ensino(ano_periodo);
create index if not exists idx_professores_email          on public.professores(email);


-- =============================================================================
-- RLS (Row Level Security) — Segurança por linha
-- =============================================================================

-- Habilitar RLS em todas as tabelas
alter table public.professores   enable row level security;
alter table public.cursos        enable row level security;
alter table public.planos_ensino enable row level security;


-- ---------------------------------------------------------------------------
-- Função auxiliar: is_admin()
-- Usa SECURITY DEFINER para rodar fora do RLS e evitar recursão infinita.
-- Sem isso, políticas que consultam "professores" dentro de uma policy de
-- "professores" causam loop infinito.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select admin from public.professores where id = auth.uid()),
    false
  );
$$;


-- ---------------------------------------------------------------------------
-- Políticas: professores
-- ---------------------------------------------------------------------------

-- Qualquer autenticado insere o próprio perfil (criação de conta via signUp)
create policy "Inserir próprio perfil"
  on public.professores for insert
  with check (auth.uid() = id);

-- Cada professor lê o próprio perfil
create policy "Professor lê o próprio perfil"
  on public.professores for select
  using (auth.uid() = id);

-- Cada professor atualiza o próprio perfil
create policy "Professor atualiza o próprio perfil"
  on public.professores for update
  using (auth.uid() = id);

-- Admin lê todos os professores
create policy "Admin lê todos os professores"
  on public.professores for select
  using (public.is_admin());

-- Admin atualiza qualquer professor
create policy "Admin atualiza qualquer professor"
  on public.professores for update
  using (public.is_admin());

-- Admin deleta qualquer professor
create policy "Admin deleta qualquer professor"
  on public.professores for delete
  using (public.is_admin());

-- Admin insere qualquer professor (criar pelo painel)
create policy "Admin insere qualquer professor"
  on public.professores for insert
  with check (public.is_admin());


-- ---------------------------------------------------------------------------
-- Políticas: cursos
-- ---------------------------------------------------------------------------

-- Qualquer autenticado lê cursos
create policy "Usuário autenticado lê cursos"
  on public.cursos for select
  using (auth.role() = 'authenticated');

-- Somente admin gerencia cursos
create policy "Admin insere cursos"
  on public.cursos for insert
  with check (public.is_admin());

create policy "Admin atualiza cursos"
  on public.cursos for update
  using (public.is_admin());

create policy "Admin deleta cursos"
  on public.cursos for delete
  using (public.is_admin());


-- ---------------------------------------------------------------------------
-- Políticas: planos_ensino
-- ---------------------------------------------------------------------------

-- Professor vê apenas os próprios planos
create policy "Professor lê os próprios planos"
  on public.planos_ensino for select
  using (professor_id = auth.uid());

-- Professor insere apenas com o próprio professor_id
create policy "Professor insere o próprio plano"
  on public.planos_ensino for insert
  with check (professor_id = auth.uid());

-- Professor atualiza apenas os próprios planos
create policy "Professor atualiza o próprio plano"
  on public.planos_ensino for update
  using (professor_id = auth.uid());

-- Professor deleta apenas os próprios planos
create policy "Professor deleta o próprio plano"
  on public.planos_ensino for delete
  using (professor_id = auth.uid());

-- Admin lê todos os planos
create policy "Admin lê todos os planos"
  on public.planos_ensino for select
  using (public.is_admin());

-- Admin atualiza qualquer plano
create policy "Admin atualiza qualquer plano"
  on public.planos_ensino for update
  using (public.is_admin());

-- Admin deleta qualquer plano
create policy "Admin deleta qualquer plano"
  on public.planos_ensino for delete
  using (public.is_admin());


-- =============================================================================
-- DADOS INICIAIS: exemplo de cursos para facilitar os primeiros testes
-- (remova ou adapte conforme necessário)
-- =============================================================================
insert into public.cursos (nome) values
  ('Sistemas de Informação'),
  ('Ciência da Computação'),
  ('Engenharia de Software'),
  ('Análise e Desenvolvimento de Sistemas'),
  ('Redes de Computadores')
on conflict do nothing;


-- =============================================================================
-- RESUMO DAS TABELAS CRIADAS
--
-- public.professores
--   id, nome, email, admin, matricula_siape, created_at
--
-- public.cursos
--   id, nome, created_at
--
-- public.planos_ensino
--   id, titulo, abreviatura, disciplina, ano_periodo, periodo, periodo_numero,
--   curso_id, professor_id, professor_nome, matricula_siape,
--   carga_horaria_total, carga_horaria_presencial, carga_horaria_presencial_percentual,
--   carga_horaria_teorica, carga_horaria_teorica_percentual,
--   carga_horaria_pratica, carga_horaria_pratica_percentual,
--   carga_horaria_semanal, carga_horaria_semanal_percentual,
--   carga_horaria_distancia, carga_horaria_distancia_percentual,
--   ementa, objetivo_geral, metodologia, atividades_extensao, justificativa_modalidade,
--   objetivos_especificos (jsonb), conteudo_programatico (jsonb), cronograma (jsonb),
--   recursos_utilizados (jsonb), visitas_tecnicas (jsonb),
--   bibliografia_basica (jsonb), bibliografia_complementar (jsonb),
--   status, finalizado, created_at, atualizado_em
-- =============================================================================
