'use client';

import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, Copy, Check, X, QrCode } from 'lucide-react';
import { PesquisaDTO } from '../../types/api';

interface QrCodePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pesquisa: PesquisaDTO | null;
  nomeUnidade?: string;
}

export function QrCodePdfModal({
  isOpen,
  onClose,
  pesquisa,
  nomeUnidade,
}: QrCodePdfModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiado, setCopiado] = useState<boolean>(false);
  const [urlPublica, setUrlPublica] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !pesquisa) return;

    // Montar URL pública de resposta
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/pesquisa/${pesquisa.id}`;
    setUrlPublica(link);

    // Gerar QR Code em alta definição estilizado com verde Cedro
    QRCode.toDataURL(link, {
      width: 600,
      margin: 2,
      color: {
        dark: '#075618',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        setQrCodeUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Erro ao gerar QR Code:', err);
      });
  }, [isOpen, pesquisa]);

  if (!isOpen || !pesquisa) return null;

  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(urlPublica);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleBaixarQr = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-cedro-${pesquisa.titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rotuloUnidade = nomeUnidade || 'Todas as Unidades';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Display de QR Code da Pesquisa"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity no-print"
        onClick={onClose}
      />

      {/* Conteúdo do Modal */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E3E3E3] overflow-hidden my-auto flex flex-col max-h-[92dvh]">
        {/* Cabeçalho da Janela (não impresso) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E3E3] bg-[#FAFAFA] no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6F5EC] text-[#075618] grid place-items-center">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-[#075618] leading-tight m-0">
                Display de Balcão e Totem
              </h2>
              <p className="text-xs text-[#5E5E5E] m-0">
                Pré-visualização para impressão e exportação em PDF
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="w-8 h-8 rounded-lg grid place-items-center text-[#5E5E5E] hover:text-[#171717] hover:bg-[#F0F0F0] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo com a Pré-visualização do Totem de Balcão (Área Imprimível) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#F5F5F5]">
          <div
            ref={printRef}
            className="cedro-print-display mx-auto max-w-md min-h-[420px] sm:min-h-[520px] bg-white rounded-2xl shadow-md border-[2px] border-[#075618]/20 overflow-hidden text-center flex flex-col justify-between"
          >
            {/* Topo Institucional com Padrão de Identidade Cedro */}
            <div className="bg-[#075618] text-white pt-6 pb-5 px-6 relative overflow-hidden">
              {/* Marca D'Água / Padrão Geométrico Sutil */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, #ffffff 2px, transparent 0), radial-gradient(circle at 80% 80%, #ffffff 2px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 flex flex-col items-center">
                <img
                  src="/logo-cedro-completa.svg"
                  alt="Laboratório Cedro"
                  className="h-9 w-auto brightness-0 invert mx-auto mb-3"
                />

                <span className="inline-block py-0.5 px-3 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/15 text-white border border-white/25 mb-1.5">
                  {rotuloUnidade}
                </span>

                <h3 className="text-lg sm:text-xl font-black text-white m-0 tracking-tight leading-snug">
                  {pesquisa.titulo}
                </h3>
              </div>
            </div>

            {/* Miolo com Instrução, QR Code Grande e Moldura */}
            <div className="p-6 flex-1 flex flex-col items-center justify-center">
              <p className="text-xs sm:text-sm text-[#323232] font-semibold max-w-[280px] mb-4 leading-relaxed">
                Sua opinião é fundamental para nós. Aponte a câmera do seu celular para avaliar o atendimento:
              </p>

              {/* Moldura de Destaque do QR Code */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-[#075618]/25 shadow-sm inline-block">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code para ${pesquisa.titulo}`}
                    className="w-48 h-48 sm:w-56 sm:h-56 block rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 grid place-items-center text-xs text-[#5E5E5E]">
                    Gerando QR Code...
                  </div>
                )}
              </div>

              {/* Link Curto Legível */}
              <div className="mt-3.5 px-3 py-1 rounded-md bg-[#F3F3F3] text-[11px] font-mono text-[#5E5E5E] max-w-full w-full truncate select-all">
                {urlPublica}
              </div>
            </div>

            {/* Rodapé da Placa */}
            <div className="py-3 px-6 bg-[#FAFAFA] border-t border-[#EEE] text-[11px] text-[#767676] font-medium flex items-center justify-between">
              <span>Laboratório Cedro</span>
              <span>Tradição e Cuidado</span>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações do Modal (não impresso) */}
        <div className="p-4 border-t border-[#E3E3E3] bg-white flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopiarLink}
              className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 px-3 h-10 rounded-lg border border-[#E3E3E3] bg-white text-xs font-bold text-[#323232] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
            >
              {copiado ? (
                <>
                  <Check size={14} className="text-[#02A562]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBaixarQr}
              className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 px-3 h-10 rounded-lg border border-[#E3E3E3] bg-white text-xs font-bold text-[#323232] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Baixar QR (PNG)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-[#075618] hover:bg-[#054012] text-white text-xs font-black shadow-sm transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
