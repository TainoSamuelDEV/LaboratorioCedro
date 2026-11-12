import React from 'react';
import Link from 'next/link';
import { UltimaManifestacaoDashboardDTO } from '../../types/api';

interface UltimasManifestacoesStreamProps {
  manifestacoes: UltimaManifestacaoDashboardDTO[];
}

const NOTA_CONFIG: Record<number, { bg: string; text: string }> = {
  5: { bg: '#02A562', text: '#FFFFFF' },
  4: { bg: '#93CBA0', text: '#171717' },
  3: { bg: '#F29222', text: '#171717' },
  2: { bg: '#E65100', text: '#FFFFFF' },
  1: { bg: '#CA2E24', text: '#FFFFFF' },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NOVA: {
    label: 'Nova',
    className: 'bg-[#ECFDF5] text-[#075618] border border-[#A7F3D0]',
  },
  NAO_RESPONDIDA: {
    label: 'Não respondida',
    className: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
  },
  EM_TRATAMENTO: {
    label: 'Em tratamento',
    className: 'bg-[#F0F9FF] text-[#075985] border border-[#BAE6FD]',
  },
  ESCALONADA: {
    label: 'Escalonada',
    className: 'bg-[#FFF1F2] text-[#CA2E24] border border-[#FDA4AF] font-black animate-pulse',
  },
  RESPONDIDA: {
    label: 'Respondida',
    className: 'bg-[#F0FDFA] text-[#115E59] border border-[#99F6E4]',
  },
  CONCLUIDA: {
    label: 'Concluída',
    className: 'bg-[#255521] text-white border border-[#255521]',
  },
};

function formatarTempoRelativo(isoDate: string): string {
  try {
    const agora = Date.now();
    const data = new Date(isoDate).getTime();
    const diffMs = agora - data;
    const diffHoras = Math.max(0, diffMs / (1000 * 60 * 60));

    if (diffHoras < 1) return 'agora';
    if (diffHoras < 24) return `${Math.round(diffHoras)} h`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias} d`;
  } catch {
    return '—';
  }
}

export function UltimasManifestacoesStream({
  manifestacoes,
}: UltimasManifestacoesStreamProps) {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mt-6 mb-3">
        <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
          Manifestações recentes
        </h2>
        <Link
          href="/manifestacoes"
          className="text-sm font-bold text-[#075618] hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E3E3] shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#EEE]">
              <th className="py-2.5 px-3 text-xs uppercase tracking-[0.06em] text-[#5E5E5E] font-bold whitespace-nowrap">
                Protocolo
              </th>
              <th className="py-2.5 px-3 text-xs uppercase tracking-[0.06em] text-[#5E5E5E] font-bold whitespace-nowrap">
                Unidade
              </th>
              <th className="py-2.5 px-3 text-xs uppercase tracking-[0.06em] text-[#5E5E5E] font-bold whitespace-nowrap text-center">
                Nota
              </th>
              <th className="py-2.5 px-3 text-xs uppercase tracking-[0.06em] text-[#5E5E5E] font-bold">
                Comentário
              </th>
              <th className="py-2.5 px-3 text-xs uppercase tracking-[0.06em] text-[#5E5E5E] font-bold whitespace-nowrap">
                Senha
              </th>
              <th className="py-2.5 px-3 text-xs uppercase tracking-[0.06em] text-[#5E5E5E] font-bold whitespace-nowrap">
                Status
              </th>
              <th className="py-2.5 px-3 text-xs uppercase tracking-[0.06em] text-[#5E5E5E] font-bold whitespace-nowrap text-right">
                Há
              </th>
            </tr>
          </thead>
          <tbody>
            {manifestacoes.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm text-[#5E5E5E]"
                >
                  Nenhuma manifestação encontrada.
                </td>
              </tr>
            ) : (
              manifestacoes.map((item) => {
                const configNota = NOTA_CONFIG[item.nota] || {
                  bg: '#5E5E5E',
                  text: '#FFFFFF',
                };
                const configStatus = STATUS_CONFIG[item.status] || {
                  label: item.status,
                  className: 'bg-[#F3F3F3] text-[#323232] border border-[#E3E3E3]',
                };

                return (
                  <tr
                    key={item.id}
                    className="border-t border-[#EEE] hover:bg-[#FAFAFA] transition-colors"
                  >
                    {/* Protocolo */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Link
                        href={`/manifestacoes/${item.id}`}
                        className="font-bold text-[#075618] hover:underline"
                      >
                        #{item.protocolo}
                      </Link>
                    </td>

                    {/* Unidade */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-[#323232] font-medium">
                      {item.unidadeNome}
                    </td>

                    {/* Nota */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className="w-7 h-7 rounded-full inline-grid place-items-center font-black text-sm shrink-0 mx-auto"
                        style={{
                          backgroundColor: configNota.bg,
                          color: configNota.text,
                        }}
                      >
                        {item.nota || '—'}
                      </span>
                    </td>

                    {/* Comentário */}
                    <td
                      className="py-3.5 px-3 max-w-[280px] sm:max-w-[340px] truncate text-xs text-[#5E5E5E]"
                      title={item.comentario || 'Sem comentário'}
                    >
                      {item.comentario || 'Sem comentário'}
                    </td>

                    {/* Senha */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-xs text-[#5E5E5E] font-medium">
                      {item.senhaAtendimento || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block py-1 px-2.5 rounded-full text-xs font-bold whitespace-nowrap ${configStatus.className}`}
                      >
                        {configStatus.label}
                      </span>
                    </td>

                    {/* Há */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-right text-xs text-[#5E5E5E] font-medium">
                      {formatarTempoRelativo(item.criadoEm)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
