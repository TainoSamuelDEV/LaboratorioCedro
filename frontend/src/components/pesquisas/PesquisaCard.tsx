'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, BarChart3, Edit, Power, Calendar } from 'lucide-react';
import { PesquisaDTO, UnidadeDTO } from '../../types/api';

interface PesquisaCardProps {
  pesquisa: PesquisaDTO;
  unidade?: UnidadeDTO | null;
  onAbrirQrCode: (p: PesquisaDTO) => void;
  onEditar: (p: PesquisaDTO) => void;
  onAlternarStatus: (p: PesquisaDTO) => void;
  podeEditar: boolean;
}

export function PesquisaCard({
  pesquisa,
  unidade,
  onAbrirQrCode,
  onEditar,
  onAlternarStatus,
  podeEditar,
}: PesquisaCardProps) {
  const nomeUnidade = unidade ? unidade.nome : 'Todas as Unidades';

  const rotuloCanal: Record<string, string> = {
    QR_CODE: 'QR Code',
    LINK: 'Link Web',
    TOTEM: 'Totem',
    WHATSAPP: 'WhatsApp',
    EMAIL: 'E-mail',
  };

  return (
    <div
      className={`p-5 bg-white rounded-2xl border transition-all flex flex-col justify-between ${
        pesquisa.ativa
          ? 'border-[#E3E3E3] shadow-xs hover:border-[#02A562]/40 hover:shadow-md'
          : 'border-[#E5E5E5] bg-[#FAFAFA] opacity-80'
      }`}
    >
      <div>
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <Link
            href={`/pesquisas/${pesquisa.id}`}
            className="text-base sm:text-lg font-black text-[#075618] hover:underline leading-snug tracking-tight m-0 line-clamp-2"
          >
            {pesquisa.titulo}
          </Link>

          <span
            className={`inline-block py-0.5 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
              pesquisa.ativa
                ? 'bg-[#E6F5EC] text-[#075618] border border-[#A7F3D0]'
                : 'bg-[#F3F3F3] text-[#767676] border border-[#E3E3E3]'
            }`}
          >
            {pesquisa.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        {/* Descrição */}
        <p className="text-xs text-[#5E5E5E] line-clamp-2 mb-3 min-h-[32px]">
          {pesquisa.descricao || 'Sem descrição cadastrada.'}
        </p>

        {/* Badges de Metadados: Unidade e Canal */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
          <span className="py-0.5 px-2 rounded-md bg-[#F3F3F3] text-[#323232] font-semibold border border-[#E3E3E3]">
            {nomeUnidade}
          </span>
          <span className="py-0.5 px-2 rounded-md bg-[#F0FDF4] text-[#166534] font-semibold border border-[#BBF7D0]">
            {rotuloCanal[pesquisa.canal] || pesquisa.canal}
          </span>
          <span className="inline-flex items-center gap-1 text-[#767676] font-medium ml-auto">
            <Calendar size={12} />
            {pesquisa.periodo}
          </span>
        </div>
      </div>

      {/* Barra de Ações Rápidas */}
      <div className="pt-3 border-t border-[#EEE] flex items-center justify-between gap-2">
        <Link
          href={`/pesquisas/${pesquisa.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6F5EC] text-[#075618] text-xs font-bold hover:bg-[#D1EEDB] transition-colors"
        >
          <BarChart3 size={14} />
          <span>Indicadores</span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAbrirQrCode(pesquisa)}
            title="Display e QR Code em PDF"
            aria-label="Abrir QR Code e exportar PDF"
            className="p-2 rounded-lg text-[#5E5E5E] hover:text-[#075618] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
          >
            <QrCode size={16} />
          </button>

          {podeEditar && (
            <>
              <button
                type="button"
                onClick={() => onEditar(pesquisa)}
                title="Editar pesquisa"
                aria-label="Editar pesquisa"
                className="p-2 rounded-lg text-[#5E5E5E] hover:text-[#075618] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
              >
                <Edit size={16} />
              </button>

              <button
                type="button"
                onClick={() => onAlternarStatus(pesquisa)}
                title={pesquisa.ativa ? 'Desativar pesquisa (Soft Delete)' : 'Reativar pesquisa'}
                aria-label={pesquisa.ativa ? 'Desativar pesquisa' : 'Reativar pesquisa'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  pesquisa.ativa
                    ? 'text-[#CA2E24] hover:bg-[#FEE2E2]'
                    : 'text-[#02A562] hover:bg-[#DCFCE7]'
                }`}
              >
                <Power size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
