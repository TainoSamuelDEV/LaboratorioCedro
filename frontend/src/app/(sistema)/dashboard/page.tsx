'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClockAlert,
  MessageSquareWarning,
  Building2,
  ClipboardList,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Star,
  Timer,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { DashboardSkeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardService } from '../../../services/dashboard.service';
import { pesquisaService } from '../../../services/pesquisa.service';
import { IndicadoresDashboardDTO, PesquisaDTO } from '../../../types/api';

export default function DashboardPage() {
  const { usuario, ehAdmin, ehOuvidoria } = useAuth();

  const [indicadores, setIndicadores] = useState<IndicadoresDashboardDTO | null>(null);
  const [pesquisas, setPesquisas] = useState<PesquisaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.obterIndicadores().catch(() => null),
      pesquisaService.listar().catch(() => []),
    ]).then(([ind, pesqs]) => {
      setIndicadores(ind);
      setPesquisas(pesqs);
      setCarregando(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Painel de Controle — Experiência do Cliente
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Visão consolidada dos 10 indicadores gerenciais da Ouvidoria e coordenações do Laboratório Cedro
        </p>
      </div>

      {carregando ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Grid Superior: Métricas de Status e SLA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Respostas
            </span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2 font-mono">
            {indicadores?.totalRespostas ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Coletadas via QR Code / Totem</div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Não Respondidas
            </span>
            <ClockAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-600 mt-2 font-mono">
            {indicadores?.totalNaoRespondidas ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Aguardando resposta da unidade</div>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Escalonadas (Críticas)
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-600 mt-2 font-mono">
            {indicadores?.totalEscalonadas ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">SLA expirado ou alta criticidade</div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Concluídas
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-2 font-mono">
            {indicadores?.totalConcluidas ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Com parecer final da Ouvidoria</div>
        </Card>
      </div>

      {/* Grid Central: Médias de SLA e Distribuição de Notas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Notas (1 a 5) */}
        <Card title="Distribuição de Notas dos Pacientes (1 a 5)">
          <p className="text-xs text-slate-500 mb-4">
            Percentual e contagem de notas atribuídas nas pesquisas de satisfação
          </p>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((nota) => {
              const item = indicadores?.distribuicaoNotas.find((d) => d.nota === nota);
              const qtd = item?.quantidade ?? 0;
              const pct = item?.porcentagem ?? 0;

              return (
                <div key={nota} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 font-semibold text-slate-700">
                    <span>{nota}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        nota >= 4
                          ? 'bg-emerald-500'
                          : nota === 3
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-20 text-right font-mono text-slate-600">
                    <span className="font-semibold text-slate-800">{qtd}</span> ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Eficiência Operacional & Tempos Médios de SLA */}
        <Card title="Eficiência e Prazos Médios (SLA)">
          <p className="text-xs text-slate-500 mb-4">
            Tempo médio em horas para primeira resposta da unidade e conclusão do protocolo
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
                <Timer className="w-4 h-4 text-blue-600" />
                Tempo Médio Resposta
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
                {indicadores?.tempoMedioRespostaHoras ?? 0}h
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Desde a manifestação até a resposta formal da unidade
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tempo Médio Conclusão
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
                {indicadores?.tempoMedioConclusaoHoras ?? 0}h
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Protocolo completo até arquivamento pela Ouvidoria
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
            <strong>Regra POO de Detratores:</strong> Notas 1 e 2 reduzem o prazo de resposta da unidade em 50% e elevam automaticamente a prioridade para <code>ALTA</code>.
          </div>
        </Card>
      </div>

      {/* Grid Inferior: Volume e Pendências por Unidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Volume Total por Unidade">
          <p className="text-xs text-slate-500 mb-3">
            Quantidade total de manifestações geradas por posto de atendimento
          </p>

          {indicadores?.volumePorUnidade && indicadores.volumePorUnidade.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {indicadores.volumePorUnidade.map((item) => (
                <div key={item.unidadeId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-800">{item.unidadeNome}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {item.total} manifestações
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Nenhum dado por unidade registrado.</p>
          )}
        </Card>

        <Card title="Fila de Pendências por Unidade">
          <p className="text-xs text-slate-500 mb-3">
            Manifestações abertas, atrasadas ou escalonadas que exigem tratativa
          </p>

          {indicadores?.pendenciasPorUnidade && indicadores.pendenciasPorUnidade.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {indicadores.pendenciasPorUnidade.map((item) => (
                <div key={item.unidadeId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-slate-800">{item.unidadeNome}</span>
                  </div>
                  <span
                    className={`font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      item.pendencias > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.pendencias} pendências
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Nenhuma pendência pendente no momento.</p>
          )}
        </Card>
      </div>

      {/* Atalhos Rápidos e Teste de Pesquisas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Acesso Rápido aos Módulos">
          <div className="space-y-3">
            <Link
              href="/manifestacoes"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Gerenciar e Tratar Manifestações
                </div>
                <div className="text-xs text-slate-500">
                  Acessar protocolos, filtros da Seção 10 e histórico de interações
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/pendencias"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Fila Crítica de Pendências (Tela 6)
                </div>
                <div className="text-xs text-slate-500">
                  Casos atrasados, escalonados e urgentes para tratativa imediata
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            {(ehAdmin || ehOuvidoria) && (
              <Link
                href="/relatorios"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Relatórios Gerenciais e Exportação CSV (Tela 9)
                  </div>
                  <div className="text-xs text-slate-500">
                    Exportação em conformidade com a auditoria e regras de POO
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            )}
          </div>
        </Card>

        <Card title="Avaliação Pública do Cliente (QR Code)">
          <p className="text-xs text-slate-600 mb-4">
            Para testar o fluxo central de ponta a ponta (resposta com nota detratora 1 ou 2 gerando
            manifestação automática com prioridade ALTA):
          </p>

          {pesquisas.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Pesquisas disponíveis para teste:</span>
              {pesquisas.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <span className="text-xs font-medium text-slate-800">{p.titulo}</span>
                  <Link
                    href={`/pesquisa/${p.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-[var(--brand-primary)] hover:underline font-semibold"
                  >
                    Abrir Formulário Público
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Nenhuma pesquisa cadastrada. Acesse a aba "Pesquisas" para criar a primeira.
            </div>
          )}
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
