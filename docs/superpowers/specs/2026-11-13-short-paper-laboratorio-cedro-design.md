# Especificação de Design: Short Paper Acadêmico de POO — Laboratório Cedro / NIT

**Data:** 13 de novembro de 2026  
**Autores da Squad:** Gabriel Ordonez dos Reis e Taino Samuel  
**Orientador:** Prof. Me./Dr. Rondineli Seba Salomao  
**Instituição:** Centro Universitário Dom Bosco (UNDB)  
**Disciplina:** Programação Orientada a Objetos (POO) / Projeto PjBL  
**Parceiro:** Laboratório Cedro / Núcleo de Inovação e Tecnologia (NIT)  
**Status:** Validado e Aprovado

---

## 1. Visão Geral e Propósito

Este documento formaliza as decisões de conteúdo, estrutura, evidências técnicas e conformidade normativa para a redação do **Short Paper Acadêmico** do projeto **Plataforma de Experiência do Cliente (Laboratório Cedro / NIT)**.

O objetivo do artigo é relatar a engenharia, a modelagem de domínio orientada a objetos (POO), as decisões arquiteturais (Clean Architecture / DDD), a persistência relacional com integridade (PostgreSQL/Supabase) e a validação automatizada (Vitest) de um sistema moderno construído para substituir o software legado INDECX, garantindo alinhamento estrito tanto com o **Modelo Oficial de Short Paper da UNDB** (`MODELO SHORT PAPER (2).docx`) quanto com o **Checklist de Avaliação de POO** (`Paper Check Short Paper de POO.pdf`).

---

## 2. Metadados do Trabalho e Identificação

* **Título Principal:**  
  `PLATAFORMA DE EXPERIÊNCIA DO CLIENTE: MODELAGEM ORIENTADA A OBJETOS E ARQUITETURA LIMPA APLICADAS À GESTÃO DE MANIFESTAÇÕES NO LABORATÓRIO CEDRO`
* **Título em Língua Estrangeira (Inglês):**  
  `CUSTOMER EXPERIENCE PLATFORM: OBJECT-ORIENTED MODELING AND CLEAN ARCHITECTURE APPLIED TO FEEDBACK MANAGEMENT AT CEDRO LABORATORY`
* **Autores:**  
  * Gabriel Ordonez dos Reis (Tech Lead / Modelagem POO / Banco de Dados / QA)  
  * Taino Samuel (Back-end / Front-end / DevOps)
* **Orientador Acadêmico:**  
  * Prof. Me./Dr. Rondineli Seba Salomao
* **Filiação:**  
  * Centro Universitário Dom Bosco (UNDB) — São Luís, MA  
  * Laboratório Cedro / NIT

---

## 3. Elementos Pré-Textuais

### 3.1. Resumo em Português (Atendendo à regra de 4 frases e extensão 100-250 palavras)
> Desenvolver uma plataforma computacional para modernizar a gestão de satisfação e resolução de manifestações no Laboratório Cedro, em substituição ao sistema legado INDECX, enfrentando as dificuldades de falta de rastreabilidade de SLA, ausência de automação na abertura de chamados críticos e frágil governança de dados. Empregar uma metodologia de desenvolvimento aplicada (PjBL) alicerçada nos princípios da Arquitetura Limpa e nos quatro pilares da Programação Orientada a Objetos (POO) em TypeScript estrito, com back-end em Node.js/Express, persistência relacional com integridade referencial em PostgreSQL/Supabase e interface responsiva em Next.js. Implementar classes de domínio ricas, hierarquias polimórficas de controle de acesso (`Usuario`), encapsulamento rígido com histórico imutável (`Manifestacao`), contratos desacoplados via interfaces (`IRepository`, `INotificador`) e captura de pesquisas via QR Code. Obter como resultados a validação integral das regras de negócio por meio de 71 testes automatizados (Vitest), eliminação de estados inconsistentes no ciclo de vida das ocorrências e entrega de um MVP funcional em ambiente de produção (VPS/Coolify). Concluir que o rigor de modelagem POO viabilizou alta manutenibilidade, fechamento do ciclo de feedback do paciente e elevação dos padrões de qualidade no ambiente clínico.
>
> **Palavras-chave:** Programação Orientada a Objetos. Arquitetura Limpa. Laboratório Cedro. Gestão de Manifestações. TypeScript.

