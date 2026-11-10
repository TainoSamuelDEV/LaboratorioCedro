export const BRAND_CONFIG = {
  name: 'Laboratório Cedro',
  subtitle: 'Plataforma de Experiência do Cliente & Ouvidoria',
  shortName: 'Cedro CX',
  department: 'Núcleo de Inovação e Tecnologia (NIT)',
  version: '1.0.0-MVP',
  supportEmail: 'nit@laboratoriocedro.com.br',
  
  // Customizações visuais preparadas para receber o Brandbook
  assets: {
    logoText: 'CEDRO',
    logoBadge: 'NIT',
  },
} as const;

export const STATUS_LABELS: Record<string, { label: string; variant: 'neutral' | 'warning' | 'info' | 'purple' | 'teal' | 'success' }> = {
  NOVA: { label: 'Nova', variant: 'neutral' },
  NAO_RESPONDIDA: { label: 'Não Respondida', variant: 'warning' },
  EM_TRATAMENTO: { label: 'Em Tratamento', variant: 'info' },
  ESCALONADA: { label: 'Escalonada', variant: 'purple' },
  RESPONDIDA: { label: 'Respondida', variant: 'teal' },
  CONCLUIDA: { label: 'Concluída', variant: 'success' },
};

export const PRIORIDADE_LABELS: Record<string, { label: string; color: string }> = {
  BAIXA: { label: 'Baixa', color: 'text-zinc-500' },
  MEDIA: { label: 'Média', color: 'text-blue-600' },
  ALTA: { label: 'Alta', color: 'text-amber-600 font-semibold' },
  CRITICA: { label: 'Crítica', color: 'text-rose-600 font-bold' },
};
