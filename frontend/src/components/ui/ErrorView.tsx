'use client';

import React from 'react';

export interface ErrorViewProps {
  codigo?: string | number;
  titulo?: string;
  descricao?: string;
  detalhesTecnicos?: string;
  tipo?: '404' | '500' | '403' | 'conexao' | 'generico';
  onReset?: () => void;
  showBack?: boolean;
  showHome?: boolean;
  homeHref?: string;
  embedded?: boolean;
  className?: string;
}

export function ErrorView({
  codigo,
  tipo = 'generico',
  embedded = false,
  className = '',
}: ErrorViewProps) {
  const presets = {
    '404': {
      codigoPadrao: '404',
      rotulo: 'Página não encontrada',
      toneColor: '#075618',
    },
    '403': {
      codigoPadrao: '403',
      rotulo: 'Acesso restrito',
      toneColor: '#A85F00',
    },
    '500': {
      codigoPadrao: '500',
      rotulo: 'Falha no servidor',
      toneColor: '#CA2E24',
    },
    conexao: {
      codigoPadrao: '503',
      rotulo: 'Serviço indisponível',
      toneColor: '#E65100',
    },
    generico: {
      codigoPadrao: 'Erro',
      rotulo: 'Falha operacional',
      toneColor: '#075618',
    },
  };

  const preset = presets[tipo] || presets.generico;
  const codigoExibido = codigo !== undefined ? String(codigo) : preset.codigoPadrao;

  return (
    <div
      className={`${embedded ? 'w-full bg-white rounded-xl' : 'cedro-eval-page'} ${className}`}
    >
      <main
        className="cedro-eval-main"
        style={{ '--tone-x': preset.toneColor, '--tone': preset.toneColor } as React.CSSProperties}
      >
        <header className="cedro-eval-brand">
          <img
            src="/logo-cedro-completa.svg"
            alt="Laboratório Cedro"
            className="cedro-eval-logo"
          />
        </header>

        <section aria-live="polite">
          <div className="cedro-score !mb-0">
            <b>{codigoExibido}</b>
            <span>{preset.rotulo}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
