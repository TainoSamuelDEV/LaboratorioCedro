import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer ${
          error ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
