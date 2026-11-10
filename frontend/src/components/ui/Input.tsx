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
        <label htmlFor={inputId} className="text-xs font-bold text-[#171717]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`px-3.5 py-2.5 text-sm rounded-lg border bg-white text-[#171717] transition-colors placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#02A562]/25 focus:border-[#02A562] disabled:bg-[#F3F3F3] disabled:text-[#999999] ${
          error ? 'border-[#CA2E24] focus:border-[#CA2E24] focus:ring-[#CA2E24]/20' : 'border-[#E3E3E3]'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-semibold text-[#CA2E24]">{error}</span>}
      {helperText && !error && <span className="text-xs text-[#5E5E5E]">{helperText}</span>}
    </div>
  );
}
