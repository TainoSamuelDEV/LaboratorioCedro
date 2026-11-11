# Solicitação de Alteração Arquitetural: Páginas por ID (`/[id]`), CRUD Completo e Soft Delete

Este documento explica de forma direta **o que estava faltando na documentação original**, **o que será alterado** na arquitetura (Documentação, Back-end e Front-end) e **o motivo de cada mudança**.

---

## 1. Qual era o problema na versão anterior?

Na documentação inicial (`01` a `05`), apenas **Manifestações** possuía uma página própria de detalhes (`/manifestacoes/[id]`).  
As demais entidades (**Pesquisas**, **Unidades** e **Usuários**) tinham apenas telas de listagem simples, sem:
1. **Página individual por ID (`/[id]`)** para enxergar os indicadores, métricas e histórico daquele item específico.
2. **Operações completas de edição (`PATCH /:id`) e busca individual (`GET /:id`)** no contrato da API para Pesquisas e Usuários.

Isso limitava a gestão do **Administrador** e da **Ouvidoria**, que conseguiam cadastrar uma Pesquisa ou um Usuário, mas não conseguiam abrir a página daquela Pesquisa/Unidade/Usuário para analisar seus números, editar informações ou desativar o registro.

---

## 2. O que vai mudar nas Rotas do Front-end (`(sistema)`)?

Agora, todos os 4 artefatos principais do sistema terão **Listagem + Página Dedicada por `[id]`**:

| Módulo | Rota de Listagem | Nova Rota por ID (`/[id]`) | O que a Página por ID (`/[id]`) vai mostrar e permitir fazer? |
| :--- | :--- | :--- | :--- |
| **Manifestações** | `/manifestacoes` | `/manifestacoes/[id]` *(já prevista)* | Dados do atendimento, nota, comentário, prazo SLA, linha do tempo imutável e botões de ação (iniciar tratativa, responder pela unidade, solicitar complemento, escalonar, redirecionar unidade e concluir). |
| **Pesquisas** | `/pesquisas` | **`/pesquisas/[id]`** *(nova)* | • **Indicadores da pesquisa:** total de respostas, nota média, % de satisfação e distribuição de notas (1 a 5).<br>• **Divulgação:** link público completo (`/pesquisa/:id`) e botão para copiar/gerar QR Code.<br>• **Listagem:** últimas manifestações geradas por esta pesquisa.<br>• **Gestão (Admin):** editar título, descrição, período, canal e ativar/desativar (*Soft Delete*). |
| **Unidades** | `/unidades` | **`/unidades/[id]`** *(nova)* | • **Indicadores da unidade:** quantidade de manifestações da unidade, pendências abertas/atrasadas e nota média geral.<br>• **Desempenho por pesquisa:** lista das pesquisas respondidas nesta unidade com o número de respostas e a nota média de cada pesquisa.<br>• **Equipe vinculada:** coordenadores alocados na unidade.<br>• **Gestão (Admin):** editar nome, responsável, prazo SLA padrão (em horas) e ativar/desativar (*Soft Delete*). |
| **Usuários** | `/usuarios` | **`/usuarios/[id]`** *(nova)* | • **Ficha do usuário:** nome, e-mail, perfil (`Administrador`, `Ouvidoria` ou `Coordenador`), unidade vinculada e status.<br>• **Atividade e auditoria:** resumo das interações, respostas de unidade ou escalonamentos registrados por este usuário.<br>• **Gestão (Admin):** editar nome, e-mail, alterar perfil/unidade vinculada, redefinir senha e ativar/desativar (*Soft Delete*). |

---

## 3. Como funcionará o CRUD e por que usamos *Soft Delete* (Desativação Lógica)?

Em um sistema de Ouvidoria e Auditoria (Seções 6 e 13 da documentação funcional), **nenhum registro que possui histórico vinculado pode ser apagado fisicamente (`DELETE` no banco)**:
* Se apagássemos uma **Unidade**, perderíamos a referência de onde ocorreram os atendimentos passados.
* Se apagássemos um **Usuário**, a trilha de auditoria (`interacoes`, `respostas_unidade`, `escalonamentos`) ficaria sem saber quem respondeu ou concluiu cada caso.
* Se apagássemos uma **Pesquisa**, todas as notas e manifestações geradas por ela perderiam a pesquisa de origem.

