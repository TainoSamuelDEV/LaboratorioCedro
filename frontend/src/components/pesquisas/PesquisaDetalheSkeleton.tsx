import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function PesquisaDetalheSkeleton() {
  return (
    <div className="space-y-6 w-full" aria-busy="true" aria-live="polite">
      {/* Botão Voltar */}
      <Skeleton className="h-4 w-32 rounded" />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-60 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      {/* Grid 2 colunas Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>

      {/* Tabela de Manifestações */}
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
