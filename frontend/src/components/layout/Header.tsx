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
    <header className="h-16 bg-white border-b border-[var(--border-subtle)] px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500">Ambiente de Operação:</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
          Back-end Express (POO 4 Camadas)
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Indicador de Status da API */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline === true
                ? 'bg-emerald-500 animate-pulse'
                : backendOnline === false
                ? 'bg-rose-500'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px]">
            {backendOnline === true
              ? 'API Online'
              : backendOnline === false
              ? 'API Offline'
              : 'Verificando API...'}
          </span>
        </div>

        {/* Informação de Unidade se for Coordenador */}
        {usuario?.unidadeId && (
          <div className="text-xs px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-medium">
            Unidade Vinculada: {usuario.unidadeId.substring(0, 8)}...
          </div>
        )}
      </div>
    </header>
  );
}
