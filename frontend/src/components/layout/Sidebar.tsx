'use client';

import React from 'react';
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
  FileText,
  AlertOctagon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  ouvidoriaOrAdmin?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Pesquisas', href: '/pesquisas', icon: ClipboardList, ouvidoriaOrAdmin: true },
  { label: 'Manifestações', href: '/manifestacoes', icon: MessageSquareWarning },
  { label: 'Pendências SLA', href: '/pendencias', icon: ClockAlert },
  { label: 'Relatórios CSV', href: '/relatorios', icon: FileText, ouvidoriaOrAdmin: true },
  { label: 'Unidades', href: '/unidades', icon: Building2, ouvidoriaOrAdmin: true },
  { label: 'Usuários', href: '/usuarios', icon: Users, adminOnly: true },
  { label: 'Telas de Erro', href: '/erros', icon: AlertOctagon, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout, ehAdmin, ehOuvidoria } = useAuth();

  const filteredNav = navItems.filter((item) => {
    if (item.adminOnly && !ehAdmin) return false;
    if (item.ouvidoriaOrAdmin && !ehAdmin && !ehOuvidoria) return false;
    return true;
  });

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

  return (
    <aside className="w-64 bg-white border-r border-[#E3E3E3] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-20">
      {/* Topo / Logo Oficial */}
      <div className="p-5 border-b border-[#E3E3E3]">
        <BrandLogo size="md" showSubtitle showBadge />
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold text-[#999999] uppercase tracking-wider">
          Módulos Operacionais
        </div>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-[#02A562] text-white shadow-xs font-bold'
                  : 'text-[#323232] font-normal hover:text-[#075618] hover:bg-[#e6f6ef]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-[#999999] group-hover:text-[#075618]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé do Usuário Logado */}
      <div className="p-4 border-t border-[#E3E3E3] bg-[#F3F3F3]/60">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-bold text-[#171717] truncate">
              {usuario?.nome || 'Carregando...'}
            </span>
            <span className="text-[11px] text-[#5E5E5E] truncate">
              {getPerfilLabel(usuario?.perfil)}
            </span>
          </div>
          <button
            onClick={logout}
            title="Sair do sistema"
            className="p-1.5 rounded-lg text-[#5E5E5E] hover:text-[#CA2E24] hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
