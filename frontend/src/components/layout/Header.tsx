'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api-client';
import { useSidebar } from './Sidebar';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard & Indicadores',
  '/manifestacoes': 'Central de Manifestações',
  '/pendencias': 'Pendências de SLA',
  '/pesquisas': 'Pesquisas CSAT',
  '/relatorios': 'Relatórios CSV',
  '/unidades': 'Unidades de Atendimento',
  '/usuarios': 'Usuários & Perfis',
  '/erros': 'Telas de Erro',
};

export function Header() {
  const pathname = usePathname();
  const { usuario } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    apiClient
      .get<{ status: string }>('/api/health')
      .then((data) => setBackendOnline(data?.status === 'ok'))
      .catch(() => setBackendOnline(false));
  }, []);

  const baseRoute = '/' + (pathname?.split('/').filter(Boolean)[0] || 'dashboard');
  const pageTitle = ROUTE_TITLES[baseRoute] || 'Painel Operacional';
  const isDetailPage = pathname && pathname.split('/').filter(Boolean).length > 1;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E3E3E3]/80 bg-white px-4">
      {/* Left side: SidebarTrigger + Separator + Breadcrumb (padrão sidebar-08) */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          title="Alternar menu lateral (Ctrl+B)"
          aria-label="Alternar menu lateral"
          className="-ml-1 inline-flex size-8 items-center justify-center rounded-lg text-[#323232] hover:bg-[#F3F3F3] hover:text-[#075618] transition-colors cursor-pointer shrink-0"
        >
          <PanelLeft className="size-4" />
        </button>

        <div className="mr-1 h-4 w-[1px] bg-[#E3E3E3] shrink-0" />

        <nav aria-label="breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-xs sm:text-[13px] min-w-0">
            <li className="hidden md:inline-flex items-center">
              <Link
                href="/dashboard"
                className="text-[#5E5E5E] hover:text-[#075618] transition-colors font-medium"
              >
                Laboratório Cedro
              </Link>
            </li>
            <li className="hidden md:inline-flex items-center text-[#999999]">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="truncate">
              {isDetailPage ? (
                <Link
                  href={baseRoute}
                  className="text-[#5E5E5E] hover:text-[#075618] transition-colors font-medium"
                >
                  {pageTitle}
                </Link>
              ) : (
                <span className="font-bold text-[#171717] truncate">{pageTitle}</span>
              )}
            </li>
            {isDetailPage && (
              <>
                <li className="inline-flex items-center text-[#999999]">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="font-bold text-[#075618] truncate">Detalhes da Tratativa</li>
              </>
            )}
          </ol>
        </nav>
      </div>

      {/* Right side: Status da API + Unidade badge */}
      <div className="flex items-center gap-2.5 shrink-0">
        {usuario?.unidadeId && (
          <div className="hidden sm:inline-flex items-center text-[11px] px-2.5 py-1 rounded-md bg-[#e6f6ef] text-[#075618] font-bold">
            Unidade: {usuario.unidadeId.substring(0, 8)}
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E3E3E3] bg-[#F3F3F3]/60 text-xs text-[#323232]">
          <span
            className={`size-2 rounded-full ${
              backendOnline === true
                ? 'bg-[#02A562] animate-pulse'
                : backendOnline === false
                ? 'bg-[#CA2E24]'
                : 'bg-[#F29222]'
            }`}
          />
          <span className="text-[11px] font-bold">
            {backendOnline === true
              ? 'API Online'
              : backendOnline === false
              ? 'API Offline'
              : 'Conectando...'}
          </span>
        </div>
      </div>
    </header>
  );
}
