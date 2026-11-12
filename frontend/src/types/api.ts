export type PerfilUsuario = 'ADMINISTRADOR' | 'OPERADOR_OUVIDORIA' | 'COORDENADOR_UNIDADE';

export type StatusManifestacao =
  | 'NOVA'
  | 'NAO_RESPONDIDA'
  | 'EM_TRATAMENTO'
  | 'ESCALONADA'
  | 'RESPONDIDA'
  | 'CONCLUIDA';

export type PrioridadeManifestacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type CanalPesquisa = 'LINK' | 'QR_CODE' | 'TOTEM' | 'WHATSAPP' | 'EMAIL';

export type TipoInteracao =
  | 'ABERTURA_AUTOMATICA'
  | 'ENCAMINHAMENTO'
  | 'INICIO_TRATAMENTO'
  | 'RESPOSTA_UNIDADE'
  | 'SOLICITACAO_COMPLEMENTO'
  | 'ESCALONAMENTO'
  | 'CONCLUSAO'
  | 'OBSERVACAO_INTERNA';

export interface UsuarioDTO {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  unidadeId: string | null;
  ativo: boolean;
  criadoEm: string;
}

export interface UnidadeDTO {
  id: string;
  nome: string;
  responsavelNome: string | null;
  ativa: boolean;
  prazoPadraoHoras: number;
  criadoEm: string;
}

export interface PesquisaDTO {
  id: string;
  titulo: string;
  descricao: string;
  periodo: string;
  canal: CanalPesquisa;
  ativa: boolean;
  unidadePadraoId: string | null;
  criadoEm: string;
}

export interface PesquisaDetalhadaDTO {
  id: string;
  titulo: string;
  descricao: string;
  periodo: string;
  canal: CanalPesquisa;
  ativa: boolean;
  unidadePadraoId: string | null;
  unidadePadraoNome: string | null;
  criadoEm: string;
  indicadores: {
    totalRespostas: number;
    notaMedia: number;
    percentualSatisfeitos: number;
    totalManifestacoes: number;
    distribuicaoNotas: Array<{
      nota: number;
      quantidade: number;
      percentual: number;
    }>;
  };
  ultimasManifestacoes: Array<{
    id: string;
    protocolo: string;
    unidadeNome: string;
    nota: number;
    comentario: string;
    status: string;
    criadoEm: string;
  }>;
}

export interface AtualizarPesquisaDTO {
  titulo?: string;
  descricao?: string;
  periodo?: string;
  canal?: CanalPesquisa;
  unidadePadraoId?: string | null;
  ativa?: boolean;
}

export interface PesquisaPublicaDTO {
  id: string;
  titulo: string;
  descricao: string;
  unidadesAtivas: UnidadeDTO[];
  unidadePadraoId: string | null;
}

export interface InteracaoDTO {
  id: string;
  usuarioId: string | null;
  tipo: TipoInteracao;
  texto: string;
  statusAnterior: StatusManifestacao | null;
  statusNovo: StatusManifestacao;
  dataHora: string;
}

export interface RespostaUnidadeDTO {
  id: string;
  usuarioId: string;
  conteudo: string;
  dataHora: string;
}

export interface EscalonamentoDTO {
  id: string;
  usuarioId: string;
  motivo: string;
  nivel: number;
  dataHora: string;
}

export interface ManifestacaoDTO {
  id: string;
  protocolo: string;
  status: StatusManifestacao;
  prioridade: PrioridadeManifestacao;
  unidadeId: string;
  unidadeNome?: string;
  respostaId: string;
  clienteAtendimento?: string;
  nota?: number;
  comentarioCliente?: string;
  responsavelId: string | null;
  prazoResposta: string;
  criadoEm: string;
  concluidoEm: string | null;
  interacoes: InteracaoDTO[];
  respostasUnidade: RespostaUnidadeDTO[];
  escalonamentos: EscalonamentoDTO[];
}

export interface LoginResponseDTO {
  token: string;
  usuario: UsuarioDTO;
}

export interface RespostaComManifestacaoDTO {
  respostaId: string;
  manifestacao: {
    id: string;
    protocolo: string;
    status: string;
    prioridade: string;
    unidadeId: string;
    prazoResposta: string;
    criadoEm: string;
  };
}

export interface DistribuicaoNotaDTO {
  nota: number;
  quantidade: number;
  porcentagem: number;
}

export interface VolumePorUnidadeDTO {
  unidadeId: string;
  unidadeNome: string;
  total: number;
}

export interface PendenciaPorUnidadeDTO {
  unidadeId: string;
  unidadeNome: string;
  pendencias: number;
}

export interface MetricaPesquisaDashboardDTO {
  pesquisaId: string;
  titulo: string;
  canal: string;
  ativa: boolean;
  totalRespostas: number;
  notaMedia: number;
}

export interface UltimaManifestacaoDashboardDTO {
  id: string;
  protocolo: string;
  unidadeId: string;
  unidadeNome: string;
  pesquisaTitulo: string;
  nota: number;
  comentario?: string;
  senhaAtendimento?: string;
  status: string;
  prioridade: string;
  criadoEm: string;
}

export interface IndicadoresDashboardDTO {
  totalRespostas: number;
  notaMediaGeral: number;
  distribuicaoNotas: DistribuicaoNotaDTO[];
  totalAbertas: number;
  totalNaoRespondidas: number;
  totalEscalonadas: number;
  totalConcluidas: number;
  tempoMedioRespostaHoras: number;
  tempoMedioConclusaoHoras: number;
  pendenciasPorUnidade: PendenciaPorUnidadeDTO[];
  volumePorUnidade: VolumePorUnidadeDTO[];
  desempenhoPorPesquisa: MetricaPesquisaDashboardDTO[];
  ultimasManifestacoes: UltimaManifestacaoDashboardDTO[];
}

export interface FiltrosRelatorioDTO {
  dataInicio?: string;
  dataFim?: string;
  unidadeId?: string;
  status?: StatusManifestacao;
  prioridade?: PrioridadeManifestacao;
  formato?: 'csv' | 'json';
}
