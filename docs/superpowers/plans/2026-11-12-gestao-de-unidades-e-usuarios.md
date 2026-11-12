# Gestão de Unidades e Usuários - Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o módulo completo de Gestão de Unidades (`/unidades` e `/unidades/[id]`) e Gestão de Usuários (`/usuarios` e `/usuarios/[id]`), permitindo cadastro, edição, consulta analítica de desempenho por unidade, histórico de auditoria por usuário e alternância de status ativo/inativo (*Soft Delete*).

**Architecture:** A camada de domínio no Back-end Express orquestra casos de uso orientados a objetos (`ObterUnidadePorIdUseCase`, `ObterUsuarioPorIdUseCase`, `AtualizarUsuarioUseCase`), expondo rotas REST autenticadas (`GET /api/unidades/:id`, `GET /api/usuarios/:id`, `PATCH /api/usuarios/:id`). No Front-end Next.js (App Router), interfaces fluidas e modais dedicados permitem aos administradores gerenciar equipes, unidades físicas, prazos de SLA e visualizar o impacto operacional de cada membro da ouvidoria e coordenação.

**Tech Stack:** TypeScript, Next.js 16 (App Router), Tailwind CSS v4, Node.js / Express, Supabase PostgreSQL, Bcrypt, Vitest, Lucide React.

**Spec:** `docs/01-arquitetura-e-papeis.md` (Seção 4: Tabela de Telas e Rotas), `docs/04-contrato-api-e-plano-qa.md` (Entregas 1, 2, 7 e Critério QA-10 de *Soft Delete*), e regras RBAC institucionais.

## Global Constraints

- **Design System Cedro:** Tipografia Lato 900 para títulos, `#075618` (verde institucional principal), `#02A562` (verde ação/sucesso), `#5E5E5E` para textos secundários, `#E3E3E3` para bordas, cantos arredondados (`rounded-xl` / `rounded-2xl`).
- **Segurança RBAC:** Criar e alterar usuários ou unidades (`POST` e `PATCH`) é exclusivo para `ADMINISTRADOR`. Visualizar listagens e detalhes (`GET`) é liberado para `ADMINISTRADOR` e `OPERADOR_OUVIDORIA`.
- **Validação de Vínculo de Coordenador:** Todo usuário com perfil `COORDENADOR_UNIDADE` deve ter obrigatoriamente um `unidadeId` válido atribuído.
- **Soft Delete Imutável:** Desativação de unidades ou usuários altera `ativa/ativo = false`, preservando integralmente todas as manifestações, interações, respostas e registros de auditoria.

## Review Focus

1. **Tentativa de cadastrar/atualizar Coordenador sem Unidade:** Bloquear com `RegraNegocioError: Coordenador de Unidade deve estar obrigatoriamente vinculado a uma unidade.`
2. **Atualização de e-mail duplicado de usuário:** Validar unicidade no banco e retornar erro claro amigável.
3. **Consulta de Unidade ou Usuário inexistente:** Retornar `404 Not Found` sem quebrar o servidor.
4. **Desativação de Unidade com Coordenadores vinculados:** Preservar o vínculo dos usuários mantendo o histórico intacto.
5. **Redefinição de senha de usuário:** Hashear senha via `BcryptPasswordHasher` antes de persistir no banco.

---

### Task 1: Back-end Unidades - Caso de Uso `ObterUnidadePorIdUseCase`, Testes Unitários e Rota `GET /api/unidades/:id`

**Files:**
- Create: `backend/src/application/use-cases/unidades/ObterUnidadePorIdUseCase.ts`
- Create: `backend/tests/application/UnidadeGestaoUseCases.spec.ts`
- Modify: `backend/src/presentation/controllers/UnidadeController.ts`
- Modify: `backend/src/presentation/routes/unidade.routes.ts`
- Modify: `backend/src/presentation/app.ts`

**Interfaces:**
- Consumes: `IUnidadeRepository`, `IManifestacaoRepository`, `IRespostaPesquisaRepository`, `IPesquisaRepository`, `IUsuarioRepository`.
- Produces:
  - `ObterUnidadePorIdUseCase.executar(id: string): Promise<UnidadeDetalhadaDTO>`
  - Endpoint `GET /api/unidades/:id`

- [ ] **Step 1: Escrever teste unitário falho em `backend/tests/application/UnidadeGestaoUseCases.spec.ts`**
  - Testar retorno dos dados da unidade, lista de coordenadores alocados, total de manifestações, pendências abertas, atrasadas, nota média geral e desempenho por pesquisa.
  - Testar erro `RecursoNaoEncontradoError` para ID inexistente.
- [ ] **Step 2: Executar teste e validar falha**
  - Run: `npm test --prefix backend UnidadeGestao`
  - Expected: FAIL ("ObterUnidadePorIdUseCase not defined")
- [ ] **Step 3: Implementar `ObterUnidadePorIdUseCase.ts`**
  - Buscar unidade, consultar manifestações e respostas daquela unidade, calcular KPIs e filtrar coordenadores via `usuarioRepo.listarPorUnidade(id)`.
