'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  QrCode,
  Edit,
  Power,
  RotateCw,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { pesquisaService } from '../../../../services/pesquisa.service';
import { unidadeService } from '../../../../services/unidade.service';
import { PesquisaDetalhadaDTO, UnidadeDTO } from '../../../../types/api';
import { DashboardKpiCard } from '../../../../components/dashboard/DashboardKpiCard';
import { DistribuicaoNotasChart } from '../../../../components/dashboard/DistribuicaoNotasChart';
import { PesquisaDetalheSkeleton } from '../../../../components/pesquisas/PesquisaDetalheSkeleton';
import { QrCodePdfModal } from '../../../../components/pesquisas/QrCodePdfModal';
import { EditarPesquisaModal } from '../../../../components/pesquisas/EditarPesquisaModal';
import { ErrorView } from '../../../../components/ui/ErrorView';

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
    className: 'bg-[#FFF1F2] text-[#CA2E24] border border-[#FDA4AF] font-bold',
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

function formatarTempoRelativo(isoDateString: string): string {
  try {
    const data = new Date(isoDateString);
    const diffMs = Date.now() - data.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 5) return 'agora';
    if (diffMin < 60) return `${diffMin} min`;
    if (diffHoras < 24) return `${diffHoras} h`;
    return `${diffDias} d`;
  } catch {
    return '—';
  }
}

