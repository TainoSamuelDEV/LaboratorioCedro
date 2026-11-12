# Dashboard Gerencial (Painel de Indicadores e Gestão) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o Dashboard Gerencial completo (`/dashboard`), apresentando os 10 indicadores oficiais da Seção 11 da documentação, nota média geral, distribuição de notas 1 a 5, divisão de desempenho por pesquisa, panorama por unidade e fluxo de últimas manifestações, respeitando estritamente o controle de acesso por perfil (RBAC: Coordenador vê apenas sua unidade; Administrador/Ouvidoria veem todas com filtro opcional).

**Architecture:** Abordagem full-stack com Clean Architecture no Back-end Express (Use Case `ObterIndicadoresDashboardUseCase`, DTOs tipados, injeção de repositórios com escopo de perfil) e Next.js App Router no Front-end (`(sistema)/dashboard/page.tsx`), utilizando componentes modulares de apresentação (`DashboardKpiCard`, `DistribuicaoNotasChart`, `PesquisaDesempenhoGrid`, `PanoramaUnidadesTable`, `UltimasManifestacoesStream`), consumindo a camada `dashboardService` com suporte a skeletons e estados de erro/vazio.

**Tech Stack:** TypeScript, Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Express.js, Vitest, PostgreSQL/Supabase.

