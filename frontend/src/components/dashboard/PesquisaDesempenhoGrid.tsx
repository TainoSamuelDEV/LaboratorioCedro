import React, { useState } from 'react';
import { MetricaPesquisaDashboardDTO, VolumePorUnidadeDTO } from '../../types/api';

interface PesquisaDesempenhoGridProps {
  pesquisas: MetricaPesquisaDashboardDTO[];
  volumePorUnidade?: VolumePorUnidadeDTO[];
  permiteAlternarUnidade?: boolean;
}

export function PesquisaDesempenhoGrid({
  pesquisas,
  volumePorUnidade = [],
  permiteAlternarUnidade = false,
}: PesquisaDesempenhoGridProps) {
  const [abaAtiva, setAbaAtiva] = useState<'pesquisas' | 'unidades'>('pesquisas');

  return (
    <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] h-full">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
          {abaAtiva === 'pesquisas'
            ? 'Desempenho por pesquisa'
            : 'Volume por unidade'}
        </h2>

        {permiteAlternarUnidade && volumePorUnidade.length > 0 && (
          <div className="flex gap-1.5 p-0.5 bg-[#F3F3F3] rounded-lg text-xs font-bold">
            <button
              type="button"
              onClick={() => setAbaAtiva('pesquisas')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                abaAtiva === 'pesquisas'
                  ? 'bg-white text-[#075618] shadow-sm'
                  : 'text-[#5E5E5E] hover:text-[#171717]'
              }`}
            >
              Pesquisas
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('unidades')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                abaAtiva === 'unidades'
                  ? 'bg-white text-[#075618] shadow-sm'
                  : 'text-[#5E5E5E] hover:text-[#171717]'
              }`}
            >
              Unidades
            </button>
          </div>
        )}
      </div>

      {abaAtiva === 'pesquisas' ? (
        pesquisas.length === 0 ? (
          <p className="text-sm text-[#5E5E5E] py-6 text-center my-0">
            Nenhuma pesquisa registrada para esta seleção.
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            {pesquisas.map((p) => {
              const temRespostas = p.totalRespostas > 0;
              const pct = temRespostas ? (p.notaMedia / 5) * 100 : 0;

              return (
                <div
                  key={p.pesquisaId}
                  className="grid grid-cols-[140px_1fr_44px] sm:grid-cols-[180px_1fr_44px] items-center gap-3 my-2"
                >
                  {/* Nome da pesquisa (rótulo informativo) */}
                  <span
                    title={p.titulo}
                    className="truncate text-sm font-medium text-[#323232]"
                  >
                    {p.titulo}
                  </span>

                  {/* Trilha e barra preenchida */}
                  <div className="h-2.5 bg-[#EEE] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out bg-[#02A562]"
                      style={{ width: `${pct}%` }}
                      title={`Média: ${p.notaMedia.toFixed(1)} de 5.0 (${p.totalRespostas} respostas)`}
                    />
                  </div>

                  {/* Nota Média */}
                  <span className="text-right font-bold text-sm text-[#171717]">
                    {temRespostas ? p.notaMedia.toFixed(1) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Visualização de Volume por Unidade */
        volumePorUnidade.length === 0 ? (
          <p className="text-sm text-[#5E5E5E] py-6 text-center my-0">
            Nenhuma unidade com respostas registradas.
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            {(() => {
              const maiorTotal = Math.max(
                ...volumePorUnidade.map((u) => u.total),
                1
              );
              return volumePorUnidade.map((u) => {
                const pct = (u.total / maiorTotal) * 100;
                return (
                  <div
                    key={u.unidadeId}
                    className="grid grid-cols-[140px_1fr_44px] sm:grid-cols-[180px_1fr_44px] items-center gap-3 my-2"
                  >
                    <span
                      title={u.unidadeNome}
                      className="truncate text-sm font-medium text-[#323232]"
                    >
                      {u.unidadeNome}
                    </span>

                    <div className="h-2.5 bg-[#EEE] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out bg-[#02A562]"
                        style={{ width: `${pct}%` }}
                        title={`${u.total} respostas`}
                      />
                    </div>

                    <span className="text-right font-bold text-sm text-[#171717]">
                      {u.total}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        )
      )}
    </div>
  );
}
