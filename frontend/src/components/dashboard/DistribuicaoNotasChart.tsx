import React from 'react';
import { NOTA_COLORS } from '../../config/brand';
import { DistribuicaoNotaDTO } from '../../types/api';
import { Star } from 'lucide-react';

interface DistribuicaoNotasChartProps {
  distribuicao: DistribuicaoNotaDTO[];
  totalRespostas: number;
  notaMedia: number;
}

export function DistribuicaoNotasChart({
  distribuicao,
  totalRespostas,
  notaMedia,
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

  const getNotaLabelDescritiva = (media: number) => {
    if (media >= 4.5) return 'Excelente';
    if (media >= 3.5) return 'Muito Bom';
    if (media >= 2.5) return 'Regular';
    if (media >= 1.5) return 'Abaixo do Esperado';
    if (media > 0) return 'Crítico';
    return 'Sem avaliações';
  };

  return (
    <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#E3E3E3]">
          <div>
            <h3 className="text-base font-bold text-[#171717]">Distribuição de Notas</h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              Frequência das avaliações de 1 a 5 estrelas
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#F0FDF4] text-[#075618] rounded-full border border-emerald-200">
            {totalRespostas} {totalRespostas === 1 ? 'resposta' : 'respostas'}
          </span>
        </div>

        {/* Resumo da Nota Média */}
        <div className="my-5 p-4 rounded-xl bg-[#F8FAF9] border border-[#E3E3E3] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#5E5E5E] uppercase tracking-wider block">
              Média Geral de Satisfação
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#075618] tracking-tight">
                {notaMedia.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-[#5E5E5E]">de 5.0</span>
            </div>
            <span className="inline-block mt-1 text-xs font-semibold text-[#02A562]">
              {getNotaLabelDescritiva(notaMedia)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#F29222]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={
                  star <= Math.round(notaMedia)
                    ? 'fill-[#F29222] text-[#F29222]'
                    : 'text-[#D1D5DB] fill-[#F3F4F6]'
                }
              />
            ))}
          </div>
        </div>

        {/* Barras de Distribuição */}
        <div className="space-y-3">
          {notasOrdenadas.map((item) => {
            const config = NOTA_COLORS[item.nota] || {
              bg: '#02A562',
              label: `Nota ${item.nota}`,
            };
            const porcentagem = item.porcentagem || 0;

            return (
              <div key={item.nota} className="flex items-center gap-3 text-xs">
                {/* Rótulo da nota */}
                <div className="w-16 flex items-center gap-1 font-semibold text-[#171717] shrink-0">
                  <span>{item.nota}</span>
                  <Star size={13} className="fill-[#F29222] text-[#F29222]" />
                  <span className="text-[11px] text-[#5E5E5E] font-normal">({item.nota})</span>
                </div>

                {/* Barra de Progresso */}
                <div className="flex-1 h-3 rounded-full bg-[#F3F3F3] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${porcentagem}%`,
                      backgroundColor: config.bg,
                    }}
                    title={`${item.quantidade} respostas (${porcentagem}%)`}
                  />
                </div>

                {/* Quantidade e Porcentagem */}
                <div className="w-20 text-right font-medium text-[#5E5E5E] shrink-0 text-[11px]">
                  <span className="font-bold text-[#171717]">{item.quantidade}</span>
                  <span className="ml-1 text-[10px] text-[#5E5E5E]">({porcentagem}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[#E3E3E3] flex items-center justify-between text-[11px] text-[#5E5E5E]">
        <span>Escala: 1 (Crítico) a 5 (Excelente)</span>
        <span>Atualizado em tempo real</span>
      </div>
    </div>
  );
}
