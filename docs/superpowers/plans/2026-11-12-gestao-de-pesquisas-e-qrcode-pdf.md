# Gestão de Pesquisas e Exportação de QR Code em PDF - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o módulo completo de Gestão de Pesquisas de Satisfação (`/pesquisas` e `/pesquisas/[id]`), permitindo listagem, criação, edição, ativação/desativação (*Soft Delete*), visualização de indicadores de desempenho por pesquisa e exportação de display de balcão/totem em PDF com QR Code centralizado e identidade visual do Laboratório Cedro.

**Architecture:** A camada de domínio no Back-end Express orquestra casos de uso orientados a objetos (`ObterPesquisaPorIdUseCase`, `AtualizarPesquisaUseCase`, `CriarPesquisaUseCase`), expondo rotas REST autenticadas (`GET /api/pesquisas/:id`, `PATCH /api/pesquisas/:id`). No Front-end Next.js (App Router), o layout fluido consome os dados via `pesquisaService` e disponibiliza modais de cadastro/edição, painel analítico da pesquisa e um modal de impressão de display (`QrCodePdfModal`) estilizado com verde Cedro (`#075618`), texturas sutis e QR Code centralizado de alta resolução para impressão em A4 ou totem acrílico de balcão.

**Tech Stack:** TypeScript, Next.js 16 (App Router), Tailwind CSS v4, Node.js / Express, Supabase PostgreSQL, Vitest, Lucide React, `qrcode`.

**Spec:** `docs/01-arquitetura-e-papeis.md` (Seção 4: Tabela de Telas e Rotas), `docs/04-contrato-api-e-plano-qa.md` (Entregas 2, 3 e 4, Critério QA-10 de *Soft Delete*), e `design/Como foi a sua experiência.html`.

## Global Constraints

- **Design System Cedro:** Tipografia Lato 900 para títulos, `#075618` (verde institucional principal), `#02A562` (verde ação/sucesso), `#5E5E5E` para textos secundários, `#E3E3E3` para bordas, cantos arredondados (`rounded-xl` / `rounded-2xl`).
- **Segurança RBAC:** Criar e editar pesquisas (`POST` e `PATCH`) é restrito a `ADMINISTRADOR`. Visualizar (`GET`) é liberado para `ADMINISTRADOR` e `OPERADOR_OUVIDORIA`.
- **Soft Delete Imutável:** Desativação de pesquisas altera `ativa = false`, preservando integralmente todas as respostas, manifestações e histórico de auditoria associados.
- **Display de QR Code:** O display gerado deve conter o logotipo Cedro, nome da unidade vinculada (ou "Todas as Unidades"), título da pesquisa, texto de chamada para o paciente ("Aponte a câmera do celular para avaliar seu atendimento"), QR Code grande e centralizado, e link curto legível.

## Review Focus

1. **Tentativa de atualizar pesquisa inexistente:** Retornar `404 Not Found` amigável sem quebrar o servidor.
2. **Edição com título ou período vazios:** O domínio deve lançar `RegraNegocioError` informando obrigatoriedade dos campos.
3. **Alternância de status (Soft Delete) por operador não-administrador:** Middleware RBAC deve bloquear com `403 Forbidden`.
4. **Exportação de PDF / Impressão em telas pequenas:** O modal deve gerar pré-visualização responsiva na tela e usar `@media print` para formatar perfeitamente em página A4 vertical sem quebras de layout.
5. **Pesquisa sem respostas registradas:** A tela `/pesquisas/[id]` deve exibir estado vazio amigável nas métricas e lista de manifestações sem erros de divisão por zero na nota média.

---

### Task 1: Back-end - Casos de Uso `ObterPesquisaPorId` e `AtualizarPesquisa`, Testes Unitários e Rotas

**Files:**
- Modify: `backend/src/domain/entities/Pesquisa.ts`
- Create: `backend/src/application/use-cases/pesquisas/ObterPesquisaPorIdUseCase.ts`
- Create: `backend/src/application/use-cases/pesquisas/AtualizarPesquisaUseCase.ts`
- Create: `backend/tests/application/PesquisaGestaoUseCases.spec.ts`
- Modify: `backend/src/presentation/controllers/PesquisaController.ts`
- Modify: `backend/src/presentation/routes/pesquisa.routes.ts`
- Modify: `backend/src/presentation/app.ts`

**Interfaces:**
- Consumes: `IPesquisaRepository`, `IUnidadeRepository`, `IRespostaPesquisaRepository`, `IManifestacaoRepository`.
- Produces:
  - `ObterPesquisaPorIdUseCase.executar(id: string): Promise<PesquisaDetalhadaDTO>`
  - `AtualizarPesquisaUseCase.executar(id: string, input: AtualizarPesquisaInput): Promise<Pesquisa>`
  - Endpoints `GET /api/pesquisas/:id` e `PATCH /api/pesquisas/:id`

