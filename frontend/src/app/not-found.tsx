import React from 'react';
import { ErrorView } from '../components/ui/ErrorView';

export const metadata = {
  title: 'Não encontramos esta página (404) | Laboratório Cedro',
  description: 'O endereço acessado não existe ou foi removido.',
};

export default function NotFound() {
  return (
    <ErrorView
      tipo="404"
      codigo={404}
      titulo="Não encontramos esta página."
      descricao="Confira se o link está completo ou volte para continuar navegando."
      showBack={true}
      showHome={true}
      homeHref="/dashboard"
    />
  );
}
