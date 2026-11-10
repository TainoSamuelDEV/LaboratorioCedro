'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Building2, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/auth.service';
import { PerfilUsuario } from '../../../types/api';
import { BRAND_CONFIG } from '../../../config/brand';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('COORDENADOR_UNIDADE');
  const [unidadeId, setUnidadeId] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [unidades, setUnidades] = useState<{ id: string; nome: string }[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    authService
      .listarUnidadesPublicas()
      .then((lista) => {
        setUnidades(lista || []);
        if (lista && lista.length > 0) {
          setUnidadeId(lista[0].id);
        }
      })
      .catch(() => {
        setUnidades([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('A confirmação de senha não confere com a senha informada.');
      return;
    }

    if (perfil === 'COORDENADOR_UNIDADE' && !unidadeId) {
      setErro('Selecione a unidade de atendimento para o perfil de Coordenador.');
      return;
    }

    setCarregando(true);
    try {
      await signup({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        perfil,
        unidadeId: perfil === 'COORDENADOR_UNIDADE' ? unidadeId : undefined,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setErro(err?.message || 'Não foi possível criar sua conta.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-4xl animate-rise">
      {/* Card Split (Padrão shadcn/ui signup-04) */}
      <div className="overflow-hidden rounded-2xl border border-[#E3E3E3] bg-white shadow-cedro-card p-0">
        <div className="grid p-0 md:grid-cols-2">
          {/* Coluna Esquerda: Formulário de Cadastro */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-4">
            <div className="flex flex-col items-center text-center gap-1">
              <img
                src="/logo-cedro-completa.svg"
                alt="Laboratório Cedro"
                className="h-8 w-auto mb-1.5"
              />
              <h1 className="text-2xl font-black text-[#075618] tracking-tight">
                Crie sua conta
              </h1>
              <p className="text-balance text-xs sm:text-sm text-[#5E5E5E]">
                Preencha seus dados corporativos para acessar a Plataforma INDECX
              </p>
            </div>

            {erro && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-bold text-[#CA2E24]">
                {erro}
              </div>
            )}

            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-[#171717]">
                Nome Completo *
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Ex.: Dra. Ana Clara Mendes"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3.5 py-2 text-sm text-[#323232] placeholder:text-[#999999] focus:outline-none focus:border-[#02A562] focus:ring-2 focus:ring-[#02A562]/20 transition-all"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-[#171717]">
                E-mail Corporativo *
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="voce@cedro.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3.5 py-2 text-sm text-[#323232] placeholder:text-[#999999] focus:outline-none focus:border-[#02A562] focus:ring-2 focus:ring-[#02A562]/20 transition-all"
              />
              <p className="text-[11px] text-[#5E5E5E]">
                Usaremos este e-mail para notificações de SLA e tratativas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label htmlFor="perfil" className="text-xs font-bold text-[#171717]">
                  Perfil Operacional *
                </label>
                <select
                  id="perfil"
                  value={perfil}
                  onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
                  className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3 py-2 text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#02A562]"
                >
                  <option value="COORDENADOR_UNIDADE">Coordenador de Unidade</option>
                  <option value="OPERADOR_OUVIDORIA">Operador de Ouvidoria</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              {perfil === 'COORDENADOR_UNIDADE' && (
                <div className="grid gap-1.5">
                  <label htmlFor="unidade" className="text-xs font-bold text-[#171717]">
                    Unidade Vinculada *
                  </label>
                  <select
                    id="unidade"
                    required
                    value={unidadeId}
                    onChange={(e) => setUnidadeId(e.target.value)}
                    className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3 py-2 text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#02A562]"
                  >
                    {unidades.length === 0 ? (
                      <option value="">Carregando unidades...</option>
                    ) : (
                      unidades.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Grid dupla de Senha e Confirmação (padrão signup-04) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label htmlFor="password" className="text-xs font-bold text-[#171717]">
                  Senha *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3.5 py-2 text-sm text-[#323232] placeholder:text-[#999999] focus:outline-none focus:border-[#02A562] focus:ring-2 focus:ring-[#02A562]/20 transition-all"
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="confirm-password" className="text-xs font-bold text-[#171717]">
                  Confirmar Senha *
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3.5 py-2 text-sm text-[#323232] placeholder:text-[#999999] focus:outline-none focus:border-[#02A562] focus:ring-2 focus:ring-[#02A562]/20 transition-all"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#5E5E5E] -mt-2">
              A senha deve conter no mínimo 6 caracteres.
            </p>

            <Button type="submit" size="lg" className="w-full mt-1" isLoading={carregando}>
              Criar Conta
            </Button>

            <div className="text-center text-xs text-[#5E5E5E] pt-1">
              Já possui uma conta?{' '}
              <Link
                href="/login"
                className="font-bold text-[#075618] underline underline-offset-4 hover:text-[#02A562]"
              >
                Entrar
              </Link>
            </div>
          </form>

          {/* Coluna Direita: Painel Institucional (signup-04) */}
          <div className="relative hidden bg-[#075618] md:flex flex-col justify-between p-8 text-white overflow-hidden">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#02A562]/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 size-72 rounded-full bg-[#79DDA9]/15 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-xs border border-white/15">
                <img src="/logo-cedro.svg" alt="Cedro" className="size-5" />
                <span className="text-xs font-bold tracking-wide">
                  {BRAND_CONFIG.name} • Governança RBAC
                </span>
              </div>
            </div>

            <div className="relative z-10 space-y-5 my-auto py-6">
              <h2 className="text-2xl font-black leading-tight tracking-tight text-white">
                Perfis de Acesso Estruturados por Competência.
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                A arquitetura orientada a objetos da Plataforma INDECX garante permissões granulares para cada papel operacional do laboratório.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#79DDA9]">
                    <Building2 className="size-3.5" />
                    <span>Coordenador de Unidade</span>
                  </div>
                  <p className="text-[11px] text-white/80 mt-1">
                    Visualiza indicadores da própria unidade e registra respostas técnicas nas manifestações atribuídas.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#79DDA9]">
                    <Users className="size-3.5" />
                    <span>Operador de Ouvidoria</span>
                  </div>
                  <p className="text-[11px] text-white/80 mt-1">
                    Acompanha todas as unidades, solicita complementos, escalona atrasos e conclui protocolos com parecer final.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#79DDA9]">
                    <ShieldCheck className="size-3.5" />
                    <span>Administrador</span>
                  </div>
                  <p className="text-[11px] text-white/80 mt-1">
                    Gerencia unidades, prazos de SLA, pesquisas CSAT, usuários e relatórios consolidados.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-white/60 border-t border-white/15 pt-4">
              <span>{BRAND_CONFIG.department}</span>
              <span className="font-mono">{BRAND_CONFIG.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé de Governança (padrão signup-04) */}
      <div className="text-balance text-center text-xs text-[#5E5E5E]">
        Ao criar sua conta, você concorda com as Diretrizes de Governança e Política de Privacidade (LGPD) do{' '}
        <span className="font-bold text-[#171717]">{BRAND_CONFIG.name}</span>.
      </div>
    </div>
  );
}
