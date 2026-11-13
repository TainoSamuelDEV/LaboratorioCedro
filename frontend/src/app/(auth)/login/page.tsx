'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../../components/ui/Drawer';
import { useAuth } from '../../../contexts/AuthContext';
import { BRAND_CONFIG } from '../../../config/brand';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [recuperarDrawerOpen, setRecuperarDrawerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      await login(email, senha);
      router.push('/dashboard');
    } catch (err: any) {
      setErro(err?.message || 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  const preencherCredencialTeste = (emailTeste: string) => {
    setEmail(emailTeste);
    setSenha('cedro123');
    setErro(null);
  };

  return (
    <div
      className="animate-rise"
      style={{ '--tone': '#02A562', '--tone-x': '#075618' } as React.CSSProperties}
    >
      {/* Cabeçalho com a Logo Oficial (mesmo padrão da avaliação e telas de erro) */}
      <header className="mb-12">
        <img
          src="/logo-cedro-completa.svg"
          alt="Laboratório Cedro"
          className="cedro-eval-logo"
        />
      </header>

      <p className="cedro-eval-unit">Laboratório Cedro — Experiência & Ouvidoria</p>

      <h1 className="cedro-eval-h1 !text-[clamp(2rem,4.5vw,2.75rem)] !mb-8">
        Acesse sua conta.
      </h1>

      {erro && (
        <p className="mb-6 text-sm font-bold text-[#CA2E24]" role="alert">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="cedro-label-q">
            E-mail corporativo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nome@cedro.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="cedro-ticket-input !max-w-none"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2.5">
            <label htmlFor="password" className="cedro-label-q !mb-0">
              Senha
            </label>
            <button
              type="button"
              onClick={() => setRecuperarDrawerOpen(true)}
              className="cedro-btn-quiet !p-0 !text-xs !font-semibold !text-[#5E5E5E] hover:!text-[#075618]"
            >
              Esqueceu a senha?
            </button>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="cedro-ticket-input !max-w-none"
          />
        </div>

        <div className="cedro-actions !mt-8">
          <button
            type="submit"
            disabled={carregando || !email || !senha}
            className="cedro-btn-send"
          >
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>

      {/* Perfis de Acesso Rápido */}
      <div className="mt-10 pt-6 border-t border-[#E3E3E3]">
        <p className="cedro-hint !mt-0 mb-3 text-xs">
          Acesso rápido para homologação (senha <span className="font-mono font-bold text-[#171717]">cedro123</span>):
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => preencherCredencialTeste('admin@cedro.com.br')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#171717] border border-[#E3E3E3] transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#02A562]" />
            Administrador
          </button>
          <button
            type="button"
            onClick={() => preencherCredencialTeste('ouvidoria@cedro.com.br')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#171717] border border-[#E3E3E3] transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#18534F]" />
            Ouvidoria
          </button>
          <button
            type="button"
            onClick={() => preencherCredencialTeste('unidade@cedro.com.br')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#171717] border border-[#E3E3E3] transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2994A]" />
            Unidade (Cohama)
          </button>
        </div>
      </div>

      {/* Drawer de Recuperação de Senha */}
      <Drawer open={recuperarDrawerOpen} onOpenChange={setRecuperarDrawerOpen} direction="bottom">
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Recuperação de Acesso</DrawerTitle>
            <DrawerDescription>
              Instruções para redefinição de credenciais na Plataforma de Experiência do Cliente
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-3 text-xs text-[#323232]">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#e6f6ef] border border-[#93CBA0] text-[#075618]">
              <KeyRound className="size-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Credenciais de Homologação</div>
                <p className="mt-1 text-[#255521]">
                  Os perfis de demonstração utilizam a senha padrão{' '}
                  <span className="font-mono font-bold">cedro123</span>.
                </p>
              </div>
            </div>
            <p className="text-[#5E5E5E]">
              Em caso de perda de acesso corporativo, contate o suporte técnico interno em{' '}
              <span className="font-bold text-[#171717]">{BRAND_CONFIG.supportEmail}</span>.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose>Fechar</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
