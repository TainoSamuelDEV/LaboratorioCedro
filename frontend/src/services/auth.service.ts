import { LoginResponseDTO, PerfilUsuario, UsuarioDTO } from '../types/api';
import { apiClient } from './api-client';

export interface SignupPayload {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  unidadeId?: string;
}

export const authService = {
  async login(email: string, senha: string): Promise<LoginResponseDTO> {
    const res = await apiClient.post<LoginResponseDTO>('/api/auth/login', { email, senha });
    localStorage.setItem('cedro_cx_token', res.token);
    localStorage.setItem('cedro_cx_usuario', JSON.stringify(res.usuario));
    return res;
  },

  async signup(payload: SignupPayload): Promise<LoginResponseDTO> {
    const res = await apiClient.post<LoginResponseDTO>('/api/auth/signup', payload);
    localStorage.setItem('cedro_cx_token', res.token);
    localStorage.setItem('cedro_cx_usuario', JSON.stringify(res.usuario));
    return res;
  },

  async listarUnidadesPublicas(): Promise<{ id: string; nome: string }[]> {
    return apiClient.get<{ id: string; nome: string }[]>('/api/auth/unidades');
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
