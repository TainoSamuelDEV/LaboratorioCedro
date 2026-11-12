'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, Filter, RotateCw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { pesquisaService } from '../../../services/pesquisa.service';
import { unidadeService } from '../../../services/unidade.service';
import { PesquisaDTO, UnidadeDTO } from '../../../types/api';
import { PesquisaCard } from '../../../components/pesquisas/PesquisaCard';
import { PesquisasSkeleton } from '../../../components/pesquisas/PesquisasSkeleton';
import { CriarPesquisaModal } from '../../../components/pesquisas/CriarPesquisaModal';
import { EditarPesquisaModal } from '../../../components/pesquisas/EditarPesquisaModal';
import { QrCodePdfModal } from '../../../components/pesquisas/QrCodePdfModal';
import { ErrorView } from '../../../components/ui/ErrorView';

type FiltroStatus = 'todas' | 'ativas' | 'inativas';

export default function PesquisasPage() {
  const { ehAdmin } = useAuth();

  const [pesquisas, setPesquisas] = useState<PesquisaDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todas');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('');

  // Modais
  const [modalCriarAberto, setModalCriarAberto] = useState<boolean>(false);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);
  const [modalQrCodeAberto, setModalQrCodeAberto] = useState<boolean>(false);
  const [pesquisaSelecionada, setPesquisaSelecionada] = useState<PesquisaDTO | null>(null);

  const carregarDados = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setCarregando(true);
      else setAtualizando(true);
      setErro(null);

      const [listaPesquisas, listaUnidades] = await Promise.all([
        pesquisaService.listar(false),
        unidadeService.listar(false).catch(() => []),
      ]);

      setPesquisas(listaPesquisas);
      setUnidades(listaUnidades);
    } catch (err: unknown) {
      console.error('[PesquisasPage] Erro ao carregar pesquisas:', err);
      setErro(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a lista de pesquisas de satisfação.'
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados(true);
  }, [carregarDados]);

  // Mapa de unidades por ID
  const mapaUnidades = useMemo(() => {
    return new Map(unidades.map((u) => [u.id, u]));
  }, [unidades]);

  // Contadores
  const totalAtivas = useMemo(() => pesquisas.filter((p) => p.ativa).length, [pesquisas]);
  const totalInativas = useMemo(() => pesquisas.filter((p) => !p.ativa).length, [pesquisas]);

  // Pesquisas filtradas
  const pesquisasFiltradas = useMemo(() => {
    return pesquisas.filter((p) => {
      // Filtro de Status
      if (filtroStatus === 'ativas' && !p.ativa) return false;
      if (filtroStatus === 'inativas' && p.ativa) return false;

      // Filtro de Unidade
      if (filtroUnidade && p.unidadePadraoId !== filtroUnidade) return false;

      // Filtro de Busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const tituloMatch = p.titulo.toLowerCase().includes(termo);
        const descMatch = (p.descricao || '').toLowerCase().includes(termo);
        const unidadeNome = p.unidadePadraoId
          ? (mapaUnidades.get(p.unidadePadraoId)?.nome || '').toLowerCase()
          : 'todas as unidades';
        const unidadeMatch = unidadeNome.includes(termo);
        if (!tituloMatch && !descMatch && !unidadeMatch) return false;
      }

      return true;
    });
  }, [pesquisas, filtroStatus, filtroUnidade, busca, mapaUnidades]);

  // Handlers dos Modais
  const handleAbrirQrCode = (p: PesquisaDTO) => {
    setPesquisaSelecionada(p);
    setModalQrCodeAberto(true);
  };

  const handleEditar = (p: PesquisaDTO) => {
    setPesquisaSelecionada(p);
    setModalEditarAberto(true);
  };

  const handleAlternarStatus = async (p: PesquisaDTO) => {
    try {
      const novaAtiva = !p.ativa;
      await pesquisaService.alternarStatus(p.id, novaAtiva);
      setPesquisas((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, ativa: novaAtiva } : item))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao alternar status da pesquisa.');
    }
  };

  const handleSucessoCriacao = (nova: PesquisaDTO) => {
    setPesquisas((prev) => [nova, ...prev]);
  };

  const handleSucessoEdicao = (atualizada: PesquisaDTO) => {
    setPesquisas((prev) =>
      prev.map((item) => (item.id === atualizada.id ? atualizada : item))
    );
  };

  if (erro) {
    return (
      <ErrorView
        tipo="conexao"
        titulo="Erro ao carregar pesquisas"
        descricao={erro}
        onReset={() => carregarDados(true)}
        embedded
      />
    );
  }

  return (
    <div>
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
            Pesquisas
          </h1>
          <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-0">
            Gestão de pesquisas de satisfação e links de QR Code por unidade.
          </p>
        </div>

        {/* Ações do Topo: Botão de Criação e Atualizar */}
        <div className="flex items-center gap-2 self-start">
          {ehAdmin && (
            <button
              type="button"
              onClick={() => setModalCriarAberto(true)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-[#075618] hover:bg-[#054012] text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Nova Pesquisa</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => carregarDados(false)}
            disabled={atualizando}
            title="Atualizar lista"
            aria-label="Atualizar lista"
            className="w-11 h-11 inline-grid place-items-center rounded-lg border-[1.5px] border-[#E3E3E3] bg-white text-[#5E5E5E] hover:text-[#075618] hover:border-[#075618] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw
              size={18}
              className={atualizando ? 'animate-spin text-[#075618]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Abas com Contadores (.tabs do modelo de referência) */}
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
          Todas ({pesquisas.length})
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

      {/* Barra de Filtros: Busca e Unidade */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[240px] relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none"
          />
          <input
            type="search"
            placeholder="Buscar por título, descrição ou unidade..."
            aria-label="Buscar pesquisa"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg pl-10 pr-3.5 h-11 placeholder:text-[#999] focus:outline-none focus:border-[#02A562]"
          />
        </div>

        {unidades.length > 0 && (
          <select
            value={filtroUnidade}
            onChange={(e) => setFiltroUnidade(e.target.value)}
            aria-label="Filtrar por unidade vinculada"
            className="text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 cursor-pointer focus:outline-none focus:border-[#02A562]"
          >
            <option value="">Todas as Unidades</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Conteúdo: Skeleton, Grid ou Estado Vazio */}
      {carregando ? (
        <PesquisasSkeleton />
      ) : pesquisasFiltradas.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E3E3E3] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F3F3F3] text-[#5E5E5E] grid place-items-center mx-auto mb-3">
            <Filter size={20} />
          </div>
          <h3 className="text-base font-bold text-[#171717] m-0 mb-1">
            Nenhuma pesquisa encontrada
          </h3>
          <p className="text-xs text-[#5E5E5E] max-w-sm mx-auto mb-4">
            {busca || filtroUnidade || filtroStatus !== 'todas'
              ? 'Nenhum resultado corresponde aos filtros selecionados. Tente ajustar os termos da busca.'
              : 'Nenhuma pesquisa de satisfação cadastrada até o momento.'}
          </p>
          {ehAdmin && !busca && filtroStatus === 'todas' && (
            <button
              type="button"
              onClick={() => setModalCriarAberto(true)}
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-[#075618] text-white text-xs font-bold hover:bg-[#054012] transition-colors"
            >
              <Plus size={15} />
              <span>Criar Primeira Pesquisa</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pesquisasFiltradas.map((pesquisa) => (
              <PesquisaCard
                key={pesquisa.id}
                pesquisa={pesquisa}
                unidade={pesquisa.unidadePadraoId ? mapaUnidades.get(pesquisa.unidadePadraoId) : null}
                onAbrirQrCode={handleAbrirQrCode}
                onEditar={handleEditar}
                onAlternarStatus={handleAlternarStatus}
                podeEditar={ehAdmin}
              />
            ))}
          </div>

          <p className="text-[#5E5E5E] text-[13px] mt-4 mb-0">
            {pesquisasFiltradas.length} de {pesquisas.length} pesquisas listadas
          </p>
        </>
      )}

      {/* Modal de Display e QR Code em PDF */}
      <QrCodePdfModal
        isOpen={modalQrCodeAberto}
        onClose={() => {
          setModalQrCodeAberto(false);
          setPesquisaSelecionada(null);
        }}
        pesquisa={pesquisaSelecionada}
        nomeUnidade={
          pesquisaSelecionada?.unidadePadraoId
            ? mapaUnidades.get(pesquisaSelecionada.unidadePadraoId)?.nome
            : undefined
        }
      />

      {/* Modal de Criação de Pesquisa */}
      <CriarPesquisaModal
        isOpen={modalCriarAberto}
        onClose={() => setModalCriarAberto(false)}
        onSucesso={handleSucessoCriacao}
        unidades={unidades}
      />

      {/* Modal de Edição de Pesquisa */}
      <EditarPesquisaModal
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setPesquisaSelecionada(null);
        }}
        onSucesso={handleSucessoEdicao}
        pesquisa={pesquisaSelecionada}
        unidades={unidades}
      />
    </div>
  );
}
