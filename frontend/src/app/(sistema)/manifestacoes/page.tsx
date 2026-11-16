'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { manifestacaoService } from '../../../services/manifestacao.service';
import { unidadeService } from '../../../services/unidade.service';
import { ManifestacaoDTO, UnidadeDTO, StatusManifestacao } from '../../../types/api';
import { ManifestacoesTable } from '../../../components/manifestacoes/ManifestacoesTable';
import { ManifestacoesTableSkeleton } from '../../../components/manifestacoes/ManifestacoesTableSkeleton';
import { ErrorView } from '../../../components/ui/ErrorView';

export default function ManifestacoesPage() {
  const { usuario, ehCoordenador } = useAuth();

  const [manifestacoes, setManifestacoes] = useState<ManifestacaoDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros em memória (busca instantânea sem debounce pesado)
  const [busca, setBusca] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('');
  const [filtroNota, setFiltroNota] = useState<string>('');

  // Carrega unidades para mapeamento
  useEffect(() => {
    unidadeService
      .listar(true)
      .then((dados) => setUnidades(dados))
      .catch((err) => console.warn('[Manifestações] Aviso ao listar unidades:', err));
  }, []);

  // Busca dados da API
  const carregarManifestacoes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const unidadeIdEfetiva = ehCoordenador ? usuario?.unidadeId || undefined : filtroUnidade || undefined;
      const dados = await manifestacaoService.listar({
        unidadeId: unidadeIdEfetiva,
      });
      setManifestacoes(dados);
    } catch (err: unknown) {
      console.error('[Manifestações] Erro ao carregar manifestações:', err);
      setErro(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a lista de manifestações.'
      );
    } finally {
      setCarregando(false);
    }
  }, [ehCoordenador, usuario?.unidadeId, filtroUnidade]);

  useEffect(() => {
    carregarManifestacoes();
  }, [carregarManifestacoes]);

  // Filtragem no cliente (rápida e suave)
  const manifestacoesFiltradas = useMemo(() => {
    return manifestacoes.filter((m) => {
      // Busca textual por protocolo, senha ou comentário
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const texto = `${m.protocolo} ${m.clienteAtendimento || ''} ${
          m.comentarioCliente || ''
        }`.toLowerCase();
        if (!texto.includes(termo)) return false;
      }

      // Filtro de status
      if (filtroStatus && m.status !== filtroStatus) {
        return false;
      }

      // Filtro de nota
      if (filtroNota && m.nota !== Number(filtroNota)) {
        return false;
      }

      return true;
    });
  }, [manifestacoes, busca, filtroStatus, filtroNota]);

  const unidadeAtual = unidades.find(
    (u) => u.id === (ehCoordenador ? usuario?.unidadeId : filtroUnidade)
  );
  const nomeUnidade = unidadeAtual?.nome || (ehCoordenador ? 'sua unidade' : 'todas as unidades');

  if (erro) {
    return (
      <ErrorView
        tipo="conexao"
        titulo="Falha ao carregar manifestações"
        descricao={erro}
        onReset={() => carregarManifestacoes()}
        embedded
      />
    );
  }

  return (
    <div>
      {/* Cabeçalho */}
      <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
        Manifestações
      </h1>
      <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-6">
        {ehCoordenador
          ? `Todas as respostas recebidas da unidade ${nomeUnidade}. Filtre por nota ou status.`
          : 'Todas as respostas recebidas. Filtre por unidade, nota ou status.'}
      </p>

      {/* Barra de Filtros (.fl do modelo de referência) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 mb-4">
        {/* Busca por texto */}
        <input
          type="search"
          placeholder="Buscar por protocolo, senha ou texto"
          aria-label="Buscar"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="sm:col-span-2 lg:flex-1 lg:min-w-[240px] w-full text-sm text-[#171717] bg-white border-[1.5px] border-[#E3E3E3] rounded-lg px-3 h-[44px] placeholder:text-[#999] focus:outline-none focus:border-[#02A562]"
        />

        {/* Filtro de Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          aria-label="Filtrar por status"
          className="w-full lg:w-auto text-sm text-[#171717] bg-white border-[1.5px] border-[#E3E3E3] rounded-lg px-3 h-[44px] cursor-pointer focus:outline-none focus:border-[#02A562]"
        >
          <option value="">Todos os status</option>
          <option value="NOVA">Nova</option>
          <option value="NAO_RESPONDIDA">Não respondida</option>
          <option value="EM_TRATAMENTO">Em tratamento</option>
          <option value="ESCALONADA">Escalonada</option>
          <option value="RESPONDIDA">Respondida</option>
          <option value="CONCLUIDA">Concluída</option>
        </select>

        {/* Filtro de Unidade (apenas para Admin e Ouvidoria) */}
        {!ehCoordenador && (
          <select
            value={filtroUnidade}
            onChange={(e) => setFiltroUnidade(e.target.value)}
            aria-label="Filtrar por unidade"
            className="w-full lg:w-auto text-sm text-[#171717] bg-white border-[1.5px] border-[#E3E3E3] rounded-lg px-3 h-[44px] cursor-pointer focus:outline-none focus:border-[#02A562]"
          >
            <option value="">Todas as unidades</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        )}

        {/* Filtro de Nota */}
        <select
          value={filtroNota}
          onChange={(e) => setFiltroNota(e.target.value)}
          aria-label="Filtrar por nota"
          className="w-full lg:w-auto text-sm text-[#171717] bg-white border-[1.5px] border-[#E3E3E3] rounded-lg px-3 h-[44px] cursor-pointer focus:outline-none focus:border-[#02A562]"
        >
          <option value="">Todas as notas</option>
          <option value="5">Nota 5</option>
          <option value="4">Nota 4</option>
          <option value="3">Nota 3</option>
          <option value="2">Nota 2</option>
          <option value="1">Nota 1</option>
        </select>
      </div>

      {/* Conteúdo da Tabela */}
      {carregando ? (
        <ManifestacoesTableSkeleton />
      ) : (
        <>
          <ManifestacoesTable manifestacoes={manifestacoesFiltradas} />
          <p className="text-[#5E5E5E] text-[13px] mt-4 mb-0">
            {manifestacoesFiltradas.length} de {manifestacoes.length} manifestações
          </p>
        </>
      )}
    </div>
  );
}
