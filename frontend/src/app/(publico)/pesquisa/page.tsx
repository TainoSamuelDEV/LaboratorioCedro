'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EvaluationPageSkeleton } from '../../../components/ui/Skeleton';
import { pesquisaService } from '../../../services/pesquisa.service';

const FALLBACK_PESQUISA_ID = 'c1d2e3f4-a5b6-4c7d-8e9f-111111111111';

export default function PesquisaDefaultRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelado = false;

    pesquisaService
      .listar(true)
      .then((pesquisas) => {
        if (cancelado) return;
        if (pesquisas && pesquisas.length > 0) {
          router.replace(`/pesquisa/${pesquisas[0].id}`);
        } else {
          router.replace(`/pesquisa/${FALLBACK_PESQUISA_ID}`);
        }
      })
      .catch(() => {
        if (!cancelado) {
          router.replace(`/pesquisa/${FALLBACK_PESQUISA_ID}`);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [router]);

  return (
    <main className="cedro-eval-main animate-rise">
      <header className="cedro-eval-brand">
        <img
          src="/logo-cedro-completa.svg"
          alt="Laboratório Cedro"
          className="cedro-eval-logo"
        />
      </header>
      <EvaluationPageSkeleton />
    </main>
  );
}