- [ ] **Step 4: Adicionar método `obterPorId` em `UnidadeController.ts` e registrar rota em `unidade.routes.ts` e `app.ts`**
- [ ] **Step 5: Executar testes unitários**
  - Run: `npm test --prefix backend UnidadeGestao`
  - Expected: PASS.
- [ ] **Step 6: Commit**
  - `git commit -m "feat(backend): adiciona caso de uso e rota GET para detalhe analitico da unidade"`

---

### Task 2: Back-end Usuários - Casos de Uso `ObterUsuarioPorIdUseCase`, `AtualizarUsuarioUseCase`, Testes e Rotas

**Files:**
- Modify: `backend/src/domain/entities/Usuario.ts`
- Create: `backend/src/application/use-cases/usuarios/ObterUsuarioPorIdUseCase.ts`
- Create: `backend/src/application/use-cases/usuarios/AtualizarUsuarioUseCase.ts`
- Create: `backend/tests/application/UsuarioGestaoUseCases.spec.ts`
- Modify: `backend/src/presentation/controllers/UsuarioController.ts`
- Modify: `backend/src/presentation/routes/usuario.routes.ts`
- Modify: `backend/src/presentation/app.ts`

**Interfaces:**
- Consumes: `IUsuarioRepository`, `IUnidadeRepository`, `IManifestacaoRepository`, `IPasswordHasher`.
- Produces:
  - `ObterUsuarioPorIdUseCase.executar(id: string): Promise<UsuarioDetalhadoDTO>`
  - `AtualizarUsuarioUseCase.executar(input: AtualizarUsuarioInput): Promise<Usuario>`
  - Endpoints `GET /api/usuarios/:id` e `PATCH /api/usuarios/:id`

- [ ] **Step 1: Escrever testes unitários em `backend/tests/application/UsuarioGestaoUseCases.spec.ts`**
  - Testar `ObterUsuarioPorIdUseCase`: ficha do usuário, nome da unidade vinculada e resumo de interações/respostas registradas.
  - Testar `AtualizarUsuarioUseCase`: atualização de nome, e-mail, perfil, unidade e senha hasheada.
  - Testar validação que impede `COORDENADOR_UNIDADE` sem `unidadeId`.
  - Testar *Soft Delete* (`ativo: false`) e reativação (`ativo: true`).
- [ ] **Step 2: Executar teste e validar falha**
  - Run: `npm test --prefix backend UsuarioGestao`
  - Expected: FAIL.
- [ ] **Step 3: Adicionar método `atualizarDados` em `Usuario.ts`**
- [ ] **Step 4: Implementar `ObterUsuarioPorIdUseCase.ts` e `AtualizarUsuarioUseCase.ts`**
- [ ] **Step 5: Adicionar métodos `obterPorId` e `atualizar` em `UsuarioController.ts` e registrar rotas em `usuario.routes.ts` e `app.ts`**
- [ ] **Step 6: Executar todos os testes do backend**
  - Run: `npm test --prefix backend`
  - Expected: 100% PASS (65+ tests).
- [ ] **Step 7: Commit**
  - `git commit -m "feat(backend): adiciona detalhe, atualizacao e soft delete de usuarios"`

---

### Task 3: Front-end - Serviços e Tipos de Unidades e Usuários

**Files:**
- Modify: `frontend/src/types/api.ts`
- Modify: `frontend/src/services/unidade.service.ts`
- Create: `frontend/src/services/usuario.service.ts`

**Interfaces:**
- Produces:
  - `UnidadeDetalhadaDTO`, `UsuarioDTO`, `UsuarioDetalhadoDTO`
  - `unidadeService.obterPorId(id: string)`
  - `usuarioService.listar()`, `usuarioService.obterPorId(id)`, `usuarioService.criar(data)`, `usuarioService.atualizar(id, data)`, `usuarioService.alternarStatus(id, ativo)`

- [ ] **Step 1: Ampliar `frontend/src/types/api.ts` com tipos de unidades e usuários**
- [ ] **Step 2: Atualizar `frontend/src/services/unidade.service.ts` com método `obterPorId`**
- [ ] **Step 3: Criar `frontend/src/services/usuario.service.ts` com métodos completos**
- [ ] **Step 4: Validar TypeScript**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS.
- [ ] **Step 5: Commit**
  - `git commit -m "feat(frontend): cria usuario.service e amplia tipos de unidades e usuarios"`

---

### Task 4: Front-end - Gestão de Unidades (`/unidades` e `/unidades/[id]`)

**Files:**
- Create: `frontend/src/components/unidades/CriarUnidadeModal.tsx`
- Create: `frontend/src/components/unidades/EditarUnidadeModal.tsx`
- Create: `frontend/src/components/unidades/UnidadesSkeleton.tsx`
- Create: `frontend/src/components/unidades/UnidadeDetalheSkeleton.tsx`
- Modify: `frontend/src/app/(sistema)/unidades/page.tsx`
- Create: `frontend/src/app/(sistema)/unidades/[id]/page.tsx`

