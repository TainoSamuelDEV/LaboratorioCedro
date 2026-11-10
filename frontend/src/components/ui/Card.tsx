import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E3E3E3] shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] transition-shadow ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E3E3]">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-[#171717]">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-[#5E5E5E] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
