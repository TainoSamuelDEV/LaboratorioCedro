# Plataforma de Experiência do Cliente — Laboratório Cedro (NIT)

Sistema próprio desenvolvido para o **Laboratório Cedro (Núcleo de Inovação e Tecnologia — NIT)** com o objetivo de **substituir o antigo sistema terceirizado**, aplicando na prática os 4 pilares de **Programação Orientada a Objetos (POO)** (Abstração, Encapsulamento, Herança e Polimorfismo) e atendendo integralmente aos requisitos da [Documentação Funcional](./Documentacao_Funcional_INDECX.pdf).

---

## 1. Equipe e Divisão das 6 Frentes de Arquitetura

| Integrante | Frentes de Responsabilidade | Escopo Principal |
| :--- | :--- | :--- |
| **Gabriel** | **Tech Lead**, **Banco de Dados**, **QA** | Arquitetura POO, contratos da API, modelagem PostgreSQL/Supabase, triggers de auditoria e suíte de testes unitários/integração. |
| **Taino** | **Back-end**, **Front-end**, **DevOps** | Implementação das classes de domínio POO e API Express.js, interfaces em Next.js (avaliação pública + login + sistema interno) e automação/deploy. |

---

## 2. Stack Tecnológica

* **Linguagem:** TypeScript (Strict Mode)
* **Back-end:** Node.js + Express.js (Arquitetura em 4 Camadas: `Presentation` → `Application` → `Domain POO` → `Infrastructure`)
* **Front-end:** Next.js 16 (App Router + React 19 + TypeScript + Tailwind CSS v4 — consome exclusivamente a API do Back-end via `NEXT_PUBLIC_API_URL`)
* **Identidade Visual:** Padrão Editorial do Brand Book Oficial do **Laboratório Cedro** (`Source Serif 4` + `Plus Jakarta Sans`, paleta verde institucional `#075618` / `#02A562` / `#23823D` / `#55D994`, Skeletons em todas as transições assíncronas e `Drawer` responsivo)
* **Banco de Dados:** PostgreSQL via **Supabase Self-Hosted na VPS** (acessado exclusivamente pelo Back-end na camada `infrastructure/`)
* **Testes (QA):** Vitest + Supertest
* **DevOps & Infra:** **VPS + Coolify** (Containers Docker para Front-end, Back-end e Supabase Self-Hosted) + GitHub Actions

---

## 3. Documentação Técnica e Engenharia do Projeto

1. [01. Arquitetura, Stack e Divisão das 6 Frentes](./docs/01-arquitetura-e-papeis.md)
2. [02. Modelagem Orientada a Objetos (POO) e Regras de Domínio](./docs/02-modelagem-poo-dominio.md)
3. [03. Modelagem do Banco de Dados (DER e Regras PostgreSQL/Supabase)](./docs/03-modelagem-banco-dados.md)
4. [04. Contrato da API REST, Entregas do MVP e Plano de QA](./docs/04-contrato-api-e-plano-qa.md)
5. [05. Diagrama de Casos de Uso (Padrão UML 2.5 com Ator Sistema), Sequência e Justificativa POO](./docs/05-diagramas-uml-casos-de-uso.md)
6. [Diagrama Visual Vetorial de Casos de Uso UML (SVG)](./docs/diagrama-casos-de-uso-uml.svg)
7. [Script SQL Oficial (Supabase / PostgreSQL)](./database/schema.sql) e [Seed Inicial](./database/seed.sql)

---

## 4. Status de Construção do MVP

### Fase 0 & 1 — Arquitetura, Banco de Dados e Domínio POO
- [x] Planejamento Arquitetural, Modelagem POO, Schema SQL (`database/schema.sql`) e Contratos da API
- [x] **Back-end POO Completo (`backend/` — Entregas 1 a 9):**
  - [x] **Entrega 1:** Autenticação JWT, usuários, perfis polimórficos (`Administrador`, `OperadorOuvidoria`, `CoordenadorUnidade`) e unidades
  - [x] **Entrega 2:** Cadastro da pesquisa e rota pública de avaliação (`/api/public/pesquisas/:id`)
  - [x] **Entrega 3:** Registro de nota (1 a 5), validação de comentário obrigatório para notas 1 a 3 e identificação opcional (LGPD)
  - [x] **Entrega 4:** Criação automática de protocolo `CED-AAAA-NNNNNN` e cálculo polimórfico de prioridade/SLA por nota (`PoliticaSlaPadraoCedro`)
  - [x] **Entrega 5:** Endpoints de manifestações com os filtros da Seção 10 e detalhe completo dos 14 campos da Seção 9
  - [x] **Entrega 6:** Início de tratamento e registro formal de resposta da unidade
  - [x] **Entrega 7:** Fila de pendências, solicitação de complemento (`<<extend>>`), escalonamento e conclusão blindada
  - [x] **Entrega 8:** Dashboard com os 10 indicadores gerenciais da Seção 11 e exportação CSV/JSON
  - [x] **Entrega 9:** Notificações polimórficas (`INotificador`) e trilha de auditoria imutável (`Interacao`)
  - [x] **Infraestrutura:** Repositórios em memória e Supabase/PostgreSQL implementados em `backend/src/infrastructure/`

