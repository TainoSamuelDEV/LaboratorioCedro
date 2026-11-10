export const BRAND_CONFIG = {
  name: 'Laboratório Cedro',
  subtitle: 'Plataforma de Experiência do Cliente & Ouvidoria',
  shortName: 'Cedro CX',
  department: 'Núcleo de Inovação e Tecnologia (NIT)',
  version: '1.0.0-MVP',
  supportEmail: 'nit@laboratoriocedro.com.br',
  website: 'https://labcedro.com.br',

  assets: {
    logoText: 'CEDRO',
    logoBadge: 'INDECX',
  },
} as const;

export const STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: 'nova' | 'warning' | 'info' | 'escalonada' | 'teal' | 'concluida' | 'neutral';
  }
> = {
  NOVA: { label: 'Nova', variant: 'nova' },
  NAO_RESPONDIDA: { label: 'Não Respondida', variant: 'warning' },
  EM_TRATAMENTO: { label: 'Em Tratamento', variant: 'info' },
  ESCALONADA: { label: 'Escalonada', variant: 'escalonada' },
  RESPONDIDA: { label: 'Respondida', variant: 'teal' },
  CONCLUIDA: { label: 'Concluída', variant: 'concluida' },
};

export const PRIORIDADE_LABELS: Record<string, { label: string; color: string }> = {
  BAIXA: { label: 'Baixa', color: 'text-[#5E5E5E]' },
  MEDIA: { label: 'Média', color: 'text-sky-700' },
  ALTA: { label: 'Alta', color: 'text-[#F29222] font-bold' },
  CRITICA: { label: 'Crítica', color: 'text-[#CA2E24] font-bold' },
};

export const NOTA_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#CA2E24', text: '#CA2E24', label: 'Ruim' },
  2: { bg: '#E65100', text: '#E65100', label: 'Abaixo do esperado' },
  3: { bg: '#F29222', text: '#A85F00', label: 'Regular' },
  4: { bg: '#93CBA0', text: '#23823D', label: 'Muito bom' },
  5: { bg: '#02A562', text: '#02A562', label: 'Excelente' },
};
