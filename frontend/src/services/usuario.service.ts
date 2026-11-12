import { AtualizarUsuarioDTO, CriarUsuarioDTO, UsuarioDetalhadoDTO, UsuarioDTO } from '../types/api';
import { apiClient } from './api-client';

export const usuarioService = {
  async listar(): Promise<UsuarioDTO[]> {
    return apiClient.get<UsuarioDTO[]>('/api/usuarios');
  },

  async obterPorId(id: string): Promise<UsuarioDetalhadoDTO> {
    return apiClient.get<UsuarioDetalhadoDTO>(`/api/usuarios/${id}`);
  },

  async criar(data: CriarUsuarioDTO): Promise<UsuarioDTO> {
    return apiClient.post<UsuarioDTO>('/api/usuarios', data);
  },

  async atualizar(id: string, data: AtualizarUsuarioDTO): Promise<UsuarioDTO> {
    return apiClient.patch<UsuarioDTO>(`/api/usuarios/${id}`, data);
  },

  async alternarStatus(id: string, ativo: boolean): Promise<UsuarioDTO> {
    return apiClient.patch<UsuarioDTO>(`/api/usuarios/${id}`, { ativo });
  },
};
