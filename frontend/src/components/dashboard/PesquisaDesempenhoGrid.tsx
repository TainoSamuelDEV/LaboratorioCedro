import React from 'react';
import Link from 'next/link';
import { MetricaPesquisaDashboardDTO } from '../../types/api';
import { NOTA_COLORS } from '../../config/brand';
import { FileText, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

interface PesquisaDesempenhoGridProps {
  pesquisas: MetricaPesquisaDashboardDTO[];
  unidadeNome?: string;
}

export function PesquisaDesempenhoGrid({
  pesquisas,
  unidadeNome,
}: PesquisaDesempenhoGridProps) {
  const getNotaColor = (nota: number) => {
    const rounded = Math.min(5, Math.max(1, Math.round(nota)));
    return NOTA_COLORS[rounded]?.bg || '#02A562';
  };

  return (
    <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#E3E3E3]">
          <div>
            <h3 className="text-base font-bold text-[#171717]">
              Desempenho por Pesquisa
            </h3>
            <p className="text-xs text-[#5E5E5E] mt-0.5">
              {unidadeNome
                ? `Métricas filtradas para ${unidadeNome}`
                : 'Métricas divididas por questionário em circulação'}
            </p>
          </div>
          <Link
            href="/pesquisas"
            className="text-xs font-semibold text-[#075618] hover:text-[#02A562] flex items-center gap-1 transition-colors"
          >
            Gerenciar pesquisas
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {pesquisas.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3F3F3] text-[#5E5E5E] flex items-center justify-center mx-auto mb-3">
              <FileText size={22} />
            </div>
            <p className="text-sm font-semibold text-[#171717]">
              Nenhuma pesquisa encontrada
            </p>
            <p className="text-xs text-[#5E5E5E] mt-1 max-w-sm mx-auto">
              Não há pesquisas cadastradas ou respostas registradas para a seleção atual.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E3E3E3] mt-2">
            {pesquisas.map((item) => {
              const temRespostas = item.totalRespostas > 0;
              const corNota = getNotaColor(item.notaMedia);

              return (
                <div
                  key={item.pesquisaId}
                  className="py-3.5 first:pt-2 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-[#F8FAF9]/80 rounded-lg px-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#171717] truncate">
                        {item.titulo}
                      </span>
                      {item.ativa ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={11} />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5E5E5E] bg-[#F3F3F3] px-2 py-0.5 rounded-full border border-[#E3E3E3]">
                          <XCircle size={11} />
                          Inativa
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#5E5E5E]">
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 bg-[#F3F3F3] rounded text-[#5E5E5E]">
                        {item.canal || 'Geral'}
                      </span>
                      <span>•</span>
                      <span>
                        {item.totalRespostas}{' '}
                        {item.totalRespostas === 1 ? 'resposta' : 'respostas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    {temRespostas ? (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-xs font-semibold text-[#5E5E5E] block leading-none">
                            Média
                          </span>
                          <span
                            className="text-base font-black leading-none mt-1 inline-block"
                            style={{ color: corNota }}
                          >
                            {item.notaMedia.toFixed(1)}
                          </span>
                        </div>
                        <div
                          className="w-2.5 h-8 rounded-full"
                          style={{ backgroundColor: corNota }}
                          title={`Média: ${item.notaMedia.toFixed(1)} de 5.0`}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-[#5E5E5E] italic">
                        Sem respostas
                      </span>
                    )}

                    <Link
                      href={`/pesquisas/${item.pesquisaId}`}
                      className="p-1.5 rounded-lg text-[#5E5E5E] hover:text-[#075618] hover:bg-[#F0FDF4] transition-colors"
                      title="Ver detalhes da pesquisa"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E3E3E3] flex items-center justify-between text-[11px] text-[#5E5E5E]">
        <span>Total de {pesquisas.length} questionários monitorados</span>
        <Link
          href="/pesquisas"
          className="text-[#075618] font-semibold hover:underline"
        >
          Ver todas as pesquisas
        </Link>
      </div>
    </div>
  );
}
