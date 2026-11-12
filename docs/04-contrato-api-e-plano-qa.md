# 04. Contrato da API REST, Entregas do MVP e Plano de QA — Plataforma de Experiência do Cliente (Cedro / NIT)

> **Responsáveis:** Gabriel (`Tech Lead` & `QA`) e Taino (`Back-end` & `Front-end`)

Este documento é o contrato oficial entre o Back-end (Express + TypeScript POO), o Front-end (Next.js) e a bateria de testes de QA da **Plataforma de Experiência do Cliente (Cedro / NIT)**. Enquanto o **Taino** implementa os endpoints ou telas, o **Gabriel** já pode preparar o banco e os testes de cada rota sem bloqueios.

---

## 1. Mapa de Endpoints da API por Entrega do MVP (Seção 14)

### Entrega 1: Autenticação, Usuários, Perfis e Unidades
| Método | Rota | Perfis Autorizados | Descrição |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público (Usuários internos) | Autentica `email` e `senha`, retornando token JWT e dados do perfil/unidade. |
| `GET` | `/api/auth/me` | Autenticado | Retorna os dados do usuário logado e suas permissões polimórficas. |
| `GET` | `/api/unidades` | Todos internos (+ Público para seleção na pesquisa) | Lista unidades cadastradas. |
| `GET` | `/api/unidades/:id` | `ADMINISTRADOR`, `OPERADOR_OUVIDORIA` *(e `COORDENADOR_UNIDADE` da própria unidade)* | Retorna dados da unidade, indicadores (total de manifestações, pendências abertas/atrasadas, nota média geral), desempenho por pesquisa (nº de respostas e nota média por pesquisa) e coordenadores vinculados. |
| `POST` | `/api/unidades` | `ADMINISTRADOR` | Cadastra nova unidade (`nome`, `responsavelNome`, `prazoPadraoHoras`). |
| `PATCH` | `/api/unidades/:id` | `ADMINISTRADOR` | Atualiza dados (`nome`, `responsavelNome`, `prazoPadraoHoras`) ou ativa/desativa uma unidade (*Soft Delete*: `ativa: boolean`). |
| `GET` | `/api/usuarios` | `ADMINISTRADOR`, `OPERADOR_OUVIDORIA` | Lista usuários internos e seus respectivos perfis/unidades. |
| `GET` | `/api/usuarios/:id` | `ADMINISTRADOR`, `OPERADOR_OUVIDORIA` | Retorna ficha completa do usuário (`nome`, `email`, `perfil`, `unidadeId`, `ativo`) e resumo do histórico de atuação/auditoria (interações, respostas de unidade e escalonamentos registrados). |
| `POST` | `/api/usuarios` | `ADMINISTRADOR` | Cria usuário (`ADMINISTRADOR`, `OPERADOR_OUVIDORIA` ou `COORDENADOR_UNIDADE`). |
| `PATCH` | `/api/usuarios/:id` | `ADMINISTRADOR` | Atualiza dados (`nome`, `email`, `perfil`, `unidadeId`, redefinição de `senha`) ou ativa/desativa o usuário (*Soft Delete*: `ativo: boolean`), validando vínculo obrigatório de `unidadeId` para `COORDENADOR_UNIDADE`. |

### Entregas 2, 3 e 4: Pesquisas, Resposta do Cliente e Geração Automática de Manifestação
| Método | Rota | Perfis Autorizados | Descrição |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/pesquisas` | `ADMINISTRADOR`, `OPERADOR_OUVIDORIA` | Lista pesquisas configuradas. |
| `GET` | `/api/pesquisas/:id` | `ADMINISTRADOR`, `OPERADOR_OUVIDORIA` | Retorna dados da pesquisa, indicadores consolidados (total de respostas, nota média, % de satisfação e distribuição de notas 1 a 5), link público (`/pesquisa/:id`) e últimas manifestações geradas por ela. |
| `POST` | `/api/pesquisas` | `ADMINISTRADOR` | Cria nova pesquisa (`titulo`, `descricao`, `periodo`, `canal`, `unidadePadraoId`). |
| `PATCH` | `/api/pesquisas/:id` | `ADMINISTRADOR` | Atualiza dados (`titulo`, `descricao`, `periodo`, `canal`, `unidadePadraoId`) ou ativa/desativa a pesquisa (*Soft Delete*: `ativa: boolean`). |
| `GET` | `/api/public/pesquisas/:id` | **Público (Cliente)** | Retorna dados públicos da pesquisa e unidades ativas para o formulário/QR Code. |
| `POST` | `/api/public/pesquisas/:id/respostas` | **Público (Cliente)** | **Fluxo Central:** Recebe `{ unidadeId, clienteAtendimento, nota, comentario }`, salva a `RespostaPesquisa` e **cria automaticamente a `Manifestacao`** (com `protocolo` único e 1ª `Interacao` no histórico). |

#### Exemplo de Payload e Retorno (`POST /api/public/pesquisas/:id/respostas`)
```json
// Request Body
{
  "unidadeId": "b3d7a100-5232-4821-9b14-123456789abc",
  "clienteAtendimento": "Atendimento #98421 - Maria Silva",
  "nota": 2,
  "comentario": "Demora de mais de 40 minutos na recepção para coleta."
}

