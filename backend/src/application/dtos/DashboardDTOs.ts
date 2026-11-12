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
