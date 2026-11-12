import React from 'react';
import { Card } from './Card';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[#E3E3E3]/80 ${className}`}
    />
  );
}

/**
 * Skeleton anatômico da Página Pública de Avaliação do Cliente
 * Espelha fielmente a estrutura de "Como foi a sua experiência.html"
 */
export function EvaluationPageSkeleton() {
  return (
    <div id="loading" aria-live="polite" aria-busy="true" className="select-none">
      <span className="sr-only">Carregando pesquisa…</span>

      {/* Nome da Unidade */}
      <Skeleton className="h-5 w-40 mb-[22px] rounded" />

      {/* Título Principal H1 */}
      <div className="space-y-2.5 mb-[14px]">
        <Skeleton className="h-10 sm:h-12 w-11/12 rounded-lg" />
        <Skeleton className="h-10 sm:h-12 w-3/5 rounded-lg" />
      </div>

      {/* Descrição Lead */}
      <div className="space-y-2 mb-[16px] max-w-[44ch]">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>

      {/* Instrução "Escolha uma nota de 1 a 5." */}
      <Skeleton className="h-4 w-48 mb-[44px] rounded" />

      {/* Escala 1 a 5 (Trilha + 5 Círculos de 56px) */}
      <div className="cedro-scale">
        <div className="cedro-rail animate-pulse" />
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="cedro-opt">
            <div className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] rounded-full bg-[#F3F3F3] border-2 border-[#E3E3E3] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Veredito ("Toque em um número") */}
      <Skeleton className="h-9 w-56 mt-[40px] rounded-lg" />
    </div>
  );
}

/**
 * Skeleton para Tabelas Operacionais (Manifestações, Pendências, Pesquisas, Unidades, Usuários)
 */
export function TableSkeleton({
  rows = 5,
   columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="w-full overflow-hidden" aria-busy="true" aria-live="polite">
      {/* Cabeçalho da Tabela */}
      <div
        className="grid gap-4 pb-3 border-b border-[#E3E3E3] px-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, idx) => (
          <Skeleton key={idx} className="h-3.5 w-24 rounded" />
        ))}
      </div>

      {/* Linhas da Tabela */}
      <div className="divide-y divide-[#E3E3E3]/60">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="grid gap-4 py-4 px-4 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, cIdx) => (
              <Skeleton
                key={cIdx}
                className={`h-4 rounded ${
                  cIdx === 0
                    ? 'w-32'
                    : cIdx === columns - 1
                    ? 'w-24 justify-self-end'
                    : 'w-28'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton do Dashboard Gerencial (10 Indicadores)
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      {/* 4 Cards Superiores de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-9 w-20 mt-3" />
            <Skeleton className="h-3 w-40 mt-2" />
          </Card>
        ))}
      </div>

      {/* Grid Central: Distribuição de Notas + Prazos Médios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Skeleton className="h-5 w-64 mb-2" />
          <Skeleton className="h-3.5 w-80 mb-5" />
          <div className="space-y-3.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-3 flex-1 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Skeleton className="h-5 w-56 mb-2" />
          <Skeleton className="h-3.5 w-72 mb-5" />
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E3E3E3] space-y-2.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
            <div className="p-4 rounded-xl border border-[#E3E3E3] space-y-2.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full mt-4 rounded-lg" />
        </Card>
      </div>

      {/* Grid Inferior: Volume e Pendências por Unidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((col) => (
          <Card key={col}>
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-3.5 w-64 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex items-center justify-between py-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton da Página de Detalhes da Manifestação (Protocolo + 3 Colunas + Linha do Tempo)
 */
export function DetalheManifestacaoSkeleton() {
  return (
    <div className="space-y-6 w-full" aria-busy="true" aria-live="polite">
      {/* Barra de Topo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-72" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* 3 Colunas de Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Trilha de Auditoria */}
      <Card>
        <Skeleton className="h-5 w-64 mb-5" />
        <div className="space-y-5 pl-4 border-l-2 border-[#E3E3E3]">
          {[1, 2, 3].map((step) => (
            <div key={step} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Skeleton da Estrutura Principal da Aplicação (Sidebar Flutuante + Área de Conteúdo)
 */
export function AppShellSkeleton() {
  return (
    <div className="cedro-admin-shell" aria-busy="true">
      {/* Sidebar Flutuante Skeleton (Desktop) */}
      <aside className="hidden lg:flex cedro-sidebar">
        <Skeleton className="h-12 w-36 rounded-xl" />

        <div className="flex flex-col gap-1.5 flex-1">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-12 w-full rounded-xl" />
          ))}
          <div className="flex-1" />
          {[6, 7].map((item) => (
            <Skeleton key={item} className="h-12 w-full rounded-xl" />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="cedro-admin-main space-y-6">
        <div className="space-y-2 mb-7">
          <Skeleton className="h-9 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <DashboardSkeleton />
      </main>
    </div>
  );
}