### 3.2. Abstract em Inglês (Fiel ao conteúdo em português)
> Develop a computational platform to modernize customer satisfaction management and feedback resolution at Cedro Laboratory, replacing the legacy INDECX system to overcome difficulties regarding lack of SLA traceability, absent automation in critical ticket opening, and fragile data governance. Employ an applied software engineering methodology (PjBL) anchored in Clean Architecture principles and the four core pillars of Object-Oriented Programming (OOP) in strict TypeScript, featuring a Node.js/Express back-end, relational persistence with referential integrity in PostgreSQL/Supabase, and a responsive Next.js interface. Implement rich domain models, polymorphic access-control hierarchies (`Usuario`), strict encapsulation with immutable interaction histories (`Manifestacao`), decoupled interface contracts (`IRepository`, `INotificador`), and survey capturing via QR Code. Achieve as results the complete validation of business rules through 71 automated tests (Vitest), eliminating inconsistent states throughout ticket lifecycles and delivering a production-ready MVP on a VPS/Coolify environment. Conclude that rigorous object-oriented domain modeling enabled high maintainability, closed the patient feedback loop, and enhanced operational quality standards in clinical diagnostics.
>
> **Keywords:** Object-Oriented Programming. Clean Architecture. Cedro Laboratory. Feedback Management. TypeScript.

---

## 4. Estrutura Textual do Artigo (Seções Principais)

### 4.1. Seção 1: Introdução
* **Contextualização e Cenário Real:** O setor de medicina diagnóstica e a importância da experiência do cliente/paciente (DONABEDIAN, 2005). Apresentação do Laboratório Cedro e do Núcleo de Inovação e Tecnologia (NIT).
* **Problematização do Sistema Legado:** Limitações encontradas no sistema anterior (INDECX): regras de negócio dispersas, ausência de automação para transformar notas detratoras em manifestações formais com SLA controlado, e falta de histórico imutável para auditoria médica.
* **Referencial Teórico Breve:** Síntese conceitual sobre Orientação a Objetos (GAMMA et al., 1994; BOOCH et al., 2007), Princípios SOLID e Arquitetura Limpa (MARTIN, 2017), Padrões de Arquitetura Corporativa (FOWLER, 2002) e Engenharia de Software (SOMMERVILLE, 2019).
* **Objetivos:**
  * *Geral:* Conceber, arquitetar, implementar e validar uma plataforma web orientada a objetos para coleta e gestão resolutiva de manifestações no Laboratório Cedro.
  * *Específicos:*
    1. Modelar o domínio com classes puras em TypeScript, aplicando abstração, herança, polimorfismo e encapsulamento;
    2. Desenvolver API REST desacoplada em Node.js/Express sobre PostgreSQL/Supabase com integridade referencial;
    3. Construir interface responsiva em Next.js com geração de QR Code para coleta pública e dashboard gerencial;
    4. Garantir 100% de conformidade com as regras de negócio através de suíte de testes automatizados unitários e de integração.
* **Estrutura do Trabalho:** Guia conciso das seções subsequentes.

### 4.2. Seção 2: Metodologia / Procedimentos de Desenvolvimento
* **Caracterização da Pesquisa:** Pesquisa aplicada de desenvolvimento experimental orientada a resolução de problemas reais (*Project-Based Learning* — PjBL).
* **Arquitetura em Camadas (Clean Architecture):**
  * *Presentation Layer:* Rotas Express, Middlewares (JWT, RBAC) e Controllers.
  * *Application Layer:* Casos de Uso (`UseCases`) e DTOs de entrada/saída.
  * *Domain Layer:* Entidades ricas puras (`Usuario`, `Manifestacao`, `Pesquisa`, etc.), Interfaces de Contrato e Exceções de Domínio.
  * *Infrastructure Layer:* Repositórios concretos (`SupabaseManifestacaoRepository`), clientes de banco e serviços de infraestrutura.
* **Stack Tecnológica:**
  * Linguagem: TypeScript (Strict Mode).
  * Back-end: Node.js + Express.js.
  * Banco de Dados: PostgreSQL (Supabase Self-Hosted).
  * Front-end: Next.js (App Router), React, Tailwind CSS.
  * QA: Vitest e Supertest.
  * DevOps: Docker, Coolify v4 e VPS Linux.
* **Divisão de Trabalho da Squad (Gabriel & Taino):**
  * Gabriel: Liderança técnica de domínio POO, modelagem de banco de dados e engenharia de testes (QA).
  * Taino: Implementação de rotas e casos de uso no Express, interface em Next.js e orquestração de deploy (DevOps).

### 4.3. Seção 3: Resultados e Discussão (Evidências de POO Obrigatórias)

#### 3.3.1. Modelagem Estrutural de Classes (Diagrama UML)
* Diagrama de classes UML do domínio:
  * Entidade abstrata `Usuario` e suas especializações (`Administrador`, `OperadorOuvidoria`, `CoordenadorUnidade`).
  * Entidade agregadora `Manifestacao` com composição forte de `Interacao`, `RespostaUnidade` e `Escalonamento`.
  * Entidades `Pesquisa`, `RespostaPesquisa` e `Unidade`.
* Tabela de máquina de estados da manifestação e regras de transição fechadas.

#### 3.3.2. Herança e Polimorfismo com Análise Crítica de Código
* Trecho real de código TypeScript demonstrando a hierarquia de `Usuario`:
  * Métodos polimórficos de autorização: `podeVisualizar()`, `podeResponderUnidade()`, `podeEscalonar()`, `podeConcluir()`.
