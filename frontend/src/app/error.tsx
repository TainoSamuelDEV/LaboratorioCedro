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
    console.error('[ERRO_NEXT_APP]:', error);
  }, [error]);

  const detalhes = error
    ? `${error.name}: ${error.message}${error.digest ? `\nDigest: ${error.digest}` : ''}${
        error.stack ? `\n\nStack:\n${error.stack}` : ''
      }`
    : undefined;

  return (
    <ErrorView
      tipo="500"
      codigo={500}
      titulo="Algo não saiu como esperado."
      descricao="Tivemos uma falha ao carregar esta página. Você pode tentar novamente ou voltar ao início."
      detalhesTecnicos={detalhes}
      onReset={() => reset()}
      showBack={true}
      showHome={true}
      homeHref="/dashboard"
    />
  );
}
