import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function PesquisasSkeleton() {
  return (
    <div className="space-y-6 w-full" aria-busy="true" aria-live="polite">
      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-11 flex-1 min-w-[240px] rounded-lg" />
        <Skeleton className="h-11 w-44 rounded-lg" />
      </div>

      {/* Grid de Cards de Pesquisas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-[#E3E3E3] shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="pt-3 border-t border-[#EEE] flex items-center justify-between">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
