'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { manifestacaoService } from '../../../../services/manifestacao.service';
import { ManifestacaoDTO } from '../../../../types/api';
import { ErrorView } from '../../../../components/ui/ErrorView';
import { Skeleton } from '../../../../components/ui/Skeleton';

const NOTA_CONFIG: Record<number, { bg: string; text: string; label: string }> = {
  5: { bg: '#02A562', text: '#FFFFFF', label: 'Excelente' },
  4: { bg: '#93CBA0', text: '#171717', label: 'Muito bom' },
  3: { bg: '#F29222', text: '#171717', label: 'Regular' },
  2: { bg: '#E65100', text: '#FFFFFF', label: 'Abaixo do esperado' },
  1: { bg: '#CA2E24', text: '#FFFFFF', label: 'Ruim' },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NOVA: {
    label: 'Nova',
    className: 'bg-[#ECFDF5] text-[#075618] border border-[#A7F3D0]',
  },
  NAO_RESPONDIDA: {
    label: 'Não respondida',
    className: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
  },
  EM_TRATAMENTO: {
    label: 'Em tratamento',
    className: 'bg-[#F0F9FF] text-[#075985] border border-[#BAE6FD]',
  },
  ESCALONADA: {
    label: 'Escalonada',
    className: 'bg-[#FFF1F2] text-[#CA2E24] border border-[#FDA4AF] font-black animate-pulse',
  },
  RESPONDIDA: {
    label: 'Respondida',
    className: 'bg-[#F0FDFA] text-[#115E59] border border-[#99F6E4]',
  },
  CONCLUIDA: {
    label: 'Concluída',
    className: 'bg-[#255521] text-white border border-[#255521]',
  },
};

