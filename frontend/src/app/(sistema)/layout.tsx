'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/layout/Header';
import { Sidebar, SidebarProvider } from '../../components/layout/Sidebar';
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
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-[#F3F3F3]">
        <Sidebar />
        {/* SidebarInset (padrão shadcn sidebar-08 variant="inset") */}
        <div className="flex flex-1 flex-col min-w-0 bg-white md:my-2 md:mr-2 md:rounded-xl md:border md:border-[#E3E3E3]/80 md:shadow-xs overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
