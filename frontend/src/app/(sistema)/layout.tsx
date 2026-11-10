'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { AppShellSkeleton } from '../../components/ui/Skeleton';
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
    return <AppShellSkeleton />;
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
