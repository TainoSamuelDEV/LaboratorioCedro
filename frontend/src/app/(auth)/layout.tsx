import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-white text-[#323232] grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      {/* Lado Esquerdo: Camadas Orgânicas Oficiais do Símbolo Cedro (Desktop) */}
      <div
        className="hidden lg:block lg:col-span-6 relative h-full min-h-dvh overflow-hidden select-none pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 720 1080"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Camada 1 (Externa - Verde Menta #79DDA9) */}
          <ellipse cx="40" cy="580" rx="640" ry="740" fill="#79DDA9" />
          {/* Camada 2 (Intermediária - Verde Petróleo #049671) */}
          <ellipse cx="-10" cy="480" rx="590" ry="750" fill="#049671" />
          {/* Camada 3 (Vibrante - Verde Esmeralda #00AE6F) */}
          <ellipse cx="-40" cy="530" rx="480" ry="670" fill="#00AE6F" />
          {/* Camada 4 (Interna - Verde Cedro Profundo #027053) */}
          <ellipse cx="-140" cy="540" rx="450" ry="650" fill="#027053" />
        </svg>
      </div>

      {/* Lado Direito: Área Editorial Minimalista do Login / Cadastro */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
