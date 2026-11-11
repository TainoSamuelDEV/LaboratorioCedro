import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-bold text-[#171717]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[48px] px-4 py-3 text-sm rounded-[10px] border-[1.5px] bg-white text-[#171717] transition-all placeholder:text-[#999999] focus:outline-none focus:border-[#02A562] focus:ring-2 focus:ring-[#02A562]/20 disabled:bg-[#F3F3F3] disabled:text-[#999999] disabled:cursor-not-allowed ${
          error ? 'border-[#CA2E24] focus:border-[#CA2E24] focus:ring-[#CA2E24]/20' : 'border-[#E3E3E3]'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-[#CA2E24]">{error}</span>}
      {helperText && !error && <span className="text-xs text-[#5E5E5E]">{helperText}</span>}
    </div>
  );
}
