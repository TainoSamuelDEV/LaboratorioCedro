import React from 'react';
import { EvaluationTransitionProvider } from '../../contexts/EvaluationTransitionContext';
import { EscamasBackdrop } from '../../components/avaliacao/EscamasBackdrop';

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <EvaluationTransitionProvider>
      <div className="relative min-h-dvh w-full bg-white text-[#323232] overflow-x-hidden">
        {/* Grid de 12 colunas para o formulário (Mobile: 100%, Desktop: 7 colunas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-dvh w-full relative z-10">
          <div className="cedro-eval-split-main col-span-1 lg:col-span-7 xl:col-span-7 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 min-h-dvh">
            <div className="w-full max-w-[620px]">{children}</div>
          </div>
          {/* Coluna de respiro visual à direita no desktop */}
          <div
            className="hidden lg:block lg:col-span-5 xl:col-span-5 min-h-dvh pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Camada das Escamas Orgânicas Oficiais e Transição Sweep */}
        <EscamasBackdrop />
      </div>
    </EvaluationTransitionProvider>
  );
}
