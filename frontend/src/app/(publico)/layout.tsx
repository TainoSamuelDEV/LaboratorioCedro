import React from 'react';

export default function PublicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}
