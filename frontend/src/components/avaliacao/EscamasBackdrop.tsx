'use client';

import React from 'react';
import { useEvaluationTransition } from '../../contexts/EvaluationTransitionContext';

export function EscamasBackdrop() {
  const { phase } = useEvaluationTransition();

  const isSweepActive = phase !== 'idle';

  // Classes dinâmicas para cada camada de acordo com o momento da transição
  let layer1Class = 'cedro-eval-arc-enter-4';
  let layer2Class = 'cedro-eval-arc-enter-3';
  let layer3Class = 'cedro-eval-arc-enter-2';
  let layer4Class = 'cedro-eval-arc-enter-1';
  let backdropClass = 'opacity-0';

  if (phase === 'sweeping-in') {
    layer1Class = 'cedro-sweep-in-layer-1';
    layer2Class = 'cedro-sweep-in-layer-2';
    layer3Class = 'cedro-sweep-in-layer-3';
    layer4Class = 'cedro-sweep-in-layer-4';
    backdropClass = 'cedro-sweep-in-backdrop';
  } else if (phase === 'covered') {
    layer1Class = 'cedro-sweep-covered-layer';
    layer2Class = 'cedro-sweep-covered-layer';
    layer3Class = 'cedro-sweep-covered-layer';
    layer4Class = 'cedro-sweep-covered-layer';
    backdropClass = 'cedro-sweep-covered-backdrop';
  } else if (phase === 'sweeping-out') {
    layer1Class = 'cedro-sweep-out-layer-1';
    layer2Class = 'cedro-sweep-out-layer-2';
    layer3Class = 'cedro-sweep-out-layer-3';
    layer4Class = 'cedro-sweep-out-layer-4';
    backdropClass = 'cedro-sweep-out-backdrop';
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden transition-opacity duration-300 ${
        isSweepActive ? 'z-50 block opacity-100' : 'z-20 max-lg:hidden opacity-100'
      }`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        fill="none"
        preserveAspectRatio="xMaxYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fundo de sustentação quando a tela é 100% preenchida */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#027053"
          className={backdropClass}
        />

        {/* Camada 1 (Externa - Verde Menta #79DDA9) — avança primeiro no sweep e acomoda por último */}
        <ellipse
          className={layer1Class}
          cx="2410"
          cy="600"
          rx="1250"
          ry="1200"
          fill="#79DDA9"
        />

        {/* Camada 2 (Intermediária - Verde Petróleo #049671) */}
        <ellipse
          className={layer2Class}
          cx="2460"
          cy="490"
          rx="1180"
          ry="1150"
          fill="#049671"
        />

        {/* Camada 3 (Vibrante - Verde Esmeralda #00AE6F) */}
        <ellipse
          className={layer3Class}
          cx="2500"
          cy="540"
          rx="1050"
          ry="1080"
          fill="#00AE6F"
        />

        {/* Camada 4 (Interna - Verde Cedro Profundo #027053) — fecha a tela com a cor institucional */}
        <ellipse
          className={layer4Class}
          cx="2620"
          cy="550"
          rx="920"
          ry="1020"
          fill="#027053"
        />
      </svg>
    </div>
  );
}
