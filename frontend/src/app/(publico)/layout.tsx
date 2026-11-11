import React from 'react';

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-white text-[#323232] grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      {/* Lado Esquerdo: Área Editorial da Avaliação */}
      <div className="cedro-eval-split-main col-span-1 lg:col-span-7 xl:col-span-7 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 bg-white min-h-dvh">
        <div className="w-full max-w-[620px]">{children}</div>
      </div>

      {/* Lado Direito: Camadas Orgânicas Espelhadas do Símbolo Cedro (Desktop) */}
      <div
        className="hidden lg:block lg:col-span-5 xl:col-span-5 relative h-full min-h-dvh overflow-hidden select-none pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 960 1080"
          fill="none"
          preserveAspectRatio="xMinYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Camada 1 (Externa - Verde Menta #79DDA9) — avança por último até o limite final à esquerda */}
          <ellipse
            className="cedro-eval-arc cedro-eval-arc-4"
            cx="1040"
            cy="600"
            rx="1000"
            ry="1120"
            fill="#79DDA9"
          />
          {/* Camada 2 (Intermediária - Verde Petróleo #049671) */}
          <ellipse
            className="cedro-eval-arc cedro-eval-arc-3"
            cx="1100"
            cy="490"
            rx="940"
            ry="1100"
            fill="#049671"
          />
          {/* Camada 3 (Vibrante - Verde Esmeralda #00AE6F) */}
          <ellipse
            className="cedro-eval-arc cedro-eval-arc-2"
            cx="1140"
            cy="540"
            rx="810"
            ry="1020"
            fill="#00AE6F"
          />
          {/* Camada 4 (Interna - Verde Cedro Profundo #027053) — inicia o movimento na borda direita */}
          <ellipse
            className="cedro-eval-arc cedro-eval-arc-1"
            cx="1280"
            cy="550"
            rx="700"
            ry="980"
            fill="#027053"
          />
        </svg>
      </div>
    </div>
  );
}
