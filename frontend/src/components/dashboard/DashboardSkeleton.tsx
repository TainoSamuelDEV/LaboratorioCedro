import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando painel de indicadores...</span>

      {/* Topo: Título e seletor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>

      {/* Grid de 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Grid Intermediário (Bento 2 Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Distribuição de Notas */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-4">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 flex-1 rounded-full" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Desempenho por Pesquisa */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-52 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="space-y-3 pt-1">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="p-3 border border-[#E3E3E3] rounded-lg flex items-center justify-between"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
                <Skeleton className="h-8 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panorama por Unidade */}
      <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-3">
        <Skeleton className="h-5 w-60 rounded" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* Fluxo de Últimas Manifestações */}
      <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-64 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="space-y-2.5 pt-1">
          {[1, 2, 3].map((m) => (
            <div
              key={m}
              className="p-3 border border-[#E3E3E3] rounded-lg flex items-center justify-between"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-56 rounded" />
              </div>
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
