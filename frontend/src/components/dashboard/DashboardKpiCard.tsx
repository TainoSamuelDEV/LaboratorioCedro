import React from 'react';

export interface DashboardKpiCardProps {
  titulo: string;
  valor: string | number;
  icone: React.ReactNode;
  descricao?: string;
  badge?: {
    texto: string;
    variante?: 'sucesso' | 'alerta' | 'perigo' | 'neutro';
  };
  destaque?: 'verde' | 'laranja' | 'vermelho' | 'padrao';
}

const badgeStyles = {
  sucesso: 'bg-emerald-50 text-[#075618] border border-emerald-200',
  alerta: 'bg-amber-50 text-amber-800 border border-amber-200',
  perigo: 'bg-rose-50 text-[#CA2E24] border border-rose-200',
  neutro: 'bg-[#F3F3F3] text-[#5E5E5E] border border-[#E3E3E3]',
};

const destaqueBorders = {
  padrao: 'border-[#E3E3E3]',
  verde: 'border-l-4 border-l-[#02A562] border-[#E3E3E3]',
  laranja: 'border-l-4 border-l-[#F29222] border-[#E3E3E3]',
  vermelho: 'border-l-4 border-l-[#CA2E24] border-[#E3E3E3]',
};

export function DashboardKpiCard({
  titulo,
  valor,
  icone,
  descricao,
  badge,
  destaque = 'padrao',
}: DashboardKpiCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all duration-200 hover:shadow-[-10px_15px_30px_rgba(0,0,0,0.08)] ${destaqueBorders[destaque]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#5E5E5E]">
          {titulo}
        </span>
        <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] text-[#075618] flex items-center justify-center shrink-0">
          {icone}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight leading-none">
          {valor}
        </div>

        {(descricao || badge) && (
          <div className="mt-2.5 flex items-center flex-wrap gap-2 text-xs">
            {badge && (
              <span
                className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
                  badgeStyles[badge.variante || 'neutro']
                }`}
              >
                {badge.texto}
              </span>
            )}
            {descricao && <span className="text-[#5E5E5E]">{descricao}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
