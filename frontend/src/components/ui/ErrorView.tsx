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

  // Configurações padrão por tipo de erro
  const presets = {
    '404': {
      codigoPadrao: '404',
      badgeTexto: 'Código 404 • Não Encontrado',
      tituloPadrao: 'Página Não Encontrada',
      descricaoPadrao:
        'O endereço solicitado não existe, foi movido ou a URL digitada possui algum caractere incorreto.',
      icon: FileQuestion,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/80',
    },
    '403': {
      codigoPadrao: '403',
      badgeTexto: 'Código 403 • Acesso Restrito',
      tituloPadrao: 'Acesso Não Autorizado',
      descricaoPadrao:
        'Seu perfil atual de usuário não possui as permissões necessárias para acessar este módulo ou unidade.',
      icon: ShieldAlert,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/70',
    },
    '500': {
      codigoPadrao: '500',
      badgeTexto: 'Código 500 • Erro Interno',
      tituloPadrao: 'Falha no Servidor',
      descricaoPadrao:
        'Ocorreu uma instabilidade inesperada ao processar sua solicitação. O incidente foi registrado para auditoria.',
      icon: ServerCrash,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/70',
    },
    conexao: {
      codigoPadrao: 'ERR_CONEXAO',
      badgeTexto: 'Comunicação • Falha de Conexão',
      tituloPadrao: 'Serviço Temporariamente Indisponível',
      descricaoPadrao:
        'Não foi possível estabelecer contato com a API da Plataforma Cedro. Verifique sua conexão de rede.',
      icon: WifiOff,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
    },
    generico: {
      codigoPadrao: 'ERRO',
      badgeTexto: 'Falha Operacional',
      tituloPadrao: 'Ocorreu um Erro no Sistema',
      descricaoPadrao:
        'Não foi possível concluir esta operação. Tente novamente ou retorne à página inicial do sistema.',
      icon: ServerCrash,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/80',
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
      className={`min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-fade-in ${className}`}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Marca d'água sutil decorativa de fundo */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-slate-50 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Logo da Empresa (Área modular pronta para o Brandbook oficial) */}
        <div className="flex justify-center mb-8">
          <BrandLogo size="lg" showSubtitle />
        </div>

        {/* Ícone de Destaque e Badge do Código */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-slate-700 shadow-2xs">
            <IconComponent className="w-7 h-7 stroke-[1.8]" />
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${preset.badgeColor}`}
          >
            <span>{codigoExibido}</span>
            <span className="opacity-40">•</span>
            <span>{preset.badgeTexto.split('•')[1]?.trim() || 'Erro'}</span>
          </div>
        </div>

        {/* Título e Descrição */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {tituloExibido}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed max-w-md mx-auto">
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
          <div className="mt-8 pt-5 border-t border-slate-100 text-left">
            <button
              type="button"
              onClick={() => setDetalhesAbertos(!detalhesAbertos)}
              className="w-full flex items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
            >
              <span>Detalhes técnicos do erro</span>
              {detalhesAbertos ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {detalhesAbertos && (
              <div className="mt-3 relative rounded-lg bg-slate-900 text-slate-200 p-3.5 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-48">
                <button
                  type="button"
                  onClick={copiarDetalhes}
                  className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Copiar log"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="pr-8 whitespace-pre-wrap break-all">{detalhesTecnicos}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rodapé institucional discreto */}
      <div className="mt-6 text-center text-[11px] text-slate-400">
        Plataforma de Experiência do Cliente Cedro / NIT • Suporte Técnico Interno
      </div>
    </div>
  );
}
