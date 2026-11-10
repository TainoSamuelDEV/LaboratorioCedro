import React from 'react';
import { BRAND_CONFIG } from '../../config/brand';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  showSubtitle?: boolean;
  showBadge?: boolean;
}

export function BrandLogo({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = false,
  showBadge = false,
}: BrandLogoProps) {
  const heightClasses = {
    sm: 'h-7',
    md: 'h-[34px]',
    lg: 'h-[38px]',
  };

  const logoSrc =
    variant === 'icon' ? BRAND_CONFIG.assets.logoIcon : BRAND_CONFIG.assets.logoCompleta;

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-2.5">
        <img
          src={logoSrc}
          alt={BRAND_CONFIG.name}
          className={`${heightClasses[size]} w-auto block flex-shrink-0`}
        />

        {showBadge && (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#e6f6ef] text-[#075618]">
            {BRAND_CONFIG.assets.logoBadge}
          </span>
        )}
      </div>

      {showSubtitle && (
        <span className="text-[11px] font-medium text-[#5E5E5E] mt-1.5 tracking-tight">
          {BRAND_CONFIG.subtitle}
        </span>
      )}
    </div>
  );
}
