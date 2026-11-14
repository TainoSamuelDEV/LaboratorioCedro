# Short Paper de POO (Laboratório Cedro) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir a versão final, sólida e profissional do Short Paper acadêmico de POO do projeto Laboratório Cedro / NIT, entregando o documento em Markdown (`docs/paper/SHORT_PAPER_CEDRO_POO.md`) e o documento Word oficial (`docs/paper/SHORT_PAPER_CEDRO_POO.docx`) rigorosamente formatado segundo o modelo da UNDB e com 100% de conformidade com o checklist de avaliação.

**Architecture:** O artigo é redigido em conformidade com as normas ABNT e a estrutura do modelo institucional da UNDB, estruturando-se em Introdução, Metodologia e Resultados & Discussão (comprovando com código real e diagramas os pilares de POO: herança, polimorfismo, interfaces, encapsulamento, persistência relacional, front-end reativo com eventos e 71 testes automatizados). A compilação do Word é automatizada via script Python dedicado (`python-docx`), garantindo tipografia, margens e legendas precisas sem erros manuais de formatação.

**Tech Stack:** Markdown acadêmico, Python 3.13, `python-docx`, TypeScript, Vitest, PostgreSQL/Supabase, Next.js.

**Spec:** [docs/superpowers/specs/2026-11-13-short-paper-laboratorio-cedro-design.md](file:///c:/Users/Admin/Documents/LaboratorioCedro/docs/superpowers/specs/2026-11-13-short-paper-laboratorio-cedro-design.md)

## Global Constraints

- Resumo (PT) e Abstract (EN) devem conter as 4 frases estruturadas (Contexto, Problema, Solução, Resultado) com extensão entre 100 e 250 palavras.
- Autores: Gabriel Ordonez dos Reis e Taino Samuel. Orientador: Prof. Me./Dr. Rondineli Seba Salomao. Instituição: Centro Universitário Dom Bosco (UNDB) / Laboratório Cedro.
- Conter evidência explícita e analisada para os 6 requisitos mínimos de POO (Herança/Polimorfismo, Abstrações/Interfaces, Exceções/Coleções, GUI com eventos, Banco de dados e Testes/Git).
- O documento Word gerado deve seguir as regras de formatação da UNDB: A4, margens (Sup/Esq 3cm, Inf/Dir 2cm), fonte Arial/Times 12pt, entrelinhas 1,5, recuo de primeira linha de 2,0 cm e legendas padronizadas.
- Proibição de placeholders (sem "TODO", "TBD", "xxxx", "lorem ipsum").

---

### Task 1: Redação Integral do Artigo em Markdown Acadêmico

**Files:**
- Create: `docs/paper/SHORT_PAPER_CEDRO_POO.md`
- Reference: `docs/01-arquitetura-e-papeis.md`, `docs/02-modelagem-poo-dominio.md`, `docs/03-modelagem-banco-dados.md`, `docs/04-contrato-api-e-plano-qa.md`, `docs/05-diagramas-uml-casos-de-uso.md`

**Interfaces:**
- Consumes: Regras de negócio, hierarquia de classes `Usuario`, encapsulamento de `Manifestacao`, schema PostgreSQL, testes Vitest.
- Produces: `docs/paper/SHORT_PAPER_CEDRO_POO.md` contendo todas as seções (Pré-textual, 1 Introdução, 2 Metodologia, 3 Resultados e Discussão com 7 subitens, 4 Considerações Finais, Declaração de Uso de IA e Referências ABNT).

- [ ] **Step 1: Redigir o arquivo `docs/paper/SHORT_PAPER_CEDRO_POO.md`**
  Escrever o artigo completo com linguagem científica formal, sem tom coloquial ou formato de manual passo a passo, integrando citações indiretas no padrão ABNT (Autor, Ano) e trechos de código TypeScript extraídos diretamente do repositório.

- [ ] **Step 2: Verificar a contagem de palavras do Resumo e Abstract**
  Executar verificação para garantir que o Resumo PT e o Abstract EN possuem entre 100 e 250 palavras e seguem as 4 frases estruturadas.

- [ ] **Step 3: Verificar a cobertura de todas as evidências de POO**
  Confirmar que cada um dos 6 requisitos do Paper Check (Herança/Polimorfismo, Interface/Abstração, Exceções/Coleções, GUI/Eventos, Banco de dados e Vitest/Git) possui subseção própria com análise detalhada.

- [ ] **Step 4: Commit das alterações do Markdown**
  `git add docs/paper/SHORT_PAPER_CEDRO_POO.md; git commit -m "docs: redigir versao integral do short paper de POO em markdown"`

---

### Task 2: Implementar o Gerador Automatizado do Word (.docx) no Padrão UNDB

**Files:**
- Create: `docs/paper/gerar_word_paper.py`
- Reference: `docs/paper/modelo/MODELO SHORT PAPER (2).docx`, `docs/paper/SHORT_PAPER_CEDRO_POO.md`

**Interfaces:**
- Consumes: Conteúdo estruturado de `docs/paper/SHORT_PAPER_CEDRO_POO.md` e estilos de `MODELO SHORT PAPER (2).docx`.
- Produces: Script Python que monta programaticamente o documento `.docx` com formatação milimétrica (margens, espaçamentos, fontes, tabelas com bordas personalizadas, caixas de código e legendas).

- [ ] **Step 1: Desenvolver `docs/paper/gerar_word_paper.py`**
  Implementar o script em Python utilizando `python-docx` para:
  - Definir tamanho A4 e margens ABNT/UNDB: Superior 3.0 cm, Esquerda 3.0 cm, Inferior 2.0 cm, Direita 2.0 cm;
  - Configurar estilos tipográficos padronizados (Título do artigo centralizado 12pt negrito, Autores e Orientador alinhados à direita, Resumo justificado sem recuo e entrelinhas simples, Títulos de Seção 12pt negrito caixa alta, Parágrafos de texto justificados com recuo de 2,0 cm e entrelinhas 1,5);
  - Inserir blocos estilizados para os trechos de código (fonte Courier New / Consolas 9.5pt, fundo cinza claro e borda sutil);
  - Inserir tabelas formatadas com cabeçalho destacado e legendas padronizadas (rótulo em negrito 11pt, fonte em 10pt simples);
  - Incluir a Declaração de Uso de Inteligência Artificial e a lista de Referências ABNT NBR 6023.

- [ ] **Step 2: Testar a execução do script e gerar o `.docx`**
  Executar `python docs/paper/gerar_word_paper.py` e verificar a saída de `docs/paper/SHORT_PAPER_CEDRO_POO.docx`.

- [ ] **Step 3: Commit do script de geração**
  `git add docs/paper/gerar_word_paper.py; git commit -m "feat(paper): adicionar script automatizado de geracao do short paper em docx"`

---

### Task 3: Validação Estrutural e de Conteúdo do Documento Word Gerado

**Files:**
- Test/Verify: `docs/paper/SHORT_PAPER_CEDRO_POO.docx`
- Create: `scratch/verificar_paper_docx.py`

**Interfaces:**
- Consumes: `docs/paper/SHORT_PAPER_CEDRO_POO.docx`
- Produces: Relatório de conformidade estrutural.

- [ ] **Step 1: Criar script de inspeção e validação do `.docx`**
  Verificar:
  - Inexistência de placeholders ("TODO", "TBD", "lorem", "xxxx");
  - Presença de todas as 4 seções principais mais pré-textuais e pós-textuais;
  - Quantidade de parágrafos, tabelas e trechos de código;
  - Contagem total de palavras e páginas estimadas.

- [ ] **Step 2: Executar o teste de validação**
  Executar `python scratch/verificar_paper_docx.py` e certificar saída 100% limpa.

- [ ] **Step 3: Commit do arquivo `.docx` final gerado**
  `git add docs/paper/SHORT_PAPER_CEDRO_POO.docx; git commit -m "docs: adicionar documento word oficial do short paper de POO formatado"`

---

### Task 4: Conferência Cruzada com o Checklist Oficial e Finalização

**Files:**
- Reference: `docs/paper/modelo/Paper Check Short Paper de POO.pdf`
- Reference: `docs/paper/SHORT_PAPER_CEDRO_POO.docx`

**Interfaces:**
- Consumes: Requisitos do slide 8 do Paper Check.
- Produces: Relatório de conformidade dos 8 itens do checklist e encerramento.

- [ ] **Step 1: Mapear os 8 critérios do Slide 8 do Paper Check**
  1. Título, squad e autores identificados;
  2. Resumo em PT e abstract em EN com o mesmo conteúdo;
  3. Cenário real e parceiro descritos com clareza;
  4. Problema e objetivo ligados à solução construída;
  5. Diagrama de classes e decisões de projeto explicadas;
  6. Evidência para cada requisito mínimo de POO;
  7. Declaração de uso de IA incluída;
  8. Referências citadas e repositório Git com histórico de commits.

- [ ] **Step 2: Executar verificação e gerar relatório de encerramento**
  Apresentar para o usuário os links e resumo das evidências verificadas.
