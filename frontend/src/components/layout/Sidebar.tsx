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
    <aside className="w-64 bg-white border-r border-[var(--border-subtle)] flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 z-20">
      {/* Topo / Logo */}
      <div className="p-5 border-b border-[var(--border-subtle)]">
        <BrandLogo size="md" showSubtitle />
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Módulos Operacionais
        </div>
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[var(--brand-primary)] text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé do Usuário Logado */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-900 truncate">
              {usuario?.nome || 'Carregando...'}
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {getPerfilLabel(usuario?.perfil)}
            </span>
          </div>
          <button
            onClick={logout}
            title="Sair do sistema"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
