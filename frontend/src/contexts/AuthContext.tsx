'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { UsuarioDTO } from '../types/api';

interface AuthContextType {
  usuario: UsuarioDTO | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  ehAdmin: boolean;
  ehOuvidoria: boolean;
  ehCoordenador: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cedro_cx_token');
    const usuarioSalvo = localStorage.getItem('cedro_cx_usuario');

    if (token && usuarioSalvo) {
      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch {
        localStorage.removeItem('cedro_cx_usuario');
      }
    }
    setCarregando(false);

    const handleUnauthorized = () => {
      setUsuario(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, senha: string) => {
    const res = await authService.login(email, senha);
    setUsuario(res.usuario);
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const ehAdmin = usuario?.perfil === 'ADMINISTRADOR';
  const ehOuvidoria = usuario?.perfil === 'OPERADOR_OUVIDORIA';
  const ehCoordenador = usuario?.perfil === 'COORDENADOR_UNIDADE';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        login,
        logout,
        ehAdmin,
        ehOuvidoria,
        ehCoordenador,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
