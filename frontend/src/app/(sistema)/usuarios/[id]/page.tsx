'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Edit, Power, RotateCw, Shield, CheckCircle2, XCircle, Activity, Mail, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { usuarioService } from '../../../../services/usuario.service';
import { unidadeService } from '../../../../services/unidade.service';
import { PerfilUsuario, UnidadeDTO, UsuarioDetalhadoDTO } from '../../../../types/api';
import { DashboardKpiCard } from '../../../../components/dashboard/DashboardKpiCard';
import { UsuarioDetalheSkeleton } from '../../../../components/usuarios/UsuariosSkeleton';
import { EditarUsuarioModal } from '../../../../components/usuarios/EditarUsuarioModal';
import { ErrorView } from '../../../../components/ui/ErrorView';

const PERFIL_CONFIG: Record<PerfilUsuario, { label: string; className: string }> = {
  ADMINISTRADOR: {
    label: 'Administrador Geral',
    className: 'bg-[#ECFDF5] text-[#075618] border border-[#A7F3D0]',
  },
  OPERADOR_OUVIDORIA: {
    label: 'Operador de Ouvidoria',
    className: 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]',
  },
  COORDENADOR_UNIDADE: {
    label: 'Coordenador de Unidade',
    className: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]',
  },
};

export default function DetalheUsuarioPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const { ehAdmin, usuario: usuarioLogado } = useAuth();

  const [usuario, setUsuario] = useState<UsuarioDetalhadoDTO | null>(null);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [atualizando, setAtualizando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState<boolean>(false);

  const carregarDetalhe = useCallback(
    async (isInitial = false) => {
      if (!id) return;
      try {
        if (isInitial) setCarregando(true);
        else setAtualizando(true);
        setErro(null);

        const [dados, listaUnidades] = await Promise.all([
          usuarioService.obterPorId(id),
          unidadeService.listar(false).catch(() => []),
        ]);

        setUsuario(dados);
        setUnidades(listaUnidades);
      } catch (err: unknown) {
        console.error('[DetalheUsuarioPage] Erro ao carregar detalhe do usuário:', err);
        setErro(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os dados cadastrais do usuário solicitado.'
        );
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [id]
  );

  useEffect(() => {
    carregarDetalhe(true);
  }, [carregarDetalhe]);

  const handleAlternarStatus = async () => {
    if (!usuario) return;
    if (usuario.id === usuarioLogado?.id) {
      alert('Você não pode desativar o usuário que está atualmente em uso.');
      return;
    }
    try {
      const novoStatus = !usuario.ativo;
      await usuarioService.alternarStatus(usuario.id, novoStatus);
      await carregarDetalhe(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao alterar status do usuário.');
    }
  };

  if (carregando) {
    return <UsuarioDetalheSkeleton />;
  }

  if (erro || !usuario) {
    return (
      <div>
        <Link
          href="/usuarios"
          className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
        >
          ← Voltar para Usuários
        </Link>
        <ErrorView
          tipo="404"
          titulo="Usuário não encontrado"
          descricao={erro || 'O usuário solicitado não foi localizado ou você não possui permissão para visualizá-lo.'}
          onReset={() => carregarDetalhe(true)}
          embedded
        />
      </div>
    );
  }

  const perfilConfig = PERFIL_CONFIG[usuario.perfil] || {
    label: usuario.perfil,
    className: 'bg-[#F3F3F3] text-[#323232] border border-[#E3E3E3]',
  };

  const iniciais = usuario.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div>
      {/* Voltar */}
      <Link
        href="/usuarios"
        className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
      >
        ← Voltar para Usuários
      </Link>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0 max-w-full">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#075618] text-white text-lg sm:text-xl font-black grid place-items-center shrink-0 shadow-sm">
            {iniciais}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0 break-words">
                {usuario.nome}
              </h1>
              <span
                className={`inline-block py-0.5 px-3 rounded-full text-xs font-bold whitespace-nowrap ${perfilConfig.className}`}
              >
                {perfilConfig.label}
              </span>
              <span
                className={`inline-block py-0.5 px-3 rounded-full text-xs font-bold whitespace-nowrap ${
                  usuario.ativo
                    ? 'bg-[#E6F5EC] text-[#075618] border border-[#A7F3D0]'
                    : 'bg-[#F3F3F3] text-[#767676] border border-[#E3E3E3]'
                }`}
              >
                {usuario.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <p className="text-[#5E5E5E] text-sm sm:text-[15px] mt-1 mb-0 break-words">
              {usuario.email} ·{' '}
              {usuario.unidadeNome
                ? `Coordenador da ${usuario.unidadeNome}`
                : 'Acesso Corporativo Geral'}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 self-start flex-wrap">
          {ehAdmin && (
            <>
              <button
                type="button"
                onClick={() => setModalEditarAberto(true)}
                className="inline-flex items-center gap-1.5 px-3.5 h-11 rounded-lg border border-[#E3E3E3] bg-white text-xs font-bold text-[#323232] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
              >
                <Edit size={15} />
                <span>Editar Dados</span>
              </button>

              {usuario.id !== usuarioLogado?.id && (
                <button
                  type="button"
                  onClick={handleAlternarStatus}
                  title={usuario.ativo ? 'Desativar usuário' : 'Reativar usuário'}
                  className={`inline-flex items-center gap-1.5 px-3.5 h-11 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    usuario.ativo
                      ? 'border-[#FCA5A5] bg-white text-[#CA2E24] hover:bg-[#FEE2E2]'
                      : 'border-[#A7F3D0] bg-white text-[#075618] hover:bg-[#ECFDF5]'
                  }`}
                >
                  <Power size={15} />
                  <span>{usuario.ativo ? 'Desativar' : 'Reativar'}</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => carregarDetalhe(false)}
            disabled={atualizando}
            title="Atualizar dados"
            aria-label="Atualizar dados"
            className="w-11 h-11 inline-grid place-items-center rounded-lg border border-[#E3E3E3] bg-white text-[#5E5E5E] hover:text-[#075618] hover:border-[#075618] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCw
              size={18}
              className={atualizando ? 'animate-spin text-[#075618]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Grid com os 3 KPIs de Auditoria e Atuação */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <DashboardKpiCard
          rotulo="Interações Registradas"
          valor={usuario.auditoria.totalInteracoes}
          descricao="encaminhamentos e notas no histórico"
        />

        <DashboardKpiCard
          rotulo="Respostas da Unidade"
          valor={usuario.auditoria.totalRespostasUnidade}
          descricao="tratativas formais enviadas"
        />

        <DashboardKpiCard
          rotulo="Escalonamentos"
          valor={usuario.auditoria.totalEscalonamentos}
          descricao="acionamentos hierárquicos registrados"
        />
      </div>

      {/* Grid Bento de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Ficha Cadastral */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-[#075618]" />
            <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
              Ficha Cadastral
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
              <span className="text-[#5E5E5E] flex items-center gap-1.5">
                <Mail size={14} /> E-mail
              </span>
              <strong className="text-[#171717]">{usuario.email}</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
              <span className="text-[#5E5E5E] flex items-center gap-1.5">
                <Shield size={14} /> Perfil Institucional
              </span>
              <strong className="text-[#171717]">{perfilConfig.label}</strong>
            </div>

            <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
              <span className="text-[#5E5E5E] flex items-center gap-1.5">
                <Building2 size={14} /> Unidade Vinculada
              </span>
              <strong className="text-[#171717]">
                {usuario.unidadeNome || 'Todas as Unidades (Geral)'}
              </strong>
            </div>

            <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
              <span className="text-[#5E5E5E] flex items-center gap-1.5">
                <Calendar size={14} /> Data de Cadastro
              </span>
              <strong className="text-[#171717]">
                {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
              </strong>
            </div>

            <div className="flex justify-between py-2 border-b border-[#F0F0F0]">
              <span className="text-[#5E5E5E]">ID no Sistema</span>
              <span className="font-mono text-[#767676]">{usuario.id}</span>
            </div>
          </div>
        </div>

        {/* Políticas de Acesso e Permissões POO */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-[#075618]" />
            <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
              Escopo e Permissões (POO / RBAC)
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5">
              <span>Visualizar dados de todas as unidades</span>
              {usuario.perfil !== 'COORDENADOR_UNIDADE' ? (
                <span className="text-[#02A562] flex items-center gap-1 font-bold">
                  <CheckCircle2 size={16} /> Permitido
                </span>
              ) : (
                <span className="text-[#CA2E24] flex items-center gap-1 font-bold">
                  <XCircle size={16} /> Restrito à sua unidade
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span>Responder manifestações pela unidade</span>
              {usuario.perfil === 'COORDENADOR_UNIDADE' ? (
                <span className="text-[#02A562] flex items-center gap-1 font-bold">
                  <CheckCircle2 size={16} /> Permitido
                </span>
              ) : (
                <span className="text-[#CA2E24] flex items-center gap-1 font-bold">
                  <XCircle size={16} /> Apenas Coordenador
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span>Escalonar manifestações por prazo</span>
              {usuario.perfil !== 'COORDENADOR_UNIDADE' ? (
                <span className="text-[#02A562] flex items-center gap-1 font-bold">
                  <CheckCircle2 size={16} /> Permitido
                </span>
              ) : (
                <span className="text-[#CA2E24] flex items-center gap-1 font-bold">
                  <XCircle size={16} /> Apenas Ouvidoria/Admin
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span>Concluir manifestações com feedback</span>
              {usuario.perfil !== 'COORDENADOR_UNIDADE' ? (
                <span className="text-[#02A562] flex items-center gap-1 font-bold">
                  <CheckCircle2 size={16} /> Permitido
                </span>
              ) : (
                <span className="text-[#CA2E24] flex items-center gap-1 font-bold">
                  <XCircle size={16} /> Apenas Ouvidoria/Admin
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span>Gerenciar parâmetros, unidades e usuários</span>
              {usuario.perfil === 'ADMINISTRADOR' ? (
                <span className="text-[#02A562] flex items-center gap-1 font-bold">
                  <CheckCircle2 size={16} /> Acesso Total
                </span>
              ) : (
                <span className="text-[#CA2E24] flex items-center gap-1 font-bold">
                  <XCircle size={16} /> Apenas Administrador
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <EditarUsuarioModal
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        onSucesso={() => carregarDetalhe(false)}
        usuario={usuario}
        unidades={unidades}
      />
    </div>
  );
}
