'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShellSkeleton } from '../components/ui/Skeleton';
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

  return <AppShellSkeleton />;
}
