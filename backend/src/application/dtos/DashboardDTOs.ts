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

export interface IndicadoresDashboardDTO {
  totalRespostas: number;
  distribuicaoNotas: DistribuicaoNotaDTO[];
  totalAbertas: number;
  totalNaoRespondidas: number;
  totalEscalonadas: number;
  totalConcluidas: number;
  tempoMedioRespostaHoras: number;
  tempoMedioConclusaoHoras: number;
  pendenciasPorUnidade: PendenciaPorUnidadeDTO[];
  volumePorUnidade: VolumePorUnidadeDTO[];
}
