'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../../contexts/AuthContext';
import { pesquisaService } from '../../../services/pesquisa.service';
import { unidadeService } from '../../../services/unidade.service';
import { CanalPesquisa, PesquisaDTO, UnidadeDTO } from '../../../types/api';

export default function PesquisasPage() {
  const { ehAdmin } = useAuth();

  const [pesquisas, setPesquisas] = useState<PesquisaDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Form de criação
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [periodo, setPeriodo] = useState('2026-Q1');
  const [canal, setCanal] = useState<CanalPesquisa>('QR_CODE');
  const [unidadePadraoId, setUnidadePadraoId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      const [listaPesq, listaUnid] = await Promise.all([
        pesquisaService.listar(),
        unidadeService.listar(true),
      ]);
      setPesquisas(listaPesq);
      setUnidades(listaUnid);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      await pesquisaService.criar({
        titulo,
        descricao,
        periodo,
        canal,
        unidadePadraoId: unidadePadraoId || null,
      });
      setModalAberto(false);
      setTitulo('');
      setDescricao('');
      await carregarDados();
    } catch (err: any) {
      setErro(err?.message || 'Falha ao criar pesquisa.');
    } finally {
      setSalvando(false);
    }
  };

  const copiarLink = (id: string) => {
    const url = `${window.location.origin}/pesquisa/${id}`;
    navigator.clipboard.writeText(url);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pesquisas de Satisfação
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão dos formulários de avaliação, links e QR Codes distribuídos aos clientes
          </p>
        </div>

        {ehAdmin && (
          <Button onClick={() => setModalAberto(true)}>
            <Plus className="w-4 h-4" />
            Nova Pesquisa
          </Button>
        )}
      </div>

      <Card>
        {carregando ? (
          <TableSkeleton rows={4} columns={5} />
        ) : pesquisas.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-700">Nenhuma pesquisa cadastrada</div>
            <p className="text-xs text-slate-400 mt-1">
              Crie a primeira pesquisa para gerar o link de avaliação pública do cliente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Canal</th>
                  <th className="py-3 px-4">Período</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Link de Avaliação do Cliente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pesquisas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{p.titulo}</div>
                      <div className="text-xs text-slate-400 font-normal">{p.descricao}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{p.canal}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{p.periodo}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.ativa
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.ativa ? 'Ativa' : 'Encerrada'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copiarLink(p.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          {copiadoId === p.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Link</span>
                            </>
                          )}
                        </button>
                        <Link
                          href={`/pesquisa/${p.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[var(--brand-primary-light)] text-[var(--brand-primary)] hover:opacity-90 transition-opacity"
                        >
                          <span>Abrir Formulário</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Nova Pesquisa */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Nova Pesquisa de Satisfação"
        description="Crie uma pesquisa para gerar formulários e QR Codes"
      >
        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {erro}
          </div>
        )}
        <form onSubmit={handleCriar} className="space-y-4">
          <Input
            label="Título da Pesquisa"
            required
            placeholder="Ex: Pesquisa de Satisfação Coleta 2026"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <Input
            label="Descrição / Orientação ao Paciente (Opcional)"
            placeholder="Ex: Sua opinião nos ajuda a aprimorar nossos serviços de diagnóstico."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Período / Vigência"
              required
              placeholder="Ex: 2026-Q1"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
            <Select
              label="Canal Principal"
              value={canal}
              onChange={(e) => setCanal(e.target.value as CanalPesquisa)}
              options={[
                { value: 'QR_CODE', label: 'QR Code Impresso' },
                { value: 'LINK', label: 'Link Web' },
                { value: 'TOTEM', label: 'Totem na Unidade' },
                { value: 'WHATSAPP', label: 'WhatsApp' },
                { value: 'EMAIL', label: 'E-mail' },
              ]}
            />
          </div>
          <Select
            label="Unidade Padrão (Opcional)"
            value={unidadePadraoId}
            onChange={(e) => setUnidadePadraoId(e.target.value)}
            options={[
              { value: '', label: 'Deixar livre para o cliente selecionar' },
              ...unidades.map((u) => ({ value: u.id, label: u.nome })),
            ]}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={salvando}>
              Cadastrar Pesquisa
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