// Response (201 Created)
{
  "respostaId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "manifestacao": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "protocolo": "CED-2026-000142",
    "status": "NAO_RESPONDIDA",
    "prioridade": "ALTA",
    "unidadeId": "b3d7a100-5232-4821-9b14-123456789abc",
    "criadoEm": "2026-11-09T13:50:00.000Z"
  }
}
```

### Entrega 5: Listagem de Manifestações com Filtros (Seção 10) e Detalhe (Seção 9)
| Método | Rota | Perfis Autorizados | Descrição |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/manifestacoes` | Todos internos *(Com filtro automático por unidade se for `COORDENADOR_UNIDADE`)* | Suporta query params da Seção 10: `dataInicio`, `dataFim`, `nota`, `unidadeId`, `status`, `responsavelId`, `escalonada` (`true`/`false`), `pendente` (`true`/`false`), `pesquisaId`, `busca` (texto ou protocolo). |
| `GET` | `/api/manifestacoes/:id` | Todos internos *(Restrito à própria unidade para `COORDENADOR_UNIDADE`)* | Retorna todos os **14 campos mínimos da Seção 9**, incluindo `respostasUnidade`, `escalonamentos` e o array completo de `interacoes` (histórico). |

### Entregas 6 e 7: Tratativa da Unidade, Pendências, Escalonamento e Conclusão
| Método | Rota | Perfis Autorizados | Descrição |
| :---: | :--- | :--- | :--- |
| `PATCH` | `/api/manifestacoes/:id/iniciar-tratamento` | `COORDENADOR_UNIDADE` (da unidade vinculada) | Muda status para `EM_TRATAMENTO` e grava `Interacao`. |
| `POST` | `/api/manifestacoes/:id/respostas-unidade` | `COORDENADOR_UNIDADE` (da unidade vinculada) | Registra a resposta formal da unidade (`conteudo`), muda status para `RESPONDIDA` e grava `Interacao`. |
| `PATCH` | `/api/manifestacoes/:id/solicitar-complemento` | `OPERADOR_OUVIDORIA`, `ADMINISTRADOR` | Caso a resposta da unidade seja incompleta, devolve para `EM_TRATAMENTO` gravando o motivo na trilha de auditoria (`Interacao`). |
| `POST` | `/api/manifestacoes/:id/escalonar` | `OPERADOR_OUVIDORIA`, `ADMINISTRADOR` | Registra `Escalonamento` (`motivo`, `nivel`), muda status para `ESCALONADA`, eleva prioridade e mantém histórico anterior. |
| `PATCH` | `/api/manifestacoes/:id/encaminhar` | `OPERADOR_OUVIDORIA`, `ADMINISTRADOR` | Redireciona para unidade correta caso necessário, gravando no histórico. |
| `PATCH` | `/api/manifestacoes/:id/concluir` | `OPERADOR_OUVIDORIA`, `ADMINISTRADOR` | **Valida se existe resposta da unidade**; se válido, muda status para `CONCLUIDA`, preenche `concluidoEm` e grava `Interacao`. |
| `GET` | `/api/pendencias` | Todos internos *(Escopo por perfil)* | Visão dedicada (Tela 6) retornando apenas manifestações `NAO_RESPONDIDA`, atrasadas (`prazo_resposta < NOW()`) ou `ESCALONADA`. |

