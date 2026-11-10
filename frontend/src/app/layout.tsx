import type { Metadata, Viewport } from 'next';
import { Lato } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { BRAND_CONFIG } from '../config/brand';
import './globals.css';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lato',
});

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.subtitle}`,
  description:
    'Plataforma oficial de Gestão de Experiência do Cliente e Ouvidoria Integrada ao Back-end POO.',
  icons: {
    icon: BRAND_CONFIG.assets.logoIcon,
    shortcut: BRAND_CONFIG.assets.logoIcon,
    apple: BRAND_CONFIG.assets.logoIcon,
  },
};

export const viewport: Viewport = {
  themeColor: '#008F66',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={lato.variable}>
      <body
        className={`${lato.className} min-h-screen bg-[var(--bg-canvas)] text-[var(--text-body)] antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
