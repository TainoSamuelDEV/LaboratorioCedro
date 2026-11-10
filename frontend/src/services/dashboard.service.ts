import { apiClient } from './api-client';
import { IndicadoresDashboardDTO } from '../types/api';

export const dashboardService = {
  async obterIndicadores(unidadeId?: string): Promise<IndicadoresDashboardDTO> {
    const params = unidadeId ? `?unidadeId=${encodeURIComponent(unidadeId)}` : '';
    return apiClient.get<IndicadoresDashboardDTO>(`/api/dashboard/indicadores${params}`);
  },
};
