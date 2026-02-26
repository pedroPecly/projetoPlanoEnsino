# Sistema de Planos de Ensino

Sistema web para criação, gerenciamento e exportação de Planos de Ensino por professores de instituições de ensino superior.

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Configuração do Banco de Dados (Supabase)](#configuração-do-banco-de-dados-supabase)
- [Rodando o Projeto](#rodando-o-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [Perfis de Usuário](#perfis-de-usuário)

---

## Sobre o Projeto

Aplicação React/TypeScript que permite a professores criar e gerenciar seus Planos de Ensino de forma digital. Professores com perfil **admin** têm acesso a painéis adicionais para gerenciar cursos, usuários e visualizar todos os planos finalizados de forma organizada por ano/período, curso e semestre.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|---|---|---|
| React | ^18.3.1 | Biblioteca principal de UI |
| TypeScript | ^5.5.3 | Tipagem estática |
| Vite | ^5.4.2 | Build tool e dev server |
| Tailwind CSS | ^3.4.1 | Estilização utilitária |
| Supabase | ^2.39.7 | Backend: autenticação + banco de dados |
| React Router DOM | ^6.22.2 | Roteamento SPA |
| @react-pdf/renderer | ^4.3.0 | Geração de PDF dos planos |
| @hello-pangea/dnd | ^16.5.0 | Drag and drop (cronograma/conteúdo) |
| react-hot-toast | ^2.4.1 | Notificações |
| react-markdown | ^9.0.1 | Renderização de markdown |
| lucide-react | ^0.344.0 | Ícones |

---

## Funcionalidades

- **Autenticação** — Login e cadastro de conta com e-mail e senha (via Supabase Auth)
- **Painel do Professor** — Listagem dos próprios planos com filtros por curso, período, ano/semestre e status
- **Novo Plano de Ensino** — Formulário completo com:
  - Informações básicas (curso, disciplina, período, abreviatura, título)
  - Ano/Período letivo
  - Carga horária (total, presencial, teórica, prática, semanal, EaD)
  - Ementa
  - Objetivo geral e objetivos específicos (hierárquicos, com drag-and-drop)
  - Conteúdo programático (hierárquico, com drag-and-drop)
  - Metodologia
  - Atividades de extensão
  - Justificativa de modalidade
  - Recursos utilizados (físico, material, tecnologia)
  - Visitas técnicas
  - Cronograma semanal
  - Bibliografia básica e complementar
- **Editar Plano** — Mesma estrutura do novo plano, com carregamento dos dados existentes
- **Salvar como rascunho ou finalizar** — Controle de status do plano
- **Exportar PDF** — Geração de PDF formatado do plano de ensino
- **Importar Plano** — Importação de plano via arquivo JSON
- **Alterar Dados do Usuário** — Editar nome, e-mail, senha e matrícula SIAPE
- **[ADMIN] Gerenciar Cursos** — Criar, editar e excluir cursos
- **[ADMIN] Gerenciar Usuários** — Criar, editar e excluir usuários do sistema
- **[ADMIN] Visualização organizada** — Todos os planos finalizados organizados por Ano/Período → Curso → Semestre

---

## Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** versão 9 ou superior (ou yarn)
- Conta no [Supabase](https://supabase.com) (gratuita)

---

## Configuração do Ambiente

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd projetoPlanoEnsino
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie (ou edite) o arquivo `.env` na raiz do projeto com as suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Onde encontrar essas chaves?**
> 1. Acesse o seu projeto em [supabase.com](https://supabase.com)
> 2. Vá em **Project Settings → API**
> 3. Copie a **Project URL** para `VITE_SUPABASE_URL`
> 4. Copie a **anon public** key para `VITE_SUPABASE_ANON_KEY`

---

## Configuração do Banco de Dados (Supabase)

Execute o script SQL completo disponível no arquivo [`supabase/schema.sql`](supabase/schema.sql) no **SQL Editor** do seu projeto Supabase.

> Acesse: **Supabase → SQL Editor → New Query** → cole o conteúdo do arquivo → clique em **Run**

O script cria automaticamente:
- As 3 tabelas necessárias (`professores`, `cursos`, `planos_ensino`)
- As extensões necessárias (`uuid-ossp`, `pgcrypto`)
- As políticas de segurança RLS (Row Level Security)
- Os índices de performance
- Um trigger para atualizar o campo `atualizado_em` automaticamente

### Após rodar o SQL: definir o primeiro admin

Depois de criar sua primeira conta pelo sistema, defina-a como admin diretamente no Supabase:

```sql
-- Substitua o e-mail pelo seu
UPDATE professores
SET admin = true
WHERE email = 'seuemail@exemplo.com';
```

---

## Rodando o Projeto

```bash
# Modo desenvolvimento (porta 8080)
npm run dev

# Gerar build de produção
npm run build

# Visualizar build de produção localmente
npm run preview
```

Acesse: [http://localhost:8080](http://localhost:8080)

---

## Estrutura de Pastas

```
src/
├── App.tsx                    # Roteamento principal
├── main.tsx                   # Entry point
├── index.css                  # Estilos globais
├── assets/
│   └── fonts/                 # Fontes TTF para PDF
├── components/
│   ├── Bibliografia.tsx        # Editor de referências bibliográficas
│   ├── CargaHoraria.tsx        # Editor de carga horária
│   ├── ConteudoProgramatico.tsx # Editor hierárquico de conteúdo
│   ├── Cronograma.tsx          # Editor de cronograma semanal
│   ├── GerenciarCursos.tsx     # Modal admin: gerenciar cursos
│   ├── GerenciarUsuarios.tsx   # Modal admin: gerenciar usuários
│   ├── ImportPlano.tsx         # Modal de importação de plano JSON
│   ├── ObjetivosEspecificos.tsx # Editor hierárquico de objetivos
│   ├── PlanoPDF.tsx            # Template PDF do plano
│   ├── PlanoSumario.tsx        # Sumário lateral de navegação
│   ├── RecursosUtilizados.tsx  # Editor de recursos
│   └── VisitasTecnicas.tsx     # Editor de visitas técnicas
├── lib/
│   └── supabase.ts             # Cliente Supabase configurado
├── paginas/
│   ├── AlterarDadosUsuario.tsx # Perfil do usuário
│   ├── CriarConta.tsx          # Cadastro
│   ├── EditarPlano.tsx         # Edição de plano existente
│   ├── Login.tsx               # Login
│   ├── NovoPlano.tsx           # Criação de novo plano
│   └── Painel.tsx              # Dashboard principal
└── tipos/
    └── index.ts                # Interfaces TypeScript
```

---

## Rotas da Aplicação

| Rota | Componente | Descrição |
|---|---|---|
| `/` | Redirect | Redireciona para `/login` |
| `/login` | `Login` | Tela de login |
| `/criar-conta` | `CriarConta` | Cadastro de novo professor |
| `/painel` | `Painel` | Dashboard com lista de planos |
| `/novo-plano` | `NovoPlano` | Formulário de criação de plano |
| `/editar-plano/:id` | `EditarPlano` | Formulário de edição de plano |
| `/alterar-dados-usuario` | `AlterarDadosUsuario` | Edição do perfil do usuário |

---

## Perfis de Usuário

### Professor (padrão)
- Cria, edita e exclui seus próprios planos
- Visualiza e exporta seus planos em PDF
- Edita seus dados pessoais

### Admin
- Todas as permissões do professor
- Gerencia cursos (criar, editar, excluir)
- Gerencia usuários do sistema (criar, editar, excluir, definir admin)
- Visualiza todos os planos finalizados de todos os professores, organizados por Ano/Período → Curso → Semestre
