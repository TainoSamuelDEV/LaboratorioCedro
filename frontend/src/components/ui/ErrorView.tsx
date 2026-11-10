'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  ArrowLeft,
  Home,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ServerCrash,
  FileQuestion,
  WifiOff,
  Copy,
  Check,
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from './Button';

export interface ErrorViewProps {
  codigo?: string | number;
  titulo?: string;
  descricao?: string;
  detalhesTecnicos?: string;
  tipo?: '404' | '500' | '403' | 'conexao' | 'generico';
  onReset?: () => void;
  showBack?: boolean;
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export function ErrorView({
  codigo,
  titulo,
  descricao,
  detalhesTecnicos,
  tipo = 'generico',
  onReset,
  showBack = true,
  showHome = true,
  homeHref = '/dashboard',
  className = '',
}: ErrorViewProps) {
  const router = useRouter();
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const presets = {
    '404': {
      codigoPadrao: '404',
      badgeTexto: 'Código 404 • Não Encontrado',
      tituloPadrao: 'Página Não Encontrada',
      descricaoPadrao:
        'O endereço solicitado não existe, foi movido ou a URL digitada possui algum caractere incorreto.',
      icon: FileQuestion,
      badgeColor: 'bg-emerald-50 text-[#075618] border-emerald-200',
    },
    '403': {
      codigoPadrao: '403',
      badgeTexto: 'Código 403 • Acesso Restrito',
      tituloPadrao: 'Acesso Não Autorizado',
      descricaoPadrao:
        'Seu perfil atual de usuário não possui as permissões necessárias para acessar este módulo ou unidade.',
      icon: ShieldAlert,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    '500': {
      codigoPadrao: '500',
      badgeTexto: 'Código 500 • Erro Interno',
      tituloPadrao: 'Falha no Servidor',
      descricaoPadrao:
        'Ocorreu uma instabilidade inesperada ao processar sua solicitação. O incidente foi registrado para auditoria.',
      icon: ServerCrash,
      badgeColor: 'bg-rose-50 text-[#CA2E24] border-rose-300',
    },
    conexao: {
      codigoPadrao: 'ERR_CONEXAO',
      badgeTexto: 'Comunicação • Falha de Conexão',
      tituloPadrao: 'Serviço Temporariamente Indisponível',
      descricaoPadrao:
        'Não foi possível estabelecer contato com a API da Plataforma Cedro. Verifique sua conexão de rede.',
      icon: WifiOff,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    generico: {
      codigoPadrao: 'ERRO',
      badgeTexto: 'Falha Operacional',
      tituloPadrao: 'Ocorreu um Erro no Sistema',
      descricaoPadrao:
        'Não foi possível concluir esta operação. Tente novamente ou retorne à página inicial do sistema.',
      icon: ServerCrash,
      badgeColor: 'bg-[#F3F3F3] text-[#323232] border-[#E3E3E3]',
    },
  };

  const preset = presets[tipo] || presets.generico;
  const codigoExibido = codigo !== undefined ? String(codigo) : preset.codigoPadrao;
  const tituloExibido = titulo || preset.tituloPadrao;
  const descricaoExibida = descricao || preset.descricaoPadrao;
  const IconComponent = preset.icon;

  const copiarDetalhes = () => {
    if (!detalhesTecnicos) return;
    navigator.clipboard.writeText(detalhesTecnicos);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div
      className={`min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-rise ${className}`}
    >
      <div className="w-full max-w-lg bg-white rounded-xl border border-[#E3E3E3] p-8 sm:p-10 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
        {/* Logotipo Oficial Laboratório Cedro */}
        <div className="flex justify-center mb-8">
          <BrandLogo size="lg" showSubtitle className="items-center" />
        </div>

        {/* Ícone de Destaque e Badge do Código */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F3F3F3] border border-[#E3E3E3] flex items-center justify-center text-[#075618]">
            <IconComponent className="w-7 h-7 stroke-[1.8]" />
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${preset.badgeColor}`}
          >
            <span>{codigoExibido}</span>
            <span className="opacity-40">•</span>
            <span>{preset.badgeTexto.split('•')[1]?.trim() || 'Erro'}</span>
          </div>
        </div>

        {/* Título e Descrição */}
        <h1 className="text-2xl sm:text-3xl font-black text-[#075618] tracking-tight">
          {tituloExibido}
        </h1>
        <p className="text-sm text-[#323232] mt-2.5 leading-relaxed max-w-md mx-auto">
          {descricaoExibida}
        </p>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
          {onReset && (
            <Button variant="primary" onClick={onReset} className="w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Tentar Novamente
            </Button>
          )}

          {showBack && (
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar à Página Anterior
            </Button>
          )}

          {showHome && (
            <Link href={homeHref} className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                <Home className="w-4 h-4 mr-1.5" />
                Ir para o Início
              </Button>
            </Link>
          )}
        </div>

        {/* Accordion de Detalhes Técnicos (Opcional) */}
        {detalhesTecnicos && (
          <div className="mt-8 pt-5 border-t border-[#E3E3E3] text-left">
            <button
              type="button"
              onClick={() => setDetalhesAbertos(!detalhesAbertos)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#5E5E5E] hover:text-[#171717] transition-colors py-1 cursor-pointer"
            >
              <span>Detalhes técnicos do erro</span>
              {detalhesAbertos ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {detalhesAbertos && (
              <div className="mt-3 relative rounded-lg bg-[#171717] text-slate-200 p-3.5 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-48">
                <button
                  type="button"
                  onClick={copiarDetalhes}
                  className="absolute top-2.5 right-2.5 p-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                  title="Copiar log"
                >
                  {copiado ? (
                    <Check className="w-3.5 h-3.5 text-[#93CBA0]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <pre className="pr-8 whitespace-pre-wrap break-all">{detalhesTecnicos}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rodapé institucional discreto */}
      <div className="mt-6 text-center text-xs text-[#999999]">
        Plataforma de Experiência do Cliente Laboratório Cedro • Suporte Técnico Interno
      </div>
    </div>
  );
}
