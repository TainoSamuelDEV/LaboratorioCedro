'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { PerfilUsuario } from '../../types/api';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../ui/Drawer';

interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  perfisPermitidos: PerfilUsuario[];
  grupo: 'operacional' | 'administrativo';
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    perfisPermitidos: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA', 'COORDENADOR_UNIDADE'],
    grupo: 'operacional',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />
      </svg>
    ),
  },
  {
    id: 'pesquisas',
    label: 'Pesquisas',
    href: '/pesquisas',
    perfisPermitidos: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA'],
    grupo: 'operacional',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    id: 'manifestacoes',
    label: 'Manifestações',
    href: '/manifestacoes',
    perfisPermitidos: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA', 'COORDENADOR_UNIDADE'],
    grupo: 'operacional',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 5h16v11H9l-5 4z" />
      </svg>
    ),
  },
  {
    id: 'pendencias',
    label: 'Pendências',
    href: '/pendencias',
    perfisPermitidos: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA', 'COORDENADOR_UNIDADE'],
    grupo: 'operacional',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    href: '/relatorios',
    perfisPermitidos: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA'],
    grupo: 'operacional',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 20V4M4 20h16M8 16v-5M13 16V8M18 16v-3" />
      </svg>
    ),
  },
  {
    id: 'unidades',
    label: 'Unidades',
    href: '/unidades',
    perfisPermitidos: ['ADMINISTRADOR'],
    grupo: 'administrativo',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    href: '/usuarios',
    perfisPermitidos: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA'],
    grupo: 'administrativo',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
];

const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  OPERADOR_OUVIDORIA: 'Ouvidoria',
  COORDENADOR_UNIDADE: 'Coordenador',
};

