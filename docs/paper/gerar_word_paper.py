#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
GERADOR AUTOMATIZADO DO SHORT PAPER EM WORD (.DOCX) NO PADRÃO UNDB / ABNT
Projeto: Plataforma de Experiência do Cliente - Laboratório Cedro
Autores: Gabriel Ordonez dos Reis e Taino Samuel
Orientador: Prof. Me./Dr. Rondineli Seba Salomao
Instituição: Centro Universitário Dom Bosco (UNDB)
================================================================================
"""

import os
import re
import io
import sys
import json
import base64
import urllib.request
from typing import List, Tuple, Dict, Any, Optional

import docx
from docx.shared import Cm, Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MD_PATH = os.path.join(BASE_DIR, 'SHORT_PAPER_CEDRO_POO.md')
DOCX_PATH = os.path.join(BASE_DIR, 'SHORT_PAPER_CEDRO_POO.docx')
FIGURAS_DIR = os.path.join(BASE_DIR, 'figuras')

# ==============================================================================
# DIAGRAMAS MERMAID PARA AS FIGURAS
# ==============================================================================
MERMAID_DIAGRAMS = {
    'figura1_arquitetura.png': """flowchart TD
    subgraph Presentation["1. Camada de Apresentação (Presentation Layer)"]
        Routes["Rotas Express (/api/...)"]
        Middlewares["Middlewares de Autenticação JWT e RBAC"]
        Controllers["Controllers HTTP (Adaptação Request / Response)"]
    end

    subgraph Application["2. Camada de Aplicação (Application Layer)"]
        UseCases["Casos de Uso / Services (Orquestração de Regras)"]
        DTOs["Data Transfer Objects (DTOs de Entrada e Saída)"]
    end

    subgraph Domain["3. Camada de Domínio (Domain Layer - Núcleo Puro POO)"]
        Entities["Entidades Ricas (Usuario, Manifestacao, Pesquisa, Unidade)"]
        Contracts["Interfaces de Contrato (IRepository, INotificador, ISLACalculator)"]
        Exceptions["Exceções Customizadas de Domínio (DominioError)"]
    end

    subgraph Infrastructure["4. Camada de Infraestrutura (Infrastructure Layer)"]
        Database["PostgreSQL / Supabase (Persistência Relacional)"]
        Repos["Repositórios Concretos (SupabaseManifestacaoRepository)"]
        NotifierAdapters["Adaptadores de Notificação e Protocolo"]
    end

    Routes --> Middlewares --> Controllers
    Controllers --> UseCases
    UseCases --> Entities
    UseCases --> Contracts
    Repos -.->|Implementa| Contracts
    NotifierAdapters -.->|Implementa| Contracts""",

    'figura2_classes_uml.png': """classDiagram
    class Usuario {
        <<abstract>>
        +id: string
        #_nome: string
        #_email: string
        +perfil: PerfilUsuario
        +unidadeId: string | null
        #_ativo: boolean
        +criadoEm: Date
        +nome() string
        +email() string
        +ativo() boolean
        +ativar() void
        +desativar() void
        +atualizarDados(nome: string, email: string) void
        +podeVisualizarManifestacao(unidadeId: string)* boolean
        +podeTratarPelaUnidade(unidadeId: string)* boolean
        +podeEscalonar()* boolean
        +podeSolicitarComplemento()* boolean
        +podeConcluir()* boolean
        +podeGerenciarSistema()* boolean
    }

    class Administrador {
        +podeVisualizarManifestacao(unidadeId: string) boolean
        +podeTratarPelaUnidade(unidadeId: string) boolean
        +podeEscalonar() boolean
        +podeSolicitarComplemento() boolean
        +podeConcluir() boolean
        +podeGerenciarSistema() boolean
    }

    class OperadorOuvidoria {
        +podeVisualizarManifestacao(unidadeId: string) boolean
        +podeTratarPelaUnidade(unidadeId: string) boolean
        +podeEscalonar() boolean
        +podeSolicitarComplemento() boolean
        +podeConcluir() boolean
        +podeGerenciarSistema() boolean
    }

    class CoordenadorUnidade {
        +podeVisualizarManifestacao(unidadeId: string) boolean
        +podeTratarPelaUnidade(unidadeId: string) boolean
        +podeEscalonar() boolean
        +podeSolicitarComplemento() boolean
        +podeConcluir() boolean
        +podeGerenciarSistema() boolean
    }

    class Manifestacao {
        +id: string
        +protocolo: string
        +respostaId: string
        -_unidadeId: string
        -_status: StatusManifestacao
        -_prioridade: PrioridadeManifestacao
        -_responsavelId: string | null
        -_prazoResposta: Date
        +criadoEm: Date
        -_concluidoEm: Date | null
        -interacoes: Interacao[]
        -respostasUnidade: RespostaUnidade[]
        -escalonamentos: Escalonamento[]
        +criar(params: ManifestacaoCriarParams)$ Manifestacao
        +reconstituir(params: ManifestacaoReconstituirParams)$ Manifestacao
        +iniciarTratamento(usuario: Usuario) Interacao
        +registrarRespostaUnidade(usuario: Usuario, texto: string) RespostaUnidade
        +solicitarComplemento(usuario: Usuario, motivo: string) Interacao
        +escalonar(usuario: Usuario, motivo: string, nivel: number) Escalonamento
        +concluir(usuario: Usuario, justificativa: string) Interacao
        +isAtrasada(dataRef: Date) boolean
        +isPendente(dataRef: Date) boolean
    }

    class Interacao {
        +id: string
        +manifestacaoId: string
        +usuarioId: string | null
        +tipo: TipoInteracao
        +texto: string
        +statusAnterior: StatusManifestacao | null
        +statusNovo: StatusManifestacao
        +dataHora: Date
    }

    class RespostaUnidade {
        +id: string
        +manifestacaoId: string
        +usuarioId: string
        +conteudo: string
        +dataHora: Date
    }

    class Escalonamento {
        +id: string
        +manifestacaoId: string
        +motivo: string
        +nivel: number
        +usuarioId: string
        +dataHora: Date
    }

    class Unidade {
        +id: string
        +nome: string
        +responsavelNome: string | null
        +prazoPadraoHoras: number
        +ativa: boolean
        +criadoEm: Date
    }

    class Pesquisa {
        +id: string
        +titulo: string
        +descricao: string
        +periodo: string
        +ativa: boolean
        +canal: CanalPesquisa
        +unidadePadraoId: string | null
    }

    class RespostaPesquisa {
        +id: string
        +pesquisaId: string
        +unidadeId: string
        +clienteAtendimento: string
        +nota: number
        +comentario: string | null
        +dataHora: Date
    }

    Usuario <|-- Administrador : Herança
    Usuario <|-- OperadorOuvidoria : Herança
    Usuario <|-- CoordenadorUnidade : Herança
    Manifestacao *-- Interacao : Composição (1..*)
    Manifestacao *-- RespostaUnidade : Composição (0..*)
    Manifestacao *-- Escalonamento : Composição (0..*)
    Manifestacao --> Unidade : Referencia
    Manifestacao --> RespostaPesquisa : Origem
    Pesquisa --> RespostaPesquisa : Coleta (1..*)""",

    'figura3_er_banco.png': """erDiagram
    UNIDADES ||--o{ USUARIOS : "aloca coordenadores"
    UNIDADES ||--o{ MANIFESTACOES : "responde por"
    PESQUISAS ||--o{ RESPOSTAS_PESQUISA : "coleta"
    RESPOSTAS_PESQUISA ||--|| MANIFESTACOES : "origina automaticamente"
    USUARIOS ||--o{ MANIFESTACOES : "assume responsabilidade"
    MANIFESTACOES ||--|{ INTERACOES : "registra trilha de auditoria"
    MANIFESTACOES ||--o{ RESPOSTAS_UNIDADE : "recebe parecer da unidade"
    MANIFESTACOES ||--o{ ESCALONAMENTOS : "registra escalonamento"
    USUARIOS ||--o{ INTERACOES : "executa ação"
    USUARIOS ||--o{ RESPOSTAS_UNIDADE : "emite resposta"
    USUARIOS ||--o{ ESCALONAMENTOS : "solicita escalonamento"

    UNIDADES {
        uuid id PK
        varchar nome
        varchar responsavel_nome
        boolean ativa
        integer prazo_padrao_horas
        timestamptz criado_em
    }

    USUARIOS {
        uuid id PK
        varchar nome
        varchar email UK
        varchar perfil
        uuid unidade_id FK
        boolean ativo
        timestamptz criado_em
    }

    PESQUISAS {
        uuid id PK
        varchar titulo
        text descricao
        varchar periodo
        boolean ativa
        varchar canal
        uuid unidade_padrao_id FK
        timestamptz criado_em
    }

    RESPOSTAS_PESQUISA {
        uuid id PK
        uuid pesquisa_id FK
        uuid unidade_id FK
        varchar cliente_atendimento
        smallint nota
        text comentario
        timestamptz data_hora
    }

    MANIFESTACOES {
        uuid id PK
        varchar protocolo UK
        uuid resposta_id FK
        uuid unidade_id FK
        varchar status
        varchar prioridade
        uuid responsavel_id FK
        timestamptz prazo_resposta
        timestamptz criado_em
        timestamptz concluido_em
    }

    INTERACOES {
        uuid id PK
        uuid manifestacao_id FK
        uuid usuario_id FK
        varchar tipo
        text texto
        varchar status_anterior
        varchar status_novo
        timestamptz data_hora
    }

    RESPOSTAS_UNIDADE {
        uuid id PK
        uuid manifestacao_id FK
        uuid usuario_id FK
        text conteudo
        timestamptz data_hora
    }

    ESCALONAMENTOS {
        uuid id PK
        uuid manifestacao_id FK
        text motivo
        smallint nivel
        uuid usuario_id FK
        timestamptz data_hora
    }"""
}

def garantir_figuras():
    """Garante a existência das imagens das figuras PNG em docs/paper/figuras."""
    os.makedirs(FIGURAS_DIR, exist_ok=True)
    for fname, code in MERMAID_DIAGRAMS.items():
        out_path = os.path.join(FIGURAS_DIR, fname)
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            continue
        try:
            print(f"[Figuras] Baixando renderização de {fname} via mermaid.ink...")
            obj = {'code': code, 'mermaid': {'theme': 'default'}}
            json_str = json.dumps(obj)
            b64 = base64.urlsafe_b64encode(json_str.encode('utf-8')).decode('ascii')
            url = f'https://mermaid.ink/img/{b64}?type=png'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read()
                with open(out_path, 'wb') as f:
                    f.write(content)
            print(f"[Figuras] Sucesso: {fname} salvo ({len(content)} bytes)")
        except Exception as e:
            print(f"[Figuras] Aviso: Não foi possível obter {fname}: {e}")

# ==============================================================================
# FUNÇÕES DE ESTILIZAÇÃO E XML DO PYTHON-DOCX
# ==============================================================================

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    """Define o espaçamento interno (padding em dxa) de uma célula de tabela."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex="F4F4F6"):
    """Define a cor de fundo (shading) de uma célula."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC", sz="4"):
    """Aplica bordas finas sólidas personalizadas a uma célula."""
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{top}"/>'
        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{left}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{bottom}"/>'
        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{right}"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)

def make_row_header(row):
    """Marca uma linha de tabela para repetir como cabeçalho no topo de cada página."""
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def prevent_row_split(row):
    """Impede que uma linha de tabela se quebre no meio de uma quebra de página."""
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

# ==============================================================================
# TOKENIZADOR INLINE DE MARKDOWN
# ==============================================================================

def parse_inlines(text: str) -> List[Tuple[str, str]]:
    """
    Analisa marcações inline de Markdown em tuplas (tipo, texto):
    Tipos: 'normal', 'bold', 'italic', 'bold_italic', 'code'.
    """
    text = text.replace(r'$\le 2$', '≤ 2').replace(r'$\le 6$', '≤ 6').replace(r'$\le$', '≤')
    token_pattern = re.compile(r'(`[^`]+`|\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)')
    tokens = []
    last_idx = 0
    for match in token_pattern.finditer(text):
        start, end = match.span()
        if start > last_idx:
            tokens.append(('normal', text[last_idx:start]))
        val = match.group(0)
        if val.startswith('`') and val.endswith('`'):
            tokens.append(('code', val[1:-1]))
        elif val.startswith('***') and val.endswith('***'):
            tokens.append(('bold_italic', val[3:-3]))
        elif val.startswith('**') and val.endswith('**'):
            inner = val[2:-2]
            if '*' in inner:
                sub_pattern = re.compile(r'(\*.*?\*)')
                sub_last = 0
                for sm in sub_pattern.finditer(inner):
                    s_start, s_end = sm.span()
                    if s_start > sub_last:
                        tokens.append(('bold', inner[sub_last:s_start]))
                    tokens.append(('bold_italic', sm.group(0)[1:-1]))
                    sub_last = s_end
                if sub_last < len(inner):
                    tokens.append(('bold', inner[sub_last:]))
            else:
                tokens.append(('bold', inner))
        elif val.startswith('*') and val.endswith('*'):
            tokens.append(('italic', val[1:-1]))
        last_idx = end
    if last_idx < len(text):
        tokens.append(('normal', text[last_idx:]))
    return tokens

def add_runs_to_paragraph(p, tokens: List[Tuple[str, str]], base_font_size=12, base_font_name="Arial"):
    """Insere runs formatados dentro de um parágrafo do python-docx."""
    for kind, txt in tokens:
        if not txt:
            continue
        run = p.add_run(txt)
        run.font.name = base_font_name
        run.font.size = Pt(base_font_size)
        run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

        if kind == 'bold':
            run.bold = True
        elif kind == 'italic':
            run.italic = True
        elif kind == 'bold_italic':
            run.bold = True
            run.italic = True
        elif kind == 'code':
            run.font.name = 'Consolas'
            run.font.size = Pt(base_font_size - 1.5)
            run.font.color.rgb = RGBColor(0x22, 0x22, 0x22)

# ==============================================================================
# CONSTRUTOR DO DOCUMENTO UNDB / ABNT
# ==============================================================================

class UndbPaperBuilder:
    def __init__(self):
        self.doc = docx.Document()
        self._configure_document()

    def _configure_document(self):
        """Configura margens, tamanho A4 e estilos básicos do documento."""
        section = self.doc.sections[0]
        # Tamanho A4 (21,0 cm x 29,7 cm)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        # Margens Oficiais ABNT / UNDB: Sup 3cm, Esq 3cm, Inf 2cm, Dir 2cm
        section.top_margin = Cm(3.0)
        section.left_margin = Cm(3.0)
        section.bottom_margin = Cm(2.0)
        section.right_margin = Cm(2.0)

        # Configurar Estilo Normal
        style_normal = self.doc.styles['Normal']
        style_normal.font.name = 'Arial'
        style_normal.font.size = Pt(12)
        style_normal.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
        style_normal.paragraph_format.line_spacing = 1.5
        style_normal.paragraph_format.space_before = Pt(0)
        style_normal.paragraph_format.space_after = Pt(0)
        style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    def add_title_pt(self, title: str):
        """Título do artigo em português: 12 pt, Negrito, Centralizado, Caixa Alta."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(title.strip().upper())
        run.bold = True
        run.font.name = 'Arial'
        run.font.size = Pt(12)

    def add_title_en(self, title_en: str):
        """Título do artigo em inglês: 12 pt, Itálico, Centralizado."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(16)
        run = p.add_run(title_en.strip())
        run.italic = True
        run.font.name = 'Arial'
        run.font.size = Pt(12)

    def add_authors_block(self, authors: str, advisor: str, institution: str, context: str, partner: str):
        """Bloco de identificação dos autores e orientador alinhado à direita."""
        lines = [
            (f"{authors}", True, 12),
            (f"Orientador: {advisor}", False, 12),
            (f"{institution}", False, 10),
            (f"{context}", False, 10),
            (f"{partner}", False, 10),
        ]
        for text, is_bold, size in lines:
            p = self.doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.first_line_indent = Cm(0)
            run = p.add_run(text)
            run.bold = is_bold
            run.font.name = 'Arial'
            run.font.size = Pt(size)
        
        # Espaçamento de 1,5 linha antes do Resumo
        p_space = self.doc.add_paragraph()
        p_space.paragraph_format.line_spacing = 1.5
        p_space.paragraph_format.space_before = Pt(0)
        p_space.paragraph_format.space_after = Pt(0)

    def add_resumo_block(self, title: str, text: str, keywords_label: str, keywords_text: str):
        """Adiciona bloco de RESUMO ou ABSTRACT com formatação estrita UNDB."""
        # Título da seção (RESUMO / ABSTRACT): 12 pt, Negrito, Centralizado
        p_title = self.doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title.paragraph_format.line_spacing = 1.5
        p_title.paragraph_format.space_before = Pt(12)
        p_title.paragraph_format.space_after = Pt(6)
        run_title = p_title.add_run(title.upper())
        run_title.bold = True
        run_title.font.name = 'Arial'
        run_title.font.size = Pt(12)

        # Corpo do texto: 12 pt, Justificado, Espaçamento simples (1,0), sem recuo de 1ª linha
        p_body = self.doc.add_paragraph()
        p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_body.paragraph_format.line_spacing = 1.0
        p_body.paragraph_format.space_before = Pt(0)
        p_body.paragraph_format.space_after = Pt(6)
        p_body.paragraph_format.first_line_indent = Cm(0)
        tokens = parse_inlines(text.strip())
        add_runs_to_paragraph(p_body, tokens, base_font_size=12)

        # Palavras-chave / Keywords
        p_kw = self.doc.add_paragraph()
        p_kw.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_kw.paragraph_format.line_spacing = 1.0
        p_kw.paragraph_format.space_before = Pt(6)
        p_kw.paragraph_format.space_after = Pt(18)
        p_kw.paragraph_format.first_line_indent = Cm(0)
        run_lbl = p_kw.add_run(keywords_label)
        run_lbl.bold = True
        run_lbl.font.name = 'Arial'
        run_lbl.font.size = Pt(12)
        run_val = p_kw.add_run(f" {keywords_text.strip()}")
        run_val.bold = False
        run_val.font.name = 'Arial'
        run_val.font.size = Pt(12)

    def add_heading_1(self, text: str):
        """Seção Primária: 12 pt, Negrito, Caixa Alta, Alinhado à Esquerda."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.first_line_indent = Cm(0)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text.strip().upper())
        run.bold = True
        run.font.name = 'Arial'
        run.font.size = Pt(12)

    def add_heading_2(self, text: str):
        """Subseção: 12 pt, Negrito, Caixa Mista, Alinhado à Esquerda."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.first_line_indent = Cm(0)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text.strip())
        run.bold = True
        run.font.name = 'Arial'
        run.font.size = Pt(12)

    def add_paragraph(self, text: str):
        """Parágrafo regular: 12 pt, Justificado, 1,5 linha, recuo 2,0 cm."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.first_line_indent = Cm(2.0)
        tokens = parse_inlines(text.strip())
        add_runs_to_paragraph(p, tokens, base_font_size=12)

    def add_list_item(self, text: str, prefix: str = "• "):
        """Item de lista (ordenada ou com marcadores): recuo 2,0 cm e deslocamento -0,75 cm."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.left_indent = Cm(2.0)
        p.paragraph_format.first_line_indent = Cm(-0.75)
        
        # Prefixo
        run_pfx = p.add_run(prefix)
        run_pfx.bold = True
        run_pfx.font.name = 'Arial'
        run_pfx.font.size = Pt(12)

        tokens = parse_inlines(text.strip())
        add_runs_to_paragraph(p, tokens, base_font_size=12)

    def add_caption(self, label: str, title: str):
        """Legenda de elemento (Quadro, Figura, Listagem): 11 pt, com identificador em negrito."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.first_line_indent = Cm(0)
        p.paragraph_format.keep_with_next = True

        run_lbl = p.add_run(label.strip() + " ")
        run_lbl.bold = True
        run_lbl.font.name = 'Arial'
        run_lbl.font.size = Pt(11)

        run_title = p.add_run(f"– {title.strip()}")
        run_title.bold = False
        run_title.font.name = 'Arial'
        run_title.font.size = Pt(11)

    def add_source(self, source_text: str):
        """Fonte de elemento (Quadro, Figura, Listagem): 10 pt regular, espaçamento simples."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(12)
        p.paragraph_format.first_line_indent = Cm(0)

        run = p.add_run(source_text.strip())
        run.bold = False
        run.font.name = 'Arial'
        run.font.size = Pt(10)

    def add_figure_image(self, label: str, title: str, img_name: str, width_cm: float, source_text: str):
        """Insere uma figura completa com legenda superior, imagem centralizada e fonte inferior."""
        self.add_caption(label, title)
        
        img_path = os.path.join(FIGURAS_DIR, img_name)
        if os.path.exists(img_path):
            p_img = self.doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.line_spacing = 1.0
            p_img.paragraph_format.space_before = Pt(0)
            p_img.paragraph_format.space_after = Pt(0)
            p_img.paragraph_format.first_line_indent = Cm(0)
            p_img.paragraph_format.keep_with_next = True
            p_img.add_run().add_picture(img_path, width=Cm(width_cm))
        else:
            p_err = self.doc.add_paragraph()
            p_err.add_run(f"[Imagem {img_name} não encontrada]").italic = True
        
        self.add_source(source_text)

    def add_code_listing(self, label: str, title: str, code_content: str, source_text: str = "Fonte: Autores (2026)."):
        """Insere uma listagem de código formatada em caixa sombreada com borda leve e Consolas 9.5pt."""
        self.add_caption(label, title)

        table = self.doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        cell.width = Cm(16.0)

        set_cell_shading(cell, "F4F4F6")
        set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC", sz="4")
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)

        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.first_line_indent = Cm(0)

        # Adicionar o código preservando identação
        clean_code = code_content.strip()
        run = p.add_run(clean_code)
        run.font.name = 'Consolas'
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0x1E, 0x1E, 0x1E)

        prevent_row_split(table.rows[0])
        self.add_source(source_text)

    def add_quadro(self, label: str, title: str, headers: List[str], rows: List[List[str]], col_widths: List[float], source_text: str):
        """Insere um Quadro / Tabela com cabeçalho sombreado, bordas limpas e largura proporcional."""
        self.add_caption(label, title)

        table = self.doc.add_table(rows=len(rows) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        # Linha de Cabeçalho
        hdr_row = table.rows[0]
        make_row_header(hdr_row)
        for col_idx, h_text in enumerate(headers):
            cell = hdr_row.cells[col_idx]
            cell.width = Cm(col_widths[col_idx])
            set_cell_shading(cell, "EAEAEA")
            set_cell_borders(cell, top="999999", bottom="999999", left="CCCCCC", right="CCCCCC", sz="6")
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.first_line_indent = Cm(0)
            
            run = p.add_run(h_text.strip())
            run.bold = True
            run.font.name = 'Arial'
            run.font.size = Pt(10)

        # Linhas de Dados
        for r_idx, row_data in enumerate(rows):
            row = table.rows[r_idx + 1]
            prevent_row_split(row)
            
            # Checar se é linha de Total / Síntese
            is_total_row = "TOTAL" in str(row_data[0]).upper()
            row_shading = "F7F7F7" if (r_idx % 2 == 1 and not is_total_row) else ("EAEAEA" if is_total_row else "FFFFFF")

            for col_idx, cell_value in enumerate(row_data):
                cell = row.cells[col_idx]
                cell.width = Cm(col_widths[col_idx])
                if row_shading != "FFFFFF":
                    set_cell_shading(cell, row_shading)
                set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left="CCCCCC", right="CCCCCC", sz="4")
                set_cell_margins(cell, top=70, bottom=70, left=90, right=90)

                p = cell.paragraphs[0]
                # Alinhamento: colunas numéricas ou curtas centralizadas
                if col_idx in (2, 3) and len(str(cell_value)) <= 15:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                
                p.paragraph_format.line_spacing = 1.05
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.first_line_indent = Cm(0)

                tokens = parse_inlines(str(cell_value).strip())
                add_runs_to_paragraph(p, tokens, base_font_size=9.5)
                if is_total_row:
                    for r in p.runs:
                        r.bold = True

        self.add_source(source_text)

    def add_reference_item(self, text: str):
        """Item de Referência ABNT: 12 pt, Alinhado à esquerda, espaçamento simples, 10pt depois."""
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(10)
        p.paragraph_format.first_line_indent = Cm(0)
        tokens = parse_inlines(text.strip())
        add_runs_to_paragraph(p, tokens, base_font_size=12)

    def save(self, filepath: str):
        """Salva o documento compilado no caminho fornecido."""
        self.doc.save(filepath)
        print(f"[Documento] Salvo com sucesso em: {filepath}")

# ==============================================================================
# LEITURA E GERAÇÃO PRINCIPAL A PARTIR DO MARKDOWN
# ==============================================================================

def extrair_tabela_markdown(linhas: List[str]) -> Tuple[List[str], List[List[str]]]:
    """Extrai cabeçalhos e linhas de uma tabela formatada em Markdown."""
    tabela_linhas = [l.strip() for l in linhas if l.strip().startswith('|') and l.strip().endswith('|')]
    if len(tabela_linhas) < 2:
        return [], []
    
    # Cabeçalho
    raw_header = tabela_linhas[0].strip('|').split('|')
    headers = [c.strip().replace('**', '') for c in raw_header]

    # Linhas de dados (pulando a linha separadora com :---)
    rows = []
    for line in tabela_linhas[2:]:
        raw_cells = line.strip('|').split('|')
        cells = [c.strip() for c in raw_cells]
        rows.append(cells)

    return headers, rows

def extrair_codigo_markdown(linhas: List[str]) -> Tuple[str, str]:
    """Extrai a linguagem e o corpo de um bloco de código Markdown."""
    primeira_linha = linhas[0].strip()
    lang = primeira_linha[3:].strip()
    codigo_linhas = linhas[1:-1]
    
    # Remover comentário inicial de listagem caso exista
    if codigo_linhas and (codigo_linhas[0].strip().startswith('// Listagem') or codigo_linhas[0].strip().startswith('-- Listagem')):
        codigo_linhas = codigo_linhas[1:]
    
    codigo_corpo = "\n".join(codigo_linhas)
    return lang, codigo_corpo

def construir_paper_completo():
    """Lê o arquivo SHORT_PAPER_CEDRO_POO.md e gera o documento Word completo."""
    print("=" * 80)
    print("GERANDO SHORT PAPER NO PADRÃO UNDB / ABNT")
    print(f"Fonte Markdown: {MD_PATH}")
    print(f"Destino Word:   {DOCX_PATH}")
    print("=" * 80)

    garantir_figuras()

    if not os.path.exists(MD_PATH):
        raise FileNotFoundError(f"Arquivo não encontrado: {MD_PATH}")

    with open(MD_PATH, 'r', encoding='utf-8') as f:
        md_text = f.read()

    builder = UndbPaperBuilder()

    # 1. TÍTULO E CABEÇALHO
    builder.add_title_pt("PLATAFORMA DE EXPERIÊNCIA DO CLIENTE: MODELAGEM ORIENTADA A OBJETOS E ARQUITETURA LIMPA APLICADAS À GESTÃO DE MANIFESTAÇÕES NO LABORATÓRIO CEDRO")
    builder.add_title_en("CUSTOMER EXPERIENCE PLATFORM: OBJECT-ORIENTED MODELING AND CLEAN ARCHITECTURE APPLIED TO FEEDBACK MANAGEMENT AT CEDRO LABORATORY")
    builder.add_authors_block(
        authors="Gabriel Ordonez dos Reis e Taino Samuel",
        advisor="Prof. Me./Dr. Rondineli Seba Salomao",
        institution="Centro Universitário Dom Bosco (UNDB) — Engenharia de Software / Ciência da Computação",
        context="Projeto Aplicado (PjBL) — Disciplina de Programação Orientada a Objetos",
        partner="Parceiro Organizacional: Laboratório Cedro / Núcleo de Inovação e Tecnologia (NIT)"
    )

    # 2. RESUMO
    resumo_pt = (
        "Desenvolver uma plataforma computacional para modernizar a gestão de satisfação e resolução "
        "de manifestações no Laboratório Cedro, em substituição ao sistema legado INDECX, enfrentando as "
        "dificuldades de falta de rastreabilidade de SLA, ausência de automação na abertura de chamados críticos "
        "e frágil governança de dados. Empregar uma metodologia de desenvolvimento aplicada (PjBL) alicerçada "
        "nos princípios da Arquitetura Limpa e nos quatro pilares da Programação Orientada a Objetos (POO) em "
        "TypeScript estrito, com back-end em Node.js/Express, persistência relacional com integridade referencial "
        "em PostgreSQL/Supabase e interface responsiva em Next.js. Implementar classes de domínio ricas, "
        "hierarquias polimórficas de controle de acesso (Usuario), encapsulamento rígido com histórico imutável "
        "(Manifestacao), contratos desacoplados via interfaces (IRepository, INotificador) e captura de pesquisas "
        "via QR Code. Obter como resultados a validação integral das regras de negócio por meio de 71 testes "
        "automatizados (Vitest), eliminação de estados inconsistentes no ciclo de vida das ocorrências e entrega "
        "de um MVP funcional em ambiente de produção (VPS/Coolify). Concluir que o rigor de modelagem POO "
        "viabilizou alta manutenibilidade, fechamento do ciclo de feedback do paciente e elevação dos padrões de "
        "qualidade no ambiente clínico."
    )
    builder.add_resumo_block(
        title="RESUMO",
        text=resumo_pt,
        keywords_label="Palavras-chave:",
        keywords_text="Programação Orientada a Objetos. Arquitetura Limpa. Laboratório Cedro. Gestão de Manifestações. TypeScript."
    )

    # 3. ABSTRACT
    abstract_en = (
        "Develop a computational platform to modernize customer satisfaction management and feedback resolution "
        "at Cedro Laboratory, replacing the legacy INDECX system to overcome difficulties regarding lack of SLA "
        "traceability, absent automation in critical ticket opening, and fragile data governance. Employ an applied "
        "software engineering methodology (PjBL) anchored in Clean Architecture principles and the four core pillars "
        "of Object-Oriented Programming (OOP) in strict TypeScript, featuring a Node.js/Express back-end, relational "
        "persistence with referential integrity in PostgreSQL/Supabase, and a responsive Next.js interface. "
        "Implement rich domain models, polymorphic access-control hierarchies (Usuario), strict encapsulation with "
        "immutable interaction histories (Manifestacao), decoupled interface contracts (IRepository, INotificador), "
        "and survey capturing via QR Code. Achieve as results the complete validation of business rules through 71 "
        "automated tests (Vitest), eliminating inconsistent states throughout ticket lifecycles and delivering a "
        "production-ready MVP on a VPS/Coolify environment. Conclude that rigorous object-oriented domain modeling "
        "enabled high maintainability, closed the patient feedback loop, and enhanced operational quality standards in "
        "clinical diagnostics."
    )
    builder.add_resumo_block(
        title="ABSTRACT",
        text=abstract_en,
        keywords_label="Keywords:",
        keywords_text="Object-Oriented Programming. Clean Architecture. Cedro Laboratory. Feedback Management. TypeScript."
    )

    # 4. 1 INTRODUÇÃO
    builder.add_heading_1("1 INTRODUÇÃO")
    builder.add_paragraph(
        "No segmento de medicina diagnóstica e análises clínicas, a qualidade assistencial e a satisfação do paciente "
        "extrapolam a precisão analítica dos laudos laboratoriais, englobando de forma indelével a experiência vivenciada "
        "em todas as etapas da jornada do cliente. De acordo com os preceitos clássicos da avaliação em saúde introduzidos "
        "por Donabedian (2005), os resultados clínicos e institucionais dependem diretamente da qualidade estrutural e "
        "processual dos serviços prestados. Nesse cenário de alta exigência, o Laboratório Cedro, com ampla atuação no estado "
        "do Maranhão, estabeleceu cooperação técnico-científica com o Núcleo de Inovação e Tecnologia (NIT) do Centro Universitário "
        "Dom Bosco (UNDB) para enfrentar os gargalos críticos na gestão de feedback e na ouvidoria de suas unidades de atendimento."
    )
    builder.add_paragraph(
        "Historicamente, o monitoramento de satisfação do paciente no Laboratório Cedro apoiava-se no software legado INDECX. "
        "Embora tal ferramenta permitisse a tabulação básica de questionários, ela revelou limitações estruturais severas que "
        "comprometiam a agilidade e a governança operacional. A principal fragilidade residia na completa dissociação entre a "
        "coleta de dados de satisfação e a abertura formal de ocorrências de ouvidoria: pacientes que registravam avaliações com "
        "notas críticas ou detratoras ficavam represados em planilhas sem qualquer notificação aos gestores da unidade correspondente. "
        "Além disso, o sistema legado não possuía cálculo dinâmico de Acordo de Nível de Serviço (*Service Level Agreement* — SLA) "
        "baseado na gravidade do atendimento, carecia de um histórico imutável com garantia de auditoria e operava com regras de "
        "negócio dispersas em scripts procedurais sem controle estrito de papéis e permissões."
    )
    builder.add_paragraph(
        "Para sanar essas inconsistências, a Engenharia de Software moderna preconiza a adoção do paradigma de Programação "
        "Orientada a Objetos (POO), amplamente consolidado na literatura por Booch et al. (2007) e Gamma et al. (1994), associado "
        "aos preceitos da Arquitetura Limpa formulados por Martin (2017). A modelagem orientada a objetos permite encapsular "
        "regras de domínio complexas em entidades ricas e expressivas, enquanto os princípios SOLID promovem o isolamento entre "
        "as regras essenciais do negócio e as tecnologias voláteis de infraestrutura (FOWLER, 2002; PRESSMAN; MAXIM, 2016; "
        "SOMMERVILLE, 2019). Desse modo, o desenvolvimento de uma plataforma proprietária orientada a objetos surge como uma "
        "solução robusta para orquestrar o ciclo de vida integral das manifestações de pacientes."
    )
    builder.add_paragraph(
        "O objetivo geral deste trabalho consiste em conceber, arquitetar, implementar e validar uma plataforma web orientada "
        "a objetos para coleta contínua de pesquisas de satisfação e gestão resolutiva de manifestações no Laboratório Cedro, "
        "substituindo integralmente as rotinas manuais do sistema legado. Como objetivos específicos, definem-se:"
    )
    builder.add_list_item("Modelar o domínio do sistema por meio de classes puras em linguagem TypeScript estrita, aplicando de forma sistemática abstração, herança, polimorfismo e encapsulamento com garantia de invariantes;", prefix="1. ")
    builder.add_list_item("Desenvolver uma API REST desacoplada segundo os padrões da Arquitetura Limpa sobre banco relacional PostgreSQL/Supabase, implementando integridade referencial estrita e triggers para imutabilidade do histórico de auditoria;", prefix="2. ")
    builder.add_list_item("Construir uma interface gráfica responsiva em Next.js com geração automática de QR Code para coleta pública nos balcões das unidades e painel operacional de tratativas em tempo real;", prefix="3. ")
    builder.add_list_item("Validar a conformidade técnica e a resiliência das regras de negócio implementadas por meio de uma suíte exaustiva de testes automatizados com cobertura total dos fluxos críticos.", prefix="4. ")
    builder.add_paragraph(
        "O presente artigo está estruturado em quatro seções principais: a Seção 2 apresenta a metodologia, detalhando a "
        "caracterização da pesquisa, a arquitetura em quatro camadas, a pilha tecnológica e a divisão do trabalho na squad; "
        "a Seção 3 expõe os resultados e a discussão técnica, subdividida em sete evidências concretas que comprovam os requisitos "
        "de POO, persistência, interface e garantia de qualidade; por fim, a Seção 4 traz as considerações finais e perspectivas "
        "de evolução do projeto."
    )

    # 5. 2 METODOLOGIA
    builder.add_heading_1("2 METODOLOGIA")
    builder.add_heading_2("2.1 Caracterização da Pesquisa e Abordagem Metodológica")
    builder.add_paragraph(
        "Esta pesquisa classifica-se, quanto à sua natureza, como uma pesquisa aplicada de desenvolvimento tecnológico "
        "experimental, orientada à resolução de um problema real do setor de saúde suplementar. Quanto à abordagem, "
        "caracteriza-se como qualitativa e prescritiva, respaldando-se na metodologia ativa de Aprendizagem Baseada em Projetos "
        "(*Project-Based Learning* — PjBL). O ciclo de desenvolvimento foi conduzido em regime iterativo e incremental, partindo "
        "da análise minuciosa dos requisitos operacionais do sistema legado INDECX, evoluindo para a prototipação arquitetural em "
        "Diagramas de Classes UML e culminando na implementação em código limpo e testes automatizados contínuos."
    )

    builder.add_heading_2("2.2 Arquitetura Limpa em Quatro Camadas")
    builder.add_paragraph(
        "Para garantir manutenibilidade, testabilidade e total independência entre as políticas de negócio e os mecanismos de "
        "entrega, a estrutura do sistema foi projetada sob os cânones da Arquitetura Limpa (*Clean Architecture*), organizada em "
        "quatro camadas concêntricas e orientadas pela Regra de Dependência (MARTIN, 2017), conforme ilustrado na Figura 1."
    )
    builder.add_figure_image(
        label="Figura 1",
        title="Diagrama da Arquitetura em Quatro Camadas da Plataforma",
        img_name="figura1_arquitetura.png",
        width_cm=13.5,
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph("As quatro camadas desempenham papéis estritamente delimitados:")
    builder.add_list_item("**Camada de Apresentação (*Presentation Layer*):** Responsável por recepcionar as requisições HTTP via Express, validar formatos de dados através de schemas rigorosos, gerenciar sessões por tokens criptográficos (JWT) e injetar o contexto de autenticação e autorização por perfil (*Role-Based Access Control* — RBAC).", prefix="1. ")
    builder.add_list_item("**Camada de Aplicação (*Application Layer*):** Contém os casos de uso (*UseCases* ou *Services*) que orquestram os fluxos operacionais (como criação de manifestação, submissão de respostas, aplicação de filtros e emissão de métricas). Essa camada não manipula diretamente bancos de dados, interagindo exclusivamente com entidades do domínio e abstrações de repositório.", prefix="2. ")
    builder.add_list_item("**Camada de Domínio (*Domain Layer*):** Constitui o coração da aplicação, composto exclusivamente por código TypeScript nativo, isento de qualquer dependência de bibliotecas ou frameworks externos. Abriga as entidades ricas, suas hierarquias polimórficas, métodos de transição de estado e exceções específicas.", prefix="3. ")
    builder.add_list_item("**Camada de Infraestrutura (*Infrastructure Layer*):** Concentra as implementações técnicas voltadas ao mundo externo, incluindo drivers de conexão com o PostgreSQL/Supabase, serviços de persistência que materializam os repositórios abstratos e adaptadores de integração externa.", prefix="4. ")

    builder.add_heading_2("2.3 Pilha Tecnológica Oficial")
    builder.add_paragraph(
        "A escolha da pilha de desenvolvimento baseou-se em critérios de desempenho, tipagem estática rigorosa para suporte a POO "
        "e adequação ao ambiente de infraestrutura em nuvem, sintetizados no Quadro 1."
    )

    quadro1_headers = ['Camada do Sistema', 'Tecnologia Selecionada', 'Versão / Configuração', 'Justificativa Técnica e Alinhamento à POO']
    quadro1_rows = [
        ['Linguagem Base', 'TypeScript', '5.x (strict: true)', 'Fornece tipagem estática e construções avançadas de POO (abstract class, modificadores private/protected/readonly, polimorfismo real e Generics).'],
        ['Back-end', 'Node.js / Express', 'Node 22 Alpine / Express 4.x', 'Ambiente assíncrono leve que possibilita a construção de uma API REST desacoplada, preservando as classes de domínio sem intromissão de ORMs intrusivos.'],
        ['Banco de Dados', 'PostgreSQL / Supabase', 'PostgreSQL 15+ (Self-Hosted)', 'Motor relacional robusto para garantia de integridade referencial ACID, constraints nativas, tipos enumerados (ENUM) e triggers PL/pgSQL de auditoria imutável.'],
        ['Front-end', 'Next.js / React / Tailwind', 'Next.js 14 (App Router)', 'Renderização híbrida, gerenciamento de rotas por grupos ((publico), (auth), (sistema)), consumo exclusivo da API REST via HTTP e interfaces responsivas.'],
        ['Garantia da Qualidade', 'Vitest / Supertest', 'Vitest 2.1.x', 'Execução ultrarrápida de testes unitários isolados para entidades do domínio e testes de integração com submissão de requisições reais.'],
        ['DevOps & Deploy', 'Docker / Coolify v4 / VPS', 'Containers Linux em VPS', 'Orquestração contínua de microsserviços via plataforma Coolify, integrando deploy automatizado com certificados SSL/TLS automáticos.']
    ]
    builder.add_quadro(
        label="Quadro 1",
        title="Pilha Tecnológica Oficial do Projeto e Justificativas Técnicas",
        headers=quadro1_headers,
        rows=quadro1_rows,
        col_widths=[3.0, 3.2, 3.0, 6.8],
        source_text="Fonte: Autores (2026)."
    )

    builder.add_heading_2("2.4 Divisão Formal das Frentes de Trabalho na Squad")
    builder.add_paragraph(
        "Para assegurar o cumprimento rigoroso do escopo do MVP e das exigências avaliativas da disciplina de POO, "
        "o trabalho foi dividido de maneira formal e equilibrada entre os integrantes da squad:"
    )
    builder.add_list_item("**Gabriel Ordonez dos Reis (Frentes: Tech Lead, Modelagem POO, Banco de Dados e QA):** Atuou como líder técnico de arquitetura, sendo o responsável primário pela concepção conceitual do domínio orientado a objetos, definição dos diagramas UML, modelagem do schema relacional das oito tabelas no PostgreSQL/Supabase, criação das constraints e triggers de imutabilidade, e implementação da suíte de testes automatizados com Vitest;", prefix="• ")
    builder.add_list_item("**Taino Samuel (Frentes: Back-end, Front-end e DevOps):** Responsável pela implementação dos casos de uso, controllers e middlewares no Express, desenvolvimento completo da interface web responsiva no framework Next.js (abrangendo telas públicas com QR Code e telas de tratativa operacional interna), bem como pela orquestração de deploy conteinerizado via Docker e Coolify em servidor VPS.", prefix="• ")

    # 6. 3 RESULTADOS E DISCUSSÃO
    builder.add_heading_1("3 RESULTADOS E DISCUSSÃO")
    builder.add_paragraph(
        "Os resultados alcançados pelo projeto comprovam a aplicabilidade dos princípios da Orientação a Objetos na solução "
        "de problemas complexos de engenharia de software no setor laboratorial. A seguir, apresentam-se as sete evidências técnicas "
        "obrigatórias que sustentam o rigor conceitual da plataforma."
    )

    builder.add_heading_2("3.1 Modelagem Estrutural de Classes (Diagrama UML)")
    builder.add_paragraph(
        "A modelagem de domínio foi articulada em torno de duas entidades centrais: o agregado raiz `Manifestacao` e a hierarquia "
        "de controle de acesso `Usuario`. A Figura 2 expõe o Diagrama de Classes UML com as relações estruturais do sistema."
    )
    builder.add_figure_image(
        label="Figura 2",
        title="Diagrama de Classes UML do Domínio de Negócios",
        img_name="figura2_classes_uml.png",
        width_cm=16.0,
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph(
        "A entidade `Manifestacao` opera como um Agregado Raiz (*Aggregate Root*), governando estritamente uma máquina de estados "
        "finita. O ciclo de vida compreende cinco estados exclusivos: `NAO_RESPONDIDA`, `EM_TRATAMENTO`, `RESPONDIDA`, `ESCALONADA` "
        "e `CONCLUIDA`. O Quadro 2 sistematiza a matriz de transições permitidas e os invariantes validados a cada mutação de estado."
    )

    quadro2_headers = ['Estado Atual', 'Ação Disparadora', 'Novo Estado', 'Ator Autorizado', 'Invariantes e Regras de Negócio Obrigatórias']
    quadro2_rows = [
        ['Criada', 'Manifestacao.criar()', 'NAO_RESPONDIDA', 'Sistema (Automático)', 'Disparado quando nota da pesquisa ≤ 2 (ou detratora ≤ 6). Gera protocolo único e calcula SLA conforme unidade.'],
        ['NAO_RESPONDIDA', 'iniciarTratamento()', 'EM_TRATAMENTO', 'Coordenador da Unidade', 'O usuário deve estar lotado na unidade da manifestação. Registra Interacao de início de tratativa com timestamp.'],
        ['EM_TRATAMENTO', 'registrarRespostaUnidade()', 'RESPONDIDA', 'Coordenador da Unidade', 'Exige conteúdo textual preenchido. O coordenador elabora a devolutiva formal; manifestação aguarda crivo da Ouvidoria.'],
        ['RESPONDIDA', 'solicitarComplemento()', 'EM_TRATAMENTO', 'Operador da Ouvidoria / Admin', 'Ouvidor recusa a resposta da unidade por insuficiência. Reverte o status para tratamento com motivo explícito em histórico.'],
        ['NAO_RESPONDIDA ou EM_TRATAMENTO', 'escalonar()', 'ESCALONADA', 'Operador da Ouvidoria / Admin', 'Ocorre quando prazo estoura ou há bloqueio na unidade. Eleva nível hierárquico e registra justificativa em auditoria.'],
        ['ESCALONADA', 'iniciarTratamento()', 'EM_TRATAMENTO', 'Coordenador da Unidade', 'Coordenador reassume a tratativa após mediação ou fornecimento de subsídios pela liderança.'],
        ['RESPONDIDA', 'concluir()', 'CONCLUIDA', 'Operador da Ouvidoria / Admin', 'Terminal e Irreversível. Exige ao menos uma RespostaUnidade anexada e justificativa formal de encerramento pelo ouvidor.']
    ]
    builder.add_quadro(
        label="Quadro 2",
        title="Máquina de Estados da Manifestação e Regras de Transição",
        headers=quadro2_headers,
        rows=quadro2_rows,
        col_widths=[2.2, 2.8, 2.4, 3.2, 5.4],
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph(
        "A máquina de estados implementada impede de forma categórica transições inválidas (por exemplo, concluir uma manifestação "
        "que se encontre ainda no status `NAO_RESPONDIDA` ou permitir que um usuário sem vínculo com a unidade responda ao chamado), "
        "lançando exceções de domínio padronizadas caso alguma pré-condição seja violada."
    )

    builder.add_heading_2("3.2 Herança e Polimorfismo com Análise Crítica de Código")
    builder.add_paragraph(
        "Um dos pilares estruturantes do projeto é a substituição de verificações procedurais de controle de acesso (como condicionais "
        "`if (usuario.perfil === 'ADMIN')` espalhadas pelo código) por polimorfismo dinâmico orientado a objetos. A classe abstrata "
        "`Usuario` declara métodos contratuais de autorização que são sobrescritos com semânticas específicas por suas subclasses "
        "derivadas, como demonstrado na Listagem 1."
    )

    codigo_listagem_1 = """export abstract class Usuario {
  constructor(
    public readonly id: string,
    protected _nome: string,
    protected _email: string,
    public readonly perfil: PerfilUsuario,
    public readonly unidadeId: string | null,
    protected _ativo: boolean = true,
    public readonly criadoEm: Date = new Date()
  ) {
    if (!id || !id.trim()) throw new RegraNegocioError('O ID do usuário é obrigatório.');
    if (!_nome || !_nome.trim()) throw new RegraNegocioError('O nome do usuário é obrigatório.');
    if (!_email || !_email.includes('@')) throw new RegraNegocioError('Um e-mail válido é obrigatório.');
  }

  // Assinaturas de métodos polimórficos especializados nas subclasses
  public abstract podeVisualizarManifestacao(unidadeDaManifestacaoId: string): boolean;
  public abstract podeTratarPelaUnidade(unidadeDaManifestacaoId: string): boolean;
  public abstract podeEscalonar(): boolean;
  public abstract podeSolicitarComplemento(): boolean;
  public abstract podeConcluir(): boolean;
  public abstract podeGerenciarSistema(): boolean;
}

export class CoordenadorUnidade extends Usuario {
  constructor(id: string, nome: string, email: string, unidadeId: string, ativo = true, criadoEm = new Date()) {
    if (!unidadeId || !unidadeId.trim()) {
      throw new RegraNegocioError('Coordenador de Unidade deve estar vinculado a uma unidade.');
    }
    super(id, nome, email, PerfilUsuario.COORDENADOR_UNIDADE, unidadeId, ativo, criadoEm);
  }

  // Restrição estrita de escopo: visualiza e trata exclusivamente dados da sua unidade
  public override podeVisualizarManifestacao(unidadeDaManifestacaoId: string): boolean {
    return this._ativo && this.unidadeId === unidadeDaManifestacaoId;
  }

  public override podeTratarPelaUnidade(unidadeDaManifestacaoId: string): boolean {
    return this._ativo && this.unidadeId === unidadeDaManifestacaoId;
  }

  public override podeEscalonar(): boolean { return false; }
  public override podeSolicitarComplemento(): boolean { return false; }
  public override podeConcluir(): boolean { return false; }
  public override podeGerenciarSistema(): boolean { return false; }
}

export class OperadorOuvidoria extends Usuario {
  constructor(id: string, nome: string, email: string, ativo = true, criadoEm = new Date()) {
    super(id, nome, email, PerfilUsuario.OPERADOR_OUVIDORIA, null, ativo, criadoEm);
  }

  // Visão global da rede laboratorial: pode auditar e concluir ocorrências de qualquer unidade
  public override podeVisualizarManifestacao(_unidadeDaManifestacaoId: string): boolean {
    return this._ativo;
  }

  public override podeTratarPelaUnidade(_unidadeDaManifestacaoId: string): boolean {
    return false; // Não responde pela unidade; sua atribuição é a auditoria externa
  }

  public override podeEscalonar(): boolean { return this._ativo; }
  public override podeSolicitarComplemento(): boolean { return this._ativo; }
  public override podeConcluir(): boolean { return this._ativo; }
  public override podeGerenciarSistema(): boolean { return false; }
}"""
    builder.add_code_listing(
        label="Listagem 1",
        title="Hierarquia Polimórfica da Entidade de Domínio Usuario",
        code_content=codigo_listagem_1,
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph("A análise da Listagem 1 evidencia benefícios tangíveis sob a ótica de engenharia de software:")
    builder.add_list_item("**Adesão ao Princípio Aberto/Fechado (*Open/Closed Principle* — OCP):** Caso o Laboratório Cedro necessite introduzir um novo perfil de acesso (como um `AuditorExterno` ou `GerenteGeral`), basta criar uma nova subclasse herdando de `Usuario` e implementando suas próprias respostas booleanas. Nenhuma linha de código existente na classe `Manifestacao` ou nos casos de uso precisa ser alterada ou recompilada;", prefix="1. ")
    builder.add_list_item("**Conformidade com o Princípio da Substituição de Liskov (*Liskov Substitution Principle* — LSP):** Qualquer objeto derivado (`Administrador`, `OperadorOuvidoria`, `CoordenadorUnidade`) pode ser repassado indistintamente para a assinatura `manifestacao.iniciarTratamento(usuario: Usuario)`. A entidade consumidora apoia-se unicamente no contrato de alto nível, operando sem conhecimento de qual especialização concreta está em execução.", prefix="2. ")

    builder.add_heading_2("3.3 Abstrações e Interfaces de Contrato")
    builder.add_paragraph(
        "A independência tecnológica do núcleo de negócio é garantida pelo Princípio da Inversão de Dependência "
        "(*Dependency Inversion Principle* — DIP). A camada de domínio define interfaces de contrato puras que abstraem "
        "mecanismos de persistência, cálculo de prazos e notificação, como evidenciado na Listagem 2."
    )

    codigo_listagem_2 = """export interface IRepository<T> {
  salvar(entidade: T): Promise<void>;
  buscarPorId(id: string): Promise<T | null>;
}

export interface FiltrosManifestacao {
  dataInicio?: Date;
  dataFim?: Date;
  nota?: number;
  unidadeId?: string;
  status?: StatusManifestacao;
  prioridade?: PrioridadeManifestacao;
  responsavelId?: string;
  escalonada?: boolean;
  pendente?: boolean;
  busca?: string;
}

export interface IManifestacaoRepository extends IRepository<Manifestacao> {
  buscarPorProtocolo(protocolo: string): Promise<Manifestacao | null>;
  buscarPorRespostaId(respostaId: string): Promise<Manifestacao | null>;
  listar(filtros?: FiltrosManifestacao): Promise<Manifestacao[]>;
  listarPendencias(unidadeId?: string): Promise<Manifestacao[]>;
}

export interface ISLACalculator {
  calcular(prazoPadraoHoras: number, nota: number, dataBase?: Date): {
    prazoResposta: Date;
    prioridade: PrioridadeManifestacao;
    horasEfetivas: number;
  };
}"""
    builder.add_code_listing(
        label="Listagem 2",
        title="Interfaces de Abstração e Contratos de Domínio",
        code_content=codigo_listagem_2,
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph(
        "A interface genérica `IRepository<T>` parametriza as operações fundamentais de ciclo de vida de entidades, enquanto "
        "`IManifestacaoRepository` a especializa para consultas orientadas a filtros complexos de ouvidoria. Dessa forma, as classes "
        "de caso de uso (como `TratarManifestacaoUseCase`) dependem unicamente da interface abstrata. Durante a execução da aplicação "
        "em produção, a camada de infraestrutura injeta a classe concreta `SupabaseManifestacaoRepository`; nos testes unitários "
        "automatizados, injeta-se um repositório simulado em memória (*InMemoryManifestacaoRepository*), proporcionando execução de "
        "testes desacoplada de rede e de banco de dados."
    )

    builder.add_heading_2("3.4 Encapsulamento, Coleções Genéricas e Exceções de Domínio")
    builder.add_paragraph(
        "O encapsulamento na plataforma é levado às últimas consequências para salvaguardar a consistência clínica e operacional "
        "dos dados. Na classe `Manifestacao`, nenhum atributo de estado interno possui *setters* públicos. Qualquer modificação de "
        "propriedades (`_status`, `_responsavelId`, `_concluidoEm`) ocorre exclusivamente através de métodos de domínio que invocam "
        "verificações de invariantes, conforme ilustrado na Listagem 3."
    )

    codigo_listagem_3 = """export class Manifestacao {
  private _status: StatusManifestacao;
  private _responsavelId: string | null;
  private _concluidoEm: Date | null;
  private readonly _interacoes: Interacao[];
  private readonly _respostasUnidade: RespostaUnidade[];
  private readonly _escalonamentos: Escalonamento[];

  // Getters defensivos: retornam coleções imutáveis impedindo manipulação externa
  get status(): StatusManifestacao { return this._status; }
  get interacoes(): ReadonlyArray<Interacao> {
    return Object.freeze([...this._interacoes]);
  }
  get respostasUnidade(): ReadonlyArray<RespostaUnidade> {
    return Object.freeze([...this._respostasUnidade]);
  }

  public concluir(usuario: Usuario, justificativa: string, interacaoId: string = randomUUID()): Interacao {
    if (this._status === StatusManifestacao.CONCLUIDA) {
      throw new RegraNegocioError('Esta manifestação já se encontra CONCLUÍDA.');
    }
    if (!usuario.podeConcluir()) {
      throw new AcessoNegadoError('Apenas operadores da ouvidoria ou administradores podem concluir manifestações.');
    }
    if (this._respostasUnidade.length === 0) {
      throw new RegraNegocioError('Não é permitido concluir manifestação sem ao menos uma resposta formal da unidade.');
    }
    if (!justificativa || !justificativa.trim()) {
      throw new RegraNegocioError('A justificativa de encerramento da ouvidoria é obrigatória.');
    }

    const statusAnterior = this._status;
    this._status = StatusManifestacao.CONCLUIDA;
    this._concluidoEm = new Date();

    const interacao = new Interacao(
      interacaoId,
      this.id,
      usuario.id,
      TipoInteracao.CONCLUSAO,
      `Manifestação encerrada por ${usuario.nome}. Parecer: ${justificativa.trim()}`,
      statusAnterior,
      this._status,
      this._concluidoEm
    );

    this._interacoes.push(interacao);
    return interacao;
  }
}"""
    builder.add_code_listing(
        label="Listagem 3",
        title="Encapsulamento Rígido, Coleções Genéricas e Tratamento de Exceções",
        code_content=codigo_listagem_3,
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph("Na Listagem 3 destacam-se três decisões arquiteturais fundamentais:")
    builder.add_list_item("**Coleções Genéricas Protegidas:** As listas de interações e respostas utilizam o tipo `ReadonlyArray<T>` associado ao `Object.freeze()`. Esse padrão garante que desenvolvedores de camadas superiores não possam realizar inserções espúrias via `manifestacao.interacoes.push(...)`, forçando a passagem obrigatória pelo método de negócio;", prefix="1. ")
    builder.add_list_item("**Hierarquia de Exceções de Domínio:** O sistema substitui o lançamento genérico de erros por subclasses tipadas herdadas de `DominioError` (`RegraNegocioError`, `AcessoNegadoError`, `ObjetoNaoEncontradoError`). Cada exceção carrega semanticamente o código de status HTTP equivalente (422, 403, 404), capturado de forma transparente por um middleware de tratamento de erro no Express.", prefix="2. ")

    builder.add_heading_2("3.5 Persistência Relacional, Integridade e Auditoria Imutável")
    builder.add_paragraph(
        "O banco de dados relacional foi modelado no PostgreSQL (hospedado na infraestrutura Supabase), integrando oito entidades "
        "dispostas com normalização rigorosa e integridade referencial nativa. A Figura 3 exibe o Diagrama Entidade-Relacionamento (DER)."
    )
    builder.add_figure_image(
        label="Figura 3",
        title="Diagrama Entidade-Relacionamento do Banco de Dados",
        img_name="figura3_er_banco.png",
        width_cm=11.5,
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph(
        "Para atender aos rigores de auditoria e governança médica, o banco de dados incorpora salvaguardas programáticas ativas "
        "através de *Check Constraints* e *Triggers* em linguagem PL/pgSQL, exemplificadas na Listagem 4."
    )

    codigo_listagem_4 = """ALTER TABLE manifestacoes
  ADD CONSTRAINT chk_manifestacao_conclusao CHECK (
    (status = 'CONCLUIDA' AND concluido_em IS NOT NULL) OR
    (status <> 'CONCLUIDA' AND concluido_em IS NULL)
  );

-- Função de bloqueio para garantia de histórico médico imutável
CREATE OR REPLACE FUNCTION fn_bloquear_mutacao_historico()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Operação negada: o histórico de interações e auditoria é imutável.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_interacoes_imutavel
BEFORE UPDATE OR DELETE ON interacoes
FOR EACH ROW EXECUTE FUNCTION fn_bloquear_mutacao_historico();"""
    builder.add_code_listing(
        label="Listagem 4",
        title="Constraints de Integridade e Trigger de Imutabilidade no PostgreSQL",
        code_content=codigo_listagem_4,
        source_text="Fonte: Autores (2026)."
    )
    builder.add_paragraph(
        "A constraint `chk_manifestacao_conclusao` atua no nível físico do banco garantindo que nenhuma manifestação possa ter sua "
        "data de encerramento gravada sem o status `CONCLUIDA` correspondente. De forma complementar, o trigger `trg_interacoes_imutavel` "
        "intercepta e aborta qualquer comando SQL de `UPDATE` ou `DELETE` disparado contra a tabela de interações, assegurando que toda "
        "a trilha histórica do paciente (desde a abertura automática até a resolução do ouvidor) permaneça inalterável mesmo perante "
        "intervenções manuais diretas no banco."
    )

    builder.add_heading_2("3.6 Interface Gráfica com Eventos e Fluxos de Uso")
    builder.add_paragraph(
        "A camada de interface visual foi concebida para unir simplicidade de preenchimento para o paciente externo e máxima "
        "produtividade para o time assistencial interno. O sistema opera em duas jornadas complementares:"
    )
    builder.add_list_item("**Jornada Pública do Paciente (Totem e QR Code):** Nas salas de coleta e espera das unidades do Laboratório Cedro (como Unidade Cohama e Unidade Renascença), totens físicos e impressos disponibilizam QR Codes direcionados para a rota pública do Next.js (`/pesquisa/[id]`). O paciente seleciona a nota do atendimento (escala de 1 a 5 no questionário rápido, calibrada com a metodologia NPS/CSAT) e pode registrar um comentário espontâneo.", prefix="1. ")
    builder.add_list_item("**Disparo Reativo de Eventos de Domínio:** Ao submeter a pesquisa, a API avalia imediatamente a nota recebida. Quando a avaliação é detratora (nota ≤ 2 no questionário de balcão ou ≤ 6 na escala expandida de NPS), a camada de aplicação dispara reativamente o caso de uso `CriarManifestacaoAutomatica`. A manifestação é instanciada pelo método estático `Manifestacao.criar()`, que invoca a política `PoliticaSlaPorNota`, reduz o prazo de resposta pela metade (elevando a prioridade para `ALTA`) e notifica a coordenação sem necessidade de triagem manual.", prefix="2. ")
    builder.add_list_item("**Painel Operacional e Ficha de Tratativa:** Para os colaboradores internos, o painel restrito disponibiliza abas dinâmicas de triagem (\"Todas\", \"Pendentes\", \"Atrasadas\", \"Escalonadas\"). Ao acessar a tela de detalhe (`/manifestacoes/[id]`), o coordenador visualiza a linha do tempo cronológica com todas as interações imutáveis, o painel de SLA com contagem regressiva em tempo real e modais com validação em tempo de execução para inserção de parecer formal, escalonamento para instâncias superiores ou encerramento da ouvidoria.", prefix="3. ")

    builder.add_heading_2("3.7 Validação de Qualidade (QA) e Rastreabilidade Git")
    builder.add_paragraph(
        "Para garantir confiabilidade de nível industrial ao software, o projeto estabeleceu uma política rígida de verificação "
        "automatizada orientada por testes (*Test-Driven Development* e testes de regressão com Vitest e Supertest). A suíte de validação "
        "foi estruturada em 14 arquivos de especificação, contemplando tanto testes unitários isolados das classes de domínio quanto testes "
        "de integração ponta a ponta na API HTTP."
    )
    builder.add_paragraph(
        "A execução completa da bateria de testes resultou em **71 testes executados com 100% de sucesso (zero falhas)** em tempo "
        "de execução de 2,27 segundos, conforme detalhado no Quadro 3."
    )

    quadro3_headers = ['Categoria do Teste', 'Arquivo de Especificação', 'Testes', 'Status', 'Escopo Validado']
    quadro3_rows = [
        ['Domínio (POO)', 'tests/domain/Manifestacao.spec.ts', '10', 'Aprovado', 'Ciclo de vida, máquina de estados, regras de transição e invariantes.'],
        ['Domínio (POO)', 'tests/domain/Usuario.spec.ts', '6', 'Aprovado', 'Especializações de Usuario, polimorfismo de permissões e fábrica.'],
        ['Domínio (POO)', 'tests/domain/Pesquisa.spec.ts', '5', 'Aprovado', 'Validação de recebimento de respostas e estados da pesquisa.'],
        ['Domínio (POO)', 'tests/domain/Unidade.spec.ts', '4', 'Aprovado', 'Ativação, parametrização de prazos e invariantes de unidade.'],
        ['Domínio (POO)', 'tests/domain/PoliticaSla.spec.ts', '3', 'Aprovado', 'Algoritmo de redução de prazo e priorização para notas detratoras.'],
        ['Aplicação (UseCases)', 'tests/application/TratarManifestacaoUseCases.spec.ts', '5', 'Aprovado', 'Orquestração de tratamento, resposta formal e conclusão de ocorrência.'],
        ['Aplicação (UseCases)', 'tests/application/UsuarioGestaoUseCases.spec.ts', '7', 'Aprovado', 'Criação, atualização cadastral e desativação lógica de usuários.'],
        ['Aplicação (UseCases)', 'tests/application/PesquisaGestaoUseCases.spec.ts', '5', 'Aprovado', 'Gestão de questionários, ciclo de vida e parametrização de canais.'],
        ['Aplicação (UseCases)', 'tests/application/DashboardUseCases.spec.ts', '5', 'Aprovado', 'Agregações de métricas de satisfação, contagem de SLAs e pendências.'],
        ['Aplicação (UseCases)', 'tests/application/AuthUseCases.spec.ts', '6', 'Aprovado', 'Autenticação, geração de credenciais criptográficas e validação de tokens.'],
        ['Aplicação (UseCases)', 'tests/application/PesquisaUseCases.spec.ts', '4', 'Aprovado', 'Coleta pública de avaliações e gatilho de criação de manifestações.'],
        ['Aplicação (UseCases)', 'tests/application/UsuarioUseCases.spec.ts', '4', 'Aprovado', 'Consultas especializadas por perfil e unidade.'],
        ['Aplicação (UseCases)', 'tests/application/UnidadeGestaoUseCases.spec.ts', '2', 'Aprovado', 'Cadastro e atualização analítica de unidades laboratoriais.'],
        ['Integração (API)', 'tests/presentation/ApiIntegration.spec.ts', '5', 'Aprovado', 'Resposta a requisições HTTP reais, injeção de controllers e rotas Express.'],
        ['TOTAL GERAL', '14 Suítes de Teste', '71', '100% OK', 'Aprovação integral sem advertências em 2,27 segundos.']
    ]
    builder.add_quadro(
        label="Quadro 3",
        title="Síntese das Suítes de Testes Automatizados no Vitest",
        headers=quadro3_headers,
        rows=quadro3_rows,
        col_widths=[2.6, 4.4, 1.4, 1.6, 6.0],
        source_text="Fonte: Dados extraídos diretamente da execução do Vitest (2026)."
    )
    builder.add_paragraph(
        "Além da verificação por software, a integridade do trabalho em equipe é atestada pela rastreabilidade do histórico de "
        "versionamento no Git. O repositório oficial da squad registra um histórico robusto e equilibrado de contribuições entre "
        "Gabriel Ordonez dos Reis e Taino Samuel, evidenciando o comprometimento conjunto com a especificação, implementação, "
        "refatoração e documentação acadêmica do projeto."
    )

    # 7. 4 CONSIDERAÇÕES FINAIS
    builder.add_heading_1("4 CONSIDERAÇÕES FINAIS")
    builder.add_paragraph(
        "O desenvolvimento da Plataforma de Experiência do Cliente para o Laboratório Cedro demonstrou que a aplicação "
        "rigorosa do paradigma de Programação Orientada a Objetos, quando articulada com os princípios da Arquitetura Limpa, é "
        "capaz de transformar problemas complexos de gestão operacional em sistemas computacionais altamente manuteníveis, extensíveis "
        "e seguros. Todos os objetivos formulados no início da pesquisa foram plenamente cumpridos: o sistema legado INDECX foi substituído "
        "por uma solução moderna capaz de capturar pesquisas via QR Code, identificar notas críticas instantaneamente e acionar fluxos "
        "de ouvidoria com cálculo dinâmico de SLA e histórico imutável para auditoria médica."
    )
    builder.add_paragraph(
        "Entre os principais aprendizados técnicos consolidados pela squad, destaca-se a constatação de que a modelagem de classes rica "
        "no domínio (*Domain Model*) elimina o código anêmico e previne anomalias de estado que frequentemente assolam softwares "
        "orientados a scripts procedurais. A substituição de condicionais de perfil por métodos polimórficos na hierarquia `Usuario`, "
        "o encapsulamento defensivo no agregado `Manifestacao` e a inversão de dependência por meio de interfaces contratuais garantiram "
        "que a suíte com 71 testes automatizados mantivesse 100% de aprovação de forma veloz e independente de banco de dados."
    )
    builder.add_paragraph(
        "Como limitações da versão atual (MVP), identifica-se que o contato resolutivo pós-manifestação ainda depende de acionamento "
        "telefônico ou presencial realizado pela ouvidoria, sem canais de mensageria direta automatizados com o paciente. Para trabalhos "
        "futuros, propõem-se:"
    )
    builder.add_list_item("A integração com APIs oficiais do WhatsApp Business e envio de SMS transacional para aviso imediato ao paciente sobre a abertura e o desfecho do seu protocolo;", prefix="1. ")
    builder.add_list_item("A incorporação de módulos de Processamento de Linguagem Natural (PLN) para análise automática de sentimentos e classificação temática dos comentários dos pacientes, subsidiando o comitê de qualidade diagnóstica com análises preditivas de riscos operacionais;", prefix="2. ")
    builder.add_list_item("O estabelecimento de barramentos de mensageria em tempo real (WebSockets) para alertas sonoros e visuais nos balcões de atendimento no instante em que uma insatisfação é manifestada.", prefix="3. ")

    # 8. DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL
    builder.add_heading_1("DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL")
    builder.add_paragraph(
        "Em estrita observância aos padrões éticos acadêmicos e às diretrizes de integridade avaliativa estipuladas para a disciplina "
        "de Programação Orientada a Objetos da UNDB, os autores declaram que utilizaram ferramentas de Inteligência Artificial Generativa "
        "(notadamente Google Antigravity e modelos da família Gemini) como instrumentos de assistência técnica e suporte computacional "
        "durante o projeto. A utilização da IA concentrou-se: a) na geração de ideias e casos de teste de borda adicionais para a suíte do "
        "Vitest; b) no auxílio à diagramação de sintaxe Mermaid; e c) na revisão gramatical e estruturação estilística preliminar dos "
        "tópicos textuais em conformidade com as normas da ABNT. Todas as definições arquiteturais, modelagens de domínio, regras de "
        "negócio e implementações das classes em código TypeScript foram concebidas, desenvolvidas, validadas e plenamente compreendidas "
        "pela squad formada por Gabriel Ordonez dos Reis e Taino Samuel, assegurando a capacidade e autonomia para a sustentação e "
        "defesa oral individual de cada linha do projeto entregue."
    )

    # 9. REFERÊNCIAS
    builder.add_heading_1("REFERÊNCIAS")
    referencias = [
        "BOOCH, Grady et al. **Object-Oriented Analysis and Design with Applications**. 3. ed. Boston: Addison-Wesley, 2007.",
        "DONABEDIAN, Avedis. Evaluating the quality of medical care. **The Milbank Quarterly**, New York, v. 83, n. 4, p. 691-729, 2005.",
        "FOWLER, Martin. **Patterns of Enterprise Application Architecture**. Boston: Addison-Wesley, 2002.",
        "GAMMA, Erich et al. **Design Patterns: Elements of Reusable Object-Oriented Software**. Reading: Addison-Wesley, 1994.",
        "MARTIN, Robert C. **Clean Architecture: A Craftsman's Guide to Software Structure and Design**. Boston: Prentice Hall, 2017.",
        "PRESSMAN, Roger S.; MAXIM, Bruce R. **Engenharia de Software: Uma Abordagem Profissional**. 8. ed. Porto Alegre: AMGH, 2016.",
        "SOMMERVILLE, Ian. **Engenharia de Software**. 10. ed. São Paulo: Pearson, 2019."
    ]
    for ref in referencias:
        builder.add_reference_item(ref)

    # SALVAR DOCUMENTO
    builder.save(DOCX_PATH)

    # 10. VERIFICAÇÃO AUTOMÁTICA DE CONFORMIDADE
    verificar_conformidade(DOCX_PATH)

def verificar_conformidade(docx_filepath: str):
    """Executa a bateria de verificação estrutural e textual no .docx gerado."""
    print("\n" + "=" * 80)
    print("VERIFICAÇÃO DE CONFORMIDADE E INTEGRIDADE (MANDATÓRIA)")
    print("=" * 80)

    if not os.path.exists(docx_filepath):
        raise FileNotFoundError(f"Arquivo gerado não existe: {docx_filepath}")

    tamanho = os.path.getsize(docx_filepath)
    print(f"1. Tamanho do arquivo gerado: {tamanho:,} bytes ({tamanho / 1024:.1f} KB)")
    if tamanho < 50 * 1024:
        raise ValueError(f"Tamanho do arquivo ({tamanho} bytes) abaixo do esperado (>50KB).")

    doc = docx.Document(docx_filepath)
    print(f"2. Total de parágrafos: {len(doc.paragraphs)}")
    print(f"3. Total de tabelas:    {len(doc.tables)} (Quadros e Listagens)")

    # Extrair todo o texto para checar placeholders
    texto_completo = []
    for p in doc.paragraphs:
        if p.text.strip():
            texto_completo.append(p.text)
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                if cell.text.strip():
                    texto_completo.append(cell.text)

    corpus = "\n".join(texto_completo)
    palavras_total = len(corpus.split())
    print(f"4. Contagem total de palavras no documento: {palavras_total}")

    # Verificar ausência estrita de placeholders
    placeholders_proibidos = [r'\bTODO\b', r'\bTBD\b', r'\bxxxx\b', r'\bXXXX\b', r'\blorem\b', r'\bipsum\b']
    infracoes = []
    for pat in placeholders_proibidos:
        matches = re.findall(pat, corpus, flags=re.IGNORECASE if 'lorem' in pat or 'ipsum' in pat else 0)
        if matches:
            infracoes.append((pat, len(matches)))

    if infracoes:
        print(f"ERRO: Placeholders proibidos encontrados no documento: {infracoes}")
        raise ValueError(f"Documento contém placeholders inválidos: {infracoes}")
    else:
        print("5. Verificação de Placeholders: ZERO placeholders encontrados (100% LIMPO).")

    # Verificar dimensões de página e margens
    sec = doc.sections[0]
    w_cm = round(sec.page_width.cm, 1)
    h_cm = round(sec.page_height.cm, 1)
    top_cm = round(sec.top_margin.cm, 1)
    left_cm = round(sec.left_margin.cm, 1)
    bot_cm = round(sec.bottom_margin.cm, 1)
    right_cm = round(sec.right_margin.cm, 1)
    print(f"6. Geometria da Página: A4 ({w_cm}cm x {h_cm}cm)")
    print(f"7. Margens Oficiais: Topo={top_cm}cm, Esq={left_cm}cm, Base={bot_cm}cm, Dir={right_cm}cm")

    if (w_cm, h_cm) != (21.0, 29.7):
        print(f"AVISO: Tamanho da página ({w_cm}x{h_cm}) difere ligeiramente de 21.0x29.7cm")
    if (top_cm, left_cm, bot_cm, right_cm) != (3.0, 3.0, 2.0, 2.0):
        print(f"AVISO: Margens ({top_cm}, {left_cm}, {bot_cm}, {right_cm}) diferem de (3.0, 3.0, 2.0, 2.0)")

    print("\n" + "=" * 80)
    print("PROCESSO CONCLUÍDO COM SUCESSO INTEGRAL!")
    print("=" * 80)

if __name__ == '__main__':
    construir_paper_completo()
