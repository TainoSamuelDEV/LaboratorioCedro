import { ManifestacaoDTO, PrioridadeManifestacao, StatusManifestacao } from '../types/api';
import { apiClient } from './api-client';

export interface FiltrosManifestacaoParams {
  unidadeId?: string;
  status?: StatusManifestacao;
  prioridade?: PrioridadeManifestacao;
  busca?: string;
  pendente?: boolean;
  escalonada?: boolean;
}

export const manifestacaoService = {
  async listar(filtros?: FiltrosManifestacaoParams): Promise<ManifestacaoDTO[]> {
    const params = new URLSearchParams();
    if (filtros?.unidadeId) params.append('unidadeId', filtros.unidadeId);
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.prioridade) params.append('prioridade', filtros.prioridade);
    if (filtros?.busca) params.append('busca', filtros.busca);
    if (filtros?.pendente) params.append('pendente', 'true');
    if (filtros?.escalonada) params.append('escalonada', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ManifestacaoDTO[]>(`/api/manifestacoes${query}`);
  },

  async obterPorId(id: string): Promise<ManifestacaoDTO> {
    return apiClient.get<ManifestacaoDTO>(`/api/manifestacoes/${id}`);
  },

  async listarPendencias(): Promise<ManifestacaoDTO[]> {
    return apiClient.get<ManifestacaoDTO[]>('/api/pendencias');
  },

  async iniciarTratamento(id: string): Promise<void> {
    await apiClient.patch(`/api/manifestacoes/${id}/iniciar-tratamento`);
  },

  async responderPelaUnidade(id: string, conteudo: string): Promise<void> {
    await apiClient.post(`/api/manifestacoes/${id}/respostas-unidade`, { conteudo });
  },

  async solicitarComplemento(id: string, motivo: string): Promise<void> {
    await apiClient.patch(`/api/manifestacoes/${id}/solicitar-complemento`, { motivo });
  },

  async escalonar(id: string, motivo: string, nivel: number = 1): Promise<void> {
    await apiClient.post(`/api/manifestacoes/${id}/escalonar`, { motivo, nivel });
  },

  async encaminhar(id: string, novaUnidadeId: string, motivo: string): Promise<void> {
    await apiClient.patch(`/api/manifestacoes/${id}/encaminhar`, { novaUnidadeId, motivo });
  },

  async concluir(id: string, parecerFinal: string): Promise<void> {
    await apiClient.patch(`/api/manifestacoes/${id}/concluir`, { parecerFinal });
  },
};
