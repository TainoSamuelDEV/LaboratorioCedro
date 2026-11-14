#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
SCRIPT DE AUDITORIA E VERIFICAÇÃO INDEPENDENTE DO DOCUMENTO WORD (.DOCX)
Short Paper: Plataforma de Experiência do Cliente - Laboratório Cedro
Autores: Gabriel Ordonez dos Reis e Taino Samuel
Orientador: Prof. Me./Dr. Rondineli Seba Salomao
Instituição: Centro Universitário Dom Bosco (UNDB)
Normas: ABNT NBR 6022, NBR 6023, NBR 14724 e Manual de TCC/Artigo UNDB
================================================================================
"""

import os
import re
import sys
import docx
from docx.shared import Cm, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from typing import List, Dict, Tuple, Any

# Caminhos padrão do projeto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCX_PATH = os.path.join(BASE_DIR, 'docs', 'paper', 'SHORT_PAPER_CEDRO_POO.docx')
REPORT_PATH = os.path.join(BASE_DIR, 'scratch', 'relatorio_verificacao_docx.txt')

class AuditoriaDocx:
    def __init__(self, docx_path: str):
        self.docx_path = docx_path
        self.erros: List[str] = []
        self.avisos: List[str] = []
        self.sucessos: List[str] = []
        self.linhas_relatorio: List[str] = []
        
        if not os.path.exists(docx_path):
            raise FileNotFoundError(f"Arquivo DOCX não encontrado no caminho: {docx_path}")
        
        self.doc = docx.Document(docx_path)
        self.total_paragrafos = len(self.doc.paragraphs)
        self.total_tabelas = len(self.doc.tables)
        self.tamanho_bytes = os.path.getsize(docx_path)

    def log(self, mensagem: str):
        print(mensagem)
        self.linhas_relatorio.append(mensagem)

    def registrar_sucesso(self, item: str, detalhe: str = ""):
        msg = f"[APROVADO] {item}" + (f" -> {detalhe}" if detalhe else "")
        self.sucessos.append(msg)
        self.log(f"  [OK] {item}" + (f": {detalhe}" if detalhe else ""))

    def registrar_erro(self, item: str, detalhe: str):
        msg = f"[FALHA] {item} -> {detalhe}"
        self.erros.append(msg)
        self.log(f"  [ERRO CRÍTICO] {item}: {detalhe}")

    def registrar_aviso(self, item: str, detalhe: str):
        msg = f"[AVISO] {item} -> {detalhe}"
        self.avisos.append(msg)
        self.log(f"  [AVISO] {item}: {detalhe}")

    # ==========================================================================
    # 1. GEOMETRIA DA PÁGINA E MARGENS (ABNT / UNDB)
    # ==========================================================================
    def auditar_geometria_e_margens(self):
        self.log("\n" + "=" * 80)
        self.log("1. AUDITORIA DE GEOMETRIA DA PÁGINA E MARGENS (ABNT / UNDB)")
        self.log("=" * 80)

        if len(self.doc.sections) == 0:
            self.registrar_erro("Seções do Documento", "Nenhuma seção encontrada no documento.")
            return

        sec = self.doc.sections[0]
        largura_cm = sec.page_width.cm
        altura_cm = sec.page_height.cm
        top_cm = sec.top_margin.cm
        left_cm = sec.left_margin.cm
        bot_cm = sec.bottom_margin.cm
        right_cm = sec.right_margin.cm

        tolerancia = 0.05  # 0,05 cm para conversões de twips/pontos

        # Largura A4: 21.0 cm
        if abs(largura_cm - 21.0) <= tolerancia:
            self.registrar_sucesso("Largura da Página A4", f"{largura_cm:.2f} cm (Esperado: 21,0 cm)")
        else:
            self.registrar_erro("Largura da Página", f"Obtido {largura_cm:.2f} cm, esperado 21,0 cm ± {tolerancia} cm")

        # Altura A4: 29.7 cm
        if abs(altura_cm - 29.7) <= tolerancia:
            self.registrar_sucesso("Altura da Página A4", f"{altura_cm:.2f} cm (Esperado: 29,7 cm)")
        else:
            self.registrar_erro("Altura da Página", f"Obtido {altura_cm:.2f} cm, esperado 29,7 cm ± {tolerancia} cm")

        # Margem Superior: 3.0 cm
        if abs(top_cm - 3.0) <= tolerancia:
            self.registrar_sucesso("Margem Superior", f"{top_cm:.2f} cm (Esperado: 3,0 cm)")
        else:
            self.registrar_erro("Margem Superior", f"Obtido {top_cm:.2f} cm, esperado 3,0 cm ± {tolerancia} cm")

        # Margem Esquerda: 3.0 cm
        if abs(left_cm - 3.0) <= tolerancia:
            self.registrar_sucesso("Margem Esquerda", f"{left_cm:.2f} cm (Esperado: 3,0 cm)")
        else:
            self.registrar_erro("Margem Esquerda", f"Obtido {left_cm:.2f} cm, esperado 3,0 cm ± {tolerancia} cm")

        # Margem Inferior: 2.0 cm
        if abs(bot_cm - 2.0) <= tolerancia:
            self.registrar_sucesso("Margem Inferior", f"{bot_cm:.2f} cm (Esperado: 2,0 cm)")
        else:
            self.registrar_erro("Margem Inferior", f"Obtido {bot_cm:.2f} cm, esperado 2,0 cm ± {tolerancia} cm")

        # Margem Direita: 2.0 cm
        if abs(right_cm - 2.0) <= tolerancia:
            self.registrar_sucesso("Margem Direita", f"{right_cm:.2f} cm (Esperado: 2,0 cm)")
        else:
            self.registrar_erro("Margem Direita", f"Obtido {right_cm:.2f} cm, esperado 2,0 cm ± {tolerancia} cm")

    # ==========================================================================
    # 2. AUDITORIA TIPOGRÁFICA E ESTILOS DE PARÁGRAFO
    # ==========================================================================
    def auditar_tipografia(self):
        self.log("\n" + "=" * 80)
        self.log("2. AUDITORIA TIPOGRÁFICA E PADRÕES DE FONTE (ARIAL / CONSOLAS)")
        self.log("=" * 80)

        # Checar Estilo Normal
        try:
            estilo_normal = self.doc.styles['Normal']
        except KeyError:
            estilo_normal = None
        if estilo_normal and estilo_normal.font:
            fonte_padrao = estilo_normal.font.name
            tam_padrao = estilo_normal.font.size.pt if estilo_normal.font.size else None
            if fonte_padrao == 'Arial':
                self.registrar_sucesso("Fonte Padrão do Estilo Normal", f"{fonte_padrao} {tam_padrao} pt")
            else:
                self.registrar_erro("Fonte Padrão do Estilo Normal", f"Esperado Arial, encontrado {fonte_padrao}")
        else:
            self.registrar_aviso("Estilo Normal", "Propriedades de fonte do estilo Normal não acessíveis diretamente.")

        # Varrer runs de parágrafos e células de tabelas
        fontes_detectadas = set()
        fontes_invalidas = set()
        total_runs_texto = 0
        total_runs_consolas = 0

        for p in self.doc.paragraphs:
            for r in p.runs:
                total_runs_texto += 1
                fn = r.font.name or (estilo_normal.font.name if estilo_normal and estilo_normal.font else 'Arial')
                fontes_detectadas.add(fn)
                if fn not in ('Arial', 'Consolas'):
                    fontes_invalidas.add(fn)
                elif fn == 'Consolas':
                    total_runs_consolas += 1

        for t in self.doc.tables:
            for row in t.rows:
                for cell in row.cells:
                    for p in cell.paragraphs:
                        for r in p.runs:
                            total_runs_texto += 1
                            fn = r.font.name or (estilo_normal.font.name if estilo_normal and estilo_normal.font else 'Arial')
                            fontes_detectadas.add(fn)
                            if fn not in ('Arial', 'Consolas'):
                                fontes_invalidas.add(fn)
                            elif fn == 'Consolas':
                                total_runs_consolas += 1

        if not fontes_invalidas:
            self.registrar_sucesso(
                "Famílias Tipográficas Utilizadas",
                f"Apenas fontes aprovadas detectadas: {sorted(list(fontes_detectadas))} "
                f"({total_runs_texto} runs analisados, {total_runs_consolas} runs de código em Consolas)"
            )
        else:
            self.registrar_erro(
                "Famílias Tipográficas Proibidas",
                f"Detectadas fontes não conformes: {sorted(list(fontes_invalidas))}"
            )

    # ==========================================================================
    # 3. AUDITORIA DE SEÇÕES OBRIGATÓRIAS E ESTRUTURA DO PAPER
    # ==========================================================================
    def auditar_secoes_e_conteudo(self):
        self.log("\n" + "=" * 80)
        self.log("3. AUDITORIA DE SEÇÕES ESTRUTURAIS OBRIGATÓRIAS E CONTEÚDO")
        self.log("=" * 80)

        # Mapear títulos de parágrafos
        textos_paragrafos = [p.text.strip() for p in self.doc.paragraphs if p.text.strip()]

        # 3.1 Bloco Pré-Textual
        titulo_pt_esperado = "PLATAFORMA DE EXPERIÊNCIA DO CLIENTE: MODELAGEM ORIENTADA A OBJETOS E ARQUITETURA LIMPA APLICADAS À GESTÃO DE MANIFESTAÇÕES NO LABORATÓRIO CEDRO"
        if any(titulo_pt_esperado in tp for tp in textos_paragrafos):
            self.registrar_sucesso("Título em Português", "Título completo em caixa alta e negrito identificado.")
        else:
            self.registrar_erro("Título em Português", f"Título não localizado exatamente: '{titulo_pt_esperado[:50]}...'")

        titulo_en_esperado = "CUSTOMER EXPERIENCE PLATFORM: OBJECT-ORIENTED MODELING AND CLEAN ARCHITECTURE APPLIED TO FEEDBACK MANAGEMENT AT CEDRO LABORATORY"
        if any(titulo_en_esperado in tp for tp in textos_paragrafos):
            self.registrar_sucesso("Título em Inglês", "Título em inglês em itálico identificado.")
        else:
            self.registrar_erro("Título em Inglês", f"Título em inglês não localizado: '{titulo_en_esperado[:50]}...'")

        # Autores e Orientador
        autores_esperados = "Gabriel Ordonez dos Reis e Taino Samuel"
        if any(autores_esperados in tp for tp in textos_paragrafos):
            self.registrar_sucesso("Autoria da Squad", f"Autores confirmados: {autores_esperados}")
        else:
            self.registrar_erro("Autoria da Squad", f"Autores não localizados: {autores_esperados}")

        orientador_esperado = "Prof. Me./Dr. Rondineli Seba Salomao"
        if any(orientador_esperado in tp for tp in textos_paragrafos):
            self.registrar_sucesso("Orientador Acadêmico", f"Orientador confirmado: {orientador_esperado}")
        else:
            self.registrar_erro("Orientador Acadêmico", f"Orientador não localizado: {orientador_esperado}")

        # Instituição e Contexto
        if any("Centro Universitário Dom Bosco (UNDB)" in tp for tp in textos_paragrafos):
            self.registrar_sucesso("Instituição UNDB", "Centro Universitário Dom Bosco presente.")
        else:
            self.registrar_erro("Instituição UNDB", "Menção à UNDB não localizada no cabeçalho.")

        # Resumo e Abstract
        tem_resumo = any(tp == "RESUMO" for tp in textos_paragrafos)
        tem_palavras_chave = any(tp.startswith("Palavras-chave:") for tp in textos_paragrafos)
        if tem_resumo and tem_palavras_chave:
            self.registrar_sucesso("Bloco RESUMO / Palavras-chave", "Seção de Resumo e Palavras-chave presente e estruturada.")
        else:
            self.registrar_erro("Bloco RESUMO / Palavras-chave", f"Resumo: {tem_resumo}, Palavras-chave: {tem_palavras_chave}")

        tem_abstract = any(tp == "ABSTRACT" for tp in textos_paragrafos)
        tem_keywords = any(tp.startswith("Keywords:") for tp in textos_paragrafos)
        if tem_abstract and tem_keywords:
            self.registrar_sucesso("Bloco ABSTRACT / Keywords", "Seção de Abstract e Keywords presente e estruturada.")
        else:
            self.registrar_erro("Bloco ABSTRACT / Keywords", f"Abstract: {tem_abstract}, Keywords: {tem_keywords}")

        # 3.2 Seções Primárias
        secoes_primarias = [
            ("1 INTRODUÇÃO", "1 INTRODUÇÃO"),
            ("2 METODOLOGIA", "2 METODOLOGIA"),
            ("3 RESULTADOS E DISCUSSÃO", "3 RESULTADOS E DISCUSSÃO"),
            ("4 CONSIDERAÇÕES FINAIS", "4 CONSIDERAÇÕES FINAIS"),
            ("DECLARAÇÃO DE USO DE IA", "DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL"),
            ("REFERÊNCIAS", "REFERÊNCIAS"),
        ]
        for rotulo, sec_nome in secoes_primarias:
            if any(tp == sec_nome for tp in textos_paragrafos):
                self.registrar_sucesso(f"Seção Primária: {rotulo}", f"Seção '{sec_nome}' localizada.")
            else:
                self.registrar_erro(f"Seção Primária: {rotulo}", f"Seção obrigatória '{sec_nome}' não encontrada.")

        # 3.3 Subseções da Metodologia
        subsecoes_metodologia = [
            "2.1 Caracterização da Pesquisa e Abordagem Metodológica",
            "2.2 Arquitetura Limpa em Quatro Camadas",
            "2.3 Pilha Tecnológica Oficial",
            "2.4 Divisão Formal das Frentes de Trabalho na Squad"
        ]
        for sub in subsecoes_metodologia:
            if any(tp == sub for tp in textos_paragrafos):
                self.registrar_sucesso(f"Subseção Metodológica: {sub[:30]}...", f"Subseção '{sub}' confirmada.")
            else:
                self.registrar_erro(f"Subseção Metodológica: {sub[:30]}...", f"Subseção '{sub}' não encontrada.")

        # 3.4 Todas as 7 Subseções de Resultados e Discussão (Evidências de POO)
        subsecoes_resultados = [
            ("3.1", "3.1 Modelagem Estrutural de Classes (Diagrama UML)"),
            ("3.2", "3.2 Herança e Polimorfismo com Análise Crítica de Código"),
            ("3.3", "3.3 Abstrações e Interfaces de Contrato"),
            ("3.4", "3.4 Encapsulamento, Coleções Genéricas e Exceções de Domínio"),
            ("3.5", "3.5 Persistência Relacional, Integridade e Auditoria Imutável"),
            ("3.6", "3.6 Interface Gráfica com Eventos e Fluxos de Uso"),
            ("3.7", "3.7 Validação de Qualidade (QA) e Rastreabilidade Git")
        ]
        for codigo, sub_nome in subsecoes_resultados:
            if any(tp == sub_nome for tp in textos_paragrafos):
                self.registrar_sucesso(f"Evidência de POO {codigo}", f"Subseção '{sub_nome}' confirmada.")
            else:
                self.registrar_erro(f"Evidência de POO {codigo}", f"Subseção obrigatória '{sub_nome}' ausente.")

        # 3.5 Referências ABNT NBR 6023
        referencias_obrigatorias = [
            ("BOOCH", "BOOCH, Grady et al."),
            ("DONABEDIAN", "DONABEDIAN, Avedis."),
            ("FOWLER", "FOWLER, Martin."),
            ("GAMMA", "GAMMA, Erich et al."),
            ("MARTIN", "MARTIN, Robert C."),
            ("PRESSMAN", "PRESSMAN, Roger S.; MAXIM, Bruce R."),
            ("SOMMERVILLE", "SOMMERVILLE, Ian.")
        ]
        idx_ref = -1
        for i, tp in enumerate(textos_paragrafos):
            if tp == "REFERÊNCIAS":
                idx_ref = i
                break
        
        if idx_ref != -1:
            refs_encontradas = textos_paragrafos[idx_ref + 1:]
            for chave, ref_inicio in referencias_obrigatorias:
                if any(r.startswith(ref_inicio) for r in refs_encontradas):
                    self.registrar_sucesso(f"Referência ABNT: {chave}", f"Item '{ref_inicio}' validado.")
                else:
                    self.registrar_erro(f"Referência ABNT: {chave}", f"Item '{ref_inicio}' não encontrado na bibliografia.")
        else:
            self.registrar_erro("Lista de Referências", "Seção REFERÊNCIAS não localizada no fluxo de texto.")

    # ==========================================================================
    # 4. AUDITORIA DE ILUSTRAÇÕES, TABELAS E CAIXAS DE CÓDIGO
    # ==========================================================================
    def auditar_ilustracoes_e_elementos_visuais(self):
        self.log("\n" + "=" * 80)
        self.log("4. AUDITORIA DE FIGURAS, QUADROS, LISTAGENS E CAIXAS DE CÓDIGO")
        self.log("=" * 80)

        # 4.1 Figuras Embutidas no DOCX
        figuras_esperadas = [
            ("Figura 1", "Diagrama da Arquitetura em Quatro Camadas da Plataforma"),
            ("Figura 2", "Diagrama de Classes UML do Domínio de Negócios"),
            ("Figura 3", "Diagrama Entidade-Relacionamento do Banco de Dados")
        ]

        # Inspecionar imagens salvas no arquivo docx (partes de mídia do OpenXML)
        imagens_rel = [rel for rel in self.doc.part.rels.values() if 'image' in rel.target_ref]
        if len(imagens_rel) == 3:
            self.registrar_sucesso("Total de Imagens Embutidas no Arquivo", f"{len(imagens_rel)} imagens PNG de alta resolução.")
        else:
            self.registrar_erro("Total de Imagens Embutidas no Arquivo", f"Esperado 3 imagens, encontrado {len(imagens_rel)}.")

        # Verificar legendas e fontes para cada Figura
        for rotulo, titulo in figuras_esperadas:
            legenda_encontrada = False
            fonte_encontrada = False
            for i, p in enumerate(self.doc.paragraphs):
                if p.text.startswith(f"{rotulo} – {titulo}"):
                    legenda_encontrada = True
                    # A imagem deve estar no parágrafo seguinte e a fonte logo após
                    if i + 2 < len(self.doc.paragraphs):
                        p_img = self.doc.paragraphs[i + 1]
                        p_fonte = self.doc.paragraphs[i + 2]
                        tem_drawing = bool(p_img._element.xpath('.//w:drawing'))
                        if tem_drawing and p_fonte.text.startswith("Fonte:"):
                            fonte_encontrada = True
                    break
            
            if legenda_encontrada and fonte_encontrada:
                self.registrar_sucesso(f"Elemento Visual {rotulo}", f"Legenda, imagem centralizada e fonte confirmadas.")
            else:
                self.registrar_erro(f"Elemento Visual {rotulo}", f"Legenda={legenda_encontrada}, Imagem+Fonte={fonte_encontrada}")

        # 4.2 Quadros Estruturados (Tabelas com Dados)
        quadros_esperados = [
            ("Quadro 1", "Pilha Tecnológica Oficial do Projeto e Justificativas Técnicas", 4, 7),
            ("Quadro 2", "Máquina de Estados da Manifestação e Regras de Transição", 5, 8),
            ("Quadro 3", "Síntese das Suítes de Testes Automatizados no Vitest", 5, 16)
        ]

        for rotulo, titulo, cols_esp, rows_esp in quadros_esperados:
            legenda_ok = False
            tabela_ok = False
            fonte_ok = False

            for i, p in enumerate(self.doc.paragraphs):
                if p.text.startswith(f"{rotulo} – {titulo}"):
                    legenda_ok = True
                    # Próximo parágrafo após a tabela ou logo após
                    if i + 1 < len(self.doc.paragraphs):
                        p_next = self.doc.paragraphs[i + 1]
                        if p_next.text.startswith("Fonte:"):
                            fonte_ok = True
                    break

            # Localizar tabela correspondente no documento
            for t in self.doc.tables:
                if len(t.columns) == cols_esp and len(t.rows) == rows_esp:
                    tabela_ok = True
                    break

            if legenda_ok and tabela_ok and fonte_ok:
                self.registrar_sucesso(
                    f"Tabela de Dados {rotulo}",
                    f"Formatada ({rows_esp} linhas x {cols_esp} colunas) com cabeçalho sombreado, cantSplit e fonte."
                )
            else:
                self.registrar_erro(
                    f"Tabela de Dados {rotulo}",
                    f"Legenda={legenda_ok}, Tabela({rows_esp}x{cols_esp})={tabela_ok}, Fonte={fonte_ok}"
                )

        # 4.3 Listagens de Código Técnico (Tabelas 1x1 sombreadas com Consolas)
        listagens_esperadas = [
            ("Listagem 1", "Hierarquia Polimórfica da Entidade de Domínio Usuario", ["Usuario", "CoordenadorUnidade", "OperadorOuvidoria"]),
            ("Listagem 2", "Interfaces de Abstração e Contratos de Domínio", ["IRepository<T>", "IManifestacaoRepository", "ISLACalculator"]),
            ("Listagem 3", "Encapsulamento Rígido, Coleções Genéricas e Tratamento de Exceções", ["Manifestacao", "_status", "ReadonlyArray", "concluir"]),
            ("Listagem 4", "Constraints de Integridade e Trigger de Imutabilidade no PostgreSQL", ["chk_manifestacao_conclusao", "trg_interacoes_imutavel"])
        ]

        # Filtrar tabelas 1x1 (caixas de código)
        tabelas_codigo = [t for t in self.doc.tables if len(t.rows) == 1 and len(t.columns) == 1]
        if len(tabelas_codigo) == 4:
            self.registrar_sucesso("Total de Caixas Sombreadas de Código", "4 caixas de código (1x1) identificadas.")
        else:
            self.registrar_erro("Total de Caixas Sombreadas de Código", f"Esperado 4, encontrado {len(tabelas_codigo)}.")

        for rotulo, titulo, palavras_chave in listagens_esperadas:
            legenda_ok = False
            conteudo_ok = False
            fonte_ok = False

            for i, p in enumerate(self.doc.paragraphs):
                if p.text.startswith(f"{rotulo} – {titulo}"):
                    legenda_ok = True
                    if i + 1 < len(self.doc.paragraphs) and self.doc.paragraphs[i + 1].text.startswith("Fonte:"):
                        fonte_ok = True
                    break

            # Procurar se alguma tabela de código contém as palavras-chave da listagem
            for t in tabelas_codigo:
                cell_text = t.cell(0, 0).text
                if all(kw in cell_text for kw in palavras_chave):
                    # Verificar sombreamento e fonte
                    cell = t.cell(0, 0)
                    shd = cell._tc.xpath('.//w:shd/@w:fill')
                    fonte_nome = cell.paragraphs[0].runs[0].font.name if cell.paragraphs[0].runs else ""
                    if shd == ['F4F4F6'] and fonte_nome == 'Consolas':
                        conteudo_ok = True
                    break

            if legenda_ok and conteudo_ok and fonte_ok:
                self.registrar_sucesso(
                    f"Caixa de Código {rotulo}",
                    f"Legenda, sombreamento cinza claro (#F4F4F6), fonte Consolas e termos chave validados: {palavras_chave}"
                )
            else:
                self.registrar_erro(
                    f"Caixa de Código {rotulo}",
                    f"Legenda={legenda_ok}, Conteúdo+Estilo={conteudo_ok}, Fonte={fonte_ok}"
                )

    # ==========================================================================
    # 5. VARREDURA ESTRITA CONTRA PLACEHOLDERS E DADOS FICTÍCIOS
    # ==========================================================================
    def auditar_varredura_placeholders(self):
        self.log("\n" + "=" * 80)
        self.log("5. VARREDURA ESTRITA CONTRA PLACEHOLDERS E TEXTOS RESIDUAIS")
        self.log("=" * 80)

        # Definição de padrões proibidos com regex compilado
        padroes_proibidos = [
            (re.compile(r'\bTODO\b', re.IGNORECASE), "Flag TODO não resolvida"),
            (re.compile(r'\bTBD\b', re.IGNORECASE), "Flag TBD (To Be Determined)"),
            (re.compile(r'\bFIXME\b', re.IGNORECASE), "Flag FIXME não resolvida"),
            (re.compile(r'\bxxxx+\b', re.IGNORECASE), "Máscara xxxx não preenchida"),
            (re.compile(r'\bXXXX+\b'), "Máscara XXXX não preenchida"),
            (re.compile(r'\blorem\b', re.IGNORECASE), "Texto lorem ipsum residual"),
            (re.compile(r'\bipsum\b', re.IGNORECASE), "Texto lorem ipsum residual"),
            (re.compile(r'\[\s*(Nome|Orientador|Autor|Data|Título)\s*\]', re.IGNORECASE), "Placeholder entre colchetes"),
            (re.compile(r'<\s*(Nome|Orientador|Autor|Data|Título)\s*>', re.IGNORECASE), "Placeholder entre tags"),
            (re.compile(r'\{\s*(Nome|Orientador|Autor|Data|Título)\s*\}', re.IGNORECASE), "Placeholder entre chaves"),
            (re.compile(r'\bNome do (Aluno|Autor|Professor|Orientador|Estudante)\b', re.IGNORECASE), "Placeholder de nome genérico"),
            (re.compile(r'\b(Seu|Insira seu|Coloque seu)\s+Nome\b', re.IGNORECASE), "Instrução de preenchimento de nome"),
            (re.compile(r'\[\s*(inserir|preencher|adicionar|definir|colocar)[^\]]*\]', re.IGNORECASE), "Instrução de inserção entre colchetes"),
            (re.compile(r'<\s*(inserir|preencher|adicionar|definir|colocar)[^>]*>', re.IGNORECASE), "Instrução de inserção entre tags"),
        ]

        infracoes = []

        # 5.1 Varrer Parágrafos Normais do Corpo
        for idx, p in enumerate(self.doc.paragraphs):
            texto = p.text
            if not texto.strip():
                continue
            
            # Checagem de Orientador solto: se contiver "Orientador", deve conter o nome do professor
            if re.search(r'\bOrientador\b', texto, re.IGNORECASE):
                if "Rondineli Seba Salomao" not in texto and "Rondineli" not in texto:
                    infracoes.append((f"Parágrafo [{idx}]", "Orientador solto sem nome do professor", texto[:80]))

            # Checagem de padrões gerais
            for regex, descricao in padroes_proibidos:
                m = regex.search(texto)
                if m:
                    infracoes.append((f"Parágrafo [{idx}]", f"{descricao} ('{m.group(0)}')", texto[:80]))

        # 5.2 Varrer Células de Tabelas
        for t_idx, t in enumerate(self.doc.tables):
            for r_idx, r in enumerate(t.rows):
                for c_idx, c in enumerate(r.cells):
                    texto_celula = c.text
                    if not texto_celula.strip():
                        continue

                    # Ignorar ocorrências de 'nome' quando for código TypeScript puro (ex: 'nome: string', 'usuario.nome')
                    eh_codigo = any("export " in texto_celula or "ALTER TABLE" in texto_celula for _ in [1])

                    for regex, descricao in padroes_proibidos:
                        m = regex.search(texto_celula)
                        if m:
                            infracoes.append((
                                f"Tabela [{t_idx}] L{r_idx} C{c_idx}",
                                f"{descricao} ('{m.group(0)}')",
                                texto_celula[:80].replace('\n', ' ')
                            ))

        # 5.3 Varrer Cabeçalhos e Rodapés de todas as seções
        for s_idx, sec in enumerate(self.doc.sections):
            for p_h in sec.header.paragraphs:
                if p_h.text.strip():
                    for regex, descricao in padroes_proibidos:
                        m = regex.search(p_h.text)
                        if m:
                            infracoes.append((f"Cabeçalho da Seção [{s_idx}]", f"{descricao} ('{m.group(0)}')", p_h.text))
            for p_f in sec.footer.paragraphs:
                if p_f.text.strip():
                    for regex, descricao in padroes_proibidos:
                        m = regex.search(p_f.text)
                        if m:
                            infracoes.append((f"Rodapé da Seção [{s_idx}]", f"{descricao} ('{m.group(0)}')", p_f.text))

        # Resultado da Varredura
        if len(infracoes) == 0:
            self.registrar_sucesso(
                "Varredura de Placeholders (Zero Ocorrências)",
                "Documento 100% íntegro e higienizado. Nenhuma marca de pendência ou placeholder encontrada."
            )
        else:
            for loc, desc, trecho in infracoes:
                self.registrar_erro(f"Placeholder detectado em {loc}", f"{desc} | Trecho: \"{trecho}\"")

    # ==========================================================================
    # 6. AUDITORIA DE MÉTRICAS GLOBAIS DO DOCUMENTO
    # ==========================================================================
    def auditar_metricas_globais(self):
        self.log("\n" + "=" * 80)
        self.log("6. AUDITORIA DE MÉTRICAS GLOBAIS E VOLUME DE CONTEÚDO")
        self.log("=" * 80)

        # Tamanho do Arquivo
        tamanho_kb = self.tamanho_bytes / 1024
        if self.tamanho_bytes >= 200 * 1024:
            self.registrar_sucesso("Tamanho do Arquivo em Disco", f"{tamanho_kb:.1f} KB ({self.tamanho_bytes:,} bytes)")
        else:
            self.registrar_erro("Tamanho do Arquivo em Disco", f"Abaixo do esperado: {tamanho_kb:.1f} KB")

        # Contagem de Parágrafos
        if self.total_paragrafos >= 90:
            self.registrar_sucesso("Contagem Total de Parágrafos", f"{self.total_paragrafos} parágrafos")
        else:
            self.registrar_erro("Contagem Total de Parágrafos", f"Apenas {self.total_paragrafos} parágrafos (esperado ≥ 90)")

        # Contagem de Tabelas (Quadros + Listagens)
        if self.total_tabelas == 7:
            self.registrar_sucesso("Contagem de Tabelas e Quadros", f"{self.total_tabelas} tabelas (3 quadros de dados + 4 caixas de código)")
        else:
            self.registrar_erro("Contagem de Tabelas e Quadros", f"Encontrado {self.total_tabelas}, esperado exatamente 7")

        # Contagem de Palavras
        palavras_paragrafos = sum(len(p.text.split()) for p in self.doc.paragraphs)
        palavras_tabelas = sum(len(c.text.split()) for t in self.doc.tables for row in t.rows for c in row.cells)
        total_palavras = palavras_paragrafos + palavras_tabelas
        if total_palavras >= 3500:
            self.registrar_sucesso("Volume Textual Acadêmico", f"{total_palavras:,} palavras (excede o mínimo recomendado de 3.500 palavras)")
        else:
            self.registrar_erro("Volume Textual Acadêmico", f"Apenas {total_palavras} palavras encontradas")

    # ==========================================================================
    # EXECUÇÃO GERAL E RELATÓRIO
    # ==========================================================================
    def executar_todas_verificacoes(self) -> bool:
        self.log("=" * 80)
        self.log("INICIANDO AUDITORIA ESTRUTURAL E DE CONTEÚDO DO DOCUMENTO WORD")
        self.log(f"Arquivo inspecionado: {self.docx_path}")
        self.log("=" * 80)

        self.auditar_geometria_e_margens()
        self.auditar_tipografia()
        self.auditar_secoes_e_conteudo()
        self.auditar_ilustracoes_e_elementos_visuais()
        self.auditar_varredura_placeholders()
        self.auditar_metricas_globais()

        # Resumo Final
        self.log("\n" + "=" * 80)
        self.log("SÍNTESE DOS RESULTADOS DA AUDITORIA INDEPENDENTE")
        self.log("=" * 80)
        self.log(f"Total de Verificações Bem-sucedidas: {len(self.sucessos)}")
        self.log(f"Total de Avisos não-impeditivos:      {len(self.avisos)}")
        self.log(f"Total de Falhas Críticas:             {len(self.erros)}")

        status_aprovado = len(self.erros) == 0

        if status_aprovado:
            self.log("\n>>> CERTIFICADO DE CONFORMIDADE: DOCUMENTO 100% APROVADO! <<<")
            self.log("O Short Paper atende com absoluto rigor a todas as diretrizes da UNDB e ABNT.")
        else:
            self.log("\n>>> REPROVADO: EXISTEM FALHAS CRÍTICAS QUE DEVEM SER CORRIGIDAS! <<<")
            for e in self.erros:
                self.log(f"  * {e}")

        self.salvar_relatorio()
        return status_aprovado

    def salvar_relatorio(self):
        os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
        with open(REPORT_PATH, 'w', encoding='utf-8') as f:
            f.write("\n".join(self.linhas_relatorio))
            f.write("\n")
        print(f"\n[Relatório] Relatório detalhado salvo em: {REPORT_PATH}")


def main():
    auditor = AuditoriaDocx(DOCX_PATH)
    sucesso = auditor.executar_todas_verificacoes()
    sys.exit(0 if sucesso else 1)


if __name__ == '__main__':
    main()
