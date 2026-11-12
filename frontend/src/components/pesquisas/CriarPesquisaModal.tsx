'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { CanalPesquisa, PesquisaDTO, UnidadeDTO } from '../../types/api';
import { pesquisaService } from '../../services/pesquisa.service';

interface CriarPesquisaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSucesso: (nova: PesquisaDTO) => void;
  unidades: UnidadeDTO[];
}

export function CriarPesquisaModal({
  isOpen,
  onClose,
  onSucesso,
  unidades,
}: CriarPesquisaModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [periodo, setPeriodo] = useState('Novembro/2026');
  const [canal, setCanal] = useState<CanalPesquisa>('QR_CODE');
  const [unidadePadraoId, setUnidadePadraoId] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro('O título da pesquisa é obrigatório.');
      return;
    }
    if (!periodo.trim()) {
      setErro('O período da pesquisa é obrigatório.');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const nova = await pesquisaService.criar({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        periodo: periodo.trim(),
        canal,
        unidadePadraoId: unidadePadraoId || null,
      });

      // Limpar formulário
      setTitulo('');
      setDescricao('');
      setPeriodo('Novembro/2026');
      setCanal('QR_CODE');
      setUnidadePadraoId('');

      onSucesso(nova);
      onClose();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha ao cadastrar a pesquisa.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cadastrar Nova Pesquisa"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden my-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E6F5EC] text-[#075618] grid place-items-center">
              <Plus size={18} />
            </div>
            <h2 className="text-base font-black text-[#075618] m-0">
              Nova Pesquisa de Satisfação
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg grid place-items-center text-[#5E5E5E] hover:text-[#171717] hover:bg-[#F3F3F3] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-semibold">
              {erro}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Título da Pesquisa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Como foi sua experiência no Laboratório Cedro?"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562]"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Descrição / Instruções aos Pacientes
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Avalie nosso atendimento desde a recepção até a coleta..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg p-3 focus:outline-none focus:border-[#02A562]"
            />
          </div>

          {/* Linha dupla: Período e Canal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
                Período *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Novembro/2026 ou Contínuo"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
                Canal Principal *
              </label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value as CanalPesquisa)}
                className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562] cursor-pointer"
              >
                <option value="QR_CODE">QR Code (Balcão / Impresso)</option>
                <option value="LINK">Link Web Direto</option>
                <option value="TOTEM">Totem de Autoatendimento</option>
                <option value="WHATSAPP">WhatsApp Pós-Exame</option>
                <option value="EMAIL">E-mail</option>
              </select>
            </div>
          </div>

          {/* Unidade Padrão */}
          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Unidade Padrão (Opcional)
            </label>
            <select
              value={unidadePadraoId}
              onChange={(e) => setUnidadePadraoId(e.target.value)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562] cursor-pointer"
            >
              <option value="">Todas as Unidades (Pesquisa Global)</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#5E5E5E] mt-1 m-0">
              Se você vincular a uma unidade específica, o display e QR Code já serão gerados automaticamente com o nome dela.
            </p>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3E3E3]">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 h-10 rounded-lg border border-[#E3E3E3] bg-white text-xs font-bold text-[#323232] hover:bg-[#F7F7F7] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-1.5 px-5 h-10 rounded-lg bg-[#075618] hover:bg-[#054012] text-white text-xs font-black shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {salvando ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Criar Pesquisa</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