* Análise técnica demonstrando a eliminação de cadeias de `if/else` e a adesão ao Princípio Aberto/Fechado (OCP).

#### 3.3.3. Abstrações e Interfaces de Contrato
* Contratos do sistema: `IRepository<T>`, `IManifestacaoRepository`, `INotificador`, `ISLACalculator`.
* Análise da Inversão de Dependência (DIP) e isolamento do domínio em relação a detalhes tecnológicos.

#### 3.3.4. Encapsulamento, Coleções Genéricas e Exceções de Domínio
* Encapsulamento: atributos privados (`_status`, `_interacoes`, `_respostasUnidade`) protegendo invariantes de negócio.
* Coleções com Generics: manipulação segura de listas imutáveis (`readonly Interacao[]`).
* Exceções Customizadas: hierarquia de erros (`RegraNegocioError`, `PermissaoNegadaError`, `EntidadeNaoEncontradaError`) tratada centralmente por middleware HTTP.

#### 3.3.5. Persistência Relacional, Integridade e Auditoria Imutável
* Diagrama e schema SQL relacional com 8 entidades.
* Regras de integridade referencial (*Foreign Keys*, *Constraints*) e triggers de imutabilidade no PostgreSQL para o histórico de auditoria médica na tabela `interacoes`.

#### 3.3.6. Interface Gráfica com Eventos e Fluxos de Uso
* Fluxo de coleta via QR Code no Next.js (página pública `/pesquisa/[id]`).
* Automação: criação reativa de `Manifestacao` com prioridade alta para notas $\le 6$.
* Fluxo interno de tratativa: tela de ocorrência com linha do tempo de interações, modais de resposta e escalonamento para o ouvidor e coordenador de unidade.

#### 3.3.7. Validação de Qualidade (QA) e Rastreabilidade Git
* Execução e resultados dos testes automatizados no Vitest: 14 arquivos de teste, **71 testes com 100% de aprovação**.
* Evidências do repositório Git com histórico equilibrado de commits entre os dois desenvolvedores da squad.

### 4.4. Seção 4: Considerações Finais
* Avaliação do cumprimento integral dos objetivos e das regras de negócio do cenário real.
* Lições aprendidas com a aplicação prática de POO e Clean Architecture.
* Limitações do MVP e propostas para trabalhos futuros (notificação via WhatsApp e análise de sentimentos via IA no texto do paciente).

---

## 5. Elementos Pós-Textuais

### 5.1. Declaração de Uso de Inteligência Artificial (Conforme Slide 7 e 8 do Paper Check)
Declaração formal e transparente especificando as ferramentas de Inteligência Artificial Generativa (Google Antigravity / Gemini) empregadas como assistentes no desenvolvimento, na formulação de casos de teste no Vitest, na revisão de código e na estruturação textual do artigo, ressaltando o domínio conceitual completo e a capacidade de defesa oral individual dos autores Gabriel e Taino.

### 5.2. Referências Bibliográficas (Normas ABNT NBR 6023)
Lista de referências acadêmicas clássicas e contemporâneas citadas no corpo do artigo:
* BOOCH, G. et al. *Object-Oriented Analysis and Design with Applications*. 3. ed. Boston: Addison-Wesley, 2007.
* DONABEDIAN, A. *Evaluating the quality of medical care*. The Milbank Quarterly, v. 83, n. 4, p. 691-729, 2005.
* FOWLER, M. *Patterns of Enterprise Application Architecture*. Boston: Addison-Wesley, 2002.
* GAMMA, E. et al. *Design Patterns: Elements of Reusable Object-Oriented Software*. Reading: Addison-Wesley, 1994.
* MARTIN, R. C. *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Boston: Prentice Hall, 2017.
* PRESSMAN, R. S.; MAXIM, B. R. *Engenharia de Software: Uma Abordagem Profissional*. 8. ed. Porto Alegre: AMGH, 2016.
* SOMMERVILLE, I. *Engenharia de Software*. 10. ed. São Paulo: Pearson, 2019.

---

## 6. Estratégia de Geração dos Artefatos Finais

1. **Arquivo Markdown Completo:**  
   Geração de `docs/paper/SHORT_PAPER_CEDRO_POO.md` com a íntegra do trabalho, tabelas formatadas, blocos de código TypeScript sintáticos e diagramas Mermaid.
2. **Arquivo Word Oficial (.docx):**  
   Script Python automatizado utilizando a biblioteca `docx` para compilar o texto formatado rigorosamente dentro dos padrões da UNDB (`MODELO SHORT PAPER (2).docx`), respeitando:
   * Margens (Superior 3cm, Esquerda 3cm, Inferior 2cm, Direita 2cm);
   * Fonte Times New Roman / Arial 12pt, espaçamento 1,5 entre linhas e recuo de parágrafo;
   * Títulos numerados em maiúsculas e negrito;
   * Quadros e tabelas com legendas superiores padronizadas e indicação de fonte inferior em fonte 10;
   * Citações e referências no padrão ABNT.
