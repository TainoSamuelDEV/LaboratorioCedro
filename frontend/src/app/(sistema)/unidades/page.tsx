'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Building2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { useAuth } from '../../../contexts/AuthContext';
import { unidadeService } from '../../../services/unidade.service';
import { UnidadeDTO } from '../../../types/api';

export default function UnidadesPage() {
  const { ehAdmin } = useAuth();

  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Form
  const [nome, setNome] = useState('');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [prazoPadraoHoras, setPrazoPadraoHoras] = useState(48);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarUnidades = async () => {
    try {
      const data = await unidadeService.listar();
      setUnidades(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUnidades();
  }, []);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    try {
      await unidadeService.criar({
        nome: nome.trim(),
        responsavelNome: responsavelNome.trim() || undefined,
        prazoPadraoHoras: Number(prazoPadraoHoras),
      });
      setModalAberto(false);
      setNome('');
      setResponsavelNome('');
      setPrazoPadraoHoras(48);
      await carregarUnidades();
    } catch (err: any) {
      setErro(err?.message || 'Falha ao cadastrar unidade.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Unidades de Atendimento e Coleta
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Governança de laboratórios, responsáveis operacionais e prazos padrão de SLA
          </p>
        </div>

        {ehAdmin && (
          <Button onClick={() => setModalAberto(true)}>
            <Plus className="w-4 h-4" />
            Nova Unidade
          </Button>
        )}
      </div>

      <Card>
        {carregando ? (
          <TableSkeleton rows={4} columns={5} />
        ) : unidades.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-700">Nenhuma unidade cadastrada</div>
            <p className="text-xs text-slate-400 mt-1">Cadastre unidades para associar aos atendimentos e SLAs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nome da Unidade</th>
                  <th className="py-3 px-4">Responsável Operacional</th>
                  <th className="py-3 px-4">SLA Padrão de Resposta</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 font-mono text-xs text-slate-400">ID do Domínio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {unidades.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{u.nome}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {u.responsavelNome || <span className="text-slate-400 italic">Não informado</span>}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {u.prazoPadraoHoras} horas
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.ativa ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <XCircle className="w-3 h-3" />
                          Inativa
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Nova Unidade */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Cadastrar Nova Unidade"
        description="Defina a unidade laboratorial e seu tempo padrão de SLA para o domínio POO"
      >
        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {erro}
          </div>
        )}
        <form onSubmit={handleCriar} className="space-y-4">
          <Input
            label="Nome da Unidade"
            required
            placeholder="Ex: Unidade Centro Diagnósticos"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            label="Nome do Responsável / Coordenador"
            placeholder="Ex: Dra. Beatriz Almeida"
            value={responsavelNome}
            onChange={(e) => setResponsavelNome(e.target.value)}
          />
          <Input
            label="Prazo Padrão de SLA (Horas)"
            type="number"
            min={1}
            required
            value={prazoPadraoHoras}
            onChange={(e) => setPrazoPadraoHoras(Number(e.target.value))}
            helperText="Tempo máximo regulamentar para que a unidade responda formalmente a manifestação."
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={salvando}>
              Cadastrar Unidade
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
