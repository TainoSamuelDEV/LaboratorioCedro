'use client';

import React from 'react';
import { ErrorView } from '../components/ui/ErrorView';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const detalhes = error
    ? `${error.name}: ${error.message}${error.digest ? `\nDigest: ${error.digest}` : ''}`
    : undefined;

  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 font-sans text-slate-800 antialiased min-h-screen flex items-center justify-center p-4">
        <ErrorView
          tipo="500"
          codigo="FALHA_CRÍTICA"
          titulo="Falha Geral do Sistema"
          descricao="Ocorreu um erro no carregamento da estrutura base da aplicação. Clique abaixo para tentar restabelecer a conexão."
          detalhesTecnicos={detalhes}
          onReset={() => reset()}
          showBack={false}
          showHome={true}
          homeHref="/"
        />
      </body>
    </html>
  );
}