- [ ] **Step 1: Escrever teste unitário falho para os novos casos de uso em `backend/tests/application/PesquisaGestaoUseCases.spec.ts`**
  - Testar `ObterPesquisaPorIdUseCase`: retornar dados da pesquisa, nome da unidade, cálculo consolidado de respostas, nota média, % satisfeitos e distribuição 1-5.
  - Testar erro quando pesquisa não existir.
  - Testar `AtualizarPesquisaUseCase`: atualizar título, descrição, período, canal, unidade padrão e alternar `ativa` (*Soft Delete*).

- [ ] **Step 2: Executar teste e validar falha**
  - Run: `npm test --prefix backend PesquisaGestao`
  - Expected: FAIL ("ObterPesquisaPorIdUseCase not defined")

- [ ] **Step 3: Ajustar entidade `Pesquisa.ts` para permitir atualização segura de canal e unidade padrão**
  - Adicionar métodos ou expandir `atualizarDados` para manter encapsulamento sem quebrar compatibilidade.

- [ ] **Step 4: Implementar `ObterPesquisaPorIdUseCase.ts` e `AtualizarPesquisaUseCase.ts`**
  - Consultar repositórios, agregar respostas e manifestações daquela pesquisa, calcular métricas e retornar DTO completo.

- [ ] **Step 5: Adicionar métodos `obterPorId` e `atualizar` no `PesquisaController.ts` e registrar rotas em `pesquisa.routes.ts` e `app.ts`**

- [ ] **Step 6: Executar testes unitários do backend**
  - Run: `npm test --prefix backend`
  - Expected: Todos os testes passando (59+ tests).

- [ ] **Step 7: Commit**
  - `git commit -m "feat(backend): adiciona casos de uso e rotas para detalhe e atualizacao de pesquisa"`

---

### Task 2: Front-end - Tipagem e Métodos do `pesquisa.service.ts`

**Files:**
- Modify: `frontend/src/types/api.ts`
- Modify: `frontend/src/services/pesquisa.service.ts`

**Interfaces:**
- Produces:
  - `PesquisaDetalhadaDTO`: interface com métricas de satisfação, distribuição e manifestações recentes.
  - `pesquisaService.obterPorId(id: string): Promise<PesquisaDetalhadaDTO>`
  - `pesquisaService.atualizar(id: string, dados: AtualizarPesquisaDTO): Promise<PesquisaDTO>`
  - `pesquisaService.alternarStatus(id: string, ativa: boolean): Promise<PesquisaDTO>`

- [ ] **Step 1: Adicionar interfaces de detalhe e atualização em `frontend/src/types/api.ts`**
- [ ] **Step 2: Adicionar métodos `obterPorId`, `atualizar` e `alternarStatus` em `frontend/src/services/pesquisa.service.ts`**
- [ ] **Step 3: Validar TypeScript**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS com 0 erros.
- [ ] **Step 4: Commit**
  - `git commit -m "feat(frontend): amplia pesquisa.service com obterPorId e atualizar"`

---

### Task 3: Front-end - Componente de Display e Exportação PDF com QR Code (`QrCodePdfModal.tsx`)

**Files:**
- Create: `frontend/src/components/pesquisas/QrCodePdfModal.tsx`
- Modify: `frontend/src/app/globals.css` (regras específicas de `@media print`)

**Interfaces:**
- Produces:
  - `<QrCodePdfModal isOpen={boolean} onClose={() => void} pesquisa={PesquisaDTO} nomeUnidade={string} />`

- [ ] **Step 1: Implementar `QrCodePdfModal.tsx`**
  - Gerar QR Code via `qrcode` em elemento `<canvas>` ou SVG de alta resolução.
  - Layout do display de balcão / totem com:
    - Faixa institucional Cedro verde escuro `#075618` com logo SVG
    - Badge refinada da Unidade
    - Título da Pesquisa em Lato 900
    - Instrução amigável: "Sua opinião é muito importante para nós. Aponte a câmera do seu celular para avaliar o seu atendimento."
    - QR Code grande no centro com moldura branca elegante
    - Link direto em texto monoespaçado legível
    - Rodapé: "Laboratório Cedro · Tradição e Excelência em Saúde"
  - Botão "Imprimir Display / Salvar em PDF" chamando `window.print()` estilizado
  - Botão "Baixar Imagem QR Code" exportando PNG em alta resolução
- [ ] **Step 2: Configurar estilos de `@media print` em `globals.css`**
  - Garantir que a impressão imprima exclusivamente a folha do display com fundo branco e contraste nítido, ocultando a sidebar, cabeçalhos do navegador e botões da aplicação.
- [ ] **Step 3: Testar build e TypeScript**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS.
- [ ] **Step 4: Commit**
  - `git commit -m "feat(frontend): cria modal de display de balcao e exportacao pdf com qr code"`

---

### Task 4: Front-end - Modais de Criação e Edição de Pesquisa (`CriarPesquisaModal.tsx` e `EditarPesquisaModal.tsx`)

**Files:**
- Create: `frontend/src/components/pesquisas/CriarPesquisaModal.tsx`
- Create: `frontend/src/components/pesquisas/EditarPesquisaModal.tsx`

