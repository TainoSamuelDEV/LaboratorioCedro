'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClockAlert, ArrowRight, AlertTriangle } from 'lucide-react';
import { PrioridadeBadge, StatusBadge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { manifestacaoService } from '../../../services/manifestacao.service';
import { ManifestacaoDTO } from '../../../types/api';

export default function PendenciasPage() {
  const [pendencias, setPendencias] = useState<ManifestacaoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    manifestacaoService
      .listarPendencias()
      .then(setPendencias)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Fila de Pendências & Alertas de SLA (Tela 6)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {pendencias.length} urgentes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manifestações não respondidas, escalonadas ou que ultrapassaram o prazo regulamentar da unidade
          </p>
        </div>
      </div>

      <Card>
        {carregando ? (
          <TableSkeleton rows={5} columns={6} />
        ) : pendencias.length === 0 ? (
          <div className="text-center py-12">
            <ClockAlert className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-800">Nenhuma pendência crítica no momento!</div>
            <p className="text-xs text-slate-400 mt-1">
              Todas as unidades estão com suas tratativas dentro dos prazos regulamentares de SLA.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Protocolo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Prazo Limite SLA</th>
                  <th className="py-3 px-4">Alerta Operacional</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pendencias.map((m) => {
                  const dataPrazo = new Date(m.prazoResposta).getTime();
                  const estourado = dataPrazo < Date.now();

                  return (
                    <tr key={m.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link href={`/manifestacoes/${m.id}`} className="hover:underline">
                          {m.protocolo}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <PrioridadeBadge prioridade={m.prioridade} />
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        {new Date(m.prazoResposta).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {estourado ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Prazo Estourado
                          </span>
                        ) : m.status === 'ESCALONADA' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Escalonada p/ Gestão
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Aguardando Unidade
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/manifestacoes/${m.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                        >
                          <span>Tratar Imediatamente</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
