import React from 'react';
import { STATUS_LABELS } from '../../config/brand';
import { PrioridadeManifestacao, StatusManifestacao } from '../../types/api';

export type BadgeVariant =
  | 'neutral'
  | 'nova'
  | 'warning'
  | 'info'
  | 'purple'
  | 'escalonada'
  | 'teal'
  | 'success'
  | 'concluida'
  | 'danger';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-[#F3F3F3] text-[#323232] border-[#E3E3E3]',
  nova: 'bg-emerald-50 text-[#075618] border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
  escalonada: 'bg-rose-50 text-[#CA2E24] border-rose-300 font-bold animate-pulse',
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
  success: 'bg-emerald-50 text-[#075618] border-emerald-200',
  concluida: 'bg-[#255521] text-white border-[#255521]',
  danger: 'bg-rose-50 text-[#CA2E24] border-rose-300 font-bold',
};

const dotStyles: Record<BadgeVariant, string> = {
  neutral: 'bg-[#5E5E5E]',
  nova: 'bg-[#02A562]',
  warning: 'bg-[#F29222]',
  info: 'bg-sky-500',
  purple: 'bg-purple-500',
  escalonada: 'bg-[#CA2E24]',
  teal: 'bg-[#008F66]',
  success: 'bg-[#02A562]',
  concluida: 'bg-[#93CBA0]',
  danger: 'bg-[#CA2E24]',
};

export function Badge({ children, variant = 'neutral', className = '', dot = true }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-normal border ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: StatusManifestacao }) {
  const info = STATUS_LABELS[status] || { label: status, variant: 'neutral' as BadgeVariant };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeManifestacao }) {
  const configs: Record<
    PrioridadeManifestacao,
    { label: string; variant: BadgeVariant }
  > = {
    BAIXA: { label: 'Baixa', variant: 'neutral' },
    MEDIA: { label: 'Média', variant: 'info' },
    ALTA: { label: 'Alta', variant: 'warning' },
    CRITICA: { label: 'Crítica', variant: 'danger' },
  };

  const conf = configs[prioridade] || { label: prioridade, variant: 'neutral' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}
