import React from 'react';
import { ErrorView } from '../components/ui/ErrorView';

export const metadata = {
  title: 'Página Não Encontrada (404) • Laboratório Cedro',
  description: 'O endereço acessado não existe ou foi removido.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4">
      <ErrorView
        tipo="404"
        codigo={404}
        titulo="Página Não Encontrada"
        descricao="O endereço que você tentou acessar não foi localizado em nossa plataforma. Ele pode ter sido movido, renomeado ou a URL pode conter algum caractere inválido."
        showBack={true}
        showHome={true}
        homeHref="/dashboard"
      />
    </div>
  );
}
