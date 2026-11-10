import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#F3F3F3] p-4 sm:p-6 md:p-10">
      {children}
    </div>
  );
}
