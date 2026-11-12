'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { manifestacaoService } from '../../../services/manifestacao.service';
import { ManifestacaoDTO } from '../../../types/api';
import { ManifestacoesTable } from '../../../components/manifestacoes/ManifestacoesTable';
import { ManifestacoesTableSkeleton } from '../../../components/manifestacoes/ManifestacoesTableSkeleton';
import { ErrorView } from '../../../components/ui/ErrorView';

type CategoriaPendencia = 'nao_respondidas' | 'atrasadas' | 'escalonadas';

export default function PendenciasPage() {
  const { usuario, ehCoordenador } = useAuth();

  const [manifestacoes, setManifestacoes] = useState<ManifestacaoDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<CategoriaPendencia>('nao_respondidas');

  const carregarPendencias = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const dados = await manifestacaoService.listar({
        pendente: true,
        unidadeId: ehCoordenador ? usuario?.unidadeId || undefined : undefined,
      });
      setManifestacoes(dados);
    } catch (err: unknown) {
      console.error('[Pendências] Erro ao carregar pendências:', err);
      setErro(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as pendências operacionais.'
      );
    } finally {
      setCarregando(false);
    }
  }, [ehCoordenador, usuario?.unidadeId]);

  useEffect(() => {
    carregarPendencias();
  }, [carregarPendencias]);

  // Função auxiliar para verificar se a pendência está atrasada (> 48h ou prazo estourado)
  const isAtrasada = useCallback((m: ManifestacaoDTO): boolean => {
    if (m.status === 'CONCLUIDA' || m.status === 'RESPONDIDA') return false;

    // Se possui prazoResposta específico e a data atual ultrapassou
    if (m.prazoResposta) {
      const dataPrazo = new Date(m.prazoResposta).getTime();
      if (!isNaN(dataPrazo) && Date.now() > dataPrazo) {
        return true;
      }
    }

    // Regra institucional Cedro: SLA padrão de 48 horas a partir da abertura
    const dataCriacao = new Date(m.criadoEm).getTime();
    const diffHoras = (Date.now() - dataCriacao) / (1000 * 60 * 60);
    return diffHoras > 48;
  }, []);

  // Grupos filtrados
  const grupoNaoRespondidas = useMemo(
    () => manifestacoes.filter((m) => m.status === 'NAO_RESPONDIDA' || m.status === 'NOVA'),
    [manifestacoes]
  );

  const grupoAtrasadas = useMemo(
    () => manifestacoes.filter((m) => isAtrasada(m)),
    [manifestacoes, isAtrasada]
  );

  const grupoEscalonadas = useMemo(
    () => manifestacoes.filter((m) => m.status === 'ESCALONADA'),
    [manifestacoes]
  );

  const listaExibida = useMemo(() => {
    switch (abaAtiva) {
      case 'atrasadas':
        return grupoAtrasadas;
      case 'escalonadas':
        return grupoEscalonadas;
      case 'nao_respondidas':
      default:
        return grupoNaoRespondidas;
    }
  }, [abaAtiva, grupoNaoRespondidas, grupoAtrasadas, grupoEscalonadas]);

  if (erro) {
    return (
      <ErrorView
        tipo="conexao"
        titulo="Falha ao carregar pendências"
        descricao={erro}
        onReset={() => carregarPendencias()}
        embedded
      />
    );
  }

  return (
    <div>
      {/* Cabeçalho */}
      <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
        Pendências
      </h1>
      <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-6">
        O que precisa de ação agora. O prazo padrão de resposta institucional é de 48 horas.
      </p>

      {/* Abas com Contadores (.tabs do modelo de referência) */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          type="button"
          onClick={() => setAbaAtiva('nao_respondidas')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            abaAtiva === 'nao_respondidas'
              ? 'bg-[#02A562] text-white border-[#02A562] shadow-sm'
              : 'bg-white text-[#02A562] border-[#02A562] hover:bg-[#02A562] hover:text-white'
          }`}
        >
          Não respondidas ({grupoNaoRespondidas.length})
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('atrasadas')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            abaAtiva === 'atrasadas'
              ? 'bg-[#CA2E24] text-white border-[#CA2E24] shadow-sm'
              : 'bg-white text-[#CA2E24] border-[#CA2E24] hover:bg-[#CA2E24] hover:text-white'
          }`}
        >
          Atrasadas ({grupoAtrasadas.length})
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva('escalonadas')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            abaAtiva === 'escalonadas'
              ? 'bg-[#E65100] text-white border-[#E65100] shadow-sm'
              : 'bg-white text-[#E65100] border-[#E65100] hover:bg-[#E65100] hover:text-white'
          }`}
        >
          Escalonadas ({grupoEscalonadas.length})
        </button>
      </div>

      {/* Tabela de Pendências */}
      {carregando ? (
        <ManifestacoesTableSkeleton />
      ) : (
        <>
          <ManifestacoesTable
            manifestacoes={listaExibida}
            mensagemVazia={
              abaAtiva === 'atrasadas'
                ? 'Nenhuma manifestação em atraso. SLA operacional 100% em dia.'
                : abaAtiva === 'escalonadas'
                ? 'Nenhuma manifestação escalonada no momento.'
                : 'Nenhuma pendência aguardando resposta.'
            }
          />
          <p className="text-[#5E5E5E] text-[13px] mt-4 mb-0">
            {listaExibida.length} pendências listadas
          </p>
        </>
      )}
    </div>
  );
}
