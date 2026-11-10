import { UnidadeDTO } from '../types/api';
import { apiClient } from './api-client';

export const unidadeService = {
  async listar(apenasAtivas: boolean = false): Promise<UnidadeDTO[]> {
    return apiClient.get<UnidadeDTO[]>(`/api/unidades${apenasAtivas ? '?apenasAtivas=true' : ''}`);
  },

  async criar(data: { nome: string; responsavelNome?: string; prazoPadraoHoras?: number }): Promise<UnidadeDTO> {
    return apiClient.post<UnidadeDTO>('/api/unidades', data);
  },

  async atualizar(
    id: string,
    data: { nome: string; responsavelNome?: string; prazoPadraoHoras?: number; ativa?: boolean }
  ): Promise<UnidadeDTO> {
    return apiClient.patch<UnidadeDTO>(`/api/unidades/${id}`, data);
  },
};
