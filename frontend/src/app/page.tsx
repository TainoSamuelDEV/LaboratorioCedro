'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (!carregando) {
      if (usuario) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [usuario, carregando, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-canvas)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
        <span className="text-xs text-slate-500">Iniciando plataforma...</span>
      </div>
    </div>
  );
}
