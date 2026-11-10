'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/Sidebar';
import { ErrorView } from '../../components/ui/ErrorView';
import { AppShellSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { PerfilUsuario } from '../../types/api';

const REGRAS_ACESSO_ROTAS: Array<{ prefixo: string; perfis: PerfilUsuario[] }> = [
  { prefixo: '/unidades', perfis: ['ADMINISTRADOR'] },
  { prefixo: '/usuarios', perfis: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA'] },
  { prefixo: '/pesquisas', perfis: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA'] },
  { prefixo: '/relatorios', perfis: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA'] },
  {
    prefixo: '/dashboard',
    perfis: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA', 'COORDENADOR_UNIDADE'],
  },
  {
    prefixo: '/manifestacoes',
    perfis: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA', 'COORDENADOR_UNIDADE'],
  },
  {
    prefixo: '/pendencias',
    perfis: ['ADMINISTRADOR', 'OPERADOR_OUVIDORIA', 'COORDENADOR_UNIDADE'],
  },
];

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!carregando && !usuario) {
      router.replace('/login');
    }
  }, [usuario, carregando, router]);

  const possuiPermissaoNaRota = useMemo(() => {
    if (!usuario) return false;
    const regra = REGRAS_ACESSO_ROTAS.find(
      (r) => pathname === r.prefixo || pathname.startsWith(`${r.prefixo}/`)
    );
    if (!regra) return true;
    return regra.perfis.includes(usuario.perfil);
  }, [usuario, pathname]);

  if (carregando || !usuario) {
    return <AppShellSkeleton />;
  }

  return (
    <div className="cedro-admin-shell">
      <Sidebar />
      <main id="main" className="cedro-admin-main">
        {possuiPermissaoNaRota ? (
          children
        ) : (
          <ErrorView embedded tipo="403" codigo={403} />
        )}
      </main>
    </div>
  );
}
