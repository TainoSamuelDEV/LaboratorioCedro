import { LoginResponseDTO, UsuarioDTO } from '../types/api';
import { apiClient } from './api-client';

export const authService = {
  async login(email: string, senha: string): Promise<LoginResponseDTO> {
    const res = await apiClient.post<LoginResponseDTO>('/api/auth/login', { email, senha });
    localStorage.setItem('cedro_cx_token', res.token);
    localStorage.setItem('cedro_cx_usuario', JSON.stringify(res.usuario));
    return res;
  },

  async me(): Promise<UsuarioDTO> {
    return apiClient.get<UsuarioDTO>('/api/auth/me');
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cedro_cx_token');
      localStorage.removeItem('cedro_cx_usuario');
      window.location.href = '/login';
    }
  },
};
