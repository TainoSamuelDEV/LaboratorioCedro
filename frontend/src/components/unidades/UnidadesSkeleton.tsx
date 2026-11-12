import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function UnidadesSkeleton() {
  return (
    <div className="space-y-6 w-full" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-11 flex-1 min-w-[240px] rounded-lg" />
      </div>

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
            <Skeleton className="h-4 w-1/2 rounded" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="pt-3 border-t border-[#EEE] flex items-center justify-between">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UnidadeDetalheSkeleton() {
  return (
    <div className="space-y-6 w-full" aria-busy="true" aria-live="polite">
      <Skeleton className="h-4 w-32 rounded" />

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80 max-w-full rounded-lg" />
          <Skeleton className="h-4 w-60 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
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
