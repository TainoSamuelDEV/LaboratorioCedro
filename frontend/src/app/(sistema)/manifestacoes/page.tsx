'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, MessageSquareWarning, ArrowRight } from 'lucide-react';
import { PrioridadeBadge, StatusBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../../components/ui/Drawer';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../../contexts/AuthContext';
import { manifestacaoService } from '../../../services/manifestacao.service';
import { unidadeService } from '../../../services/unidade.service';
import {
  ManifestacaoDTO,
  PrioridadeManifestacao,
  StatusManifestacao,
  UnidadeDTO,
} from '../../../types/api';

export default function ManifestacoesPage() {
  const { usuario } = useAuth();

  const [manifestacoes, setManifestacoes] = useState<ManifestacaoDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros (Seção 10)
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<string>('');
  const [unidadeFiltro, setUnidadeFiltro] = useState<string>('');
  const [filtroDrawerOpen, setFiltroDrawerOpen] = useState(false);

  const carregarManifestacoes = async () => {
    setCarregando(true);
    try {
      const data = await manifestacaoService.listar({
        busca: busca.trim() || undefined,
        status: (statusFiltro as StatusManifestacao) || undefined,
        prioridade: (prioridadeFiltro as PrioridadeManifestacao) || undefined,
        unidadeId: unidadeFiltro || undefined,
      });
      setManifestacoes(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    unidadeService.listar().then(setUnidades).catch(console.error);
  }, []);

  useEffect(() => {
    carregarManifestacoes();
  }, [statusFiltro, prioridadeFiltro, unidadeFiltro]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    carregarManifestacoes();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestão de Manifestações da Ouvidoria
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualização, filtros avançados e tratativa operacional das avaliações dos clientes
          </p>
        </div>

        {/* Botão Mobile para abrir Filtros em Gaveta (Drawer) */}
        <div className="flex md:hidden">
          <Button variant="outline" size="sm" onClick={() => setFiltroDrawerOpen(true)} className="w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5" />
            Filtros Avançados
          </Button>
        </div>
      </div>

      {/* Barra de Filtros Desktop (Seção 10 da Documentação Funcional) */}
      <Card className="hidden md:block p-4 bg-slate-50/50">
        <form onSubmit={handleBuscar} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Input
              placeholder="Buscar por protocolo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <Select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            options={[
              { value: '', label: 'Todos os Status' },
              { value: 'NAO_RESPONDIDA', label: 'Não Respondida' },
              { value: 'EM_TRATAMENTO', label: 'Em Tratamento' },
              { value: 'ESCALONADA', label: 'Escalonada' },
              { value: 'RESPONDIDA', label: 'Respondida' },
              { value: 'CONCLUIDA', label: 'Concluída' },
            ]}
          />

          <Select
            value={prioridadeFiltro}
            onChange={(e) => setPrioridadeFiltro(e.target.value)}
            options={[
              { value: '', label: 'Todas as Prioridades' },
              { value: 'BAIXA', label: 'Baixa' },
              { value: 'MEDIA', label: 'Média' },
              { value: 'ALTA', label: 'Alta (Detratora)' },
              { value: 'CRITICA', label: 'Crítica (Escalonada)' },
            ]}
          />

          {!usuario?.unidadeId && (
            <Select
              value={unidadeFiltro}
              onChange={(e) => setUnidadeFiltro(e.target.value)}
              options={[
                { value: '', label: 'Todas as Unidades' },
                ...unidades.map((u) => ({ value: u.id, label: u.nome })),
              ]}
            />
          )}

          <div className="md:col-span-4 flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setBusca('');
                setStatusFiltro('');
                setPrioridadeFiltro('');
                setUnidadeFiltro('');
              }}
            >
              Limpar Filtros
            </Button>
            <Button type="submit" size="sm">
              <Search className="w-3.5 h-3.5" />
              Filtrar
            </Button>
          </div>
        </form>
      </Card>

      {/* Tabela de Manifestações */}
      <Card>
        {carregando ? (
          <TableSkeleton rows={6} columns={6} />
        ) : manifestacoes.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquareWarning className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-700">Nenhuma manifestação encontrada</div>
            <p className="text-xs text-slate-400 mt-1">
              Altere os filtros acima ou envie novas avaliações no formulário público.
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
                  <th className="py-3 px-4">Data de Abertura</th>
                  <th className="py-3 px-4">Prazo SLA</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {manifestacoes.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--brand-primary)]">
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
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {new Date(m.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                      {new Date(m.prazoResposta).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/manifestacoes/${m.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] hover:underline"
                      >
                        <span>Tratar Caso</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drawer de Filtros Mobile */}
      <Drawer open={filtroDrawerOpen} onOpenChange={setFiltroDrawerOpen} direction="bottom">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filtrar Manifestações</DrawerTitle>
            <DrawerDescription>
              Refine a listagem por protocolo, status, prioridade ou unidade
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <Input
              label="Protocolo"
              placeholder="Buscar por protocolo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Select
              label="Status Operacional"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              options={[
                { value: '', label: 'Todos os Status' },
                { value: 'NAO_RESPONDIDA', label: 'Não Respondida' },
                { value: 'EM_TRATAMENTO', label: 'Em Tratamento' },
                { value: 'ESCALONADA', label: 'Escalonada' },
                { value: 'RESPONDIDA', label: 'Respondida' },
                { value: 'CONCLUIDA', label: 'Concluída' },
              ]}
            />
            <Select
              label="Prioridade"
              value={prioridadeFiltro}
              onChange={(e) => setPrioridadeFiltro(e.target.value)}
              options={[
                { value: '', label: 'Todas as Prioridades' },
                { value: 'BAIXA', label: 'Baixa' },
                { value: 'MEDIA', label: 'Média' },
                { value: 'ALTA', label: 'Alta (Detratora)' },
                { value: 'CRITICA', label: 'Crítica (Escalonada)' },
              ]}
            />
            {!usuario?.unidadeId && (
              <Select
                label="Unidade"
                value={unidadeFiltro}
                onChange={(e) => setUnidadeFiltro(e.target.value)}
                options={[
                  { value: '', label: 'Todas as Unidades' },
                  ...unidades.map((u) => ({ value: u.id, label: u.nome })),
                ]}
              />
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBusca('');
                setStatusFiltro('');
                setPrioridadeFiltro('');
                setUnidadeFiltro('');
                setFiltroDrawerOpen(false);
              }}
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={() => {
                carregarManifestacoes();
                setFiltroDrawerOpen(false);
              }}
            >
              Aplicar Filtros
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
