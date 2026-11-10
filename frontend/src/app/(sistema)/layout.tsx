'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { useAuth } from '../../contexts/AuthContext';

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (!carregando && !usuario) {
      router.replace('/login');
    }
  }, [usuario, carregando, router]);

  if (carregando) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-canvas)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
          <span className="text-xs text-slate-500">Verificando credenciais...</span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[var(--bg-canvas)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
