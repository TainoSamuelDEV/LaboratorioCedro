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
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
}
