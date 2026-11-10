'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { BRAND_CONFIG } from '../../../config/brand';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
  };

  return (
    <div className="w-full max-w-md animate-rise">
      <Card className="p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo size="lg" className="items-center" />
          <h1 className="text-2xl font-black text-[#075618] tracking-tight mt-5">
            Acesso à Plataforma
          </h1>
          <p className="text-xs text-[#5E5E5E] mt-1">
            {BRAND_CONFIG.subtitle}
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs font-bold text-[#CA2E24]">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail Corporativo"
            type="email"
            required
            placeholder="usuario@cedro.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Senha de Acesso"
            type="password"
            required
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <Button type="submit" size="lg" className="w-full mt-2" isLoading={carregando}>
            Entrar no Sistema
          </Button>
        </form>

        {/* Atalhos Rápidos para Testar o Back-end com Diferentes Perfis */}
        <div className="mt-8 pt-5 border-t border-[#E3E3E3]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#999999] mb-2.5 text-center">
            Perfis de Teste Pré-Configurados:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => preencherCredencialTeste('admin@cedro.com.br')}
              className="px-2 py-1.5 text-xs font-bold rounded-full border border-[#02A562] text-[#02A562] hover:bg-[#02A562] hover:text-white transition-all text-center cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => preencherCredencialTeste('ouvidoria@cedro.com.br')}
              className="px-2 py-1.5 text-xs font-bold rounded-full border border-[#02A562] text-[#02A562] hover:bg-[#02A562] hover:text-white transition-all text-center cursor-pointer"
            >
              Ouvidoria
            </button>
            <button
              type="button"
              onClick={() => preencherCredencialTeste('coord.sul@cedro.com.br')}
              className="px-2 py-1.5 text-xs font-bold rounded-full border border-[#02A562] text-[#02A562] hover:bg-[#02A562] hover:text-white transition-all text-center cursor-pointer"
            >
              Coord. Sul
            </button>
          </div>
          <div className="text-[11px] text-[#999999] text-center mt-2.5">
            Senha padrão: <span className="font-mono font-bold text-[#323232]">cedro123</span>
          </div>
        </div>
      </Card>

      <div className="text-center mt-4 text-xs text-[#999999]">
        {BRAND_CONFIG.name} — {BRAND_CONFIG.department}
      </div>
    </div>
  );
}
