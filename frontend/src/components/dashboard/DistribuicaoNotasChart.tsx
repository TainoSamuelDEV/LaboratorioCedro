import React from 'react';
import { DistribuicaoNotaDTO } from '../../types/api';

interface DistribuicaoNotasChartProps {
  distribuicao: DistribuicaoNotaDTO[];
  totalRespostas: number;
}

const NOTA_CONFIG: Record<number, { bg: string; text: string }> = {
  5: { bg: '#02A562', text: '#FFFFFF' },
  4: { bg: '#93CBA0', text: '#171717' },
  3: { bg: '#F29222', text: '#171717' },
  2: { bg: '#E65100', text: '#FFFFFF' },
  1: { bg: '#CA2E24', text: '#FFFFFF' },
};

export function DistribuicaoNotasChart({
  distribuicao,
  totalRespostas,
}: DistribuicaoNotasChartProps) {
  // Ordenar da nota 5 para a nota 1
  const notasOrdenadas = [5, 4, 3, 2, 1].map((notaValor) => {
    const item = distribuicao.find((d) => d.nota === notaValor);
    return (
      item || {
        nota: notaValor,
        quantidade: 0,
        porcentagem: 0,
      }
    );
  });

  return (
    <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] h-full">
      <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0 mb-3.5">
        Distribuição das notas
      </h2>

      <div className="space-y-3 pt-1">
        {notasOrdenadas.map((item) => {
          const config = NOTA_CONFIG[item.nota] || {
            bg: '#02A562',
            text: '#FFFFFF',
          };
          const pct =
            totalRespostas > 0 ? (item.quantidade / totalRespostas) * 100 : 0;

          return (
            <div
              key={item.nota}
              className="grid grid-cols-[28px_1fr_44px] items-center gap-3 my-2"
            >
              {/* Círculo com a nota */}
              <span
                className="w-7 h-7 rounded-full inline-grid place-items-center font-black text-sm shrink-0"
                style={{ backgroundColor: config.bg, color: config.text }}
              >
                {item.nota}
              </span>

              {/* Trilha e barra preenchida */}
              <div className="h-2.5 bg-[#EEE] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: config.bg,
                  }}
                  title={`${item.quantidade} respostas (${pct.toFixed(0)}%)`}
                />
              </div>

              {/* Contagem numérica */}
              <span className="text-right font-bold text-sm text-[#171717]">
                {item.quantidade}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