function formatarTempoRelativo(isoDate: string): string {
  try {
    const agora = Date.now();
    const data = new Date(isoDate).getTime();
    const diffMs = agora - data;
    const diffHoras = Math.max(0, diffMs / (1000 * 60 * 60));

    if (diffHoras < 1) return 'agora';
    if (diffHoras < 24) return `${Math.round(diffHoras)} h`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias} d`;
  } catch {
    return '—';
  }
}

interface EventoTimeline {
  id: string;
  autor: string;
  descricao: string;
  dataHora: string;
}

export default function DetalheManifestacaoPage() {
  const params = useParams();
  const manifestacaoId = String(params?.id || '');
  const { ehCoordenador, ehAdmin, ehOuvidoria } = useAuth();

  const [manifestacao, setManifestacao] = useState<ManifestacaoDTO | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Form de tratativa
  const [textoTratativa, setTextoTratativa] = useState<string>('');
  const [executandoAcao, setExecutandoAcao] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(
    null
  );

  const carregarDetalhe = useCallback(async () => {
    if (!manifestacaoId) return;
    try {
      setCarregando(true);
      setErro(null);
      const dados = await manifestacaoService.obterPorId(manifestacaoId);
      setManifestacao(dados);
    } catch (err: unknown) {
      console.error('[Tratativa] Erro ao carregar manifestação:', err);
      setErro(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados desta manifestação.'
      );
    } finally {
      setCarregando(false);
    }
  }, [manifestacaoId]);

  useEffect(() => {
    carregarDetalhe();
  }, [carregarDetalhe]);

  // Montagem da Timeline de histórico imutável
  const historico = useMemo(() => {
    if (!manifestacao) return [];

    const eventos: EventoTimeline[] = [];

    // 1. Criação inicial / Resposta da pesquisa
    eventos.push({
      id: 'evento-criacao',
      autor: 'Cliente',
      descricao: `Resposta registrada na pesquisa de satisfação (Nota ${manifestacao.nota || '—'}).`,
      dataHora: manifestacao.criadoEm,
    });

    // 2. Interações do sistema e da ouvidoria
    manifestacao.interacoes.forEach((i) => {
      let autor = 'Sistema';
      if (i.tipo === 'INICIO_TRATAMENTO') autor = 'Unidade ' + (manifestacao.unidadeNome || '');
      else if (i.tipo === 'ENCAMINHAMENTO') autor = 'Ouvidoria';
      else if (i.tipo === 'SOLICITACAO_COMPLEMENTO') autor = 'Ouvidoria';
      else if (i.tipo === 'CONCLUSAO') autor = 'Ouvidoria';

      eventos.push({
        id: i.id,
        autor,
        descricao: i.texto,
        dataHora: i.dataHora,
      });
    });

    // 3. Respostas formais da Unidade
    manifestacao.respostasUnidade.forEach((r) => {
      eventos.push({
        id: r.id,
        autor: `Unidade ${manifestacao.unidadeNome || ''}`,
        descricao: r.conteudo,
        dataHora: r.dataHora,
      });
    });

    // 4. Escalonamentos registrados
    manifestacao.escalonamentos.forEach((e) => {
      eventos.push({
        id: e.id,
        autor: 'Ouvidoria',
        descricao: `Escalonamento de Nível ${e.nivel}: ${e.motivo}`,
        dataHora: e.dataHora,
      });
    });

    // Ordenar cronologicamente do mais antigo para o mais recente
    eventos.sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
    );

    return eventos;
  }, [manifestacao]);

  // Ações de Tratativa
  const handleIniciarTratamento = async () => {
    if (!manifestacao) return;
    try {
      setExecutandoAcao(true);
      setFeedbackMsg(null);
      await manifestacaoService.iniciarTratamento(manifestacao.id);
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Tratativa iniciada com sucesso.' });
      await carregarDetalhe();
    } catch (err: unknown) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Erro ao iniciar tratativa.',
      });
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleResponderPelaUnidade = async () => {
    if (!manifestacao) return;
    if (!textoTratativa.trim()) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: 'Por favor, descreva a resposta antes de enviar.',
      });
      return;
    }

    try {
      setExecutandoAcao(true);
      setFeedbackMsg(null);
      await manifestacaoService.responderPelaUnidade(manifestacao.id, textoTratativa.trim());
      setTextoTratativa('');
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Resposta registrada com sucesso.' });
      await carregarDetalhe();
    } catch (err: unknown) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Erro ao registrar resposta.',
      });
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleEscalonar = async () => {
    if (!manifestacao) return;
    if (!textoTratativa.trim()) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: 'Informe o motivo do escalonamento no campo de texto.',
      });
      return;
    }

    try {
      setExecutandoAcao(true);
      setFeedbackMsg(null);
      await manifestacaoService.escalonar(manifestacao.id, textoTratativa.trim(), 1);
      setTextoTratativa('');
      setFeedbackMsg({
        tipo: 'sucesso',
        texto: 'Manifestação escalonada para a gerência com sucesso.',
      });
      await carregarDetalhe();
    } catch (err: unknown) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Erro ao escalonar manifestação.',
      });
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleConcluir = async () => {
    if (!manifestacao) return;
    if (!textoTratativa.trim()) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: 'Informe o parecer de conclusão no campo de texto.',
      });
      return;
    }

    try {
      setExecutandoAcao(true);
      setFeedbackMsg(null);
      await manifestacaoService.concluir(manifestacao.id, textoTratativa.trim());
      setTextoTratativa('');
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Manifestação concluída com sucesso.' });
      await carregarDetalhe();
    } catch (err: unknown) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Erro ao concluir manifestação.',
      });
    } finally {
      setExecutandoAcao(false);
    }
  };

  if (carregando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-36 rounded" />
        <div className="flex justify-between items-center pb-4">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (erro || !manifestacao) {
    return (
      <div>
        <Link
          href="/manifestacoes"
          className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
        >
          ← Voltar para a lista
        </Link>
        <ErrorView
          tipo="404"
          titulo="Manifestação não encontrada"
          descricao={erro || 'A manifestação solicitada não foi localizada ou você não possui permissão para visualizá-la.'}
          onReset={() => carregarDetalhe()}
          embedded
        />
      </div>
    );
  }

  const notaConfig = (manifestacao.nota && NOTA_CONFIG[manifestacao.nota]) || {
    bg: '#5E5E5E',
    text: '#FFFFFF',
    label: 'Sem avaliação',
  };
  const statusConfig = STATUS_CONFIG[manifestacao.status] || {
    label: manifestacao.status,
    className: 'bg-[#F3F3F3] text-[#323232] border border-[#E3E3E3]',
  };
  const isConcluida = manifestacao.status === 'CONCLUIDA';

  return (
    <div>
      {/* Botão Voltar (.back do modelo) */}
      <Link
        href="/manifestacoes"
        className="inline-block text-[#075618] font-bold text-sm mb-4 hover:underline"
      >
        ← Voltar para a lista
      </Link>

      {/* Cabeçalho (.hd do modelo) */}
      <div className="flex justify-between items-start gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-black text-[#075618] tracking-[-0.02em] leading-[1.1] m-0">
            Manifestação #{manifestacao.protocolo}
          </h1>
          <p className="text-[#5E5E5E] text-[15px] mt-1.5 mb-0">
            {manifestacao.unidadeNome || 'Unidade'} · recebida há{' '}
            {formatarTempoRelativo(manifestacao.criadoEm)}
          </p>
        </div>

        <span
          className={`inline-block py-1 px-3 rounded-full text-xs font-bold whitespace-nowrap ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Grid de 2 Colunas (.g3 do modelo de referência) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        {/* Coluna Esquerda: Cartão da Avaliação e Bloco de Tratativa */}
        <div className="space-y-4">
          {/* Card da Avaliação */}
          <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4 mb-4">
              <span
                className="w-16 h-16 rounded-full inline-grid place-items-center font-black text-2xl shrink-0"
                style={{
                  backgroundColor: notaConfig.bg,
                  color: notaConfig.text,
                }}
              >
                {manifestacao.nota || '—'}
              </span>

              <div>
                <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0">
                  {notaConfig.label}
                </h2>
                <span className="block text-xs uppercase font-bold tracking-[0.06em] text-[#5E5E5E] mt-1">
                  Senha de atendimento:{' '}
                  {manifestacao.clienteAtendimento || 'não informada'}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#323232] m-0 leading-relaxed">
              {manifestacao.comentarioCliente || 'O cliente não deixou comentário.'}
            </p>
          </div>

          {/* Card de Registrar Tratativa */}
          {isConcluida ? (
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)] text-sm text-[#5E5E5E]">
              Manifestação concluída. O histórico não pode mais ser alterado.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0 mb-3.5">
                Registrar tratativa
              </h2>

              <textarea
                value={textoTratativa}
                onChange={(e) => setTextoTratativa(e.target.value)}
                placeholder="Descreva a tratativa ou a resposta enviada ao cliente"
                aria-label="Tratativa"
                className="w-full min-h-[110px] p-3 text-sm text-[#171717] bg-white border-[1.5px] border-[#E3E3E3] rounded-lg resize-y placeholder:text-[#999] focus:outline-none focus:border-[#02A562]"
              />

              {/* Mensagem de Feedback */}
              {feedbackMsg && (
                <div
                  className={`mt-2.5 p-2.5 rounded-lg text-xs font-semibold ${
                    feedbackMsg.tipo === 'sucesso'
                      ? 'bg-emerald-50 text-[#075618] border border-emerald-200'
                      : 'bg-rose-50 text-[#CA2E24] border border-rose-200'
                  }`}
                >
                  {feedbackMsg.texto}
                </div>
              )}

              {/* Botões de Ação de acordo com o Perfil (RBAC) */}
              <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap mt-3.5">
                {/* Se for Coordenador de Unidade e a manifestação estiver NOVA */}
                {ehCoordenador && manifestacao.status === 'NOVA' && (
                  <button
                    type="button"
                    onClick={handleIniciarTratamento}
                    disabled={executandoAcao}
                    className="w-full sm:w-auto min-h-[44px] px-5 rounded-lg text-xs font-bold uppercase tracking-[0.02em] text-white bg-[#075618] hover:bg-[#23823D] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Iniciar Tratamento
                  </button>
                )}

                {/* Resposta Formal da Unidade (Coordenador ou Ouvidoria) */}
                <button
                  type="button"
                  onClick={handleResponderPelaUnidade}
                  disabled={executandoAcao}
                  className="w-full sm:w-auto min-h-[44px] px-5 rounded-lg text-xs font-bold uppercase tracking-[0.02em] text-white bg-[#02A562] hover:bg-[#23823D] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  Registrar resposta
                </button>

                {/* Ações Restritas à Ouvidoria e Administração */}
                {(ehOuvidoria || ehAdmin) && (
                  <>
                    <button
                      type="button"
                      onClick={handleEscalonar}
                      disabled={executandoAcao}
                      className="w-full sm:w-auto min-h-[44px] px-5 rounded-lg text-xs font-bold uppercase tracking-[0.02em] text-white bg-[#075618] hover:bg-[#F29222] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Escalonar
                    </button>

                    <button
                      type="button"
                      onClick={handleConcluir}
                      disabled={executandoAcao}
                      className="w-full sm:w-auto min-h-[44px] px-5 rounded-lg text-xs font-bold uppercase tracking-[0.02em] text-[#02A562] bg-white border border-[#02A562] hover:bg-[#02A562] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Concluir
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Card de Histórico Imutável (.tl do modelo) */}
        <div className="bg-white rounded-xl border border-[#E3E3E3] p-5 shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]">
          <h2 className="text-[1.1rem] font-bold leading-tight text-[#171717] m-0 mb-4">
            Histórico
          </h2>

          <ul className="list-none m-0 ml-1.5 p-0 border-l-2 border-[#E3E3E3]">
            {historico.map((ev) => (
              <li
                key={ev.id}
                className="relative pb-4 pl-5 before:absolute before:-left-[7px] before:top-1.5 before:w-3 before:h-3 before:rounded-full before:bg-[#02A562] before:border-2 before:border-white"
              >
                <b className="font-bold text-sm text-[#171717] block leading-tight">
                  {ev.autor}
                </b>
                <span className="text-sm text-[#323232] block mt-0.5 leading-normal">
                  {ev.descricao}
                </span>
                <small className="text-xs text-[#5E5E5E] block mt-1">
                  há {formatarTempoRelativo(ev.dataHora)}
                </small>
              </li>
            ))}
          </ul>

          <p className="text-[#5E5E5E] text-[13px] mt-4 mb-0 pt-3 border-t border-[#EEE]">
            O histórico é imutável: novas ações entram sempre no fim.
          </p>
        </div>
      </div>
    </div>
  );
}
