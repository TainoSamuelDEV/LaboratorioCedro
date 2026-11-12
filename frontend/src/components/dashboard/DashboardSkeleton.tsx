import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando painel de indicadores...</span>

      {/* Topo: Título e seletor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div className="space-y-1.5">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      {/* Grid de 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-2"
          >
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-20 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Grid 2 Colunas (.g2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Distribuição de Notas */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-3.5">
          <Skeleton className="h-5 w-44 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="grid grid-cols-[28px_1fr_44px] items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-3 w-8 ml-auto rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho por Pesquisa */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-3.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-52 rounded" />
            <Skeleton className="h-6 w-28 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((k) => (
              <div key={k} className="grid grid-cols-[140px_1fr_44px] items-center gap-3">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-3 w-8 ml-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manifestações Recentes */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-3">
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
