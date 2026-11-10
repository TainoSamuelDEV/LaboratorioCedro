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
      <body className="bg-white antialiased min-h-screen m-0">
        <ErrorView
          tipo="500"
          codigo={500}
          titulo="Não foi possível carregar o sistema."
          descricao="Ocorreu uma falha na estrutura principal da aplicação. Tente recarregar a página."
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
