import React from 'react';
import Link from 'next/link';
import { UltimaManifestacaoDashboardDTO } from '../../types/api';
import { NOTA_COLORS, STATUS_LABELS } from '../../config/brand';
import { Badge, BadgeVariant } from '../ui/Badge';
import { MessageSquare, ArrowUpRight, Star, Clock } from 'lucide-react';

interface UltimasManifestacoesStreamProps {
  manifestacoes: UltimaManifestacaoDashboardDTO[];
}

export function UltimasManifestacoesStream({
  manifestacoes,
}: UltimasManifestacoesStreamProps) {
  const formatarData = (isoDate: string) => {
    try {
      const data = new Date(isoDate);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-4 border-b border-[#E3E3E3]">
        <div>
          <h3 className="text-base font-bold text-[#171717] flex items-center gap-2">
            <MessageSquare size={18} className="text-[#075618]" />
            Últimas Manifestações Registradas
          </h3>
          <p className="text-xs text-[#5E5E5E] mt-0.5">
            Fluxo recente de chamados e insatisfações encaminhadas para a ouvidoria
          </p>
        </div>
        <Link
          href="/manifestacoes"
          className="text-xs font-semibold text-[#075618] hover:text-[#02A562] flex items-center gap-1 transition-colors"
        >
          Ver todas as manifestações
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {manifestacoes.length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#075618] flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={22} />
          </div>
          <p className="text-sm font-semibold text-[#171717]">
            Nenhuma manifestação pendente
          </p>
          <p className="text-xs text-[#5E5E5E] mt-1 max-w-sm mx-auto">
            Todas as manifestações foram tratadas ou ainda não houve registros com nota insatisfatória para este escopo.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E3E3E3] mt-2">
          {manifestacoes.map((item) => {
            const statusConfig = STATUS_LABELS[item.status] || {
              label: item.status,
              variant: 'neutral' as BadgeVariant,
            };
            const notaConfig = NOTA_COLORS[item.nota] || {
              bg: '#5E5E5E',
              label: `Nota ${item.nota}`,
            };

            return (
              <div
                key={item.id}
                className="py-3.5 first:pt-2 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-[#F8FAF9]/80 rounded-lg px-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono text-xs font-bold text-[#075618] bg-[#F0FDF4] px-2 py-0.5 rounded border border-emerald-200">
                      {item.protocolo}
                    </span>

                    {/* Tag de Nota */}
                    {item.nota > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-white px-2 py-0.5 rounded"
                        style={{ backgroundColor: notaConfig.bg }}
                      >
                        <Star size={11} className="fill-white" />
                        Nota {item.nota}
                      </span>
                    )}

                    <Badge variant={statusConfig.variant} dot>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="mt-1.5 flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#5E5E5E]">
                    <span className="font-semibold text-[#171717]">
                      {item.unidadeNome}
                    </span>
                    <span>•</span>
                    <span className="truncate">{item.pesquisaTitulo}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <Clock size={12} />
                      {formatarData(item.criadoEm)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <Link
                    href={`/manifestacoes/${item.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E3E3E3] text-[#171717] hover:bg-[#F0FDF4] hover:text-[#075618] hover:border-emerald-200 transition-colors"
                  >
                    <span>Tratar / Detalhes</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
