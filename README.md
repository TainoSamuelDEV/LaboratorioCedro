# Plataforma de Experiência do Cliente (Cedro / NIT)

Sistema próprio desenvolvido para o **Laboratório Cedro (Núcleo de Inovação e Tecnologia — NIT)** com o objetivo de **substituir o antigo sistema terceirizado (INDECX)**, aplicando na prática os pilares de **Programação Orientada a Objetos (POO)** e atendendo integralmente aos requisitos da [Documentacao_Funcional_INDECX.pdf](file:///c:/Users/gabri/poo-taino-gabriel/Documentacao_Funcional_INDECX.pdf).

---

## 1. Equipe e Divisão das 6 Frentes de Arquitetura

| Integrante | Frentes de Responsabilidade | Escopo Principal |
| :--- | :--- | :--- |
| **Gabriel** | **Tech Lead**, **Banco de Dados**, **QA** | Arquitetura POO, contratos da API, modelagem PostgreSQL/Supabase, triggers de auditoria e suíte de testes unitários/integração. |
| **Taino** | **Back-end**, **Front-end**, **DevOps** | Implementação das classes de domínio POO e API Express.js, interfaces em Next.js (9 telas internas + pesquisa pública) e automação/deploy. |

---

## 2. Stack Tecnológica

* **Linguagem:** TypeScript (Strict Mode)
* **Back-end:** Node.js + Express.js (Arquitetura em 4 Camadas: `Presentation` → `Application` → `Domain POO` → `Infrastructure`)
* **Front-end:** Next.js (App Router + React + TypeScript — consome exclusivamente a API do Back-end via `NEXT_PUBLIC_API_URL`)
* **Banco de Dados:** PostgreSQL via **Supabase Self-Hosted na VPS** (acessado exclusivamente pelo Back-end na camada `infrastructure/`)
* **Testes (QA):** Vitest + Supertest
* **DevOps & Infra:** **VPS + Coolify** (Containers Docker para Front-end, Back-end e Supabase Self-Hosted) + GitHub Actions

---

## 3. Documentação Técnica e Fundação do Projeto

Toda a engenharia de base foi documentada antes da construção da API:

1. [01. Arquitetura, Stack e Divisão das 6 Frentes](file:///c:/Users/gabri/poo-taino-gabriel/docs/01-arquitetura-e-papeis.md)
2. [02. Modelagem Orientada a Objetos (POO) e Regras de Domínio](file:///c:/Users/gabri/poo-taino-gabriel/docs/02-modelagem-poo-dominio.md)
3. [03. Modelagem do Banco de Dados (DER e Regras PostgreSQL/Supabase)](file:///c:/Users/gabri/poo-taino-gabriel/docs/03-modelagem-banco-dados.md)
4. [04. Contrato da API REST, Entregas do MVP e Plano de QA](file:///c:/Users/gabri/poo-taino-gabriel/docs/04-contrato-api-e-plano-qa.md)
5. [05. Diagrama de Casos de Uso (Padrão UML 2.5 com Ator Sistema), Sequência e Justificativa POO](file:///c:/Users/gabri/poo-taino-gabriel/docs/05-diagramas-uml-casos-de-uso.md)
6. [Diagrama Visual Vetorial de Casos de Uso UML (SVG)](file:///c:/Users/gabri/poo-taino-gabriel/docs/diagrama-casos-de-uso-uml.svg)
7. [Script SQL Oficial (Supabase / PostgreSQL)](file:///c:/Users/gabri/poo-taino-gabriel/database/schema.sql)

---

## 4. Roteiro de Construção do MVP (Seção 14)

- [x] **Fase 0 & 1:** Planejamento Arquitetural, Modelagem POO, Schema SQL e Contratos da API
- [ ] **Entrega 1:** Autenticação, usuários, perfis polimórficos e unidades
- [ ] **Entrega 2:** Cadastro da pesquisa e geração do link/formulário de resposta
- [ ] **Entrega 3:** Registro de nota 1 a 5 e comentário
- [ ] **Entrega 4:** Criação automática e encaminhamento da manifestação
- [ ] **Entrega 5:** Tela e rotas de manifestações com filtros e detalhe
- [ ] **Entrega 6:** Resposta da unidade e alteração encapsulada de status
- [ ] **Entrega 7:** Pendências, escalonamento e conclusão pela Ouvidoria
- [ ] **Entrega 8:** Dashboard gerencial e relatórios
- [ ] **Entrega 9:** Notificações polimórficas e trilha de auditoria imutável

