'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquareWarning,
  ClockAlert,
  Building2,
  Users,
  LogOut,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  AlertOctagon,
  LifeBuoy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BRAND_CONFIG } from '../../config/brand';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '../ui/Drawer';

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [openMobile, setOpenMobile] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <SidebarContext.Provider value={{ open, setOpen, openMobile, setOpenMobile, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  ouvidoriaOrAdmin?: boolean;
  group: 'plataforma' | 'governanca';
  items?: NavSubItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    group: 'plataforma',
    items: [
      { title: 'Visão Geral & CSAT', url: '/dashboard' },
      { title: 'Pendências SLA', url: '/pendencias' },
    ],
  },
  {
    label: 'Manifestações',
    href: '/manifestacoes',
    icon: MessageSquareWarning,
    group: 'plataforma',
    items: [
      { title: 'Central de Tratativas', url: '/manifestacoes' },
      { title: 'Monitoramento de Prazo', url: '/pendencias' },
    ],
  },
  {
    label: 'Pendências SLA',
    href: '/pendencias',
    icon: ClockAlert,
    group: 'plataforma',
  },
  {
    label: 'Pesquisas CSAT',
    href: '/pesquisas',
    icon: ClipboardList,
    ouvidoriaOrAdmin: true,
    group: 'plataforma',
  },
  {
    label: 'Relatórios CSV',
    href: '/relatorios',
    icon: FileText,
    ouvidoriaOrAdmin: true,
    group: 'plataforma',
  },
  {
    label: 'Unidades',
    href: '/unidades',
    icon: Building2,
    ouvidoriaOrAdmin: true,
    group: 'governanca',
  },
  {
    label: 'Usuários & Perfis',
    href: '/usuarios',
    icon: Users,
    adminOnly: true,
    group: 'governanca',
  },
  {
    label: 'Telas de Erro',
    href: '/erros',
    icon: AlertOctagon,
    adminOnly: true,
    group: 'governanca',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout, ehAdmin, ehOuvidoria } = useAuth();
  const { open, openMobile, setOpenMobile } = useSidebar();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '/dashboard': true,
    '/manifestacoes': true,
  });

  // Drawers da Sidebar-08 (Perfil do Usuário, Organização e Suporte NIT)
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [orgDrawerOpen, setOrgDrawerOpen] = useState(false);
  const [suporteDrawerOpen, setSuporteDrawerOpen] = useState(false);

  const filteredNav = navItems.filter((item) => {
    if (item.adminOnly && !ehAdmin) return false;
    if (item.ouvidoriaOrAdmin && !ehAdmin && !ehOuvidoria) return false;
    return true;
  });

  const plataformaItems = filteredNav.filter((i) => i.group === 'plataforma');
  const governancaItems = filteredNav.filter((i) => i.group === 'governanca');

  const getPerfilLabel = (perfil?: string) => {
    switch (perfil) {
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'OPERADOR_OUVIDORIA':
        return 'Ouvidoria Geral';
      case 'COORDENADOR_UNIDADE':
        return 'Coordenador de Unidade';
      default:
        return 'Usuário';
    }
  };

  const getInitials = (nome?: string) => {
    if (!nome) return 'CD';
    const parts = nome.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const toggleExpand = (href: string) => {
    setExpandedGroups((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  const renderSidebarBody = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full justify-between select-none text-[#323232]">
      {/* SidebarHeader (sidebar-08 pattern: Brand Switcher Button size="lg") */}
      <div className="p-2">
        <button
          type="button"
          onClick={() => setOrgDrawerOpen(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-black/[0.04] transition-colors text-left cursor-pointer group"
        >
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-white border border-[#E3E3E3] shadow-2xs shrink-0">
            <img src="/logo-cedro.svg" alt="Cedro" className="size-6 block" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
            <span className="truncate font-black text-[#075618] text-[13px]">
              {BRAND_CONFIG.name}
            </span>
            <span className="truncate text-[11px] font-medium text-[#5E5E5E]">
              Plataforma {BRAND_CONFIG.assets.logoBadge}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-[#999999] group-hover:text-[#171717] shrink-0" />
        </button>
      </div>

      {/* SidebarContent (NavMain + NavProjects/Governanca + NavSecondary) */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-5">
        {/* Grupo 1: Plataforma Operacional */}
        <div>
          <div className="px-2.5 pb-1.5 text-[11px] font-bold text-[#999999] uppercase tracking-wider">
            Plataforma
          </div>
          <ul className="space-y-0.5">
            {plataformaItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              const hasSub = Boolean(item.items && item.items.length > 0);
              const isExpanded = expandedGroups[item.href];

              return (
                <li key={item.href}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={() => isMobileDrawer && setOpenMobile(false)}
                      className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                        isActive
                          ? 'bg-[#02A562] text-white font-bold shadow-2xs'
                          : 'text-[#323232] font-medium hover:bg-black/[0.04] hover:text-[#075618]'
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-[#5E5E5E]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>

                    {hasSub && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.href)}
                        aria-label="Expandir subitens"
                        className={`ml-0.5 p-1.5 rounded-md transition-transform cursor-pointer ${
                          isActive
                            ? 'text-[#075618] hover:bg-black/[0.05]'
                            : 'text-[#999999] hover:text-[#171717] hover:bg-black/[0.04]'
                        }`}
                      >
                        <ChevronRight
                          className={`size-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSub && isExpanded && (
                    <ul className="mt-0.5 ml-4 pl-2.5 border-l border-[#E3E3E3] space-y-0.5 py-0.5">
                      {item.items!.map((sub) => {
                        const subActive = pathname === sub.url;
                        return (
                          <li key={sub.title}>
                            <Link
                              href={sub.url}
                              onClick={() => isMobileDrawer && setOpenMobile(false)}
                              className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                subActive
                                  ? 'font-bold text-[#075618] bg-[#e6f6ef]/70'
                                  : 'text-[#5E5E5E] hover:text-[#171717] hover:bg-black/[0.03]'
                              }`}
                            >
                              {sub.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Grupo 2: Governança & Cadastros */}
        {governancaItems.length > 0 && (
          <div>
            <div className="px-2.5 pb-1.5 text-[11px] font-bold text-[#999999] uppercase tracking-wider">
              Governança
            </div>
            <ul className="space-y-0.5">
              {governancaItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => isMobileDrawer && setOpenMobile(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                        isActive
                          ? 'bg-[#02A562] text-white font-bold shadow-2xs'
                          : 'text-[#323232] font-medium hover:bg-black/[0.04] hover:text-[#075618]'
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-[#5E5E5E]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Grupo 3: NavSecondary (sidebar-08 bottom secondary links) */}
        <div className="pt-2">
          <div className="px-2.5 pb-1.5 text-[11px] font-bold text-[#999999] uppercase tracking-wider">
            Suporte & Atalhos
          </div>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/pesquisas"
                onClick={() => isMobileDrawer && setOpenMobile(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5E5E5E] hover:text-[#075618] hover:bg-black/[0.04] transition-colors"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span>Links de Avaliação Pública</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setSuporteDrawerOpen(true)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5E5E5E] hover:text-[#075618] hover:bg-black/[0.04] transition-colors text-left cursor-pointer"
              >
                <LifeBuoy className="size-3.5 shrink-0" />
                <span>Suporte Técnico NIT</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* SidebarFooter (sidebar-08 NavUser button that opens User Drawer) */}
      <div className="p-2 border-t border-[#E3E3E3]/70">
        <button
          type="button"
          onClick={() => setUserDrawerOpen(true)}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-black/[0.04] transition-colors text-left cursor-pointer group"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#075618] text-white text-xs font-black shrink-0">
            {getInitials(usuario?.nome)}
          </div>
          <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
            <span className="truncate font-bold text-[#171717]">
              {usuario?.nome || 'Usuário'}
            </span>
            <span className="truncate text-[11px] text-[#5E5E5E]">
              {usuario?.email || getPerfilLabel(usuario?.perfil)}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-[#999999] group-hover:text-[#171717] shrink-0" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop (sidebar-08 variant="inset") */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-[#F3F3F3] transition-all duration-200 ease-in-out ${
          open ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="w-64 h-svh sticky top-0 flex flex-col">{renderSidebarBody(false)}</div>
      </aside>

      {/* Sidebar Mobile dentro de um Drawer (Gaveta) */}
      <Drawer open={openMobile} onOpenChange={setOpenMobile} direction="left">
        <DrawerContent showCloseButton={true} className="!bg-[#F3F3F3]">
          <div className="h-full pt-2">{renderSidebarBody(true)}</div>
        </DrawerContent>
      </Drawer>

      {/* Drawer da Conta do Usuário (NavUser Drawer) */}
      <Drawer open={userDrawerOpen} onOpenChange={setUserDrawerOpen} direction="bottom">
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Minha Conta Corporativa</DrawerTitle>
            <DrawerDescription>
              Credenciais e permissões RBAC ativas na sessão atual
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F3F3F3] border border-[#E3E3E3]">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#075618] text-white text-base font-black shrink-0">
                {getInitials(usuario?.nome)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-[#171717] truncate">{usuario?.nome}</div>
                <div className="text-xs text-[#5E5E5E] truncate">{usuario?.email}</div>
                <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#e6f6ef] text-[#075618]">
                  <ShieldCheck className="size-3" />
                  {getPerfilLabel(usuario?.perfil)}
                </div>
              </div>
            </div>

            {usuario?.unidadeId && (
              <div className="p-3 rounded-lg border border-[#E3E3E3] text-xs text-[#323232]">
                <span className="font-bold text-[#171717]">Unidade Vinculada:</span>{' '}
                <span className="font-mono">{usuario.unidadeId}</span>
              </div>
            )}
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose>Fechar</DrawerClose>
            <button
              type="button"
              onClick={() => {
                setUserDrawerOpen(false);
                logout();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CA2E24] hover:bg-[#b0261d] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Sair do Sistema
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer de Informações da Organização (SidebarHeader Switcher) */}
      <Drawer open={orgDrawerOpen} onOpenChange={setOrgDrawerOpen} direction="bottom">
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>{BRAND_CONFIG.name}</DrawerTitle>
            <DrawerDescription>{BRAND_CONFIG.subtitle}</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-3 text-xs text-[#323232]">
            <div className="flex items-center justify-center py-4 bg-[#F3F3F3] rounded-xl border border-[#E3E3E3]">
              <img src="/logo-cedro-completa.svg" alt="Laboratório Cedro" className="h-9 w-auto" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg border border-[#E3E3E3]">
                <div className="text-[10px] font-bold uppercase text-[#999999]">Departamento</div>
                <div className="font-bold text-[#171717] mt-0.5">{BRAND_CONFIG.department}</div>
              </div>
              <div className="p-3 rounded-lg border border-[#E3E3E3]">
                <div className="text-[10px] font-bold uppercase text-[#999999]">Versão</div>
                <div className="font-mono font-bold text-[#075618] mt-0.5">
                  {BRAND_CONFIG.version}
                </div>
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose>Fechar</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer de Suporte Técnico NIT */}
      <Drawer open={suporteDrawerOpen} onOpenChange={setSuporteDrawerOpen} direction="bottom">
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Suporte Técnico — NIT Cedro</DrawerTitle>
            <DrawerDescription>
              Atendimento interno para coordenadores de unidade e operadores da ouvidoria
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-3 text-xs text-[#323232]">
            <div className="p-3.5 rounded-xl bg-[#e6f6ef] border border-[#93CBA0] text-[#075618] flex items-start gap-2.5">
              <Sparkles className="size-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Governança de SLA Automatizada</div>
                <p className="mt-1 text-[#255521]">
                  Avaliações com notas 1 a 3 geram protocolo automático de manifestação com cálculo de prazo em horas úteis.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[#E3E3E3] space-y-1">
              <div>
                <span className="font-bold text-[#171717]">E-mail NIT:</span>{' '}
                <span>{BRAND_CONFIG.supportEmail}</span>
              </div>
              <div>
                <span className="font-bold text-[#171717]">Portal Institucional:</span>{' '}
                <span>{BRAND_CONFIG.website}</span>
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose>Entendi</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
