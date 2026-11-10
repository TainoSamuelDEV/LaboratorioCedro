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
        <img
          src="/logo-cedro-completa.svg"
          alt="Laboratório Cedro"
          className="cedro-eval-logo"
        />
      </header>

      <form id="form" noValidate onSubmit={handleSubmit}>
        {carregando && <EvaluationPageSkeleton />}

        {!carregando && naoEncontrada && (
          <div id="missing" className="cedro-eval-state" aria-live="polite">
            <div className="cedro-score" style={{ color: '#075618' }}>
              <b>404</b>
              <span>Pesquisa não encontrada</span>
            </div>
            <p className="cedro-eval-unit">Laboratório Cedro</p>
            <h1 className="cedro-eval-h1">Não encontramos esta pesquisa.</h1>
            <p className="cedro-eval-lead">
              Confira se o link está completo ou peça um novo link à unidade que atendeu você.
            </p>
            <div className="cedro-actions">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="cedro-btn-send"
              >
                Tentar novamente
              </button>
            </div>
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
