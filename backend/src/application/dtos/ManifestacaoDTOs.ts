import { PrioridadeManifestacao, StatusManifestacao, TipoInteracao } from '../../domain/enums';

export interface InteracaoOutput {
  id: string;
  usuarioId: string | null;
  tipo: TipoInteracao;
  texto: string;
  statusAnterior: StatusManifestacao | null;
  statusNovo: StatusManifestacao;
  dataHora: Date;
}

export interface RespostaUnidadeOutput {
  id: string;
  usuarioId: string;
  conteudo: string;
  dataHora: Date;
}

export interface EscalonamentoOutput {
  id: string;
  usuarioId: string;
  motivo: string;
  nivel: number;
  dataHora: Date;
}

export interface ManifestacaoDetalheOutput {
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
  prazoResposta: Date;
  criadoEm: Date;
  concluidoEm: Date | null;
  interacoes: InteracaoOutput[];
  respostasUnidade: RespostaUnidadeOutput[];
  escalonamentos: EscalonamentoOutput[];
}

export interface FiltrosListagemManifestacaoInput {
  usuarioExecutanteId: string;
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

export interface IniciarTratamentoInput {
  manifestacaoId: string;
  usuarioId: string;
}

export interface ResponderUnidadeInput {
  manifestacaoId: string;
  usuarioId: string;
  conteudo: string;
}

export interface SolicitarComplementoInput {
  manifestacaoId: string;
  usuarioId: string;
  motivo: string;
}

export interface EscalonarInput {
  manifestacaoId: string;
  usuarioId: string;
  motivo: string;
  nivel?: number;
}

export interface EncaminharInput {
  manifestacaoId: string;
  usuarioId: string;
  novaUnidadeId: string;
  motivo: string;
}

export interface ConcluirInput {
  manifestacaoId: string;
  usuarioId: string;
  parecerFinal: string;
}
