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
        <label htmlFor={selectId} className="text-xs font-bold text-[#171717]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`px-3.5 py-2.5 text-sm rounded-lg border bg-white text-[#171717] transition-colors focus:outline-none focus:ring-2 focus:ring-[#02A562]/25 focus:border-[#02A562] disabled:bg-[#F3F3F3] disabled:text-[#999999] cursor-pointer ${
          error ? 'border-[#CA2E24] focus:border-[#CA2E24]' : 'border-[#E3E3E3]'
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
      {error && <span className="text-xs font-semibold text-[#CA2E24]">{error}</span>}
    </div>
  );
}