**Spec:** [`docs/01-arquitetura-e-papeis.md`](file:///C:/Users/Taino/Desktop/poo-taino-gabriel/docs/01-arquitetura-e-papeis.md), [`docs/04-contrato-api-e-plano-qa.md`](file:///C:/Users/Taino/Desktop/poo-taino-gabriel/docs/04-contrato-api-e-plano-qa.md) (Seção Entregas 8 e 9), [`docs/05-diagramas-uml-casos-de-uso.md`](file:///C:/Users/Taino/Desktop/poo-taino-gabriel/docs/05-diagramas-uml-casos-de-uso.md) (UC12: Atualizar e Consultar Dashboard).

---

## Global Constraints

- **Segregação por Perfil (RBAC):** `COORDENADOR_UNIDADE` só pode visualizar indicadores da sua unidade vinculada (`usuario.unidadeId`). O filtro de unidade é fixo e bloqueado para ele tanto no front-end quanto garantido no use case do back-end.
- **Tipografia & Design System:** Seguir rigorosamente a escala do Brand Book Cedro padronizada no projeto: títulos em Lato 900 `#075618`, textos de apoio em `#5E5E5E`, cartões com `rounded-xl border border-[#E3E3E3] shadow-cedro-card`, badges semânticas oficiais e botões com `min-height: 48px` / `rounded-[10px]`.
- **Cores de Notas Oficiais (1 a 5):** 5: `#02A562` (Excelente), 4: `#93CBA0` (Muito bom), 3: `#F29222` (Regular), 2: `#E65100` (Abaixo do esperado), 1: `#CA2E24` (Ruim).
- **Sem Dependência de Bibliotecas Externas de Gráficos:** Gráficos de barras e distribuição devem ser construídos em CSS/SVG nativo puro e Tailwind (acessível, ultra rápido, zero overhead de bundle e 100% responsivo).
- **Preservação de Auditoria (Soft Delete):** Unidades ou pesquisas desativadas logicamente (`ativa = false`) continuam alimentando os dados históricos do Dashboard.

---

## Review Focus

1. **Tentativa de Vazamento de Dados por Coordenador:** Coordenador da Unidade A enviando `?unidadeId=unidade-B` na rota `/api/dashboard/indicadores` deve ter o filtro forçado para a Unidade A no back-end.
2. **Dashboard com Zero Respostas (Divisão por zero):** Cálculo de nota média e porcentagem quando `totalRespostas === 0` deve retornar `0` de forma segura, sem resultar em `NaN` ou quebrar a tela.
3. **Desempenho por Pesquisa com Pesquisa Inativa:** Pesquisas inativadas devem ser listadas com badge "Inativa" e continuar exibindo o histórico de respostas recebidas no período.
4. **Resoluções Mobile (< 1024px):** Grid de 4 KPIs deve colapsar para 1 ou 2 colunas com tipografia legível e scroll suave sem overflow horizontal.
5. **Comunicação com API Indisponível:** Front-end deve exibir estado de erro gracioso com botão "Tentar novamente" (`retry`) em vez de tela branca.

---

### Task 1: Expansão dos DTOs e do Caso de Uso no Back-end

**Files:**
- Modify: `backend/src/application/dtos/DashboardDTOs.ts`
- Modify: `backend/src/application/use-cases/dashboard/ObterIndicadoresDashboardUseCase.ts`
- Modify: `backend/src/presentation/controllers/DashboardController.ts`
- Modify: `backend/src/infrastructure/server.ts`
- Test: `backend/tests/application/DashboardUseCases.spec.ts`

- [x] **Step 1.1:** Adicionar `MetricaPesquisaDashboardDTO`, `UltimaManifestacaoDashboardDTO` e os campos `notaMediaGeral`, `desempenhoPorPesquisa` e `ultimasManifestacoes` em `backend/src/application/dtos/DashboardDTOs.ts`.
- [x] **Step 1.2:** Injetar `IPesquisaRepository` no construtor de `ObterIndicadoresDashboardUseCase`, calcular `notaMediaGeral` e mapear cada pesquisa em `desempenhoPorPesquisa` (com `totalRespostas` e `notaMedia`).
- [x] **Step 1.3:** Mapear as últimas 5 manifestações ordenadas por data decrescente em `ultimasManifestacoes`.
- [x] **Step 1.4:** Atualizar os testes unitários em `backend/tests/application/DashboardUseCases.spec.ts` para verificar os novos campos e a proteção de escopo de unidade.
- [x] **Step 1.5:** Executar os testes com `npm test --prefix backend` e garantir que todos passam (100% verde).
- [x] **Step 1.6:** Commitar as alterações no back-end.
  - Commit: `feat(dashboard-api): expande indicadores do dashboard com media geral, desempenho por pesquisa e ultimas manifestacoes`

---

### Task 2: Sincronização dos DTOs e Serviço no Front-end

**Files:**
- Modify: `frontend/src/types/api.ts`
- Modify: `frontend/src/services/dashboard.service.ts`

- [x] **Step 2.1:** Atualizar a interface `IndicadoresDashboardDTO` em `frontend/src/types/api.ts` com `notaMediaGeral`, `desempenhoPorPesquisa` e `ultimasManifestacoes`.
- [x] **Step 2.2:** Verificar a tipagem do método `dashboardService.obterIndicadores(unidadeId?: string)`.
- [x] **Step 2.3:** Validar checagem de tipos com `npx tsc --noEmit --project frontend/tsconfig.json`.
- [x] **Step 2.4:** Commitar as alterações.
  - Commit: `feat(dashboard-types): sincroniza DTOs de indicadores com desempenho por pesquisa no frontend`

---

### Task 3: Componentes Visuais do Dashboard

**Files:**
- Create: `frontend/src/components/dashboard/DashboardKpiCard.tsx`
- Create: `frontend/src/components/dashboard/DistribuicaoNotasChart.tsx`
- Create: `frontend/src/components/dashboard/PesquisaDesempenhoGrid.tsx`
- Create: `frontend/src/components/dashboard/PanoramaUnidadesTable.tsx`
- Create: `frontend/src/components/dashboard/UltimasManifestacoesStream.tsx`
- Create: `frontend/src/components/dashboard/DashboardSkeleton.tsx`

- [x] **Step 3.1:** Criar `DashboardKpiCard.tsx` (cartão com ícone, número de alto destaque em fonte display, rótulo e badge descritiva/tendência).
- [x] **Step 3.2:** Criar `DistribuicaoNotasChart.tsx` (barras horizontais de 5 a 1 com largura percentual, quantidade e paleta oficial de notas).
- [x] **Step 3.3:** Criar `PesquisaDesempenhoGrid.tsx` (cards por pesquisa exibindo título, canal, badge de ativa/inativa, total de respostas, nota média em destaque e botão de atalho para `/pesquisas/[id]`).
- [x] **Step 3.4:** Criar `PanoramaUnidadesTable.tsx` (tabela de unidades para Admin/Ouvidoria com total de respostas, nota média, contagem de pendências e link).
- [x] **Step 3.5:** Criar `UltimasManifestacoesStream.tsx` (lista das últimas manifestações com protocolo mono, nota, status badge, data e link direto para `/manifestacoes/[id]`).
- [x] **Step 3.6:** Criar `DashboardSkeleton.tsx` com placeholders pulsantes para simular o layout real durante o carregamento inicial.
- [x] **Step 3.7:** Commitar os componentes do dashboard.
  - Commit: `feat(dashboard-ui): cria componentes modulares de KPIs, graficos, grid de pesquisas e tabelas`

---

### Task 4: Montagem da Página Principal do Dashboard (`/dashboard`) com RBAC

**Files:**
- Modify: `frontend/src/app/(sistema)/dashboard/page.tsx`

- [x] **Step 4.1:** Estruturar o estado da página (`indicadores`, `carregando`, `erro`, `unidades`, `unidadeFiltro`).
- [x] **Step 4.2:** Identificar o perfil do usuário via `useAuth()`:
  - Se `COORDENADOR_UNIDADE`: fixa a unidade no ID do usuário e renderiza aviso institucional ("Exibindo dados da unidade: [Nome]").
  - Se `ADMINISTRADOR` ou `OPERADOR_OUVIDORIA`: busca a lista de unidades ativas via `unidadeService.listar()` e exibe o seletor dropdown no cabeçalho ("Todas as Unidades" ou unidade específica).
- [x] **Step 4.3:** Integrar a chamada a `dashboardService.obterIndicadores(unidadeFiltro)` com recarregamento ao trocar o filtro.
- [x] **Step 4.4:** Renderizar o grid superior com os 4 KPIs principais (Nota Média Geral, Total de Avaliações, Pendências em Aberto, SLA Médio de Resposta).
- [x] **Step 4.5:** Renderizar a seção intermediária em grid bento de duas colunas: Distribuição de Notas (esquerda) e Desempenho Dividido por Pesquisa (direita).
- [x] **Step 4.6:** Renderizar condicionalmente o Panorama por Unidade (apenas para Admin/Ouvidoria quando visualizando "Todas as Unidades").
- [x] **Step 4.7:** Renderizar a seção inferior com o stream de Últimas Manifestações Recebidas.
- [x] **Step 4.8:** Incluir estado de carregamento (`DashboardSkeleton`) e estado de erro com botão de recarregar.
- [x] **Step 4.9:** Executar `npm run build --prefix frontend` para testar a compilação completa.
- [x] **Step 4.10:** Commitar a página do dashboard.
  - Commit: `feat(dashboard-page): integra painel gerencial completo com escopo de unidade e design system Cedro`

---

### Task 5: Validação Integrada e Homologação

**Files:**
- Test: Executar suíte completa de testes no back-end (`npm test --prefix backend`).
- Test: Executar build de produção do front-end (`npm run build --prefix frontend`).
- Verify: Testar os 3 perfis de usuário (`admin@cedro.com.br`, `ouvidoria@cedro.com.br`, `coord.sul@cedro.com.br`) garantindo que as regras de isolamento de unidade funcionam com perfeição.

- [x] **Step 5.1:** Rodar todos os testes de backend e front-end.
- [x] **Step 5.2:** Commitar qualquer ajuste fino final.
- [x] **Step 5.3:** Sincronizar com o repositório remoto `origin/prod`.