**Interfaces:**
- Produces:
  - `<CriarPesquisaModal isOpen={boolean} onClose={() => void} onSucesso={(pesquisa) => void} unidades={UnidadeDTO[]} />`
  - `<EditarPesquisaModal isOpen={boolean} onClose={() => void} onSucesso={(pesquisa) => void} pesquisa={PesquisaDTO} unidades={UnidadeDTO[]} />`

- [ ] **Step 1: Implementar `CriarPesquisaModal.tsx`**
  - Campos: Título (obrigatório), Descrição, Período (ex: "Novembro/2026"), Canal (`QR_CODE`, `LINK_EXTERNO`, `TOTEM`), Unidade Padrão (select com unidades ativas ou "Todas as Unidades").
  - Validações em tempo real e tratamento de erros amigável.
- [ ] **Step 2: Implementar `EditarPesquisaModal.tsx`**
  - Mesmos campos pré-preenchidos, com botão para salvar alterações.
- [ ] **Step 3: Testar tipagem com `tsc`**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS.
- [ ] **Step 4: Commit**
  - `git commit -m "feat(frontend): adiciona modais de criacao e edicao de pesquisas"`

---

### Task 5: Front-end - Tela de Listagem e Gestão de Pesquisas (`/pesquisas`)

**Files:**
- Modify: `frontend/src/app/(sistema)/pesquisas/page.tsx`
- Create: `frontend/src/components/pesquisas/PesquisasGrid.tsx`
- Create: `frontend/src/components/pesquisas/PesquisaCard.tsx`
- Create: `frontend/src/components/pesquisas/PesquisasSkeleton.tsx`

**Interfaces:**
- Consumes: `pesquisaService.listar()`, `unidadeService.listar()`, `QrCodePdfModal`, `CriarPesquisaModal`.
- Produces: Página `/pesquisas` funcional.

- [ ] **Step 1: Criar componentes visuais `PesquisaCard.tsx` e `PesquisasGrid.tsx`**
  - Card limpo com: Título, Unidade vinculada, badge de Canal, badge de Status (Ativa / Inativa), Período e data de criação.
  - Ações rápidas no card: `Ver Indicadores`, `Exportar QR Code / PDF`, `Editar` e alternador rápido de status (*Ativar / Inativar*).
- [ ] **Step 2: Implementar página `frontend/src/app/(sistema)/pesquisas/page.tsx`**
  - Filtro por busca de texto (título, descrição, unidade)
  - Filtro por status (Todas, Ativas, Inativas)
  - Botão de destaque `+ Nova Pesquisa` (visível para Admin)
  - Contadores no topo e estado vazio informativo quando nenhuma pesquisa for encontrada.
- [ ] **Step 3: Testar tipagem com `tsc`**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS.
- [ ] **Step 4: Commit**
  - `git commit -m "feat(frontend): implementa tela de listagem e gestao de pesquisas"`

---

### Task 6: Front-end - Tela de Detalhes e Indicadores da Pesquisa (`/pesquisas/[id]`)

**Files:**
- Create: `frontend/src/app/(sistema)/pesquisas/[id]/page.tsx`
- Create: `frontend/src/components/pesquisas/PesquisaDetalheSkeleton.tsx`

**Interfaces:**
- Consumes: `pesquisaService.obterPorId(id)`, `QrCodePdfModal`, `EditarPesquisaModal`.
- Produces: Página `/pesquisas/[id]` funcional.

- [ ] **Step 1: Implementar `PesquisaDetalheSkeleton.tsx`**
- [ ] **Step 2: Implementar página `frontend/src/app/(sistema)/pesquisas/[id]/page.tsx`**
  - Botão de retorno `← Voltar para Pesquisas`.
  - Cabeçalho com Título da Pesquisa, Unidade vinculada, Canal e status (*Ativa* / *Inativa*).
  - Barra de ações: `Exportar Display PDF / QR Code`, `Editar Pesquisa`, `Desativar / Ativar`.
  - Grid de 4 KPIs da Pesquisa:
    - Respostas coletadas
    - Nota média
    - % de Satisfação (notas 4 e 5)
    - Total de Manifestações geradas
  - Gráfico Bento da Distribuição de Notas (1 a 5) com barras de progresso e percentuais.
  - Tabela das manifestações mais recentes originadas dessa pesquisa com links para `[id]`.
- [ ] **Step 3: Testar tipagem e compilação do Next.js**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS.
- [ ] **Step 4: Commit**
  - `git commit -m "feat(frontend): implementa pagina de detalhe e indicadores da pesquisa"`

---

### Task 7: Verificação Integrada e Homologação Final

**Files:**
- All created and modified files.

- [ ] **Step 1: Rodar suíte completa de testes unitários do backend**
  - Run: `npm test --prefix backend`
  - Expected: 100% dos testes passando.
- [ ] **Step 2: Rodar build de produção do frontend Next.js**
  - Run: `npm run build --prefix frontend`
  - Expected: Build com zero erros e rotas estáticas/dinâmicas geradas (`/pesquisas`, `/pesquisas/[id]`).
- [ ] **Step 3: Push para o branch `prod`**
  - Run: `git push origin prod`
- [ ] **Step 4: Apresentar demonstração e tabela de entrega para o usuário**
