'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Edit, Power, RotateCw, Users, FileText, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { unidadeService } from '../../../../services/unidade.service';
import { UnidadeDetalhadaDTO } from '../../../../types/api';
import { DashboardKpiCard } from '../../../../components/dashboard/DashboardKpiCard';
import { UnidadeDetalheSkeleton } from '../../../../components/unidades/UnidadesSkeleton';
import { EditarUnidadeModal } from '../../../../components/unidades/EditarUnidadeModal';
import { ErrorView } from '../../../../components/ui/ErrorView';

export default function DetalheUnidadePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const { ehAdmin } = useAuth();

  const [unidade, setUnidade] = useState<UnidadeDetalhadaDTO | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);

  const carregarDetalhe = useCallback(
    async (isInitial = false) => {
      if (!id) return;
      try {
        if (isInitial) setCarregando(true);
        else setAtualizando(true);
        setErro(null);

        const dados = await unidadeService.obterPorId(id);
        setUnidade(dados);
      } catch (err: unknown) {
        console.error('[DetalheUnidadePage] Erro ao carregar detalhe da unidade:', err);
        setErro(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os detalhes da unidade solicitada.'
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
    if (!unidade) return;
    try {
      const novoStatus = !unidade.ativa;
      await unidadeService.alternarStatus(unidade.id, novoStatus);
      await carregarDetalhe(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao alterar status da unidade.');
    }
  };

  if (carregando) {
    return <UnidadeDetalheSkeleton />;
  }

  if (erro || !unidade) {
    return (
      <div>
        <Link
          href="/unidades"
          className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
        >
          ← Voltar para Unidades
        </Link>
        <ErrorView
          tipo="404"
          titulo="Unidade não encontrada"
          descricao={erro || 'A unidade solicitada não foi localizada ou você não possui permissão para visualizá-la.'}
          onReset={() => carregarDetalhe(true)}
          embedded
        />
      </div>
    );
  }

  return (
    <div>
      {/* Voltar */}
      <Link
        href="/unidades"
        className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
      >
        ← Voltar para Unidades
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
              {unidade.nome}
            </h1>
            <span
              className={`inline-block py-0.5 px-3 rounded-full text-xs font-bold whitespace-nowrap ${
                unidade.ativa
                  ? 'bg-[#E6F5EC] text-[#075618] border border-[#A7F3D0]'
                  : 'bg-[#F3F3F3] text-[#767676] border border-[#E3E3E3]'
              }`}
            >
              {unidade.ativa ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-0">
            {unidade.responsavelNome ? `Responsável Técnico: ${unidade.responsavelNome}` : 'Responsável não definido'} · SLA Padrão: <strong>{unidade.prazoPadraoHoras}h</strong>
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 self-start flex-wrap">
          {ehAdmin && (
            <>
              <button
                type="button"
                onClick={() => setModalEditarAberto(true)}
                className="inline-flex items-center gap-1.5 px-3.5 h-11 rounded-lg border border-[#E3E3E3] bg-white text-xs font-bold text-[#323232] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
              >
                <Edit size={15} />
                <span>Editar Unidade</span>
              </button>

              <button
                type="button"
                onClick={handleAlternarStatus}
                title={unidade.ativa ? 'Desativar unidade' : 'Reativar unidade'}
                className={`inline-flex items-center gap-1.5 px-3.5 h-11 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                  unidade.ativa
                    ? 'border-[#FCA5A5] bg-white text-[#CA2E24] hover:bg-[#FEE2E2]'
                    : 'border-[#A7F3D0] bg-white text-[#075618] hover:bg-[#ECFDF5]'
                }`}
              >
                <Power size={15} />
                <span>{unidade.ativa ? 'Desativar' : 'Reativar'}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => carregarDetalhe(false)}
            disabled={atualizando}
            title="Atualizar dados"
            aria-label="Atualizar dados"
            className="w-11 h-11 inline-grid place-items-center rounded-lg border border-[#E3E3E3] bg-white text-[#5E5E5E] hover:text-[#075618] hover:border-[#075618] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw
              size={18}
              className={atualizando ? 'animate-spin text-[#075618]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Grid com os 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardKpiCard
          rotulo="Manifestações"
          valor={unidade.indicadores.totalManifestacoes}
          descricao="registradas nesta unidade"
        />

        <DashboardKpiCard
          rotulo="Pendências"
          valor={unidade.indicadores.pendenciasAbertas}
          descricao="aguardando resposta formal"
        />

        <DashboardKpiCard
          rotulo="Atrasadas"
          valor={unidade.indicadores.pendenciasAtrasadas}
          descricao={
            unidade.indicadores.pendenciasAtrasadas > 0
              ? 'excederam prazo SLA institucional'
              : 'todas no prazo previsto'
          }
        />

        <DashboardKpiCard
          rotulo="Nota Média"
          valor={
            unidade.indicadores.notaMediaGeral > 0
              ? unidade.indicadores.notaMediaGeral.toFixed(1)
              : '—'
          }
          descricao={`com base em ${unidade.indicadores.totalRespostas} respostas`}
        />
      </div>

      {/* Grid Bento de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Desempenho por Pesquisa */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3.5">
            <FileText size={18} className="text-[#075618]" />
            <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
              Desempenho por Pesquisa
            </h2>
          </div>

          {unidade.desempenhoPorPesquisa.length === 0 ? (
            <p className="text-xs text-[#5E5E5E] py-8 text-center">
              Nenhuma resposta registrada para esta unidade até o momento.
            </p>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {unidade.desempenhoPorPesquisa.map((p) => (
                <div key={p.pesquisaId} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/pesquisas/${p.pesquisaId}`}
                      className="text-sm font-bold text-[#075618] hover:underline block leading-snug"
                    >
                      {p.titulo}
                    </Link>
                    <span className="text-xs text-[#5E5E5E]">
                      {p.totalRespostas} {p.totalRespostas === 1 ? 'resposta' : 'respostas'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-[#E6F5EC] text-[#075618] border border-[#A7F3D0]">
                      {p.notaMedia.toFixed(1)} ★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Equipe de Coordenadores */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-3.5">
            <Users size={18} className="text-[#075618]" />
            <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
              Coordenadores Alocados
            </h2>
          </div>

          {unidade.coordenadores.length === 0 ? (
            <p className="text-xs text-[#5E5E5E] py-8 text-center">
              Nenhum coordenador vinculado a esta unidade no momento.
            </p>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {unidade.coordenadores.map((coord) => {
                const iniciais = coord.nome
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0].toUpperCase())
                  .join('');

                return (
                  <div key={coord.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#075618] text-white text-xs font-black grid place-items-center shrink-0">
                        {iniciais}
                      </div>
                      <div>
                        <Link
                          href={`/usuarios/${coord.id}`}
                          className="text-sm font-bold text-[#171717] hover:underline block leading-snug"
                        >
                          {coord.nome}
                        </Link>
                        <span className="text-xs text-[#5E5E5E]">{coord.email}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-block py-0.5 px-2.5 rounded-full text-[11px] font-bold ${
                        coord.ativo
                          ? 'bg-[#E6F5EC] text-[#075618]'
                          : 'bg-[#F3F3F3] text-[#767676]'
                      }`}
                    >
                      {coord.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      <EditarUnidadeModal
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        onSucesso={() => carregarDetalhe(false)}
        unidade={unidade}
      />
    </div>
  );
}
