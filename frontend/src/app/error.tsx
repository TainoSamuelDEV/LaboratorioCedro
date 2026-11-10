'use client';

import React, { useEffect } from 'react';
import { ErrorView } from '../components/ui/ErrorView';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registra o erro no console do navegador para diagnóstico
    console.error('[ERRO_NEXT_APP]:', error);
  }, [error]);

  const detalhes = error
    ? `${error.name}: ${error.message}${error.digest ? `\nDigest: ${error.digest}` : ''}${
        error.stack ? `\n\nStack:\n${error.stack}` : ''
      }`
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4">
      <ErrorView
        tipo="500"
        codigo={500}
        titulo="Ocorreu um Erro Inesperado"
        descricao="Identificamos uma falha no carregamento deste módulo. Nenhuma informação foi corrompida. Você pode tentar recarregar ou retornar ao painel principal."
        detalhesTecnicos={detalhes}
        onReset={() => reset()}
        showBack={true}
        showHome={true}
        homeHref="/dashboard"
      />
    </div>
  );
}
