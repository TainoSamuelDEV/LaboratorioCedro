import { apiClient } from './api-client';
import { FiltrosRelatorioDTO } from '../types/api';

export const relatorioService = {
  async exportarCsv(filtros?: FiltrosRelatorioDTO): Promise<void> {
    const params = new URLSearchParams();
    if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros?.unidadeId) params.append('unidadeId', filtros.unidadeId);
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.prioridade) params.append('prioridade', filtros.prioridade);
    params.append('formato', 'csv');

    const query = params.toString() ? `?${params.toString()}` : '';
    await apiClient.downloadFile(`/api/relatorios/exportar${query}`, 'relatorio-manifestacoes.csv');
  },

  async exportarJson(filtros?: FiltrosRelatorioDTO): Promise<any[]> {
    const params = new URLSearchParams();
    if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros?.unidadeId) params.append('unidadeId', filtros.unidadeId);
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.prioridade) params.append('prioridade', filtros.prioridade);
    params.append('formato', 'json');

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<any[]>(`/api/relatorios/exportar${query}`);
  },
};
