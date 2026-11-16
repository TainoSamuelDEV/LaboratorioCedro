import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function UsuariosSkeleton() {
  return (
    <div className="space-y-6 w-full" aria-busy="true" aria-live="polite">
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-11 w-full sm:flex-1 rounded-lg" />
        <Skeleton className="h-11 w-full sm:w-44 rounded-lg" />
      </div>

      <div className="p-4 bg-white rounded-2xl border border-[#E3E3E3] shadow-xs space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-36 sm:w-40 rounded" />
                <Skeleton className="h-3 w-44 sm:w-56 max-w-full rounded" />
              </div>
            </div>
            <Skeleton className="hidden md:block h-6 w-24 rounded-full" />
            <Skeleton className="hidden md:block h-6 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UsuarioDetalheSkeleton() {
  return (
    <div className="space-y-6 w-full" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-32 rounded" />

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-60 rounded-lg" />
            <Skeleton className="h-4 w-44 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