**Interfaces:**
- Consumes: `unidadeService`, `useAuth`.
- Produces: Telas de listagem e detalhe analítico de unidades.

- [ ] **Step 1: Criar modais de cadastro e edição de unidade (`CriarUnidadeModal.tsx`, `EditarUnidadeModal.tsx`)**
  - Campos: Nome da Unidade, Responsável Técnico/Médico, Prazo SLA Padrão (em horas).
- [ ] **Step 2: Criar esqueletos de carregamento (`UnidadesSkeleton.tsx`, `UnidadeDetalheSkeleton.tsx`)**
- [ ] **Step 3: Implementar página de listagem `frontend/src/app/(sistema)/unidades/page.tsx`**
  - Busca por nome/responsável, abas Ativas/Inativas, cards de unidades com prazo SLA, status, botões de ação (Ver Indicadores, Editar, Desativar/Ativar) e botão `+ Nova Unidade` para Administrador.
- [ ] **Step 4: Implementar página de detalhe `frontend/src/app/(sistema)/unidades/[id]/page.tsx`**
  - Cabeçalho da Unidade com responsável e SLA padrão.
  - 4 KPIs: Total de Manifestações, Pendências Abertas, Pendências Atrasadas, Nota Média da Unidade.
  - Grid Bento: Desempenho por Pesquisa respondida nessa unidade + Equipe de Coordenadores Alocados.
- [ ] **Step 5: Validar TypeScript**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS.
- [ ] **Step 6: Commit**
  - `git commit -m "feat(frontend): implementa listagem, cadastro e detalhe analitico de unidades"`

---

### Task 5: Front-end - Gestão de Usuários (`/usuarios` e `/usuarios/[id]`)

**Files:**
- Create: `frontend/src/components/usuarios/CriarUsuarioModal.tsx`
- Create: `frontend/src/components/usuarios/EditarUsuarioModal.tsx`
- Create: `frontend/src/components/usuarios/UsuariosSkeleton.tsx`
- Create: `frontend/src/components/usuarios/UsuarioDetalheSkeleton.tsx`
- Modify: `frontend/src/app/(sistema)/usuarios/page.tsx`
- Create: `frontend/src/app/(sistema)/usuarios/[id]/page.tsx`

**Interfaces:**
- Consumes: `usuarioService`, `unidadeService`, `useAuth`.
- Produces: Telas de listagem e ficha de usuário com auditoria.

- [ ] **Step 1: Criar modais de usuário (`CriarUsuarioModal.tsx`, `EditarUsuarioModal.tsx`)**
  - Campos: Nome, E-mail, Perfil (`Administrador`, `Operador de Ouvidoria`, `Coordenador de Unidade`), Unidade vinculada (condicionalmente obrigatória quando Coordenador), Senha (com opção de manter a atual na edição).
- [ ] **Step 2: Criar esqueletos de carregamento (`UsuariosSkeleton.tsx`, `UsuarioDetalheSkeleton.tsx`)**
- [ ] **Step 3: Implementar página de listagem `frontend/src/app/(sistema)/usuarios/page.tsx`**
  - Filtros por perfil, status (Ativos/Inativos) e busca por nome/email.
  - Tabela corporativa com avatar, perfil estilizado, unidade vinculada, status e ações (Ver Ficha, Editar, Ativar/Desativar).
  - Botão `+ Novo Usuário` para Administrador.
- [ ] **Step 4: Implementar página de detalhe `frontend/src/app/(sistema)/usuarios/[id]/page.tsx`**
  - Ficha cadastral do usuário: avatar, perfil, e-mail, unidade vinculada, data de cadastro.
  - Painel de Auditoria & Atuação: resumo com total de interações registradas, respostas de unidade e escalonamentos realizados.
  - Ações de gestão: Editar dados, Redefinir senha e Ativar/Desativar (*Soft Delete*).
- [ ] **Step 5: Validar TypeScript**
  - Run: `powershell -Command "cd frontend; npx tsc --noEmit"`
  - Expected: PASS.
- [ ] **Step 6: Commit**
  - `git commit -m "feat(frontend): implementa gestao, cadastro e ficha de usuarios com auditoria"`

---

### Task 6: Verificação Integrada e Homologação Final

**Files:**
- All created and modified files.

- [ ] **Step 1: Executar todos os testes do backend**
  - Run: `npm test --prefix backend`
  - Expected: 100% dos testes passando.
- [ ] **Step 2: Executar build de produção do Next.js**
  - Run: `npm run build --prefix frontend`
  - Expected: Build com zero erros e todas as rotas estáticas e dinâmicas geradas.
- [ ] **Step 3: Enviar alterações para `origin/prod`**
  - Run: `git push origin prod`
- [ ] **Step 4: Apresentar relatório final de entrega ao usuário**
