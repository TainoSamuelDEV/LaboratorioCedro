import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold uppercase tracking-wide rounded-[10px] transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 min-h-[34px]',
    md: 'text-xs sm:text-sm px-5 py-2.5 gap-2 min-h-[40px]',
    lg: 'text-sm px-6 py-3 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[#02A562] text-white hover:bg-[#23823D] focus:ring-[#02A562]/40 shadow-sm hover:-translate-y-[1px] active:translate-y-0',
    secondary:
      'bg-[#075618] text-white hover:bg-[#255521] focus:ring-[#075618]/40 shadow-sm hover:-translate-y-[1px] active:translate-y-0',
    outline:
      'bg-white text-[#02A562] border border-[#02A562] hover:bg-[#02A562] hover:text-white focus:ring-[#02A562]/30 shadow-2xs',
    pill:
      'border border-[#02A562] text-[#02A562] hover:bg-[#02A562] hover:text-white rounded-full px-5 py-2 text-xs font-bold',
    danger:
      'bg-[#CA2E24] text-white hover:bg-[#A8221A] focus:ring-[#CA2E24]/40 shadow-sm hover:-translate-y-[1px] active:translate-y-0',
    ghost:
      'text-[#323232] hover:bg-[#E3E3E3]/60 hover:text-[#171717] focus:ring-[#E3E3E3] normal-case font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        isLoading ? 'animate-pulse' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
}
