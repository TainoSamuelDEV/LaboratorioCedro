import React from 'react';

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return <div className="cedro-eval-page">{children}</div>;
}
