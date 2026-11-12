import React from 'react';
import { VolumePorUnidadeDTO, PendenciaPorUnidadeDTO } from '../../types/api';
import { Building2, AlertCircle, CheckCircle, Filter } from 'lucide-react';

interface PanoramaUnidadesTableProps {
  volumePorUnidade: VolumePorUnidadeDTO[];
  pendenciasPorUnidade: PendenciaPorUnidadeDTO[];
  onSelecionarUnidade?: (unidadeId: string) => void;
  unidadeSelecionadaId?: string;
}

export function PanoramaUnidadesTable({
  volumePorUnidade,
  pendenciasPorUnidade,
  onSelecionarUnidade,
  unidadeSelecionadaId,
}: PanoramaUnidadesTableProps) {
  // Monta mapa unificado de unidades
  const mapaUnidades = new Map<
    string,
    {
      id: string;
      nome: string;
      volume: number;
      pendencias: number;
    }
  >();

  volumePorUnidade.forEach((v) => {
    mapaUnidades.set(v.unidadeId, {
      id: v.unidadeId,
      nome: v.unidadeNome,
      volume: v.total,
      pendencias: 0,
    });
  });

  pendenciasPorUnidade.forEach((p) => {
    const atual = mapaUnidades.get(p.unidadeId);
    if (atual) {
      atual.pendencias = p.pendencias;
    } else {
      mapaUnidades.set(p.unidadeId, {
        id: p.unidadeId,
        nome: p.unidadeNome,
        volume: 0,
        pendencias: p.pendencias,
      });
    }
  });

  const listaUnidades = Array.from(mapaUnidades.values());

  return (
    <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3E3E3] gap-2">
        <div>
          <h3 className="text-base font-bold text-[#171717] flex items-center gap-2">
            <Building2 size={18} className="text-[#075618]" />
            Panorama Operacional por Unidade
          </h3>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Comparativo de volume de avaliações e pendências abertas por polo
          </p>
        </div>
        {unidadeSelecionadaId && onSelecionarUnidade && (
          <button
            type="button"
            onClick={() => onSelecionarUnidade('')}
            className="text-xs font-semibold text-[#075618] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Filter size={13} />
            Limpar filtro de unidade
          </button>
        )}
      </div>

      {listaUnidades.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#5E5E5E]">
          Nenhuma unidade com dados registrados no período.
        </div>
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E3E3E3] text-[#5E5E5E] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3 text-center">Volume de Respostas</th>
                <th className="py-2.5 px-3 text-center">Pendências Abertas</th>
                <th className="py-2.5 px-3 text-center">Status Operacional</th>
                {onSelecionarUnidade && <th className="py-2.5 px-3 text-right">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E3E3]">
              {listaUnidades.map((u) => {
                const isSelected = unidadeSelecionadaId === u.id;
                const temPendencias = u.pendencias > 0;

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-[#F8FAF9]'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#171717] flex items-center gap-2">
                        {u.nome}
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#075618] text-white px-1.5 py-0.5 rounded">
                            Filtrado
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-[#171717] text-sm">
                        {u.volume}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {temPendencias ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-[#CA2E24] font-bold border border-rose-200">
                          <AlertCircle size={12} />
                          {u.pendencias}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#075618] font-medium border border-emerald-200">
                          <CheckCircle size={12} />
                          0 pendências
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {u.pendencias > 3 ? (
                        <span className="text-[11px] font-bold text-[#CA2E24]">
                          Atenção Necessária
                        </span>
                      ) : u.pendencias > 0 ? (
                        <span className="text-[11px] font-medium text-[#F29222]">
                          Em Atendimento
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#02A562]">
                          Operação Regular
                        </span>
                      )}
                    </td>

                    {onSelecionarUnidade && (
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelecionarUnidade(isSelected ? '' : u.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#075618] text-white hover:bg-[#064e16]'
                              : 'bg-[#F3F3F3] text-[#171717] hover:bg-[#E3E3E3]'
                          }`}
                        >
                          {isSelected ? 'Ver Todas' : 'Filtrar Unidade'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
