'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Users, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../services/api-client';
import { unidadeService } from '../../../services/unidade.service';
import { PerfilUsuario, UnidadeDTO, UsuarioDTO } from '../../../types/api';

export default function UsuariosPage() {
  const { ehAdmin } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioDTO[]>([]);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Form
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('COORDENADOR_UNIDADE');
  const [unidadeId, setUnidadeId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      const [listaUsers, listaUnids] = await Promise.all([
        apiClient.get<UsuarioDTO[]>('/api/usuarios'),
        unidadeService.listar(true),
      ]);
      setUsuarios(listaUsers);
      setUnidades(listaUnids);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (perfil === 'COORDENADOR_UNIDADE' && !unidadeId) {
      setErro('Coordenador de Unidade deve estar obrigatoriamente vinculado a uma unidade.');
      return;
    }
    setErro(null);
    setSalvando(true);

    try {
      await apiClient.post('/api/usuarios', {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        perfil,
        unidadeId: perfil === 'COORDENADOR_UNIDADE' ? unidadeId : null,
      });
      setModalAberto(false);
      setNome('');
      setEmail('');
      setSenha('');
      setUnidadeId('');
      await carregarDados();
    } catch (err: any) {
      setErro(err?.message || 'Falha ao cadastrar usuário.');
    } finally {
      setSalvando(false);
    }
  };

  const getPerfilBadge = (p: PerfilUsuario) => {
    switch (p) {
      case 'ADMINISTRADOR':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrador
          </span>
        );
      case 'OPERADOR_OUVIDORIA':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            <UserCheck className="w-3.5 h-3.5" />
            Ouvidoria Geral
          </span>
        );
      case 'COORDENADOR_UNIDADE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            Coordenador de Unidade
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestão de Usuários & Perfis Polimórficos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administração de operadores de ouvidoria, coordenadores e políticas de acesso (RBAC)
          </p>
        </div>

        {ehAdmin && (
          <Button onClick={() => setModalAberto(true)}>
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      <Card>
        {carregando ? (
          <div className="text-center py-8 text-xs text-slate-500">Carregando usuários...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nome do Usuário</th>
                  <th className="py-3 px-4">E-mail Corporativo</th>
                  <th className="py-3 px-4">Perfil Polimórfico</th>
                  <th className="py-3 px-4">Unidade Vinculada</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usuarios.map((u) => {
                  const unidadeInfo = unidades.find((un) => un.id === u.unidadeId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{u.nome}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">{getPerfilBadge(u.perfil)}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {unidadeInfo ? (
                          <span className="font-medium text-slate-800">{unidadeInfo.nome}</span>
                        ) : u.unidadeId ? (
                          <span className="font-mono text-slate-400">{u.unidadeId}</span>
                        ) : (
                          <span className="text-slate-400 italic">Global (Sem restrição)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.ativo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Novo Usuário */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Cadastrar Novo Usuário Interno"
        description="Configure o perfil de acesso e vínculos operacionais"
      >
        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {erro}
          </div>
        )}
        <form onSubmit={handleCriar} className="space-y-4">
          <Input
            label="Nome Completo"
            required
            placeholder="Ex: Dra. Mariana Costa"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            label="E-mail Corporativo"
            type="email"
            required
            placeholder="mariana@cedro.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Senha Inicial"
            type="password"
            required
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Select
            label="Perfil de Acesso (POO)"
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
            options={[
              { value: 'COORDENADOR_UNIDADE', label: 'Coordenador de Unidade (Trata apenas sua unidade)' },
              { value: 'OPERADOR_OUVIDORIA', label: 'Operador de Ouvidoria (Escalona e Conclui)' },
              { value: 'ADMINISTRADOR', label: 'Administrador (Acesso total)' },
            ]}
          />
          {perfil === 'COORDENADOR_UNIDADE' && (
            <Select
              label="Unidade Obrigatória Vinculada"
              required
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
              placeholder="Selecione a unidade responsável..."
              options={unidades.map((u) => ({ value: u.id, label: u.nome }))}
            />
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={salvando}>
              Cadastrar Usuário
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
