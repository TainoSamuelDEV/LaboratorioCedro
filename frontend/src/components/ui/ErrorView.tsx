'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  titulo,
  descricao,
  detalhesTecnicos,
  tipo = 'generico',
  onReset,
  showBack = true,
  showHome = true,
  homeHref = '/dashboard',
  embedded = false,
  className = '',
}: ErrorViewProps) {
  const router = useRouter();
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const presets = {
    '404': {
      codigoPadrao: '404',
      rotulo: 'Página não encontrada',
      tituloPadrao: 'Não encontramos esta página.',
      descricaoPadrao:
        'Confira se o endereço digitado está completo ou retorne para continuar navegando.',
      toneColor: '#075618',
    },
    '403': {
      codigoPadrao: '403',
      rotulo: 'Acesso restrito',
      tituloPadrao: 'Você não tem permissão para acessar esta área.',
      descricaoPadrao:
        'Seu perfil atual não possui privilégios para visualizar este módulo ou unidade.',
      toneColor: '#A85F00',
    },
    '500': {
      codigoPadrao: '500',
      rotulo: 'Falha no servidor',
      tituloPadrao: 'Algo não saiu como esperado.',
      descricaoPadrao:
        'Tivemos uma instabilidade ao processar sua solicitação. Tente novamente em instantes.',
      toneColor: '#CA2E24',
    },
    conexao: {
      codigoPadrao: '503',
      rotulo: 'Sem comunicação com o servidor',
      tituloPadrao: 'Serviço temporariamente indisponível.',
      descricaoPadrao:
        'Não foi possível conectar à API da plataforma. Confira sua conexão e tente novamente.',
      toneColor: '#E65100',
    },
    generico: {
      codigoPadrao: 'Erro',
      rotulo: 'Falha operacional',
      tituloPadrao: 'Não foi possível concluir esta ação.',
      descricaoPadrao:
        'Tente novamente ou volte para a página anterior.',
      toneColor: '#075618',
    },
  };

  const preset = presets[tipo] || presets.generico;
  const codigoExibido = codigo !== undefined ? String(codigo) : preset.codigoPadrao;
  const tituloExibido = titulo || preset.tituloPadrao;
  const descricaoExibida = descricao || preset.descricaoPadrao;

  const copiarDetalhes = () => {
    if (!detalhesTecnicos) return;
    navigator.clipboard.writeText(detalhesTecnicos);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

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
          <div className="cedro-score">
            <b>{codigoExibido}</b>
            <span>{preset.rotulo}</span>
          </div>

          <p className="cedro-eval-unit">Laboratório Cedro</p>

          <h1 className="cedro-eval-h1">{tituloExibido}</h1>

          <p className="cedro-eval-lead !mb-0">{descricaoExibida}</p>

          <div className="cedro-actions">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="cedro-btn-send"
              >
                Tentar novamente
              </button>
            )}

            {showHome && !onReset && (
              <Link href={homeHref} className="cedro-btn-send inline-flex items-center no-underline">
                Ir para o início
              </Link>
            )}

            {showBack && (
              <button
                type="button"
                onClick={() => router.back()}
                className="cedro-btn-quiet"
              >
                Voltar à página anterior
              </button>
            )}

            {showHome && onReset && (
              <Link href={homeHref} className="cedro-btn-quiet no-underline">
                Ir para o início
              </Link>
            )}
          </div>

          {detalhesTecnicos && (
            <div className="mt-10 pt-6 border-t border-[#E3E3E3] max-w-[54ch]">
              <button
                type="button"
                onClick={() => setDetalhesAbertos(!detalhesAbertos)}
                className="cedro-btn-quiet !py-0 !text-sm !text-[#5E5E5E] hover:!text-[#171717]"
              >
                {detalhesAbertos ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}
              </button>

              {detalhesAbertos && (
                <div className="mt-3 relative rounded-[10px] bg-[#F3F3F3] border border-[#E3E3E3] p-4 text-xs font-mono text-[#323232] leading-relaxed overflow-x-auto">
                  <button
                    type="button"
                    onClick={copiarDetalhes}
                    className="float-right ml-3 px-2.5 py-1 rounded bg-white border border-[#E3E3E3] text-[11px] font-sans font-bold text-[#171717] hover:border-[#075618] cursor-pointer"
                  >
                    {copiado ? 'Copiado' : 'Copiar'}
                  </button>
                  <pre className="whitespace-pre-wrap break-all m-0">{detalhesTecnicos}</pre>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
