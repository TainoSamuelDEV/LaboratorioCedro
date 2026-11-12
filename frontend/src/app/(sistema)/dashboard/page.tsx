'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardService } from '../../../services/dashboard.service';
import { unidadeService } from '../../../services/unidade.service';
import { IndicadoresDashboardDTO, UnidadeDTO } from '../../../types/api';
import { DashboardKpiCard } from '../../../components/dashboard/DashboardKpiCard';
import { DistribuicaoNotasChart } from '../../../components/dashboard/DistribuicaoNotasChart';
import { PesquisaDesempenhoGrid } from '../../../components/dashboard/PesquisaDesempenhoGrid';
import { UltimasManifestacoesStream } from '../../../components/dashboard/UltimasManifestacoesStream';
import { DashboardSkeleton } from '../../../components/dashboard/DashboardSkeleton';
import { ErrorView } from '../../../components/ui/ErrorView';
import { RotateCw } from 'lucide-react';

export default function DashboardPage() {
  const { usuario, ehCoordenador, ehAdmin, ehOuvidoria } = useAuth();

  const [indicadores, setIndicadores] = useState<IndicadoresDashboardDTO | null>(null);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [unidadeFiltro, setUnidadeFiltro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Inicializa filtro caso seja Coordenador de Unidade
  useEffect(() => {
    if (ehCoordenador && usuario?.unidadeId) {
      setUnidadeFiltro(usuario.unidadeId);
    }
  }, [ehCoordenador, usuario]);

  // Carrega lista de unidades ativas para identificação e filtros
  useEffect(() => {
    unidadeService
      .listar(true)
      .then((dados) => setUnidades(dados))
      .catch((err) => {
        console.warn('[Dashboard] Aviso ao listar unidades:', err);
      });
  }, []);

  // Busca indicadores do dashboard
  const carregarIndicadores = useCallback(
    async (mostrarSpinnerTotal = false) => {
      try {
        if (mostrarSpinnerTotal) {
          setCarregando(true);
        } else {
          setAtualizando(true);
        }
        setErro(null);

        // Se for coordenador, garante que a busca utilize a unidade dele
        const filtroEfetivo = ehCoordenador ? usuario?.unidadeId : unidadeFiltro;
        const dados = await dashboardService.obterIndicadores(
          filtroEfetivo ? filtroEfetivo : undefined
        );
        setIndicadores(dados);
      } catch (err: unknown) {
        console.error('[Dashboard] Erro ao obter indicadores:', err);
        setErro(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os indicadores do dashboard.'
        );
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [ehCoordenador, usuario?.unidadeId, unidadeFiltro]
  );

  useEffect(() => {
    carregarIndicadores(true);
  }, [carregarIndicadores]);

  const unidadeIdEfetiva = ehCoordenador ? usuario?.unidadeId : unidadeFiltro;
  const unidadeAtual = unidades.find((u) => u.id === unidadeIdEfetiva);
  const nomeUnidade = unidadeAtual?.nome || (ehCoordenador ? 'Sua Unidade Vinculada' : 'todas as unidades');

  if (carregando) {
    return <DashboardSkeleton />;
  }

  if (erro) {
    return (
      <ErrorView
        tipo="conexao"
        titulo="Falha ao carregar indicadores"
        descricao={erro}
        onReset={() => carregarIndicadores(true)}
        embedded
      />
    );
  }

  if (!indicadores) {
    return null;
  }

  // Cálculos fiéis ao protótipo Painel _ Experiência do Cliente (2).html
  const totalRespostas = indicadores.totalRespostas;
  const notaMedia = indicadores.notaMediaGeral;

  // Satisfeitos: porcentagem de notas 4 e 5
  const respostasSatisfeitas = indicadores.distribuicaoNotas
    .filter((d) => d.nota >= 4)
    .reduce((acc, d) => acc + d.quantidade, 0);
  const percentualSatisfeitos =
    totalRespostas > 0
      ? Math.round((respostasSatisfeitas / totalRespostas) * 100)
      : 0;

  // Pendências e atrasadas/escalonadas
  const totalPendencias = indicadores.totalAbertas;
  const totalAtrasadasOuEscalonadas = indicadores.totalEscalonadas;

  return (
    <div>
      {/* Cabeçalho da Página com Boas-vindas e Seletor Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
            Dashboard
          </h1>
          <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-0">
            {ehCoordenador
              ? `Visão geral das respostas das pesquisas da unidade ${nomeUnidade}.`
              : unidadeFiltro
              ? `Visão geral das respostas das pesquisas da unidade ${nomeUnidade}.`
              : 'Visão geral das respostas das pesquisas de todas as unidades.'}
          </p>
        </div>

        {/* Controles de Escopo e Atualização */}
        <div className="flex items-center gap-2 self-start">
          {ehCoordenador ? (
            <span className="inline-block py-1 px-3 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#075618] border border-[#A7F3D0]">
              {nomeUnidade}
            </span>
          ) : (
            <select
              value={unidadeFiltro}
              onChange={(e) => setUnidadeFiltro(e.target.value)}
              aria-label="Filtrar por unidade"
              className="text-sm text-[#171717] bg-white border-[1.5px] border-[#E3E3E3] rounded-lg px-3 h-[44px] cursor-pointer focus:outline-none focus:border-[#02A562]"
            >
              <option value="">Todas as unidades</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => carregarIndicadores(false)}
            disabled={atualizando}
            title="Atualizar dados"
            aria-label="Atualizar dados"
            className="w-[44px] h-[44px] inline-grid place-items-center rounded-lg border-[1.5px] border-[#E3E3E3] bg-white text-[#5E5E5E] hover:text-[#075618] hover:border-[#075618] transition-colors disabled:opacity-50"
          >
            <RotateCw
              size={18}
              className={atualizando ? 'animate-spin text-[#075618]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Grid com os 4 KPIs Limpos (Padrão .kpis do modelo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* KPI 1: Respostas */}
        <DashboardKpiCard
          rotulo="Respostas"
          valor={totalRespostas}
          descricao="no período"
        />

        {/* KPI 2: Nota Média */}
        <DashboardKpiCard
          rotulo="Nota média"
          valor={notaMedia > 0 ? notaMedia.toFixed(1) : '—'}
          descricao="de 5"
        />

        {/* KPI 3: Satisfeitos */}
        <DashboardKpiCard
          rotulo="Satisfeitos"
          valor={`${percentualSatisfeitos}%`}
          descricao="notas 4 e 5"
        />

        {/* KPI 4: Pendências */}
        <DashboardKpiCard
          rotulo="Pendências"
          valor={totalPendencias}
          descricao={
            totalAtrasadasOuEscalonadas > 0
              ? `${totalAtrasadasOuEscalonadas} ${
                  totalAtrasadasOuEscalonadas === 1 ? 'atrasada' : 'atrasadas'
                }`
              : totalPendencias === 0
              ? 'todas em dia'
              : 'em tratamento'
          }
        />
      </div>

      {/* Grid de 2 Colunas (.g2 do modelo: Distribuição das notas & Desempenho por pesquisa) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Distribuição das Notas (Barras 5 a 1 com círculos .nt) */}
        <DistribuicaoNotasChart
          distribuicao={indicadores.distribuicaoNotas}
          totalRespostas={totalRespostas}
        />

        {/* Desempenho por Pesquisa / Unidade */}
        <PesquisaDesempenhoGrid
          pesquisas={indicadores.desempenhoPorPesquisa || []}
          volumePorUnidade={indicadores.volumePorUnidade || []}
          permiteAlternarUnidade={!ehCoordenador && (ehAdmin || ehOuvidoria)}
        />
      </div>

      {/* Tabela de Manifestações Recentes (Idêntica ao modelo .tbl) */}
      <UltimasManifestacoesStream
        manifestacoes={indicadores.ultimasManifestacoes || []}
      />
    </div>
  );
}
