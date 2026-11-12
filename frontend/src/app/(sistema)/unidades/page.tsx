'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Building2, Edit, Power, RotateCw, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { unidadeService } from '../../../services/unidade.service';
import { UnidadeDTO } from '../../../types/api';
import { CriarUnidadeModal } from '../../../components/unidades/CriarUnidadeModal';
import { EditarUnidadeModal } from '../../../components/unidades/EditarUnidadeModal';
import { UnidadesSkeleton } from '../../../components/unidades/UnidadesSkeleton';
import { ErrorView } from '../../../components/ui/ErrorView';

type FiltroStatus = 'todas' | 'ativas' | 'inativas';

export default function UnidadesPage() {
  const { ehAdmin } = useAuth();

  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas');

  // Modais
  const [modalCriarAberto, setModalCriarAberto] = useState<boolean>(false);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<UnidadeDTO | null>(null);

  const carregarUnidades = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setCarregando(true);
      else setAtualizando(true);
      setErro(null);

      const lista = await unidadeService.listar(false);
      setUnidades(lista);
    } catch (err: unknown) {
      console.error('[UnidadesPage] Erro ao carregar unidades:', err);
      setErro(
        err instanceof Error ? err.message : 'Não foi possível carregar a lista de unidades.'
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarUnidades(true);
  }, [carregarUnidades]);

  const totalAtivas = useMemo(() => unidades.filter((u) => u.ativa).length, [unidades]);
  const totalInativas = useMemo(() => unidades.filter((u) => !u.ativa).length, [unidades]);

  const unidadesFiltradas = useMemo(() => {
    return unidades.filter((u) => {
      if (filtroStatus === 'ativas' && !u.ativa) return false;
      if (filtroStatus === 'inativas' && u.ativa) return false;

      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nomeMatch = u.nome.toLowerCase().includes(termo);
        const respMatch = (u.responsavelNome || '').toLowerCase().includes(termo);
        if (!nomeMatch && !respMatch) return false;
      }

      return true;
    });
  }, [unidades, filtroStatus, busca]);

  const handleAlternarStatus = async (u: UnidadeDTO) => {
    try {
      const novaAtiva = !u.ativa;
      await unidadeService.alternarStatus(u.id, novaAtiva);
      setUnidades((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, ativa: novaAtiva } : item))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao alternar status da unidade.');
    }
  };

  const handleEditar = (u: UnidadeDTO) => {
    setUnidadeSelecionada(u);
    setModalEditarAberto(true);
  };

  const handleSucessoCriacao = (nova: UnidadeDTO) => {
    setUnidades((prev) => [...prev, nova]);
  };

  const handleSucessoEdicao = (atualizada: UnidadeDTO) => {
    setUnidades((prev) =>
      prev.map((item) => (item.id === atualizada.id ? atualizada : item))
    );
  };

  if (erro) {
    return (
      <ErrorView
        tipo="conexao"
        titulo="Erro ao carregar unidades"
        descricao={erro}
        onReset={() => carregarUnidades(true)}
        embedded
      />
    );
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
            Unidades
          </h1>
          <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-0">
            Cadastro e configuração de unidades de atendimento e prazos de SLA.
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 self-start">
          {ehAdmin && (
            <button
              type="button"
              onClick={() => setModalCriarAberto(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-[#075618] hover:bg-[#054012] text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Nova Unidade</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => carregarUnidades(false)}
            disabled={atualizando}
            title="Atualizar lista"
            aria-label="Atualizar lista"
            className="w-11 h-11 inline-grid place-items-center rounded-lg border border-[#E3E3E3] bg-white text-[#5E5E5E] hover:text-[#075618] hover:border-[#075618] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw
              size={18}
              className={atualizando ? 'animate-spin text-[#075618]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Abas com Contadores */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          type="button"
          onClick={() => setFiltroStatus('todas')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            filtroStatus === 'todas'
              ? 'bg-[#02A562] text-white border-[#02A562] shadow-sm'
              : 'bg-white text-[#02A562] border-[#02A562] hover:bg-[#02A562] hover:text-white'
          }`}
        >
          Todas ({unidades.length})
        </button>

        <button
          type="button"
          onClick={() => setFiltroStatus('ativas')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            filtroStatus === 'ativas'
              ? 'bg-[#075618] text-white border-[#075618] shadow-sm'
              : 'bg-white text-[#075618] border-[#075618] hover:bg-[#075618] hover:text-white'
          }`}
        >
          Ativas ({totalAtivas})
        </button>

        <button
          type="button"
          onClick={() => setFiltroStatus('inativas')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            filtroStatus === 'inativas'
              ? 'bg-[#5E5E5E] text-white border-[#5E5E5E] shadow-sm'
              : 'bg-white text-[#5E5E5E] border-[#5E5E5E] hover:bg-[#5E5E5E] hover:text-white'
          }`}
        >
          Inativas ({totalInativas})
        </button>
      </div>

      {/* Busca */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[240px] relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none"
          />
          <input
            type="search"
            placeholder="Buscar por nome da unidade ou responsável..."
            aria-label="Buscar unidade"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg pl-10 pr-3.5 h-11 placeholder:text-[#999] focus:outline-none focus:border-[#02A562]"
          />
        </div>
      </div>

      {/* Conteúdo */}
      {carregando ? (
        <UnidadesSkeleton />
      ) : unidadesFiltradas.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E3E3E3] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F3F3F3] text-[#5E5E5E] grid place-items-center mx-auto mb-3">
            <Building2 size={20} />
          </div>
          <h3 className="text-base font-bold text-[#171717] m-0 mb-1">
            Nenhuma unidade encontrada
          </h3>
          <p className="text-xs text-[#5E5E5E] max-w-sm mx-auto mb-4">
            {busca || filtroStatus !== 'todas'
              ? 'Nenhum resultado corresponde aos filtros selecionados.'
              : 'Nenhuma unidade cadastrada no sistema.'}
          </p>
          {ehAdmin && !busca && filtroStatus === 'todas' && (
            <button
              type="button"
              onClick={() => setModalCriarAberto(true)}
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-[#075618] text-white text-xs font-bold hover:bg-[#054012] transition-colors"
            >
              <Plus size={15} />
              <span>Cadastrar Primeira Unidade</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {unidadesFiltradas.map((u) => (
              <div
                key={u.id}
                className={`p-5 bg-white rounded-2xl border transition-all flex flex-col justify-between ${
                  u.ativa
                    ? 'border-[#E3E3E3] shadow-xs hover:border-[#02A562]/40 hover:shadow-md'
                    : 'border-[#E5E5E5] bg-[#FAFAFA] opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <Link
                      href={`/unidades/${u.id}`}
                      className="text-base sm:text-lg font-black text-[#075618] hover:underline leading-snug tracking-tight m-0"
                    >
                      {u.nome}
                    </Link>

                    <span
                      className={`inline-block py-0.5 px-2.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                        u.ativa
                          ? 'bg-[#E6F5EC] text-[#075618] border border-[#A7F3D0]'
                          : 'bg-[#F3F3F3] text-[#767676] border border-[#E3E3E3]'
                      }`}
                    >
                      {u.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4 text-xs text-[#5E5E5E]">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={14} className="text-[#075618]" />
                      <span>{u.responsavelNome ? `Resp: ${u.responsavelNome}` : 'Responsável não definido'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#02A562]" />
                      <span>SLA Padrão: <strong>{u.prazoPadraoHoras}h</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EEE] flex items-center justify-between gap-2">
                  <Link
                    href={`/unidades/${u.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6F5EC] text-[#075618] text-xs font-bold hover:bg-[#D1EEDB] transition-colors"
                  >
                    <span>Indicadores</span>
                  </Link>

                  {ehAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditar(u)}
                        title="Editar unidade"
                        aria-label="Editar unidade"
                        className="p-2 rounded-lg text-[#5E5E5E] hover:text-[#075618] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAlternarStatus(u)}
                        title={u.ativa ? 'Desativar unidade (Soft Delete)' : 'Reativar unidade'}
                        aria-label={u.ativa ? 'Desativar unidade' : 'Reativar unidade'}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          u.ativa
                            ? 'text-[#CA2E24] hover:bg-[#FEE2E2]'
                            : 'text-[#02A562] hover:bg-[#DCFCE7]'
                        }`}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[#5E5E5E] text-[13px] mt-4 mb-0">
            {unidadesFiltradas.length} de {unidades.length} unidades listadas
          </p>
        </>
      )}

      {/* Modais */}
      <CriarUnidadeModal
        isOpen={modalCriarAberto}
        onClose={() => setModalCriarAberto(false)}
        onSucesso={handleSucessoCriacao}
      />

      <EditarUnidadeModal
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setUnidadeSelecionada(null);
        }}
        onSucesso={handleSucessoEdicao}
        unidade={unidadeSelecionada}
      />
    </div>
  );
}
