import type { Metadata } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import { BRAND_CONFIG } from '../config/brand';
import './globals.css';

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.subtitle}`,
  description: 'Plataforma oficial de Gestão de Experiência do Cliente e Ouvidoria Integrada ao Back-end POO.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
