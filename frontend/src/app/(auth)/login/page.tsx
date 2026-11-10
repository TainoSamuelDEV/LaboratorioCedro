'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, Activity, KeyRound } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
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
      setErro(err?.message || 'Falha ao autenticar.');
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
    <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-3xl animate-rise">
      {/* Card Split (Padrão shadcn/ui login-04) */}
      <div className="overflow-hidden rounded-2xl border border-[#E3E3E3] bg-white shadow-cedro-card p-0">
        <div className="grid p-0 md:grid-cols-2">
          {/* Coluna Esquerda: Formulário de Login */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-1.5">
              <img
                src="/logo-cedro-completa.svg"
                alt="Laboratório Cedro"
                className="h-8 w-auto mb-2"
              />
              <h1 className="text-2xl font-black text-[#075618] tracking-tight">
                Bem-vindo de volta
              </h1>
              <p className="text-balance text-xs sm:text-sm text-[#5E5E5E]">
                Acesse sua conta corporativa da Plataforma INDECX
              </p>
            </div>

            {erro && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-bold text-[#CA2E24]">
                {erro}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="email" className="text-xs font-bold text-[#171717]">
                  E-mail Corporativo
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="usuario@cedro.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3.5 py-2.5 text-sm text-[#323232] placeholder:text-[#999999] focus:outline-none focus:border-[#02A562] focus:ring-2 focus:ring-[#02A562]/20 transition-all"
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-[#171717]">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setRecuperarDrawerOpen(true)}
                    className="text-xs font-medium text-[#5E5E5E] underline-offset-2 hover:underline hover:text-[#075618] cursor-pointer"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded-lg border border-[#E3E3E3] bg-white px-3.5 py-2.5 text-sm text-[#323232] placeholder:text-[#999999] focus:outline-none focus:border-[#02A562] focus:ring-2 focus:ring-[#02A562]/20 transition-all"
                />
              </div>

              <Button type="submit" size="lg" className="w-full mt-1" isLoading={carregando}>
                Entrar
              </Button>
            </div>

            {/* Separador estilo login-04 */}
            <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[#E3E3E3]">
              <span className="relative z-10 bg-white px-2 text-[11px] font-bold uppercase tracking-wider text-[#999999]">
                Acesso Rápido (Demo)
              </span>
            </div>

            {/* Botões de Perfis de Teste */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => preencherCredencialTeste('admin@cedro.com.br')}
                className="px-2 py-2 text-xs font-bold rounded-lg border border-[#E3E3E3] text-[#171717] hover:border-[#02A562] hover:bg-[#e6f6ef]/60 hover:text-[#075618] transition-all text-center cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => preencherCredencialTeste('ouvidoria@cedro.com.br')}
                className="px-2 py-2 text-xs font-bold rounded-lg border border-[#E3E3E3] text-[#171717] hover:border-[#02A562] hover:bg-[#e6f6ef]/60 hover:text-[#075618] transition-all text-center cursor-pointer"
              >
                Ouvidoria
              </button>
              <button
                type="button"
                onClick={() => preencherCredencialTeste('coord.sul@cedro.com.br')}
                className="px-2 py-2 text-xs font-bold rounded-lg border border-[#E3E3E3] text-[#171717] hover:border-[#02A562] hover:bg-[#e6f6ef]/60 hover:text-[#075618] transition-all text-center cursor-pointer"
              >
                Coord. Sul
              </button>
            </div>

            <div className="text-center text-xs text-[#5E5E5E]">
              Não tem uma conta?{' '}
              <Link
                href="/cadastro"
                className="font-bold text-[#075618] underline underline-offset-4 hover:text-[#02A562]"
              >
                Cadastre-se
              </Link>
            </div>
          </form>

          {/* Coluna Direita: Painel Visual Institucional (login-04) */}
          <div className="relative hidden bg-[#075618] md:flex flex-col justify-between p-8 text-white overflow-hidden">
            {/* Elementos orgânicos da marca ao fundo */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#02A562]/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 size-72 rounded-full bg-[#79DDA9]/15 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-xs border border-white/15">
                <img src="/logo-cedro.svg" alt="Cedro" className="size-5" />
                <span className="text-xs font-bold tracking-wide">
                  {BRAND_CONFIG.name} • {BRAND_CONFIG.assets.logoBadge}
                </span>
              </div>
            </div>

            <div className="relative z-10 space-y-5 my-auto py-6">
              <h2 className="text-2xl font-black leading-tight tracking-tight text-white">
                Gestão de Experiência do Paciente e Ouvidoria Ativa.
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Cada avaliação recebida nas unidades do Laboratório Cedro é monitorada em tempo real com abertura automática de protocolo e controle de SLA.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 shrink-0">
                    <Activity className="size-3.5 text-[#79DDA9]" />
                  </div>
                  <span>Escala CSAT (1 a 5) integrada por QR Code e Totem</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 shrink-0">
                    <Clock className="size-3.5 text-[#79DDA9]" />
                  </div>
                  <span>Cálculo automático de SLA por severidade da nota</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/90">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 shrink-0">
                    <ShieldCheck className="size-3.5 text-[#79DDA9]" />
                  </div>
                  <span>Isolamento RBAC por Unidade e Ouvidoria Central</span>
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

      {/* Rodapé de Governança (padrão login-04) */}
      <div className="text-balance text-center text-xs text-[#5E5E5E]">
        Ao continuar, você concorda com as Diretrizes de Governança e Política de Privacidade (LGPD) do{' '}
        <span className="font-bold text-[#171717]">{BRAND_CONFIG.name}</span>.
      </div>

      {/* Drawer de Recuperação de Senha */}
      <Drawer open={recuperarDrawerOpen} onOpenChange={setRecuperarDrawerOpen} direction="bottom">
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader>
            <DrawerTitle>Recuperação de Acesso Corporativo</DrawerTitle>
            <DrawerDescription>
              Instruções para redefinição de credenciais na Plataforma INDECX
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-3 text-xs text-[#323232]">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#e6f6ef] border border-[#93CBA0] text-[#075618]">
              <KeyRound className="size-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Ambiente de Demonstração & Homologação</div>
                <p className="mt-1 text-[#255521]">
                  Todas as contas de demonstração utilizam a senha padrão{' '}
                  <span className="font-mono font-bold">cedro123</span>. Você também pode criar uma nova conta em{' '}
                  <Link href="/cadastro" className="underline font-bold">
                    Cadastre-se
                  </Link>
                  .
                </p>
              </div>
            </div>
            <p className="text-[#5E5E5E]">
              Para redefinir a senha de um usuário existente em produção, solicite ao Administrador do sistema ou entre em contato com{' '}
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