export default function DetalhePesquisaPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const { ehAdmin } = useAuth();
  const router = useRouter();

  const [pesquisa, setPesquisa] = useState<PesquisaDetalhadaDTO | null>(null);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<boolean>(false);

  // Modais
  const [modalQrCodeAberto, setModalQrCodeAberto] = useState<boolean>(false);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);

  const carregarDetalhe = useCallback(
    async (isInitial = false) => {
      if (!id) return;
      try {
        if (isInitial) setCarregando(true);
        else setAtualizando(true);
        setErro(null);

        const [dados, listaUnidades] = await Promise.all([
          pesquisaService.obterPorId(id),
          unidadeService.listar(false).catch(() => []),
        ]);

        setPesquisa(dados);
        setUnidades(listaUnidades);
      } catch (err: unknown) {
        console.error('[DetalhePesquisaPage] Erro ao carregar detalhe:', err);
        setErro(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os detalhes da pesquisa solicitada.'
        );
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [id]
  );

  useEffect(() => {
    carregarDetalhe(true);
  }, [carregarDetalhe]);

  const handleAlternarStatus = async () => {
    if (!pesquisa) return;
    try {
      const novoStatus = !pesquisa.ativa;
      await pesquisaService.alternarStatus(pesquisa.id, novoStatus);
      await carregarDetalhe(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao alterar status da pesquisa.');
    }
  };

  const handleCopiarLink = async () => {
    if (!pesquisa) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/pesquisa/${pesquisa.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (carregando) {
    return <PesquisaDetalheSkeleton />;
  }

  if (erro || !pesquisa) {
    return (
      <div>
        <Link
          href="/pesquisas"
          className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
        >
          ← Voltar para Pesquisas
        </Link>
        <ErrorView
          tipo="404"
          titulo="Pesquisa não encontrada"
          descricao={erro || 'A pesquisa solicitada não foi localizada ou você não possui permissão para visualizá-la.'}
          onReset={() => carregarDetalhe(true)}
          embedded
        />
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const urlPublica = `${origin}/pesquisa/${pesquisa.id}`;

  return (
    <div>
      {/* Botão Voltar */}
      <Link
        href="/pesquisas"
        className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
      >
        ← Voltar para Pesquisas
      </Link>

      {/* Cabeçalho da Pesquisa */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
              {pesquisa.titulo}
            </h1>
            <span
              className={`inline-block py-0.5 px-3 rounded-full text-xs font-bold whitespace-nowrap ${
                pesquisa.ativa
                  ? 'bg-[#E6F5EC] text-[#075618] border border-[#A7F3D0]'
                  : 'bg-[#F3F3F3] text-[#767676] border border-[#E3E3E3]'
              }`}
            >
              {pesquisa.ativa ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-0">
            {pesquisa.unidadePadraoNome || 'Todas as Unidades'} · Canal:{' '}
            <strong className="text-[#323232]">{pesquisa.canal}</strong> · Período:{' '}
            <strong className="text-[#323232]">{pesquisa.periodo}</strong>
          </p>
        </div>

        {/* Barra de Ações: Display QR Code / PDF, Editar, Soft Delete */}
        <div className="flex items-center gap-2 self-start flex-wrap">
          <button
            type="button"
            onClick={() => setModalQrCodeAberto(true)}
            className="inline-flex items-center gap-1.5 px-4 h-11 rounded-lg bg-[#075618] hover:bg-[#054012] text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
          >
            <QrCode size={16} />
            <span>Display QR Code / PDF</span>
          </button>

          {ehAdmin && (
            <>
              <button
                type="button"
                onClick={() => setModalEditarAberto(true)}
                className="inline-flex items-center gap-1.5 px-3.5 h-11 rounded-lg border border-[#E3E3E3] bg-white text-xs font-bold text-[#323232] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
              >
                <Edit size={15} />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={handleAlternarStatus}
                title={pesquisa.ativa ? 'Desativar pesquisa' : 'Reativar pesquisa'}
                className={`inline-flex items-center gap-1.5 px-3.5 h-11 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                  pesquisa.ativa
                    ? 'border-[#FCA5A5] bg-white text-[#CA2E24] hover:bg-[#FEE2E2]'
                    : 'border-[#A7F3D0] bg-white text-[#075618] hover:bg-[#ECFDF5]'
                }`}
              >
                <Power size={15} />
                <span>{pesquisa.ativa ? 'Desativar' : 'Reativar'}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => carregarDetalhe(false)}
            disabled={atualizando}
            title="Atualizar indicadores"
            aria-label="Atualizar indicadores"
            className="w-11 h-11 inline-grid place-items-center rounded-lg border border-[#E3E3E3] bg-white text-[#5E5E5E] hover:text-[#075618] hover:border-[#075618] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw
              size={18}
              className={atualizando ? 'animate-spin text-[#075618]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Grid com os 4 KPIs Limpos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <DashboardKpiCard
          rotulo="Respostas"
          valor={pesquisa.indicadores.totalRespostas}
          descricao="coletadas nesta pesquisa"
        />

        <DashboardKpiCard
          rotulo="Nota Média"
          valor={
            pesquisa.indicadores.notaMedia > 0
              ? pesquisa.indicadores.notaMedia.toFixed(1)
              : '—'
          }
          descricao="escala de 1 a 5"
        />

        <DashboardKpiCard
          rotulo="Satisfeitos"
          valor={`${pesquisa.indicadores.percentualSatisfeitos}%`}
          descricao="avaliaram com nota 4 ou 5"
        />

        <DashboardKpiCard
          rotulo="Manifestações"
          valor={pesquisa.indicadores.totalManifestacoes}
          descricao="geradas para acompanhamento"
        />
      </div>

      {/* Grid Bento de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Gráfico de Distribuição das Notas */}
        <DistribuicaoNotasChart
          distribuicao={pesquisa.indicadores.distribuicaoNotas.map((d) => ({
            nota: d.nota,
            quantidade: d.quantidade,
            porcentagem: d.percentual,
          }))}
          totalRespostas={pesquisa.indicadores.totalRespostas}
        />

        {/* Card de Informações e Link de Acesso Público */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0 mb-3.5">
              Acesso e Divulgação
            </h2>

            <p className="text-xs text-[#5E5E5E] mb-4">
              {pesquisa.descricao ||
                'Nenhuma descrição ou instrução detalhada cadastrada para esta pesquisa.'}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex flex-wrap justify-between gap-2 py-1.5 border-b border-[#F0F0F0]">
                <span className="text-[#5E5E5E]">Unidade vinculada:</span>
                <span className="font-bold text-[#171717] text-right">
                  {pesquisa.unidadePadraoNome || 'Todas as Unidades (Global)'}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-1.5 border-b border-[#F0F0F0]">
                <span className="text-[#5E5E5E]">Canal configurado:</span>
                <span className="font-bold text-[#171717]">{pesquisa.canal}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-1.5 border-b border-[#F0F0F0]">
                <span className="text-[#5E5E5E]">Período de aplicação:</span>
                <span className="font-bold text-[#171717]">{pesquisa.periodo}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-1.5 border-b border-[#F0F0F0]">
                <span className="text-[#5E5E5E]">Identificador (ID):</span>
                <span className="font-mono text-[#767676] break-all text-right">{pesquisa.id}</span>
              </div>
            </div>
          </div>

          {/* Caixa de Link de Resposta */}
          <div className="mt-4 p-3 rounded-lg bg-[#F9F9F9] border border-[#E3E3E3]">
            <span className="block text-[11px] font-bold text-[#5E5E5E] uppercase tracking-wider mb-1.5">
              Link Direto do Formulário
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={urlPublica}
                className="min-w-0 flex-1 text-xs font-mono text-[#323232] bg-white border border-[#E3E3E3] rounded px-2.5 h-9 select-all focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopiarLink}
                  title="Copiar link"
                  className="flex-1 sm:flex-initial justify-center h-9 px-3 rounded bg-white border border-[#E3E3E3] hover:bg-[#F3F3F3] text-xs font-bold text-[#323232] inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiado ? <Check size={13} className="text-[#02A562]" /> : <Copy size={13} />}
                  <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <a
                  href={urlPublica}
                  target="_blank"
                  rel="noreferrer"
                  title="Abrir formulário em nova aba"
                  aria-label="Abrir formulário em nova aba"
                  className="h-9 px-2.5 rounded bg-white border border-[#E3E3E3] hover:bg-[#F3F3F3] text-[#5E5E5E] inline-grid place-items-center transition-colors shrink-0"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Manifestações Recentes desta Pesquisa */}
      <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#075618]" />
            <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
              Respostas e Manifestações Recentes
            </h2>
          </div>
          <Link
            href="/manifestacoes"
            className="text-xs font-bold text-[#075618] hover:underline"
          >
            Ver todas as manifestações →
          </Link>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#E3E3E3] text-[11px] uppercase tracking-[0.06em] text-[#5E5E5E] font-bold">
                <th className="py-2.5 px-3">Protocolo</th>
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3 text-center">Nota</th>
                <th className="py-2.5 px-3">Comentário</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Há</th>
              </tr>
            </thead>
            <tbody>
              {pesquisa.ultimasManifestacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[#5E5E5E]">
                    Nenhuma resposta registrada para esta pesquisa ainda.
                  </td>
                </tr>
              ) : (
                pesquisa.ultimasManifestacoes.map((item) => {
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
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Link
                          href={`/manifestacoes/${item.id}`}
                          className="font-bold text-[#075618] hover:underline"
                        >
                          #{item.protocolo}
                        </Link>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#323232] font-medium text-xs">
                        {item.unidadeNome}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="w-7 h-7 rounded-full inline-grid place-items-center font-black text-xs shrink-0 mx-auto"
                          style={{
                            backgroundColor: configNota.bg,
                            color: configNota.text,
                          }}
                        >
                          {item.nota || '—'}
                        </span>
                      </td>
                      <td
                        className="py-3 px-3 max-w-[280px] sm:max-w-[400px] xl:max-w-[600px] truncate text-xs text-[#5E5E5E]"
                        title={item.comentario || 'Sem comentário'}
                      >
                        {item.comentario || 'Sem comentário'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block py-0.5 px-2.5 rounded-full text-xs font-bold whitespace-nowrap ${configStatus.className}`}
                        >
                          {configStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-[#767676] whitespace-nowrap font-medium">
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

      {/* Modal de Display e QR Code em PDF */}
      <QrCodePdfModal
        isOpen={modalQrCodeAberto}
        onClose={() => setModalQrCodeAberto(false)}
        pesquisa={pesquisa}
        nomeUnidade={pesquisa.unidadePadraoNome || undefined}
      />

      {/* Modal de Edição */}
      <EditarPesquisaModal
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        onSucesso={() => carregarDetalhe(false)}
        pesquisa={pesquisa}
        unidades={unidades}
      />
    </div>
  );
}