Por isso, o **D** do CRUD é implementado como **Soft Delete (Inativação Lógica: `ativa = false` / `ativo = false`)**:
* **Unidade inativada:** para de aparecer para novos atendimentos, mas preserva todo o histórico no Dashboard e nos Relatórios.
* **Pesquisa inativada:** bloqueia novas respostas no link público/QR Code, mas mantém todas as respostas antigas salvas.
* **Usuário inativado:** bloqueia imediatamente o login e novas ações na API (`UC05`), mas mantém o nome do usuário registrado em todas as tratativas que ele já realizou no passado.

---

## 4. Resumo do que deve ser alterado em cada parte do projeto

### A. Na Documentação (`docs/`)
1. **`docs/01-arquitetura-e-papeis.md`**: Adicionar as sub-rotas `/pesquisas/[id]`, `/unidades/[id]` e `/usuarios/[id]` na árvore de diretórios do `frontend/`.
2. **`docs/02-modelagem-poo-dominio.md`**: Adicionar na classe `Usuario` os métodos de negócio para edição (`atualizarDados()`, `alterarPerfil()`) mantendo a validação obrigatória de `unidadeId` quando o perfil for `COORDENADOR_UNIDADE`.
3. **`docs/04-contrato-api-e-plano-qa.md`**: Incluir os novos endpoints REST de consulta individual (`GET /:id`) e atualização/Soft Delete (`PATCH /:id`).

### B. No Back-end (`backend/`)
Adicionar os seguintes endpoints que faltavam para fechar o CRUD completo:

| Entidade | Já existe hoje no Back-end | O que será adicionado no Back-end | Quem pode executar |
| :--- | :--- | :--- | :--- |
| **Pesquisas** | `GET /api/pesquisas`<br>`POST /api/pesquisas` | • **`GET /api/pesquisas/:id`** *(dados da pesquisa + indicadores e respostas)*<br>• **`PATCH /api/pesquisas/:id`** *(editar dados + Soft Delete `ativa: boolean`)* | Leitura: `Admin` e `Ouvidoria`<br>Edição/Soft Delete: `Admin` |
| **Unidades** | `GET /api/unidades`<br>`POST /api/unidades`<br>`PATCH /api/unidades/:id` | • **`GET /api/unidades/:id`** *(dados da unidade + nota média por pesquisa, total de manifestações, pendências e coordenadores)* | Leitura: `Admin` e `Ouvidoria` *(e `Coordenador` da própria unidade)*<br>Edição/Soft Delete: `Admin` |
| **Usuários** | `GET /api/usuarios`<br>`POST /api/usuarios` | • **`GET /api/usuarios/:id`** *(dados do usuário + histórico de atuação)*<br>• **`PATCH /api/usuarios/:id`** *(editar nome, e-mail, perfil, unidade, senha + Soft Delete `ativo: boolean`)* | Leitura: `Admin` e `Ouvidoria`<br>Edição/Soft Delete: `Admin` |

### C. No Front-end (`frontend/`)
1. **Services (`src/services/`)**: Adicionar os métodos `obterPorId(id)`, `criar(dados)` e `atualizar(id, dados)` em `pesquisa.service.ts`, `unidade.service.ts` e `usuario.service.ts`.
2. **Telas de Listagem (`/pesquisas`, `/unidades`, `/usuarios`)**:
   - Exibir a lista com filtros/busca, botão **"Novo Cadastro"** (para `ADMINISTRADOR`) e link clicável em cada linha levando para a página de detalhe (`/[id]`).
3. **Páginas de Detalhe (`/pesquisas/[id]`, `/unidades/[id]`, `/usuarios/[id]`)**:
   - Exibir os cards de indicadores específicos daquele item (média de notas, volume por pesquisa, manifestações vinculadas) e permitir ao `ADMINISTRADOR` editar os dados ou ativar/desativar (*Soft Delete*) o registro.
