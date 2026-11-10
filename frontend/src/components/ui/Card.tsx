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
      className={`bg-white rounded-xl border border-[var(--border-subtle)] shadow-xs transition-shadow ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
