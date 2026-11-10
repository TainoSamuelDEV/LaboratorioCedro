import React from 'react';
import { BRAND_CONFIG } from '../../config/brand';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function BrandLogo({ className = '', size = 'md', showSubtitle = false }: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Símbolo do Laboratório Cedro (Pronto para receber o SVG oficial do Brandbook) */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold shadow-xs flex-shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 stroke-[2.2]">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-semibold tracking-tight text-[var(--text-primary)] ${textSizes[size]}`}>
            {BRAND_CONFIG.assets.logoText}
          </span>
          <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-[var(--brand-primary-light)] text-[var(--brand-primary)]">
            {BRAND_CONFIG.assets.logoBadge}
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 tracking-tight">
            {BRAND_CONFIG.subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
