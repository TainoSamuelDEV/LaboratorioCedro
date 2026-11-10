'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { EvaluationPageSkeleton } from '../../../../components/ui/Skeleton';
import { pesquisaService } from '../../../../services/pesquisa.service';
import { PesquisaPublicaDTO, RespostaComManifestacaoDTO } from '../../../../types/api';

const WORDS: Record<number, string> = {
  1: 'Ruim',
  2: 'Abaixo do esperado',
  3: 'Regular',
  4: 'Muito bom',
  5: 'Excelente',
};

const ARIA_LABELS: Record<number, string> = {
  1: '1, ruim',
  2: '2, abaixo do esperado',
  3: '3, regular',
  4: '4, muito bom',
  5: '5, excelente',
};

const PROMPTS = {
  low: 'O que podemos melhorar?',
  high: 'O que você mais gostou?',
};

function PesquisaPublicaContent() {
  const params = useParams();
  const pesquisaId = String(params?.id || '');

  const [pesquisa, setPesquisa] = useState<PesquisaPublicaDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Campos da avaliação seguindo o modelo oficial do Laboratório Cedro
  const [unidadeId, setUnidadeId] = useState('');
  const [nota, setNota] = useState<number>(0);
  const [comentario, setComentario] = useState('');
  const [senhaAtendimento, setSenhaAtendimento] = useState('');

  // Estado de conclusão
  const [sucesso, setSucesso] = useState<RespostaComManifestacaoDTO | null>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!pesquisaId) {
      setNaoEncontrada(true);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setNaoEncontrada(false);

    pesquisaService
      .obterPublica(pesquisaId)
      .then((data) => {
        if (!data) {
          setNaoEncontrada(true);
          return;
        }
        setPesquisa(data);

        let unidadeInicialId = '';
        if (data.unidadePadraoId) {
          unidadeInicialId = data.unidadePadraoId;
        } else if (data.unidadesAtivas && data.unidadesAtivas.length > 0) {
          unidadeInicialId = data.unidadesAtivas[0].id;
        }
        setUnidadeId(unidadeInicialId);

        const unidadeObj = data.unidadesAtivas?.find((u) => u.id === unidadeInicialId);
        if (typeof document !== 'undefined') {
          document.title = unidadeObj
            ? `${data.titulo} | ${unidadeObj.nome}`
            : `${data.titulo} | Laboratório Cedro`;
        }
      })
      .catch(() => {
        setNaoEncontrada(true);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [pesquisaId]);

  const unidadeSelecionadaNome = useMemo(() => {
    if (!pesquisa) return '';
    const encontrada = pesquisa.unidadesAtivas?.find((u) => u.id === unidadeId);
    return encontrada?.nome || pesquisa.unidadesAtivas?.[0]?.nome || 'Laboratório Cedro';
  }, [pesquisa, unidadeId]);

  const selecionarNota = (n: number) => {
    setNota(n);
    setStatusMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota) {
      setStatusMsg('Escolha uma nota de 1 a 5 para enviar.');
      return;
    }
    if (!unidadeId) {
      setStatusMsg('Selecione a unidade de atendimento.');
      return;
    }

    const commentTrim = comentario.trim();
    // Regra UC01 (docs/05-diagramas-uml-casos-de-uso.md): Comentário obrigatório para notas 1 a 3
    if (nota <= 3 && !commentTrim) {
      setStatusMsg('Para notas de 1 a 3, o comentário é obrigatório.');
      commentRef.current?.focus();
      return;
    }

    setEnviando(true);
    setStatusMsg('Enviando sua avaliação…');

    try {
      const ticketTrim = senhaAtendimento.trim();

      const res = await pesquisaService.responderPublica(pesquisaId, {
        unidadeId,
        clienteAtendimento: ticketTrim,
        nota,
        comentario: commentTrim,
      });

      setSucesso(res);
      setStatusMsg('');
      setTimeout(() => {
        doneHeadingRef.current?.focus();
      }, 50);
    } catch (err: any) {
      setStatusMsg(err?.message || 'Não foi possível enviar sua avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const handleAvaliarDeNovo = () => {
    setNota(0);
    setComentario('');
    setSenhaAtendimento('');
    setStatusMsg('');
    setSucesso(null);
  };

  // Variáveis CSS dinâmicas idênticas ao script paint(n) do modelo oficial
  const toneStyle = (
    nota > 0
      ? {
          '--tone': `var(--t${nota})`,
          '--tone-x': `var(--x${nota})`,
          '--on': `var(--on${nota})`,
        }
      : {
          '--tone': 'var(--ink)',
          '--tone-x': 'var(--ink)',
          '--on': '#fff',
        }
  ) as React.CSSProperties;

  const temUnidadeFixa = Boolean(
    pesquisa?.unidadePadraoId || (pesquisa?.unidadesAtivas && pesquisa.unidadesAtivas.length <= 1)
  );

  return (
    <main className="cedro-eval-main" style={toneStyle}>
      <header className="cedro-eval-brand">
        <svg
          className="cedro-eval-logo"
          viewBox="0 0 277 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Cedro"
        >
          <ellipse cx="45.14" cy="52" rx="45.14" ry="44" fill="#79DDA9" />
          <ellipse cx="47.42" cy="44.57" rx="45.14" ry="44.57" fill="#049671" />
          <ellipse cx="54.85" cy="47.42" rx="41.14" ry="39.42" fill="#00AE6F" />
          <circle cx="48.22" cy="47.95" r="38.78" fill="#027053" />
          <path
            d="M27.78 52.94C27.22 53.14 26.60 53.88 26.52 54.44C26.39 55.30 26.78 56.20 27.45 56.61L27.83 56.84L35.34 56.90C39.47 56.94 42.85 56.98 42.86 56.99C42.87 57.01 43.00 57.13 43.16 57.27L43.45 57.52L43.49 60.87L43.52 64.22L43.39 64.30C43.32 64.35 42.92 64.39 42.51 64.41C39.88 64.48 34.98 65.12 34.47 65.45L34.17 65.65L34.21 66.09L34.25 66.54L34.55 66.68L34.85 66.82L35.94 66.65C40.24 66.01 44.84 65.71 49.27 65.79C54.08 65.88 57.06 66.12 60.47 66.68C61.10 66.78 61.80 66.89 62.02 66.93L62.42 67L62.66 66.78C62.95 66.51 62.97 65.86 62.68 65.60C62.56 65.50 62.28 65.39 62.05 65.36C61.81 65.32 61.05 65.20 60.35 65.09C58.71 64.82 57.68 64.70 55.41 64.52L53.57 64.37V61.11V57.85L53.77 57.50C53.89 57.31 54.06 57.11 54.17 57.05C54.27 57.00 57.71 56.93 61.80 56.90L69.25 56.84L69.63 56.63C69.84 56.51 70.14 56.21 70.30 55.96L70.58 55.50L70.57 54.83L70.56 54.16L70.27 53.72C70.11 53.48 69.82 53.18 69.62 53.06L69.25 52.83L62.05 52.80C57.35 52.77 54.56 52.81 54.01 52.89C52.03 53.20 50.43 54.58 49.71 56.59L49.53 57.08L49.48 60.63L49.43 64.18H48.54H47.65L47.60 60.57L47.55 56.96L47.21 56.12L46.87 55.28L46.07 54.48C45.15 53.56 44.28 53.09 43.14 52.90C42.66 52.82 39.65 52.78 35.28 52.78L28.19 52.79L27.78 52.94Z"
            fill="white"
          />
          <path
            d="M20.99 47.28C20.76 47.40 20.44 47.69 20.28 47.92L20 48.35L20.04 49.06L20.09 49.77L20.58 50.23L21.07 50.69L21.97 50.77C22.46 50.81 34.78 50.83 49.35 50.81L75.84 50.77L76.17 50.52C76.35 50.38 76.61 50.12 76.75 49.94L77 49.61V48.97C77 48.18 76.67 47.58 76.09 47.28L75.67 47.07H48.54H21.41L20.99 47.28Z"
            fill="white"
          />
          <path
            d="M37.47 35.29C36.30 35.91 36.17 37.71 37.24 38.48L37.64 38.76L48.30 38.79L58.96 38.83L59.41 38.62C60.04 38.34 60.40 37.72 60.40 36.95C60.40 36.19 60.11 35.66 59.50 35.31L59.04 35.06L48.46 35.07L37.88 35.07L37.47 35.29Z"
            fill="white"
          />
          <path
            d="M45.27 29.14C44.30 29.67 43.86 30.81 44.29 31.65C44.39 31.84 44.67 32.16 44.90 32.37L45.34 32.76H48.33H51.33L51.78 32.45C52.36 32.06 52.60 31.58 52.60 30.84V30.24L52.33 29.84C52.18 29.62 51.86 29.34 51.63 29.22L51.21 29L48.36 29.00C46.51 29.00 45.43 29.05 45.27 29.14Z"
            fill="white"
          />
          <path
            d="M30.60 41.36C30.39 41.48 30.10 41.76 29.95 41.97L29.68 42.36V42.93C29.68 43.66 29.95 44.19 30.52 44.58L30.97 44.89L48.48 44.89L65.98 44.88L66.45 44.61C67.64 43.93 67.68 42.19 66.53 41.40L66.13 41.13L48.55 41.13L30.98 41.13L30.60 41.36Z"
            fill="white"
          />
          <path
            className="wm"
            d="M127.72 39.00C127.48 39.31 127.25 39.56 127.01 39.75C126.79 39.93 126.46 40.02 126.03 40.02C125.62 40.02 125.22 39.89 124.83 39.64C124.43 39.37 123.97 39.08 123.42 38.76C122.88 38.42 122.23 38.13 121.47 37.88C120.73 37.60 119.81 37.47 118.70 37.47C117.29 37.47 116.05 37.74 114.99 38.28C113.93 38.81 113.04 39.56 112.32 40.56C111.62 41.56 111.10 42.77 110.76 44.20C110.41 45.60 110.24 47.20 110.24 48.99C110.24 50.84 110.42 52.50 110.79 53.95C111.18 55.40 111.73 56.62 112.45 57.62C113.17 58.59 114.03 59.34 115.06 59.86C116.08 60.36 117.23 60.61 118.51 60.61C119.79 60.61 120.82 60.45 121.60 60.13C122.40 59.79 123.08 59.43 123.62 59.04C124.16 58.64 124.63 58.27 125.02 57.96C125.43 57.62 125.89 57.45 126.39 57.45C127.04 57.45 127.53 57.71 127.85 58.23L130.17 61.29C129.28 62.37 128.31 63.29 127.27 64.04C126.23 64.76 125.14 65.35 124.01 65.81C122.90 66.24 121.75 66.54 120.56 66.72C119.39 66.90 118.21 67 117.04 67C114.98 67 113.04 66.60 111.21 65.81C109.39 64.99 107.79 63.81 106.42 62.27C105.06 60.73 103.97 58.85 103.17 56.63C102.39 54.39 102 51.84 102 48.99C102 46.43 102.34 44.06 103.04 41.89C103.75 39.69 104.80 37.80 106.16 36.21C107.53 34.60 109.23 33.35 111.24 32.44C113.26 31.53 115.59 31.08 118.21 31.08C120.71 31.08 122.89 31.50 124.76 32.34C126.65 33.18 128.34 34.38 129.84 35.94L127.72 39.00Z"
          />
          <path
            className="wm"
            d="M156.16 45.05C156.16 43.96 156.01 42.94 155.71 41.99C155.43 41.01 154.99 40.16 154.41 39.44C153.82 38.71 153.07 38.15 152.16 37.74C151.27 37.31 150.23 37.09 149.03 37.09C146.71 37.09 144.87 37.79 143.53 39.17C142.20 40.55 141.36 42.51 140.99 45.05H156.16ZM140.82 50.11C140.95 51.90 141.26 53.45 141.74 54.76C142.21 56.05 142.84 57.13 143.63 57.99C144.41 58.83 145.33 59.46 146.39 59.89C147.48 60.30 148.67 60.51 149.98 60.51C151.28 60.51 152.40 60.35 153.33 60.03C154.29 59.71 155.11 59.36 155.81 58.98C156.52 58.59 157.14 58.24 157.66 57.92C158.20 57.61 158.73 57.45 159.23 57.45C159.90 57.45 160.40 57.71 160.72 58.23L163.04 61.29C162.15 62.37 161.15 63.29 160.04 64.04C158.93 64.76 157.77 65.35 156.55 65.81C155.36 66.24 154.13 66.54 152.87 66.72C151.64 66.90 150.43 67 149.26 67C146.94 67 144.78 66.60 142.78 65.81C140.78 64.99 139.04 63.80 137.57 62.24C136.09 60.65 134.93 58.70 134.08 56.39C133.24 54.06 132.81 51.37 132.81 48.31C132.81 45.93 133.18 43.70 133.92 41.61C134.66 39.51 135.71 37.68 137.08 36.14C138.47 34.58 140.15 33.35 142.13 32.44C144.12 31.53 146.37 31.08 148.87 31.08C150.97 31.08 152.92 31.43 154.70 32.13C156.48 32.84 158.01 33.87 159.29 35.23C160.57 36.56 161.57 38.22 162.29 40.19C163.02 42.13 163.39 44.37 163.39 46.88C163.39 48.15 163.26 49.01 163.00 49.46C162.74 49.89 162.24 50.11 161.50 50.11H140.82Z"
          />
          <path
            className="wm"
            d="M190.40 40.53C189.49 39.37 188.49 38.56 187.41 38.08C186.34 37.60 185.19 37.37 183.96 37.37C182.74 37.37 181.64 37.60 180.67 38.08C179.69 38.56 178.85 39.28 178.16 40.25C177.46 41.21 176.93 42.43 176.56 43.92C176.19 45.40 176.01 47.14 176.01 49.16C176.01 51.20 176.16 52.93 176.46 54.36C176.79 55.76 177.25 56.92 177.83 57.82C178.42 58.70 179.14 59.35 179.98 59.76C180.83 60.14 181.77 60.34 182.82 60.34C184.49 60.34 185.91 59.97 187.08 59.25C188.25 58.52 189.36 57.49 190.40 56.16V40.53ZM198.45 16V66.49H193.53C192.47 66.49 191.79 65.98 191.51 64.96L190.83 61.59C189.48 63.20 187.93 64.50 186.17 65.50C184.43 66.50 182.40 67 180.08 67C178.26 67 176.58 66.60 175.06 65.81C173.54 65.01 172.23 63.87 171.12 62.37C170.04 60.86 169.19 58.99 168.58 56.77C168.00 54.55 167.70 52.01 167.70 49.16C167.70 46.57 168.04 44.17 168.71 41.95C169.39 39.73 170.35 37.81 171.61 36.18C172.87 34.55 174.38 33.28 176.14 32.37C177.90 31.44 179.87 30.98 182.07 30.98C183.93 30.98 185.53 31.28 186.85 31.90C188.18 32.51 189.36 33.33 190.40 34.38V16H198.45Z"
          />
          <path
            className="wm"
            d="M213.97 37.67C215.02 35.59 216.25 33.96 217.69 32.78C219.12 31.58 220.81 30.98 222.77 30.98C224.31 30.98 225.55 31.33 226.48 32.03L225.96 38.32C225.85 38.73 225.69 39.02 225.47 39.20C225.28 39.36 225.00 39.44 224.66 39.44C224.33 39.44 223.84 39.38 223.19 39.27C222.56 39.16 221.94 39.10 221.34 39.10C220.44 39.10 219.65 39.24 218.96 39.51C218.26 39.78 217.63 40.18 217.07 40.70C216.53 41.19 216.04 41.81 215.60 42.53C215.19 43.26 214.80 44.08 214.43 45.01V66.49H206.39V31.62H211.11C211.93 31.62 212.51 31.78 212.83 32.10C213.16 32.39 213.38 32.94 213.49 33.73L213.97 37.67Z"
          />
          <path
            className="wm"
            d="M244.52 31.08C246.99 31.08 249.24 31.50 251.26 32.34C253.30 33.18 255.04 34.37 256.47 35.91C257.92 37.45 259.04 39.33 259.82 41.55C260.60 43.77 261 46.25 261 48.99C261 51.75 260.60 54.24 259.82 56.46C259.04 58.68 257.92 60.57 256.47 62.14C255.04 63.70 253.30 64.90 251.26 65.74C249.24 66.58 246.99 67 244.52 67C242.02 67 239.75 66.58 237.71 65.74C235.67 64.90 233.92 63.70 232.47 62.14C231.03 60.57 229.92 58.68 229.11 56.46C228.33 54.24 227.94 51.75 227.94 48.99C227.94 46.25 228.33 43.77 229.11 41.55C229.92 39.33 231.03 37.45 232.47 35.91C233.92 34.37 235.67 33.18 237.71 32.34C239.75 31.50 242.02 31.08 244.52 31.08ZM244.52 60.54C247.3 60.54 249.35 59.57 250.67 57.62C252.02 55.67 252.69 52.82 252.69 49.06C252.69 45.29 252.02 42.43 250.67 40.46C249.35 38.49 247.3 37.50 244.52 37.50C241.69 37.50 239.60 38.50 238.23 40.49C236.88 42.46 236.21 45.32 236.21 49.06C236.21 52.79 236.88 55.65 238.23 57.62C239.60 59.57 241.69 60.54 244.52 60.54Z"
          />
          <path
            className="wm"
            d="M266.86 33.84C267.05 33.84 267.21 33.83 267.32 33.80C267.45 33.77 267.54 33.72 267.60 33.66C267.67 33.59 267.72 33.52 267.75 33.42C267.77 33.33 267.79 33.23 267.79 33.11C267.79 33.00 267.78 32.90 267.75 32.81C267.73 32.73 267.69 32.65 267.63 32.60C267.57 32.54 267.49 32.50 267.38 32.47C267.27 32.44 267.14 32.43 266.97 32.43H266.38V33.84H266.86ZM266.97 31.54C267.65 31.54 268.15 31.66 268.47 31.91C268.79 32.15 268.95 32.50 268.95 32.96C268.95 33.29 268.87 33.57 268.70 33.82C268.53 34.06 268.27 34.24 267.91 34.35C267.99 34.40 268.06 34.46 268.12 34.54C268.17 34.61 268.23 34.69 268.28 34.78L269.28 36.47H268.15C267.98 36.47 267.87 36.41 267.80 36.29L267.01 34.84C266.97 34.79 266.93 34.75 266.88 34.73C266.84 34.70 266.77 34.68 266.68 34.68H266.38V36.47H265.2V31.54H266.97ZM266.99 37.42C267.30 37.42 267.60 37.38 267.89 37.30C268.17 37.22 268.44 37.11 268.68 36.96C268.93 36.81 269.16 36.64 269.36 36.43C269.56 36.23 269.74 36.00 269.88 35.75C270.02 35.49 270.13 35.22 270.21 34.93C270.29 34.64 270.33 34.34 270.33 34.02C270.33 33.70 270.29 33.39 270.21 33.10C270.13 32.81 270.02 32.53 269.88 32.28C269.74 32.02 269.56 31.79 269.36 31.59C269.16 31.38 268.93 31.20 268.68 31.05C268.44 30.90 268.17 30.79 267.89 30.71C267.60 30.63 267.30 30.59 266.99 30.59C266.68 30.59 266.38 30.63 266.10 30.71C265.82 30.79 265.55 30.90 265.31 31.05C265.06 31.20 264.84 31.38 264.63 31.59C264.44 31.79 264.27 32.02 264.12 32.28C263.98 32.53 263.87 32.81 263.79 33.10C263.72 33.39 263.68 33.70 263.68 34.02C263.68 34.50 263.76 34.94 263.93 35.36C264.10 35.77 264.34 36.13 264.63 36.44C264.93 36.74 265.28 36.98 265.69 37.16C266.09 37.34 266.52 37.42 266.99 37.42ZM266.99 29.95C267.36 29.95 267.72 30.00 268.07 30.10C268.42 30.20 268.74 30.33 269.04 30.51C269.34 30.69 269.61 30.90 269.86 31.15C270.11 31.39 270.32 31.67 270.50 31.97C270.67 32.27 270.81 32.59 270.90 32.94C271.00 33.29 271.05 33.64 271.05 34.02C271.05 34.39 271.00 34.75 270.90 35.10C270.81 35.44 270.67 35.76 270.50 36.06C270.32 36.36 270.11 36.63 269.86 36.88C269.61 37.13 269.34 37.34 269.04 37.52C268.74 37.69 268.42 37.83 268.07 37.93C267.72 38.02 267.36 38.07 266.99 38.07C266.61 38.07 266.26 38.02 265.91 37.93C265.57 37.83 265.24 37.69 264.94 37.52C264.65 37.34 264.37 37.13 264.12 36.88C263.88 36.63 263.67 36.36 263.49 36.06C263.31 35.76 263.18 35.44 263.08 35.10C262.98 34.75 262.94 34.39 262.94 34.02C262.94 33.64 262.98 33.29 263.08 32.94C263.18 32.59 263.31 32.27 263.49 31.97C263.67 31.67 263.88 31.39 264.12 31.15C264.37 30.90 264.65 30.69 264.94 30.51C265.24 30.33 265.57 30.20 265.91 30.10C266.26 30.00 266.61 29.95 266.99 29.95Z"
          />
        </svg>
      </header>

      <form id="form" noValidate onSubmit={handleSubmit}>
        {carregando && <EvaluationPageSkeleton />}

        {!carregando && naoEncontrada && (
          <div id="missing" className="cedro-eval-state">
            <h1 className="cedro-eval-h1">Não encontramos esta pesquisa.</h1>
            <p className="cedro-eval-lead">
              Confira se o link está completo ou peça um novo link à unidade que atendeu você.
            </p>
          </div>
        )}

        {!carregando && !naoEncontrada && pesquisa && !sucesso && (
          <div id="ask">
            {temUnidadeFixa ? (
              <p className="cedro-eval-unit" id="unit">
                {unidadeSelecionadaNome}
              </p>
            ) : (
              <div className="mb-[22px]">
                <label htmlFor="unit-select" className="sr-only">
                  Unidade de atendimento
                </label>
                <select
                  id="unit-select"
                  className="cedro-unit-select"
                  value={unidadeId}
                  onChange={(e) => setUnidadeId(e.target.value)}
                >
                  {pesquisa.unidadesAtivas.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <h1 className="cedro-eval-h1" id="title">
              {pesquisa.titulo}
            </h1>
            <p className="cedro-eval-lead" id="desc">
              {pesquisa.descricao}
            </p>
            <p className="cedro-eval-how">Escolha uma nota de 1 a 5.</p>

            <fieldset className="border-0 m-0 p-0 min-w-0">
              <legend className="sr-only">Nota de 1 a 5</legend>
              <div className="cedro-scale" id="scale">
                <div className="cedro-rail" />
                <div
                  className="cedro-fill"
                  id="fill"
                  style={{ width: nota > 0 ? `${((nota - 1) / 4) * 80}%` : '0%' }}
                />

                {[1, 2, 3, 4, 5].map((n) => {
                  const isLit = nota > 0 && n <= nota;
                  const isOn = nota === n;
                  return (
                    <label
                      key={n}
                      className={`cedro-opt ${isLit ? 'lit' : ''} ${isOn ? 'on' : ''}`}
                    >
                      <input
                        type="radio"
                        name="nota"
                        value={n}
                        checked={isOn}
                        onChange={() => selecionarNota(n)}
                        aria-label={ARIA_LABELS[n]}
                      />
                      <span className="cedro-dot">{n}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <p
              className={`cedro-verdict ${nota > 0 ? 'set' : ''}`}
              id="verdict"
              aria-live="polite"
            >
              {nota > 0 ? WORDS[nota] : 'Toque em um número'}
            </p>

            <div className={`cedro-more ${nota > 0 ? 'open' : ''}`} id="more">
              <div>
                <div className="cedro-more-inner">
                  <label className="cedro-label-q" htmlFor="comment" id="q">
                    {nota > 0
                      ? nota <= 3
                        ? `${PROMPTS.low} *`
                        : PROMPTS.high
                      : 'Quer contar mais?'}
                  </label>
                  <textarea
                    ref={commentRef}
                    id="comment"
                    className="cedro-textarea"
                    maxLength={500}
                    required={nota > 0 && nota <= 3}
                    placeholder={
                      nota > 0 && nota <= 3
                        ? 'Conte pra gente o que aconteceu (obrigatório)'
                        : 'Escreva aqui, se quiser'
                    }
                    value={comentario}
                    onChange={(e) => {
                      setComentario(e.target.value);
                      if (statusMsg) setStatusMsg('');
                    }}
                  />
                  <p className="cedro-hint">
                    {nota > 0 && nota <= 3
                      ? 'Obrigatório para notas de 1 a 3. Até 500 caracteres.'
                      : 'Opcional. Até 500 caracteres.'}
                  </p>

                  <label className="cedro-label-q cedro-label-q2" htmlFor="ticket">
                    Senha de atendimento
                  </label>
                  <input
                    type="text"
                    id="ticket"
                    className="cedro-ticket-input"
                    maxLength={20}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="Ex.: A045"
                    value={senhaAtendimento}
                    onChange={(e) => setSenhaAtendimento(e.target.value)}
                  />
                  <p className="cedro-hint">
                    Opcional. Ajuda a gente a localizar o seu atendimento.
                  </p>
                </div>
              </div>
            </div>

            <div className="cedro-actions">
              <button
                type="submit"
                id="send"
                className="cedro-btn-send"
                disabled={!nota || enviando}
              >
                {enviando ? 'Enviando…' : 'Enviar avaliação'}
              </button>
              <span className="cedro-status" id="status" role="status">
                {statusMsg}
              </span>
            </div>
          </div>
        )}

        {!carregando && !naoEncontrada && sucesso && (
          <section className="cedro-done" id="done" aria-live="polite">
            <div className="cedro-score" id="finalScore">
              <b id="finalNum">{nota}</b>
              <span>de 5</span>
            </div>
            <p className="cedro-eval-unit" id="doneUnit">
              {unidadeSelecionadaNome}
            </p>
            <h2 ref={doneHeadingRef} tabIndex={-1} className="outline-none">
              Obrigado pela sua avaliação.
            </h2>
            <p>Ela nos ajuda a melhorar o atendimento para quem vem depois de você.</p>
            {sucesso.manifestacao?.protocolo && (
              <p className="text-sm font-semibold text-[#171717] !mb-6">
                Protocolo registrado:{' '}
                <span className="font-mono text-[#075618]">{sucesso.manifestacao.protocolo}</span>
              </p>
            )}
            <button
              type="button"
              className="cedro-btn-quiet"
              id="again"
              onClick={handleAvaliarDeNovo}
            >
              Avaliar de novo
            </button>
          </section>
        )}
      </form>
    </main>
  );
}

export default function PesquisaPublicaPage() {
  return (
    <Suspense
      fallback={
        <main className="cedro-eval-main">
          <EvaluationPageSkeleton />
        </main>
      }
    >
      <PesquisaPublicaContent />
    </Suspense>
  );
}
