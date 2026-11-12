import {
  AtualizarPesquisaDTO,
  CanalPesquisa,
  PesquisaDetalhadaDTO,
  PesquisaDTO,
  PesquisaPublicaDTO,
  RespostaComManifestacaoDTO,
} from '../types/api';
import { apiClient } from './api-client';

export const pesquisaService = {
  async listar(apenasAtivas: boolean = false): Promise<PesquisaDTO[]> {
    return apiClient.get<PesquisaDTO[]>(`/api/pesquisas${apenasAtivas ? '?apenasAtivas=true' : ''}`);
  },

  async obterPorId(id: string): Promise<PesquisaDetalhadaDTO> {
    return apiClient.get<PesquisaDetalhadaDTO>(`/api/pesquisas/${id}`);
  },

  async criar(data: {
    titulo: string;
    descricao: string;
    periodo: string;
    canal: CanalPesquisa;
    unidadePadraoId?: string | null;
  }): Promise<PesquisaDTO> {
    return apiClient.post<PesquisaDTO>('/api/pesquisas', data);
  },

  async atualizar(id: string, data: AtualizarPesquisaDTO): Promise<PesquisaDTO> {
    return apiClient.patch<PesquisaDTO>(`/api/pesquisas/${id}`, data);
  },

  async alternarStatus(id: string, ativa: boolean): Promise<PesquisaDTO> {
    return apiClient.patch<PesquisaDTO>(`/api/pesquisas/${id}`, { ativa });
  },

  async obterPublica(id: string): Promise<PesquisaPublicaDTO> {
    return apiClient.get<PesquisaPublicaDTO>(`/api/public/pesquisas/${id}`);
  },

  async responderPublica(
    id: string,
    data: {
      unidadeId: string;
      clienteAtendimento: string;
      nota: number;
      comentario: string;
    }
  ): Promise<RespostaComManifestacaoDTO> {
    return apiClient.post<RespostaComManifestacaoDTO>(`/api/public/pesquisas/${id}/respostas`, data);
  },
};