function obterIniciais(nome?: string): string {
  if (!nome) return 'CE';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuth();

  const [recolhido, setRecolhido] = useState(false);
  const [drawerMobileAberto, setDrawerMobileAberto] = useState(false);

  // Persiste estado de recolhimento do menu lateral no localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem('cedro_menu_recolhido') === '1') {
        setRecolhido(true);
      }
    } catch {
      // ignora bloqueio de storage
    }
  }, []);

  const alternarRecolhimento = () => {
    setRecolhido((atual) => {
      const proximo = !atual;
      try {
        localStorage.setItem('cedro_menu_recolhido', proximo ? '1' : '0');
      } catch {
        // ignora
      }
      return proximo;
    });
  };

  // Fecha o Drawer mobile automaticamente ao navegar
  useEffect(() => {
    setDrawerMobileAberto(false);
  }, [pathname]);

  const itensVisiveis = useMemo(() => {
    if (!usuario) return [];
    return NAV_ITEMS.filter((item) => item.perfisPermitidos.includes(usuario.perfil));
  }, [usuario]);

  const itensOperacionais = useMemo(
    () => itensVisiveis.filter((i) => i.grupo === 'operacional'),
    [itensVisiveis]
  );

  const itensAdministrativos = useMemo(
    () => itensVisiveis.filter((i) => i.grupo === 'administrativo'),
    [itensVisiveis]
  );

  const verificarAtivo = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    setDrawerMobileAberto(false);
    logout();
    router.replace('/login');
  };

  const iniciais = obterIniciais(usuario?.nome);
  const perfilFormatado = usuario ? PERFIL_LABELS[usuario.perfil] : '';

  return (
    <>
      {/* ====================================================================
          BARRA SUPERIOR MOBILE (< 1024px) + DRAWER DE NAVEGAÇÃO
         ==================================================================== */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#F3F3F3]/90 backdrop-blur-md px-4 pt-3 pb-1">
        <div className="flex items-center justify-between h-14 px-4 bg-white border border-[#E3E3E3] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <Link href="/dashboard" aria-label="Cedro, ir para o Dashboard" className="block">
            <img
              src="/logo-cedro-completa.svg"
              alt="Laboratório Cedro"
              className="h-[42px] w-auto block"
            />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerMobileAberto(true)}
              aria-label="Abrir menu de navegação"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[#171717] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <Drawer
        open={drawerMobileAberto}
        onOpenChange={setDrawerMobileAberto}
        direction="left"
      >
        <DrawerContent className="p-0 flex flex-col justify-between">
          <DrawerHeader className="px-5 pt-5 pb-4 border-b border-[#E3E3E3]">
            <DrawerTitle className="flex items-center">
              <img
                src="/logo-cedro-completa.svg"
                alt="Laboratório Cedro"
                className="h-[42px] w-auto block"
              />
            </DrawerTitle>
          </DrawerHeader>

          <DrawerBody className="p-3 flex-1 flex flex-col gap-1 overflow-y-auto">
            <nav aria-label="Menu mobile" className="flex flex-col gap-1 flex-1">
              {itensOperacionais.map((item) => {
                const ativo = verificarAtivo(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={ativo ? 'page' : undefined}
                    className={`cedro-nav-item ${ativo ? 'is-active' : ''}`}
                  >
                    {item.icon}
                    <span className="cedro-nav-label">{item.label}</span>
                  </Link>
                );
              })}

              {itensAdministrativos.length > 0 && (
                <>
                  <div className="my-2 border-t border-[#E3E3E3]" />
                  {itensAdministrativos.map((item) => {
                    const ativo = verificarAtivo(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={ativo ? 'page' : undefined}
                        className={`cedro-nav-item ${ativo ? 'is-active' : ''}`}
                      >
                        {item.icon}
                        <span className="cedro-nav-label">{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>
          </DrawerBody>

          <DrawerFooter className="p-3 border-t border-[#E3E3E3] bg-white flex-col sm:flex-col items-stretch gap-2">
            <div className="flex items-center gap-2.5 p-1.5 bg-[#F3F3F3] rounded-full">
              <span className="grid place-items-center shrink-0 w-9 h-9 rounded-full bg-[#075618] text-white text-[13px] font-black">
                {iniciais}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block text-sm text-[#171717] leading-tight truncate">
                  {usuario?.nome}
                </strong>
                <small className="block text-xs text-[#5E5E5E] leading-tight truncate">
                  {perfilFormatado}
                </small>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da conta"
                aria-label="Sair da conta"
                className="grid place-items-center shrink-0 w-9 h-9 rounded-full text-[#5E5E5E] hover:text-[#CA2E24] hover:bg-white transition-colors cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* ====================================================================
          SIDEBAR FLUTUANTE DESKTOP (>= 1024px)
         ==================================================================== */}
      <aside
        className={`hidden lg:flex cedro-sidebar ${recolhido ? 'is-collapsed' : ''}`}
      >
        {/* Marca: logo completa alinhada à esquerda quando expandida / símbolo centralizado quando recolhida */}
        <div className="flex items-center justify-start">
          <Link
            href="/dashboard"
            className="cedro-sidebar-logo-wrap"
            aria-label="Cedro, ir para o Dashboard"
          >
            <img
              src={recolhido ? '/logo-cedro.svg?v=2' : '/logo-cedro-completa.svg?v=2'}
              alt="Laboratório Cedro"
              className={recolhido ? 'cedro-logo-icon' : 'cedro-logo-full'}
            />
          </Link>
        </div>

        {/* Navegação Principal */}
        <nav aria-label="Principal" className="flex flex-col gap-1 flex-1">
          {itensOperacionais.map((item) => {
            const ativo = verificarAtivo(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                data-tip={item.label}
                aria-current={ativo ? 'page' : undefined}
                className={`cedro-nav-item ${ativo ? 'is-active' : ''}`}
              >
                {item.icon}
                <span className="cedro-nav-label">{item.label}</span>
              </Link>
            );
          })}

          {itensAdministrativos.length > 0 && (
            <>
              <span className="flex-1" />
              {itensAdministrativos.map((item) => {
                const ativo = verificarAtivo(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    data-tip={item.label}
                    aria-current={ativo ? 'page' : undefined}
                    className={`cedro-nav-item ${ativo ? 'is-active' : ''}`}
                  >
                    {item.icon}
                    <span className="cedro-nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Controles Inferiores: Recolher Menu + Pílula do Usuário */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={alternarRecolhimento}
            aria-expanded={!recolhido}
            aria-label={recolhido ? 'Expandir menu' : 'Recolher menu'}
            data-tip={recolhido ? 'Expandir menu' : 'Recolher menu'}
            className="cedro-nav-item"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`transition-transform duration-250 ${
                recolhido ? 'rotate-180' : ''
              }`}
            >
              <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
            </svg>
            <span className="cedro-nav-label">
              {recolhido ? 'Expandir menu' : 'Recolher menu'}
            </span>
          </button>

          <div
            className={`flex items-center h-12 p-1.5 bg-[#F3F3F3] rounded-full ${
              recolhido ? 'gap-0 justify-center' : 'gap-2.5'
            }`}
            title={
              usuario ? `${usuario.nome}, ${perfilFormatado}` : 'Usuário autenticado'
            }
          >
            <span className="grid place-items-center shrink-0 w-9 h-9 rounded-full bg-[#075618] text-white text-[13px] font-black select-none">
              {iniciais}
            </span>

            <div className="cedro-nav-label min-w-0 flex-1">
              <strong className="block text-[14px] text-[#171717] leading-[1.2] truncate">
                {usuario?.nome}
              </strong>
              <small className="block text-[12px] text-[#5E5E5E] leading-[1.2] truncate">
                {perfilFormatado}
              </small>
            </div>

            {!recolhido && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da conta"
                aria-label="Sair da conta"
                className="grid place-items-center shrink-0 w-8 h-8 rounded-full text-[#5E5E5E] hover:text-[#CA2E24] hover:bg-white transition-colors cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
