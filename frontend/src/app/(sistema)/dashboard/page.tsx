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
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../../contexts/AuthContext';
import { manifestacaoService } from '../../../services/manifestacao.service';
import { pesquisaService } from '../../../services/pesquisa.service';
import { ManifestacaoDTO, PesquisaDTO } from '../../../types/api';

export default function DashboardPage() {
  const { usuario, ehAdmin, ehOuvidoria } = useAuth();

  const [manifestacoes, setManifestacoes] = useState<ManifestacaoDTO[]>([]);
  const [pendencias, setPendencias] = useState<ManifestacaoDTO[]>([]);
  const [pesquisas, setPesquisas] = useState<PesquisaDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      manifestacaoService.listar().catch(() => []),
      manifestacaoService.listarPendencias().catch(() => []),
      pesquisaService.listar().catch(() => []),
    ]).then(([manifs, pends, pesqs]) => {
      setManifestacoes(manifs);
      setPendencias(pends);
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
          Visão consolidada da Ouvidoria e coordenação de unidades do Laboratório Cedro
        </p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-l-4 border-l-[var(--brand-primary)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total de Manifestações
            </span>
            <MessageSquareWarning className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2 font-mono">
            {manifestacoes.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Registradas no domínio POO</div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fila de Pendências & SLA
            </span>
            <ClockAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-600 mt-2 font-mono">
            {pendencias.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Não respondidas ou escalonadas</div>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pesquisas Ativas
            </span>
            <ClipboardList className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-3xl font-bold text-sky-600 mt-2 font-mono">
            {pesquisas.filter((p) => p.ativa).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Canais QR Code / Totem / Link</div>
        </Card>
      </div>

      {/* Atalhos Rápidos para Testar o Back-end */}
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
                href="/pesquisas"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Pesquisas de Satisfação e Links
                  </div>
                  <div className="text-xs text-slate-500">
                    Gerar links públicos de avaliação do cliente via QR Code
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
    </div>
  );
}
