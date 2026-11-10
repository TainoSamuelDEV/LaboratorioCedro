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