### Fase 2 — Front-end Next.js (`frontend/`)
- [x] **Identidade Visual & Logos Oficiais:** Integração de `logo-cedro.svg` e `logo-cedro-completa.svg`, tipografia editorial e tokens cromáticos do Brand Book
- [x] **Grupo `(publico)` — Avaliação do Cliente (`/pesquisa/[id]`):**
  - [x] Escala interativa de 1 a 5 com cores semânticas, gaveta animada de comentário e senha de atendimento
  - [x] Destaque visual e validação obrigatória de comentário para notas 1 a 3 (`UC01`) com scroll suave automático
  - [x] Tela de confirmação com protocolo gerado (`CED-AAAA-NNNNNN`) e Skeletons de carregamento
- [x] **Páginas de Erro (`ErrorView`, `not-found`, `error`, `global-error`):**
  - [x] Design minimalista exibindo exclusivamente a marca, o código do erro (`404`, `403`, `500`, `503`) e seu significado
- [x] **Grupo `(auth)` — Tela 1: Login Corporativo (`/login`):**
  - [x] Layout dividido com arcos orgânicos nas cores da marca Cedro à esquerda e formulário minimalista à direita
  - [x] Atalhos de preenchimento rápido para avaliação dos 3 perfis POO (`Administrador`, `Ouvidoria`, `Coordenador`)
  - [x] Sem tela pública de auto-cadastro (conforme `UC13`, o cadastro de usuários é restrito ao `Administrador`)
- [ ] **Grupo `(sistema)` — Reconstrução Estruturada Passo a Passo (Telas 2 a 9):**
  - [ ] **Passo 1:** Layout Corporativo (`sidebar-08` + `Drawer` responsivo no Mobile + proteção de rotas por perfil `UC05`)
  - [ ] **Passo 2 (Tela 2):** Dashboard Gerencial (`/dashboard`) — 10 indicadores da Seção 11 (`UC12`)
  - [ ] **Passo 3 (Tela 3):** Gestão de Pesquisas (`/pesquisas`) — listagem, criação e link público / QR Code (`UC13`)
  - [ ] **Passo 4 (Tela 4):** Lista de Manifestações (`/manifestacoes`) — filtros via Query Params da Seção 10 (`UC06`)
  - [ ] **Passo 5 (Tela 5):** Detalhe e Tratativa da Manifestação (`/manifestacoes/[id]`) — 14 campos da Seção 9, histórico imutável e ações por perfil (`UC07` a `UC11`)
  - [ ] **Passo 6 (Tela 6):** Fila de Pendências (`/pendencias`) — não respondidas, atrasadas e escalonadas (`UC06` / `QA-05`)
  - [ ] **Passo 7 (Tela 7):** Gestão de Unidades (`/unidades`) — cadastro, SLA padrão e ativação/desativação (`UC13`)
  - [ ] **Passo 8 (Tela 8):** Gestão de Usuários e Permissões (`/usuarios`) — cadastro de perfis internos e vínculo obrigatório de unidade para Coordenador (`UC13`)
  - [ ] **Passo 9 (Tela 9):** Relatórios e Exportação (`/relatorios`) — exportação CSV/JSON (`UC12`)

### Fase 3 — DevOps & Infraestrutura
- [x] **Dockerfiles:** Multi-stage build standalone para Front-end e Back-end
- [x] **Docker Compose:** Orquestração completa local e compatível com Coolify (PaaS VPS)
- [x] **GitHub Actions:** Pipeline de CI contínuo com Vitest, Typecheck e Build na branch `prod`

---

## 5. Como Executar Localmente

### 1. Back-end (API Express + Domínio POO)
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Servidor disponível em http://localhost:3001/api
```

Para executar a suíte de testes de domínio POO e QA:
```bash
cd backend
npm test
```

### 2. Front-end (Next.js App Router)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# Aplicação disponível em http://localhost:3000
```

---

## 6. Credenciais de Demonstração (Seed Inicial)

| Perfil POO | E-mail | Senha | Escopo de Acesso |
| :--- | :--- | :--- | :--- |
| `Administrador` | `admin@cedro.com.br` | `123456` | Acesso total, gestão de unidades, usuários, pesquisas, ouvidoria e dashboard global. |
| `OperadorOuvidoria` | `ouvidoria@cedro.com.br` | `123456` | Monitoramento global, solicitação de complemento, escalonamento, conclusão e relatórios. |
| `CoordenadorUnidade` | `coord.matriz@cedro.com.br` | `123456` | Restrito exclusivamente às manifestações e indicadores da sua unidade vinculada. |