### Entregas 8 e 9: Dashboard Gerencial (Seção 11), Relatórios e Notificações
| Método | Rota | Perfis Autorizados | Descrição |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/dashboard/indicadores` | Todos internos *(Escopo por perfil)* | Retorna os **10 indicadores da Seção 11**: total de respostas, distribuição de notas 1 a 5 (qtd e %), abertas, não respondidas, escalonadas, concluídas, tempo médio de resposta, tempo médio de conclusão, pendências por unidade e volume por unidade. |
| `GET` | `/api/relatorios/exportar` | `OPERADOR_OUVIDORIA`, `ADMINISTRADOR` | Exporta os dados filtrados em formato CSV/JSON para análise gerencial. |

---

## 2. Plano de Testes de QA (Responsabilidade do Gabriel)

Cada uma das **9 Regras de Negócio Essenciais (Seção 6)** da [Documentacao_Funcional_INDECX.pdf](file:///c:/Users/gabri/poo-taino-gabriel/Documentacao_Funcional_INDECX.pdf) possui um Caso de Teste obrigatório que deve passar antes da entrega ao professor:

| ID QA | Regra de Negócio (Seção 6 do PDF) | Cenário de Teste (Unitário POO / Integração) | Resultado Esperado |
| :---: | :--- | :--- | :--- |
| **QA-01** | Toda resposta da pesquisa deve gerar um registro único e rastreável. | Enviar uma resposta com nota 1 a 5 para uma pesquisa ativa. | Cria 1 `RespostaPesquisa` + 1 `Manifestacao` com `protocolo` único e 1 `Interacao` inicial. |
| **QA-02** | A manifestação deve manter vínculo com a unidade responsável pelo atendimento. | Tentar criar manifestação sem `unidadeId`. | Erro de domínio (`RegraNegocioError`): manifestação exige unidade responsável. |
| **QA-03** | Apenas usuários autorizados da unidade podem registrar a resposta da manifestação. | Coordenador da **Unidade B** tenta chamar `registrarRespostaUnidade()` em uma manifestação da **Unidade A** (ou `OperadorOuvidoria` tenta responder pela unidade). | Bloqueado com erro de permissão (`AcessoNegadoError` / HTTP 403). |
| **QA-04** | Toda mudança de status deve registrar usuário, data e hora. | Executar transições `iniciarTratamento()`, `registrarRespostaUnidade()`, `escalonar()` e `concluir()`. | O array `manifestacao.interacoes` deve crescer em +1 a cada mudança, contendo `usuarioId`, `statusAnterior`, `statusNovo` e `dataHora`. |
| **QA-05** | Manifestações não respondidas devem permanecer visíveis como pendência. | Consultar listagem de pendências após criar manifestação sem resposta da unidade. | A manifestação aparece na lista de pendências até receber resposta válida. |
| **QA-06** | O sistema deve permitir escalonar uma manifestação sem perder o histórico anterior. | Escalonar uma manifestação que já possuía 2 interações no histórico. | Status muda para `ESCALONADA`, cria registro de `Escalonamento` e mantém as 2 interações anteriores + a nova (total = 3). |
| **QA-07** | A conclusão só deve ocorrer após o registro do tratamento ou resposta da unidade. | `OperadorOuvidoria` tenta chamar `concluir()` em uma manifestação com status `NAO_RESPONDIDA` ou `EM_TRATAMENTO` (sem resposta da unidade). | Bloqueado com `RegraNegocioError`: *"A manifestação só pode ser concluída após resposta formal da unidade"*. |
| **QA-08** | Nenhuma manifestação concluída deve ser apagada do histórico operacional. | Tentar excluir (`DELETE`) uma manifestação com status `CONCLUIDA` ou alterar uma `Interacao`. | Bloqueado pela classe de domínio e pela Trigger do PostgreSQL. |
| **QA-09** | As permissões devem restringir a visualização por perfil e, quando aplicável, por unidade. | `CoordenadorUnidade` (Unidade A) chama `GET /api/manifestacoes` ou tenta abrir detalhe de manifestação da Unidade B. | Só retorna manifestações da Unidade A; tentativa de acesso à Unidade B retorna `403 Forbidden`. |
| **QA-10** | A desativação de Unidades, Pesquisas ou Usuários deve ser lógica (*Soft Delete*), preservando todo o histórico de auditoria. | Inativar uma Pesquisa (`PATCH /api/pesquisas/:id`), Unidade (`PATCH /api/unidades/:id`) ou Usuário (`PATCH /api/usuarios/:id`). | Bloqueia novas respostas na pesquisa, oculta a unidade de novos atendimentos e bloqueia login/ações do usuário inativo (`UC05`), mantendo intactos os dados históricos em `interacoes`, `manifestacoes` e relatórios. |


