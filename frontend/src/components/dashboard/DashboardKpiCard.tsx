import React from 'react';

export interface DashboardKpiCardProps {
  rotulo: string;
  valor: string | number;
  descricao?: string;
  className?: string;
}

export function DashboardKpiCard({
  rotulo,
  valor,
  descricao,
  className = '',
}: DashboardKpiCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] min-w-0 transition-shadow hover:shadow-[-10px_15px_30px_rgba(0,0,0,0.07)] ${className}`}
    >
      <span className="block text-xs uppercase font-bold tracking-[0.06em] text-[#5E5E5E]">
        {rotulo}
      </span>
      <b className="block font-black text-4xl sm:text-[2.5rem] leading-none text-[#075618] my-2 tracking-tight">
        {valor}
      </b>
      {descricao && (
        <small className="block text-[13px] text-[#5E5E5E] leading-normal">
          {descricao}
        </small>
      )}
    </div>
  );
}
