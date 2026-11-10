export interface CriarUnidadeInput {
  executanteId: string;
  nome: string;
  responsavelNome?: string | null;
  prazoPadraoHoras?: number;
}

export interface AtualizarUnidadeInput {
  executanteId: string;
  unidadeId: string;
  nome: string;
  responsavelNome?: string | null;
  prazoPadraoHoras?: number;
  ativa?: boolean;
}

export interface UnidadeOutput {
  id: string;
  nome: string;
  responsavelNome: string | null;
  ativa: boolean;
  prazoPadraoHoras: number;
  criadoEm: Date;
}
