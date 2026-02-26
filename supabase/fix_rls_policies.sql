-- =============================================================================
-- CORREÇÃO DAS POLÍTICAS RLS
-- Execute este script no Supabase → SQL Editor → New Query → Run
--
-- Problema: as políticas anteriores causavam recursão infinita ao consultar
-- a tabela "professores" dentro de uma policy da própria tabela "professores".
-- Solução: usar uma função com SECURITY DEFINER que escapa do RLS.
-- =============================================================================


-- 1. Remove todas as políticas antigas que causam recursão
-- ---------------------------------------------------------------------------
drop policy if exists "Professor lê o próprio perfil"          on public.professores;
drop policy if exists "Professor atualiza o próprio perfil"    on public.professores;
drop policy if exists "Admin lê todos os professores"          on public.professores;
drop policy if exists "Admin atualiza qualquer professor"      on public.professores;
drop policy if exists "Admin deleta qualquer professor"        on public.professores;
drop policy if exists "Inserir próprio perfil ao criar conta"  on public.professores;
drop policy if exists "Admin insere qualquer professor"        on public.professores;

drop policy if exists "Usuário autenticado lê cursos"          on public.cursos;
drop policy if exists "Admin insere cursos"                    on public.cursos;
drop policy if exists "Admin atualiza cursos"                  on public.cursos;
drop policy if exists "Admin deleta cursos"                    on public.cursos;

drop policy if exists "Professor lê os próprios planos"        on public.planos_ensino;
drop policy if exists "Professor insere o próprio plano"       on public.planos_ensino;
drop policy if exists "Professor atualiza o próprio plano"     on public.planos_ensino;
drop policy if exists "Professor deleta o próprio plano"       on public.planos_ensino;
drop policy if exists "Admin lê todos os planos"               on public.planos_ensino;
drop policy if exists "Admin atualiza qualquer plano"          on public.planos_ensino;
drop policy if exists "Admin deleta qualquer plano"            on public.planos_ensino;


-- 2. Cria função auxiliar com SECURITY DEFINER
-- (roda com privilégio do criador, fora do RLS — sem recursão)
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


-- =============================================================================
-- POLÍTICAS: professores
-- =============================================================================

-- Qualquer usuário autenticado pode inserir o próprio perfil (signUp)
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

-- Admin lê todos os professores (usa a função — sem recursão)
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

-- Admin insere qualquer professor (criar usuário pelo painel admin)
create policy "Admin insere qualquer professor"
  on public.professores for insert
  with check (public.is_admin());


-- =============================================================================
-- POLÍTICAS: cursos
-- =============================================================================

-- Qualquer autenticado pode listar cursos
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


-- =============================================================================
-- POLÍTICAS: planos_ensino
-- =============================================================================

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
-- LIMPEZA: remove usuários órfãos do Auth que não têm perfil em professores
-- (gerados pelas tentativas anteriores que falharam)
-- Rode o SELECT primeiro para confirmar quem são, depois o DELETE se quiser.
-- =============================================================================

-- Visualizar órfãos:
-- SELECT au.id, au.email, au.created_at
-- FROM auth.users au
-- LEFT JOIN public.professores p ON p.id = au.id
-- WHERE p.id IS NULL;

-- Deletar órfãos (descomente se quiser limpar):
-- DELETE FROM auth.users
-- WHERE id IN (
--   SELECT au.id FROM auth.users au
--   LEFT JOIN public.professores p ON p.id = au.id
--   WHERE p.id IS NULL
-- );
