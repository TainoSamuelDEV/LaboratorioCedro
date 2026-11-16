import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function ManifestacoesTableSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-[#E3E3E3] shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] overflow-hidden p-4 space-y-3"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#EEE]">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-4 w-40 rounded" />
      </div>

      <div className="space-y-3 pt-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 py-2 border-b border-[#EEE] last:border-b-0"
          >
            <Skeleton className="h-4 w-24 sm:w-32 rounded shrink-0" />
            <Skeleton className="hidden sm:block h-4 w-28 rounded" />
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className="hidden md:block h-4 flex-1 max-w-xs rounded" />
            <Skeleton className="hidden lg:block h-4 w-16 rounded" />
            <Skeleton className="h-6 w-20 sm:w-24 rounded-full shrink-0" />
            <Skeleton className="hidden sm:block h-3 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
