import React from 'react';
import { STATUS_LABELS } from '../../config/brand';
import { PrioridadeManifestacao, StatusManifestacao } from '../../types/api';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'neutral' | 'warning' | 'info' | 'purple' | 'teal' | 'success' | 'danger';
  className?: string;
  dot?: boolean;
}

const variantStyles = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/70',
  info: 'bg-sky-50 text-sky-800 border-sky-200/70',
  purple: 'bg-purple-50 text-purple-800 border-purple-200/70',
  teal: 'bg-teal-50 text-teal-800 border-teal-200/70',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
  danger: 'bg-rose-50 text-rose-800 border-rose-200/70',
};

const dotStyles = {
  neutral: 'bg-slate-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
};

export function Badge({ children, variant = 'neutral', className = '', dot = true }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: StatusManifestacao }) {
  const info = STATUS_LABELS[status] || { label: status, variant: 'neutral' };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeManifestacao }) {
  const configs: Record<PrioridadeManifestacao, { label: string; variant: 'neutral' | 'info' | 'warning' | 'danger' }> = {
    BAIXA: { label: 'Baixa', variant: 'neutral' },
    MEDIA: { label: 'Média', variant: 'info' },
    ALTA: { label: 'Alta', variant: 'warning' },
    CRITICA: { label: 'Crítica', variant: 'danger' },
  };

  const conf = configs[prioridade] || { label: prioridade, variant: 'neutral' };
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}
