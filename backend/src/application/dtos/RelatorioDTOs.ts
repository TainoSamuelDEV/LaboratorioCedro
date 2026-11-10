import { PrioridadeManifestacao, StatusManifestacao } from '../../domain/enums';

export interface FiltrosRelatorioDTO {
  dataInicio?: string;
  dataFim?: string;
  unidadeId?: string;
  status?: StatusManifestacao;
  prioridade?: PrioridadeManifestacao;
  formato?: 'csv' | 'json';
}

export interface ItemRelatorioDTO {
  protocolo: string;
  unidadeNome: string;
  status: string;
  prioridade: string;
  prazoResposta: string;
  criadoEm: string;
  concluidoEm: string;
  tempoRespostaHoras: number | null;
  tempoConclusaoHoras: number | null;
  totalInteracoes: number;
  totalEscalonamentos: number;
  totalRespostasUnidade: number;
}
