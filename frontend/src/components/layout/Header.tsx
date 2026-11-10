'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api-client';

export function Header() {
  const { usuario } = useAuth();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    apiClient
      .get<{ status: string }>('/api/health')
      .then((data) => setBackendOnline(data?.status === 'ok'))
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E3E3E3] px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#999999]">
          Ambiente de Operação:
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-[#e6f6ef] text-[#075618]">
          <img src="/logo-cedro.svg" alt="Cedro" className="w-4 h-4 block flex-shrink-0" />
          Plataforma INDECX • Cedro
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Indicador de Status da API */}
        <div className="flex items-center gap-1.5 text-xs text-[#323232]">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline === true
                ? 'bg-[#02A562] animate-pulse'
                : backendOnline === false
                ? 'bg-[#CA2E24]'
                : 'bg-[#F29222]'
            }`}
          />
          <span className="text-[11px] font-bold">
            {backendOnline === true
              ? 'API Online'
              : backendOnline === false
              ? 'API Offline'
              : 'Verificando API...'}
          </span>
        </div>

        {/* Informação de Unidade se for Coordenador */}
        {usuario?.unidadeId && (
          <div className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#075618] font-bold">
            Unidade Vinculada: {usuario.unidadeId.substring(0, 8)}...
          </div>
        )}
      </div>
    </header>
  );
}
