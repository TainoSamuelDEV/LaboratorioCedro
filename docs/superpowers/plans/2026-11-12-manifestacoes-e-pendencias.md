# Módulo de Manifestações, Pendências e Tratativa — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o fluxo operacional completo de Ouvidoria: listagem filtrada de Manifestações (`/manifestacoes`), painel de SLA de Pendências (`/pendencias`) e tela individual de Detalhes e Tratativa (`/manifestacoes/[id]`), seguindo a Clean Architecture no back-end e a estética editorial limpa do modelo de referência `design/Painel _ Experiência do Cliente (2).html`.

**Architecture:** 
- Back-end Express: Enriquecimento de `ListarManifestacoesUseCase` para preenchimento de `unidadeNome`, `nota`, `comentarioCliente` e `clienteAtendimento` nas listagens, reutilizando as regras de negócio de `TratarManifestacaoUseCase` e as rotas seguras de RBAC.
- Front-end Next.js App Router: Componente compartilhado `ManifestacoesTable.tsx`, páginas `/manifestacoes/page.tsx`, `/pendencias/page.tsx` e `/manifestacoes/[id]/page.tsx`, consumindo `manifestacaoService` com tipagem estrita, timeline imutável e formulários de tratativa por perfil.

**Spec:** [`docs/01-arquitetura-e-papeis.md`](file:///C:/Users/Taino/Desktop/poo-taino-gabriel/docs/01-arquitetura-e-papeis.md), [`docs/04-contrato-api-e-plano-qa.md`](file:///C:/Users/Taino/Desktop/poo-taino-gabriel/docs/04-contrato-api-e-plano-qa.md) (Entregas 3, 4, 6 e 7), [`docs/05-diagramas-uml-casos-de-uso.md`](file:///C:/Users/Taino/Desktop/poo-taino-gabriel/docs/05-diagramas-uml-casos-de-uso.md) (UC03 a UC08) e protótipo [`design/Painel _ Experiência do Cliente (2).html`](file:///C:/Users/Taino/Desktop/poo-taino-gabriel/design/Painel%20_%20Experi%C3%AAncia%20do%20Cliente%20(2).html).

---

## Global Constraints

- **Segregação por Perfil (RBAC):** Coordenador de Unidade (`COORDENADOR_UNIDADE`) visualiza apenas manifestações da sua própria unidade (`usuario.unidadeId`). Administrador e Ouvidoria visualizam de todas as unidades com filtro opcional.
- **Tipografia & Design System:** Títulos em Lato 900 `#075618`, textos em `#5E5E5E` / `#323232`, cards com borda `#E3E3E3` e sombra suave, badges semânticas oficiais (`.bd`), círculos de notas 1 a 5 (`.nt`) e botões com `min-height: 48px` / `rounded-[10px]`.
- **Imutabilidade do Histórico:** A linha do tempo de tratativas (`timeline`) é estritamente aditiva e imutável. Manifestações no status `CONCLUIDA` bloqueiam novos registros de tratativa.
- **Proteção contra Rotas Inexistentes / Vazamento:** Coordenador não tem acesso à gestão de questionários nem a manifestações de outros polos.

---

### Task 1: Enriquecimento do Back-end em `ListarManifestacoesUseCase`

**Files:**
- Modify: `backend/src/application/use-cases/manifestacoes/ListarManifestacoesUseCase.ts`
- Modify: `backend/src/presentation/app.ts`
- Test: `backend/tests/application/TratarManifestacaoUseCases.spec.ts`

- [x] **Step 1.1:** Injetar `IUnidadeRepository` e `IRespostaPesquisaRepository` no construtor de `ListarManifestacoesUseCase`.
- [x] **Step 1.2:** Mapear em lote os nomes das unidades e os dados da resposta de origem (`nota`, `comentarioCliente`, `clienteAtendimento`).
- [x] **Step 1.3:** Atualizar `backend/src/presentation/app.ts` passando `deps.unidadeRepo` e `deps.respostaRepo` na instanciação do caso de uso.
- [x] **Step 1.4:** Executar os testes unitários (`npm test --prefix backend`) e garantir 100% de aprovação.
- [x] **Step 1.5:** Commitar as alterações.
  - Commit: `feat(manifestacoes-api): enriquece listagem de manifestacoes com dados de nota, comentario e unidade`

---

### Task 2: Componente Reutilizável de Tabela de Manifestações

**Files:**
- Create: `frontend/src/components/manifestacoes/ManifestacoesTable.tsx`
- Create: `frontend/src/components/manifestacoes/ManifestacoesTableSkeleton.tsx`

- [x] **Step 2.1:** Implementar `ManifestacoesTable.tsx` com as colunas oficiais: `Protocolo`, `Unidade`, `Nota` (círculo `.nt`), `Comentário` (`.tx` com tooltip), `Senha`, `Status` (badge `.bd`) e `Há` (tempo relativo).
- [x] **Step 2.2:** Adicionar estados de hover (`hover:bg-[#FAFAFA]`), link para `/manifestacoes/[id]` e mensagem vazia graciosa.
- [x] **Step 2.3:** Criar skeleton pulsante para carregamento suave da tabela.
- [x] **Step 2.4:** Validar com `npx tsc --noEmit` no frontend.
- [x] **Step 2.5:** Commitar o componente.
  - Commit: `feat(manifestacoes-ui): cria componente de tabela de manifestacoes fiel ao design system limpo`

---

### Task 3: Página de Manifestações (`/manifestacoes`) com Filtros Dinâmicos

**Files:**
- Modify: `frontend/src/app/(sistema)/manifestacoes/page.tsx`

- [x] **Step 3.1:** Implementar a barra de filtros (`.fl`):
  - Campo de busca por texto (protocolo, senha de atendimento ou comentário do cliente).
  - Seletor de Status (Todos os status, Nova, Não respondida, Em tratamento, Escalonada, Respondida, Concluída).
  - Seletor de Unidade (disponível para Admin/Ouvidoria; bloqueado para Coordenador).
  - Seletor de Nota (Todas as notas, Nota 5 a Nota 1).
- [x] **Step 3.2:** Integrar com `manifestacaoService.listar(...)` e manter filtragem instantânea em memória para busca rápida.
- [x] **Step 3.3:** Renderizar o contador de resultados no rodapé (`X de Y manifestações`).
- [x] **Step 3.4:** Validar o build de produção (`npm run build --prefix frontend`).
- [x] **Step 3.5:** Commitar a página.
  - Commit: `feat(manifestacoes-page): implementa listagem com busca e filtros avancados por status, unidade e nota`

---

### Task 4: Página de Pendências (`/pendencias`) com Foco em SLA

**Files:**
- Modify: `frontend/src/app/(sistema)/pendencias/page.tsx`

- [x] **Step 4.1:** Estruturar as 3 abas operacionais do modelo:
  - `Não respondidas` (`status === 'NAO_RESPONDIDA'`)
  - `Atrasadas` (abertas com mais de 48h ou prioridade alta/crítica)
  - `Escalonadas` (`status === 'ESCALONADA'`)
- [x] **Step 4.2:** Exibir a contagem em cada aba (ex: `Atrasadas (3)`).
- [x] **Step 4.3:** Conectar com `manifestacaoService.listarPendencias()` respeitando a unidade do usuário.
- [x] **Step 4.4:** Reutilizar `ManifestacoesTable.tsx` para exibição direta das pendências.
- [x] **Step 4.5:** Validar build e tipos.
- [x] **Step 4.6:** Commitar a página de pendências.
  - Commit: `feat(pendencias-page): implementa painel operacional com abas de SLA, atrasadas e escalonadas`

---

### Task 5: Página de Detalhe e Tratativa (`/manifestacoes/[id]`)

**Files:**
- Create: `frontend/src/app/(sistema)/manifestacoes/[id]/page.tsx`

- [x] **Step 5.1:** Criar a rota dinâmica `(sistema)/manifestacoes/[id]/page.tsx` com carregamento via `manifestacaoService.obterPorId(id)`.
- [x] **Step 5.2:** Renderizar o cabeçalho: botão `← Voltar para a lista`, título `Manifestação #CED-...`, unidade, tempo decorrido e badge de status.
- [x] **Step 5.3:** Montar o grid bento de 2 colunas (`.g3`):
  - Coluna 1:
    - Card da Avaliação: nota grande `.nt big`, rótulo da nota, senha de atendimento e comentário na íntegra.
    - Card de Tratativa:
      - Para Coordenador: botões "Iniciar Tratamento" e formulário para "Registrar Resposta da Unidade".
      - Para Ouvidoria/Admin: opções de "Solicitar Complemento", "Escalonar para Gerência" e "Concluir Manifestação".
      - Para Manifestação Concluída: aviso institucional de conclusão e bloqueio de novas edições.
  - Coluna 2:
    - Card de Histórico (`.tl`): linha do tempo vertical imutável com todos os eventos ordenados (criação, respostas, escalonamentos e pareceres).
- [x] **Step 5.4:** Implementar chamadas aos métodos de tratativa no `manifestacaoService` com feedback visual imediato e recarregamento dos dados.
- [x] **Step 5.5:** Validar build do frontend (`npm run build --prefix frontend`).
- [x] **Step 5.6:** Commitar a tela de detalhes.
  - Commit: `feat(manifestacoes-detalhe): implementa tela de tratamento, historico imutavel e acoes de ouvidoria`

---

### Task 6: Validação Integrada e Sincronização

**Files:**
- Test: Suíte completa do back-end (`npm test --prefix backend`).
- Test: Build de produção do front-end (`npm run build --prefix frontend`).
- Verify: Teste cruzado de Coordenador (`coord.sul@cedro.com.br`) e Ouvidoria (`ouvidoria@cedro.com.br`).

- [x] **Step 6.1:** Rodar testes e build integrados.
- [x] **Step 6.2:** Sincronizar com o repositório remoto `origin/prod`.
