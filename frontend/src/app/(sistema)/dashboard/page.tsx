'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardService } from '../../../services/dashboard.service';
import { unidadeService } from '../../../services/unidade.service';
import { IndicadoresDashboardDTO, UnidadeDTO } from '../../../types/api';
import { DashboardKpiCard } from '../../../components/dashboard/DashboardKpiCard';
import { DistribuicaoNotasChart } from '../../../components/dashboard/DistribuicaoNotasChart';
import { PesquisaDesempenhoGrid } from '../../../components/dashboard/PesquisaDesempenhoGrid';
import { PanoramaUnidadesTable } from '../../../components/dashboard/PanoramaUnidadesTable';
import { UltimasManifestacoesStream } from '../../../components/dashboard/UltimasManifestacoesStream';
import { DashboardSkeleton } from '../../../components/dashboard/DashboardSkeleton';
import { ErrorView } from '../../../components/ui/ErrorView';
import {
  Star,
  MessageSquareCheck,
  AlertTriangle,
  Clock,
  RotateCw,
  Building2,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

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

  // Carrega lista de unidades ativas para Admin e Ouvidoria
  useEffect(() => {
    if (ehAdmin || ehOuvidoria) {
      unidadeService
        .listar(true)
        .then((dados) => setUnidades(dados))
        .catch((err) => {
          console.warn('[Dashboard] Aviso ao listar unidades:', err);
        });
    }
  }, [ehAdmin, ehOuvidoria]);

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

  const nomeUnidadeFiltro =
    unidades.find((u) => u.id === unidadeFiltro)?.nome ||
    (ehCoordenador ? 'Sua Unidade Vinculada' : 'Todas as Unidades');

  if (carregando) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <ErrorView
          tipo="conexao"
          titulo="Falha ao carregar indicadores"
          descricao={erro}
          onReset={() => carregarIndicadores(true)}
          embedded
        />
      </div>
    );
  }

  if (!indicadores) {
    return null;
  }

  // Preparações dos KPIs
  const totalAbertas = indicadores.totalAbertas;
  const totalEscalonadas = indicadores.totalEscalonadas;
  const statusPendenciasDestaque =
    totalEscalonadas > 0
      ? 'vermelho'
      : totalAbertas > 0
      ? 'laranja'
      : 'verde';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho da Página com Boas-vindas e Controles de Escopo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
              Dashboard Gerencial
            </h1>
            <button
              type="button"
              onClick={() => carregarIndicadores(false)}
              disabled={atualizando}
              title="Atualizar indicadores"
              className="p-1.5 rounded-lg text-[#5E5E5E] hover:text-[#075618] hover:bg-[#F0FDF4] transition-all disabled:opacity-50"
            >
              <RotateCw size={18} className={atualizando ? 'animate-spin text-[#075618]' : ''} />
            </button>
          </div>
          <p className="text-[#5E5E5E] text-sm mt-1">
            Visão consolidada de satisfação dos clientes, SLA e manifestações em tempo real.
          </p>
        </div>

        {/* Seletor de Escopo de Unidade (RBAC) */}
        <div className="flex items-center gap-3">
          {ehCoordenador ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F0FDF4] border border-emerald-200 text-[#075618] text-xs font-semibold">
              <ShieldCheck size={16} className="text-[#02A562]" />
              <span>Escopo: {nomeUnidadeFiltro}</span>
            </div>
          ) : (
            <div className="relative inline-flex items-center">
              <Building2
                size={16}
                className="absolute left-3 text-[#5E5E5E] pointer-events-none"
              />
              <select
                value={unidadeFiltro}
                onChange={(e) => setUnidadeFiltro(e.target.value)}
                aria-label="Filtrar indicadores por unidade"
                className="pl-9 pr-9 py-2 text-xs font-semibold rounded-xl border border-[#E3E3E3] bg-white text-[#171717] hover:border-[#075618] focus:outline-none focus:ring-2 focus:ring-[#075618]/20 transition-all appearance-none cursor-pointer shadow-sm"
              >
                <option value="">Todas as Unidades</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 text-[#5E5E5E] pointer-events-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Grid Superior com os 4 KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nota Média Geral */}
        <DashboardKpiCard
          titulo="Nota Média Geral"
          valor={indicadores.notaMediaGeral > 0 ? indicadores.notaMediaGeral.toFixed(1) : '—'}
          icone={<Star size={20} className="fill-[#075618]" />}
          descricao={`Meta institucional: > 4.5`}
          badge={{
            texto:
              indicadores.notaMediaGeral >= 4.5
                ? 'Excelente'
                : indicadores.notaMediaGeral >= 3.5
                ? 'Muito Bom'
                : indicadores.notaMediaGeral > 0
                ? 'Em Atenção'
                : 'Sem notas',
            variante:
              indicadores.notaMediaGeral >= 4.5
                ? 'sucesso'
                : indicadores.notaMediaGeral >= 3.5
                ? 'neutro'
                : 'alerta',
          }}
          destaque="verde"
        />

        {/* KPI 2: Total de Respostas */}
        <DashboardKpiCard
          titulo="Total de Avaliações"
          valor={indicadores.totalRespostas}
          icone={<MessageSquareCheck size={20} />}
          descricao="Respostas de pesquisas registradas"
          badge={{
            texto: `${indicadores.totalConcluidas} concluídas`,
            variante: 'sucesso',
          }}
          destaque="padrao"
        />

        {/* KPI 3: Pendências em Aberto */}
        <DashboardKpiCard
          titulo="Pendências Abertas"
          valor={totalAbertas}
          icone={<AlertTriangle size={20} />}
          descricao={`${indicadores.totalNaoRespondidas} aguardando resposta`}
          badge={{
            texto:
              totalEscalonadas > 0
                ? `${totalEscalonadas} escalonadas`
                : totalAbertas === 0
                ? 'Tudo em dia'
                : 'Em atendimento',
            variante:
              totalEscalonadas > 0
                ? 'perigo'
                : totalAbertas === 0
                ? 'sucesso'
                : 'alerta',
          }}
          destaque={statusPendenciasDestaque}
        />

        {/* KPI 4: SLA Médio */}
        <DashboardKpiCard
          titulo="SLA Médio de Conclusão"
          valor={
            indicadores.tempoMedioConclusaoHoras > 0
              ? `${indicadores.tempoMedioConclusaoHoras}h`
              : '0h'
          }
          icone={<Clock size={20} />}
          descricao={
            indicadores.tempoMedioRespostaHoras > 0
              ? `1ª resposta: ${indicadores.tempoMedioRespostaHoras}h`
              : 'SLA dentro do padrão'
          }
          badge={{
            texto: 'SLA Operacional',
            variante: 'neutro',
          }}
          destaque="padrao"
        />
      </div>

      {/* Grid Intermediário (Bento de 2 Colunas: Notas & Desempenho por Pesquisa) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Coluna Esquerda: Distribuição de Notas (1 a 5) */}
        <div className="lg:col-span-5">
          <DistribuicaoNotasChart
            distribuicao={indicadores.distribuicaoNotas}
            totalRespostas={indicadores.totalRespostas}
            notaMedia={indicadores.notaMediaGeral}
          />
        </div>

        {/* Coluna Direita: Desempenho Dividido por Pesquisa */}
        <div className="lg:col-span-7">
          <PesquisaDesempenhoGrid
            pesquisas={indicadores.desempenhoPorPesquisa || []}
            unidadeNome={unidadeFiltro ? nomeUnidadeFiltro : undefined}
          />
        </div>
      </div>

      {/* Seção Operacional: Panorama por Unidade (Visível para Admin e Ouvidoria) */}
      {(ehAdmin || ehOuvidoria) && (
        <PanoramaUnidadesTable
          volumePorUnidade={indicadores.volumePorUnidade || []}
          pendenciasPorUnidade={indicadores.pendenciasPorUnidade || []}
          onSelecionarUnidade={(id) => setUnidadeFiltro(id)}
          unidadeSelecionadaId={unidadeFiltro}
        />
      )}

      {/* Seção Inferior: Últimas Manifestações Registradas */}
      <UltimasManifestacoesStream
        manifestacoes={indicadores.ultimasManifestacoes || []}
      />
    </div>
  );
}
