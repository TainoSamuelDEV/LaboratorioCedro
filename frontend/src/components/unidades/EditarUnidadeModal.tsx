'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit, Loader2 } from 'lucide-react';
import { UnidadeDTO } from '../../types/api';
import { unidadeService } from '../../services/unidade.service';

interface EditarUnidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSucesso: (atualizada: UnidadeDTO) => void;
  unidade: UnidadeDTO | null;
}

export function EditarUnidadeModal({
  isOpen,
  onClose,
  onSucesso,
  unidade,
}: EditarUnidadeModalProps) {
  const [nome, setNome] = useState('');
  const [responsavelNome, setResponsavelNome] = useState('');
  const [prazoPadraoHoras, setPrazoPadraoHoras] = useState<number>(48);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (unidade) {
      setNome(unidade.nome || '');
      setResponsavelNome(unidade.responsavelNome || '');
      setPrazoPadraoHoras(unidade.prazoPadraoHoras || 48);
      setErro(null);
    }
  }, [unidade]);

  if (!isOpen || !unidade) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('O nome da unidade é obrigatório.');
      return;
    }
    if (prazoPadraoHoras <= 0) {
      setErro('O prazo padrão deve ser maior que zero horas.');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const atualizada = await unidadeService.atualizar(unidade.id, {
        nome: nome.trim(),
        responsavelNome: responsavelNome.trim() || undefined,
        prazoPadraoHoras,
      });

      onSucesso(atualizada);
      onClose();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha ao atualizar a unidade.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar Unidade de Atendimento"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E3E3E3] overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E6F5EC] text-[#075618] grid place-items-center">
              <Edit size={18} />
            </div>
            <h2 className="text-base font-black text-[#075618] m-0">
              Editar Unidade
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-semibold">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Nome da Unidade *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Responsável Técnico / Médico
            </label>
            <input
              type="text"
              value={responsavelNome}
              onChange={(e) => setResponsavelNome(e.target.value)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Prazo Padrão de SLA (Horas) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={prazoPadraoHoras}
              onChange={(e) => setPrazoPadraoHoras(Number(e.target.value))}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562]"
            />
          </div>

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
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
