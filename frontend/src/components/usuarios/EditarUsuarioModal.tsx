'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit, Loader2 } from 'lucide-react';
import { PerfilUsuario, UnidadeDTO, UsuarioDTO } from '../../types/api';
import { usuarioService } from '../../services/usuario.service';

interface EditarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSucesso: (atualizado: UsuarioDTO) => void;
  usuario: UsuarioDTO | null;
  unidades: UnidadeDTO[];
}

export function EditarUsuarioModal({
  isOpen,
  onClose,
  onSucesso,
  usuario,
  unidades,
}: EditarUsuarioModalProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('OPERADOR_OUVIDORIA');
  const [unidadeId, setUnidadeId] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setPerfil(usuario.perfil || 'OPERADOR_OUVIDORIA');
      setUnidadeId(usuario.unidadeId || '');
      setSenha('');
      setErro(null);
    }
  }, [usuario]);

  if (!isOpen || !usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('O nome do usuário é obrigatório.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErro('Um e-mail válido é obrigatório.');
      return;
    }
    if (senha.trim() && senha.trim().length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (perfil === 'COORDENADOR_UNIDADE' && !unidadeId) {
      setErro('Coordenador de Unidade deve estar obrigatoriamente vinculado a uma unidade.');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const atualizado = await usuarioService.atualizar(usuario.id, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        perfil,
        unidadeId: perfil === 'COORDENADOR_UNIDADE' ? unidadeId : null,
        senha: senha.trim() ? senha.trim() : undefined,
      });

      onSucesso(atualizado);
      onClose();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha ao atualizar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar Usuário"
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
              Editar Usuário
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
              Nome Completo *
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
              E-mail Institucional *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Redefinir Senha de Acesso (Opcional)
            </label>
            <input
              type="password"
              minLength={6}
              placeholder="Deixe em branco para manter a senha atual"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
              Perfil de Acesso (RBAC) *
            </label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
              className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562] cursor-pointer"
            >
              <option value="OPERADOR_OUVIDORIA">Operador de Ouvidoria</option>
              <option value="COORDENADOR_UNIDADE">Coordenador de Unidade</option>
              <option value="ADMINISTRADOR">Administrador Geral</option>
            </select>
          </div>

          {perfil === 'COORDENADOR_UNIDADE' && (
            <div>
              <label className="block text-xs font-bold text-[#323232] uppercase tracking-wider mb-1">
                Unidade Vinculada *
              </label>
              <select
                required
                value={unidadeId}
                onChange={(e) => setUnidadeId(e.target.value)}
                className="w-full text-sm text-[#171717] bg-white border border-[#E3E3E3] rounded-lg px-3.5 h-11 focus:outline-none focus:border-[#02A562] cursor-pointer"
              >
                <option value="">Selecione a Unidade...</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

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
