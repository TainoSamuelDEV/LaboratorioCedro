'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Edit, Power, RotateCw } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { usuarioService } from '../../../services/usuario.service';
import { unidadeService } from '../../../services/unidade.service';
import { PerfilUsuario, UnidadeDTO, UsuarioDTO } from '../../../types/api';
import { CriarUsuarioModal } from '../../../components/usuarios/CriarUsuarioModal';
import { EditarUsuarioModal } from '../../../components/usuarios/EditarUsuarioModal';
import { UsuariosSkeleton } from '../../../components/usuarios/UsuariosSkeleton';
import { ErrorView } from '../../../components/ui/ErrorView';

type FiltroStatus = 'todos' | 'ativos' | 'inativos';

const PERFIL_CONFIG: Record<PerfilUsuario, { label: string; className: string }> = {
  ADMINISTRADOR: {
    label: 'Administrador',
    className: 'bg-[#ECFDF5] text-[#075618] border border-[#A7F3D0]',
  },
  OPERADOR_OUVIDORIA: {
    label: 'Ouvidoria',
    className: 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]',
  },
  COORDENADOR_UNIDADE: {
    label: 'Coordenador',
    className: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]',
  },
};

export default function UsuariosPage() {
  const { ehAdmin, usuario: usuarioLogado } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState<string>('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');

  // Modais
  const [modalCriarAberto, setModalCriarAberto] = useState<boolean>(false);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioDTO | null>(null);

  const carregarDados = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setCarregando(true);
      else setAtualizando(true);
      setErro(null);

      const [listaUsuarios, listaUnidades] = await Promise.all([
        usuarioService.listar(),
        unidadeService.listar(false).catch(() => []),
      ]);

      setUsuarios(listaUsuarios);
      setUnidades(listaUnidades);
    } catch (err: unknown) {
      console.error('[UsuariosPage] Erro ao carregar usuários:', err);
      setErro(
        err instanceof Error ? err.message : 'Não foi possível carregar a lista de usuários.'
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados(true);
  }, [carregarDados]);

  const mapaUnidades = useMemo(() => {
    return new Map(unidades.map((u) => [u.id, u.nome]));
  }, [unidades]);

  const totalAtivos = useMemo(() => usuarios.filter((u) => u.ativo).length, [usuarios]);
  const totalInativos = useMemo(() => usuarios.filter((u) => !u.ativo).length, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroStatus === 'ativos' && !u.ativo) return false;
      if (filtroStatus === 'inativos' && u.ativo) return false;
      if (filtroPerfil && u.perfil !== filtroPerfil) return false;

      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nomeMatch = u.nome.toLowerCase().includes(termo);
        const emailMatch = u.email.toLowerCase().includes(termo);
        if (!nomeMatch && !emailMatch) return false;
      }

      return true;
    });
  }, [usuarios, filtroStatus, filtroPerfil, busca]);

  const handleAlternarStatus = async (u: UsuarioDTO) => {
    if (u.id === usuarioLogado?.id) {
      alert('Você não pode desativar seu próprio usuário logado.');
      return;
    }
    try {
      const novoAtivo = !u.ativo;
      await usuarioService.alternarStatus(u.id, novoAtivo);
      setUsuarios((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, ativo: novoAtivo } : item))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao alternar status do usuário.');
    }
  };

  const handleEditar = (u: UsuarioDTO) => {
    setUsuarioSelecionado(u);
    setModalEditarAberto(true);
  };

  const handleSucessoCriacao = (novo: UsuarioDTO) => {
    setUsuarios((prev) => [novo, ...prev]);
  };

  const handleSucessoEdicao = (atualizado: UsuarioDTO) => {
    setUsuarios((prev) =>
      prev.map((item) => (item.id === atualizado.id ? atualizado : item))
    );
  };

  if (erro) {
    return (
      <ErrorView
        tipo="conexao"
        titulo="Erro ao carregar usuários"
        descricao={erro}
        onReset={() => carregarDados(true)}
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
            Usuários
          </h1>
          <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-0">
            Gestão de acessos internos e vínculo de coordenadores por unidade.
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:self-start">
          {ehAdmin && (
            <button
              type="button"
              onClick={() => setModalCriarAberto(true)}
              className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 px-4 h-11 rounded-lg bg-[#075618] hover:bg-[#054012] text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={16} />
              <span>Novo Usuário</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => carregarDados(false)}
            disabled={atualizando}
            title="Atualizar lista"
            aria-label="Atualizar lista"
            className="w-11 h-11 shrink-0 inline-grid place-items-center rounded-lg border border-[#E3E3E3] bg-white text-[#5E5E5E] hover:text-[#075618] hover:border-[#075618] transition-colors disabled:opacity-50 cursor-pointer"
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
          onClick={() => setFiltroStatus('todos')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            filtroStatus === 'todos'
              ? 'bg-[#02A562] text-white border-[#02A562] shadow-sm'
              : 'bg-white text-[#02A562] border-[#02A562] hover:bg-[#02A562] hover:text-white'
          }`}
        >
          Todos ({usuarios.length})
        </button>

        <button
          type="button"
          onClick={() => setFiltroStatus('ativos')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            filtroStatus === 'ativos'
              ? 'bg-[#075618] text-white border-[#075618] shadow-sm'
              : 'bg-white text-[#075618] border-[#075618] hover:bg-[#075618] hover:text-white'
          }`}
        >
          Ativos ({totalAtivos})
        </button>

        <button
          type="button"
          onClick={() => setFiltroStatus('inativos')}
          className={`h-9 px-4 rounded-full text-xs font-bold uppercase tracking-[0.02em] transition-all cursor-pointer border ${
            filtroStatus === 'inativos'
              ? 'bg-[#5E5E5E] text-white border-[#5E5E5E] shadow-sm'
              : 'bg-white text-[#5E5E5E] border-[#5E5E5E] hover:bg-[#5E5E5E] hover:text-white'
          }`}
        >
          Inativos ({totalInativos})
        </button>
      </div>

      {/* Filtros: Busca e Perfil */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full sm:flex-1 relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none"
          />
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail..."
            aria-label="Buscar usuário"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg pl-10 pr-3.5 h-11 placeholder:text-[#999] focus:outline-none focus:border-[#02A562]"
          />
        </div>

        <select
          value={filtroPerfil}
          onChange={(e) => setFiltroPerfil(e.target.value)}
          aria-label="Filtrar por perfil"
          className="w-full sm:w-auto text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 cursor-pointer focus:outline-none focus:border-[#02A562]"
        >
          <option value="">Todos os perfis</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="OPERADOR_OUVIDORIA">Operador de Ouvidoria</option>
          <option value="COORDENADOR_UNIDADE">Coordenador de Unidade</option>
        </select>
      </div>

      {/* Conteúdo da Tabela */}
      {carregando ? (
        <UsuariosSkeleton />
      ) : usuariosFiltrados.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E3E3E3] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F3F3F3] text-[#5E5E5E] grid place-items-center mx-auto mb-3">
            <Users size={20} />
          </div>
          <h3 className="text-base font-bold text-[#171717] m-0 mb-1">
            Nenhum usuário encontrado
          </h3>
          <p className="text-xs text-[#5E5E5E] max-w-sm mx-auto mb-4">
            {busca || filtroPerfil || filtroStatus !== 'todos'
              ? 'Nenhum resultado corresponde aos filtros selecionados.'
              : 'Nenhum usuário cadastrado no sistema.'}
          </p>
        </div>
      ) : (
        <>
          {/* Visão em Cards para Mobile (< 768px) */}
          <div className="md:hidden space-y-3">
            {usuariosFiltrados.map((u) => {
              const perfilConfig = PERFIL_CONFIG[u.perfil] || {
                label: u.perfil,
                className: 'bg-[#F3F3F3] text-[#323232] border border-[#E3E3E3]',
              };
              const iniciais = u.nome
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0].toUpperCase())
                .join('');
              const nomeUnidade = u.unidadeId ? mapaUnidades.get(u.unidadeId) : 'Geral (Todas)';

              return (
                <div
                  key={u.id}
                  className="bg-white rounded-2xl border border-[#E3E3E3] p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#075618] text-white text-xs font-black grid place-items-center shrink-0">
                        {iniciais}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/usuarios/${u.id}`}
                          className="font-bold text-[#171717] hover:text-[#075618] hover:underline block leading-snug truncate"
                        >
                          {u.nome}
                        </Link>
                        <span className="text-xs text-[#5E5E5E] block truncate">{u.email}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-block py-0.5 px-2.5 rounded-full text-[11px] font-bold shrink-0 ${
                        u.ativo
                          ? 'bg-[#E6F5EC] text-[#075618]'
                          : 'bg-[#F3F3F3] text-[#767676]'
                      }`}
                    >
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-block py-0.5 px-2.5 rounded-full font-bold whitespace-nowrap ${perfilConfig.className}`}
                    >
                      {perfilConfig.label}
                    </span>
                    <span className="text-[#5E5E5E] truncate">{nomeUnidade}</span>
                  </div>

                  <div className="pt-2.5 border-t border-[#F0F0F0] flex items-center justify-between gap-2">
                    <Link
                      href={`/usuarios/${u.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#E6F5EC] text-[#075618] text-xs font-bold hover:bg-[#D1EEDB] transition-colors"
                    >
                      Ver Ficha
                    </Link>

                    {ehAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditar(u)}
                          title="Editar usuário"
                          aria-label="Editar usuário"
                          className="p-2 rounded-lg text-[#5E5E5E] hover:text-[#075618] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>

                        {u.id !== usuarioLogado?.id && (
                          <button
                            type="button"
                            onClick={() => handleAlternarStatus(u)}
                            title={u.ativo ? 'Desativar usuário' : 'Reativar usuário'}
                            aria-label={u.ativo ? 'Desativar usuário' : 'Reativar usuário'}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              u.ativo
                                ? 'text-[#CA2E24] hover:bg-[#FEE2E2]'
                                : 'text-[#02A562] hover:bg-[#DCFCE7]'
                            }`}
                          >
                            <Power size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <p className="text-[#5E5E5E] text-[13px] pt-1 mb-0">
              {usuariosFiltrados.length} de {usuarios.length} usuários listados
            </p>
          </div>

          {/* Tabela para Tablet/Desktop (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E3E3E3] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E3E3E3] text-[11px] uppercase tracking-[0.06em] text-[#5E5E5E] font-bold bg-[#FAFAFA]">
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4">Unidade Vinculada</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => {
                  const perfilConfig = PERFIL_CONFIG[u.perfil] || {
                    label: u.perfil,
                    className: 'bg-[#F3F3F3] text-[#323232] border border-[#E3E3E3]',
                  };

                  const iniciais = u.nome
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join('');

                  const nomeUnidade = u.unidadeId ? mapaUnidades.get(u.unidadeId) : 'Geral (Todas)';

                  return (
                    <tr
                      key={u.id}
                      className="border-t border-[#EEE] hover:bg-[#FAFAFA] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#075618] text-white text-xs font-black grid place-items-center shrink-0">
                            {iniciais}
                          </div>
                          <div>
                            <Link
                              href={`/usuarios/${u.id}`}
                              className="font-bold text-[#171717] hover:text-[#075618] hover:underline block leading-snug"
                            >
                              {u.nome}
                            </Link>
                            <span className="text-xs text-[#5E5E5E]">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block py-0.5 px-2.5 rounded-full text-xs font-bold whitespace-nowrap ${perfilConfig.className}`}
                        >
                          {perfilConfig.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs text-[#323232] font-medium">
                        {nomeUnidade}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block py-0.5 px-2.5 rounded-full text-[11px] font-bold ${
                            u.ativo
                              ? 'bg-[#E6F5EC] text-[#075618]'
                              : 'bg-[#F3F3F3] text-[#767676]'
                          }`}
                        >
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/usuarios/${u.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-[#E6F5EC] text-[#075618] text-xs font-bold hover:bg-[#D1EEDB] transition-colors"
                          >
                            Ver Ficha
                          </Link>

                          {ehAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEditar(u)}
                                title="Editar usuário"
                                aria-label="Editar usuário"
                                className="p-1.5 rounded-lg text-[#5E5E5E] hover:text-[#075618] hover:bg-[#F3F3F3] transition-colors cursor-pointer"
                              >
                                <Edit size={16} />
                              </button>

                              {u.id !== usuarioLogado?.id && (
                                <button
                                  type="button"
                                  onClick={() => handleAlternarStatus(u)}
                                  title={u.ativo ? 'Desativar usuário' : 'Reativar usuário'}
                                  aria-label={u.ativo ? 'Desativar usuário' : 'Reativar usuário'}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    u.ativo
                                      ? 'text-[#CA2E24] hover:bg-[#FEE2E2]'
                                      : 'text-[#02A562] hover:bg-[#DCFCE7]'
                                  }`}
                                >
                                  <Power size={16} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-[#EEE] bg-[#FAFAFA] text-xs text-[#5E5E5E]">
            {usuariosFiltrados.length} de {usuarios.length} usuários listados
          </div>
        </div>
        </>
      )}

      {/* Modais */}
      <CriarUsuarioModal
        isOpen={modalCriarAberto}
        onClose={() => setModalCriarAberto(false)}
        onSucesso={handleSucessoCriacao}
        unidades={unidades}
      />

      <EditarUsuarioModal
        isOpen={modalEditarAberto}
        onClose={() => {
          setModalEditarAberto(false);
          setUsuarioSelecionado(null);
        }}
        onSucesso={handleSucessoEdicao}
        usuario={usuarioSelecionado}
        unidades={unidades}
      />
    </div>
  );
}
