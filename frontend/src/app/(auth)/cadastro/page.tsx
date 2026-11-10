'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/auth.service';
import { PerfilUsuario } from '../../../types/api';

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
      setErro('A confirmação de senha não confere.');
      return;
    }

    if (perfil === 'COORDENADOR_UNIDADE' && !unidadeId) {
      setErro('Selecione a unidade de atendimento vinculada.');
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
    <div
      className="animate-rise"
      style={{ '--tone': '#02A562', '--tone-x': '#075618' } as React.CSSProperties}
    >
      <header className="mb-10">
        <img
          src="/logo-cedro-completa.svg"
          alt="Laboratório Cedro"
          className="cedro-eval-logo"
        />
      </header>

      <p className="cedro-eval-unit">Laboratório Cedro — Experiência & Ouvidoria</p>

      <h1 className="cedro-eval-h1 !text-[clamp(2rem,4.5vw,2.6rem)]">
        Crie sua conta.
      </h1>

      <p className="cedro-eval-lead !mb-7">
        Preencha seus dados corporativos para acessar o painel de experiência e ouvidoria.
      </p>

      {erro && (
        <p className="mb-5 text-sm font-bold text-[#CA2E24]" role="alert">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="cedro-label-q">
            Nome completo *
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="Ex.: Dra. Ana Clara Mendes"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="cedro-ticket-input !max-w-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="cedro-label-q">
            E-mail corporativo *
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="nome@cedro.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cedro-ticket-input !max-w-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="perfil" className="cedro-label-q">
              Perfil *
            </label>
            <select
              id="perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
              className="cedro-unit-select !max-w-none !py-[14px]"
            >
              <option value="COORDENADOR_UNIDADE">Coordenador de Unidade</option>
              <option value="OPERADOR_OUVIDORIA">Operador de Ouvidoria</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          {perfil === 'COORDENADOR_UNIDADE' && (
            <div>
              <label htmlFor="unidade" className="cedro-label-q">
                Unidade *
              </label>
              <select
                id="unidade"
                required
                value={unidadeId}
                onChange={(e) => setUnidadeId(e.target.value)}
                className="cedro-unit-select !max-w-none !py-[14px]"
              >
                {unidades.length === 0 ? (
                  <option value="">Carregando…</option>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="password" className="cedro-label-q">
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
              className="cedro-ticket-input !max-w-none"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="cedro-label-q">
              Confirmar senha *
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="cedro-ticket-input !max-w-none"
            />
          </div>
        </div>
        <p className="cedro-hint !mt-1">Mínimo de 6 caracteres.</p>

        <div className="cedro-actions !mt-7">
          <button
            type="submit"
            disabled={carregando || !nome || !email || !senha || !confirmarSenha}
            className="cedro-btn-send"
          >
            {carregando ? 'Criando conta…' : 'Criar conta'}
          </button>

          <Link href="/login" className="cedro-btn-quiet">
            Já tenho conta
          </Link>
        </div>
      </form>
    </div>
  );
}
