'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Star,
  CheckCircle2,
  AlertTriangle,
  History,
  Building2,
  Send,
  CornerUpLeft,
} from 'lucide-react';
import { PrioridadeBadge, StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Modal } from '../../../../components/ui/Modal';
import { Select } from '../../../../components/ui/Select';
import { DetalheManifestacaoSkeleton } from '../../../../components/ui/Skeleton';
import { useAuth } from '../../../../contexts/AuthContext';
import { manifestacaoService } from '../../../../services/manifestacao.service';
import { unidadeService } from '../../../../services/unidade.service';
import { ManifestacaoDTO, UnidadeDTO } from '../../../../types/api';

function DetalheManifestacaoContent() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || '');
  const { usuario, ehAdmin, ehOuvidoria, ehCoordenador } = useAuth();

  const [manifestacao, setManifestacao] = useState<ManifestacaoDTO | null>(null);
  const [unidades, setUnidades] = useState<UnidadeDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Modais de Ação
  const [modalResposta, setModalResposta] = useState(false);
  const [modalComplemento, setModalComplemento] = useState(false);
  const [modalEscalonamento, setModalEscalonamento] = useState(false);
  const [modalEncaminhar, setModalEncaminhar] = useState(false);
  const [modalConcluir, setModalConcluir] = useState(false);

  // Campos dos Modais
  const [conteudoResposta, setConteudoResposta] = useState('');
  const [motivoComplemento, setMotivoComplemento] = useState('');
  const [motivoEscalonamento, setMotivoEscalonamento] = useState('');
  const [nivelEscalonamento, setNivelEscalonamento] = useState(1);
  const [novaUnidadeId, setNovaUnidadeId] = useState('');
  const [motivoEncaminhar, setMotivoEncaminhar] = useState('');
  const [parecerConclusao, setParecerConclusao] = useState('');
  const [executandoAcao, setExecutandoAcao] = useState(false);

  const carregarDetalhe = async () => {
    if (!id) return;
    try {
      const data = await manifestacaoService.obterPorId(id);
      setManifestacao(data);
    } catch (err: any) {
      setErro(err?.message || 'Falha ao carregar manifestação.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDetalhe();
    unidadeService.listar(true).then(setUnidades).catch(console.error);
  }, [id]);

  // Ações do Domínio POO
  const handleIniciarTratamento = async () => {
    setExecutandoAcao(true);
    try {
      await manifestacaoService.iniciarTratamento(id);
      await carregarDetalhe();
    } catch (err: any) {
      alert(err?.message || 'Erro ao iniciar tratamento.');
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleEnviarResposta = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecutandoAcao(true);
    try {
      await manifestacaoService.responderPelaUnidade(id, conteudoResposta);
      setModalResposta(false);
      setConteudoResposta('');
      await carregarDetalhe();
    } catch (err: any) {
      alert(err?.message || 'Erro ao registrar resposta.');
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleSolicitarComplemento = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecutandoAcao(true);
    try {
      await manifestacaoService.solicitarComplemento(id, motivoComplemento);
      setModalComplemento(false);
      setMotivoComplemento('');
      await carregarDetalhe();
    } catch (err: any) {
      alert(err?.message || 'Erro ao solicitar complemento.');
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleEscalonar = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecutandoAcao(true);
    try {
      await manifestacaoService.escalonar(id, motivoEscalonamento, nivelEscalonamento);
      setModalEscalonamento(false);
      setMotivoEscalonamento('');
      await carregarDetalhe();
    } catch (err: any) {
      alert(err?.message || 'Erro ao escalonar.');
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleEncaminhar = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecutandoAcao(true);
    try {
      await manifestacaoService.encaminhar(id, novaUnidadeId, motivoEncaminhar);
      setModalEncaminhar(false);
      setNovaUnidadeId('');
      setMotivoEncaminhar('');
      await carregarDetalhe();
    } catch (err: any) {
      alert(err?.message || 'Erro ao reencaminhar.');
    } finally {
      setExecutandoAcao(false);
    }
  };

  const handleConcluir = async (e: React.FormEvent) => {
    e.preventDefault();
    setExecutandoAcao(true);
    try {
      await manifestacaoService.concluir(id, parecerConclusao);
      setModalConcluir(false);
      setParecerConclusao('');
      await carregarDetalhe();
    } catch (err: any) {
      alert(err?.message || 'Erro ao concluir manifestação.');
    } finally {
      setExecutandoAcao(false);
    }
  };

  if (carregando) {
    return <DetalheManifestacaoSkeleton />;
  }

  if (erro || !manifestacao) {
    return (
      <div className="p-8 text-center">
        <div className="text-sm font-semibold text-rose-600">{erro || 'Manifestação não encontrada.'}</div>
        <Link href="/manifestacoes" className="text-xs text-slate-600 hover:underline mt-2 inline-block">
          Voltar para listagem
        </Link>
      </div>
    );
  }

  const ehMesmaUnidade = usuario?.unidadeId === manifestacao.unidadeId;
  const podeTratar = (ehCoordenador && ehMesmaUnidade) || ehAdmin;
  const podeOuvidoria = ehOuvidoria || ehAdmin;

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      {/* Barra de Topo Responsiva */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <Link
            href="/manifestacoes"
            className="p-2 rounded-lg border border-[#E3E3E3] text-[#323232] hover:bg-[#F3F3F3] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg sm:text-xl font-black text-[#075618]">
                {manifestacao.protocolo}
              </span>
              <StatusBadge status={manifestacao.status} />
              <PrioridadeBadge prioridade={manifestacao.prioridade} />
            </div>
            <span className="text-xs text-[#5E5E5E] block mt-0.5">
              Protocolo imutável gerado automaticamente a partir da avaliação do cliente
            </span>
          </div>
        </div>

        {/* Botões de Ação Dinâmicos (Abrem em Gaveta / Drawer) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ações da Unidade */}
          {podeTratar && manifestacao.status === 'NAO_RESPONDIDA' && (
            <Button onClick={handleIniciarTratamento} isLoading={executandoAcao}>
              Iniciar Tratamento
            </Button>
          )}

          {podeTratar &&
            (manifestacao.status === 'EM_TRATAMENTO' ||
              manifestacao.status === 'NAO_RESPONDIDA' ||
              manifestacao.status === 'ESCALONADA') && (
              <Button onClick={() => setModalResposta(true)}>
                <Send className="w-3.5 h-3.5" />
                Responder pela Unidade
              </Button>
            )}

          {/* Ações da Ouvidoria */}
          {podeOuvidoria && manifestacao.status === 'RESPONDIDA' && (
            <>
              <Button variant="secondary" onClick={() => setModalComplemento(true)}>
                Solicitar Complemento
              </Button>
              <Button onClick={() => setModalConcluir(true)}>
                <CheckCircle2 className="w-4 h-4" />
                Concluir Caso
              </Button>
            </>
          )}

          {podeOuvidoria &&
            manifestacao.status !== 'CONCLUIDA' &&
            manifestacao.status !== 'RESPONDIDA' && (
              <Button variant="danger" onClick={() => setModalEscalonamento(true)}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Escalonar
              </Button>
            )}

          {podeOuvidoria && manifestacao.status !== 'CONCLUIDA' && (
            <Button variant="outline" onClick={() => setModalEncaminhar(true)}>
              Reencaminhar
            </Button>
          )}
        </div>
      </div>

      {/* Grid com os 14 Campos Mínimos (Seção 9 da Documentação Funcional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Coluna 1: Dados do Cliente e Avaliação */}
        <Card title="Avaliação do Cliente">
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block">Identificação do Atendimento:</span>
              <span className="font-semibold text-slate-900 text-sm">
                {manifestacao.clienteAtendimento || 'Não informado'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Nota Atribuída (1 a 5):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900">{manifestacao.nota}</span>
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        (manifestacao.nota || 0) >= s ? 'fill-current' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block">Comentário / Relato:</span>
              <p className="mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 italic">
                "{manifestacao.comentarioCliente || 'Sem comentário'}"
              </p>
            </div>
          </div>
        </Card>

        {/* Coluna 2: Dados da Unidade e Prazos SLA */}
        <Card title="Unidade & Prazos Regulamentares">
          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block">Unidade Responsável:</span>
              <span className="font-semibold text-slate-900 text-sm">
                {manifestacao.unidadeNome || manifestacao.unidadeId}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Data de Abertura:</span>
              <span className="text-slate-800">
                {new Date(manifestacao.criadoEm).toLocaleString('pt-BR')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Prazo Limite de SLA:</span>
              <span className="font-mono font-semibold text-slate-900">
                {new Date(manifestacao.prazoResposta).toLocaleString('pt-BR')}
              </span>
            </div>

            {manifestacao.concluidoEm && (
              <div>
                <span className="text-slate-400 block">Concluído Em:</span>
                <span className="font-semibold text-emerald-700">
                  {new Date(manifestacao.concluidoEm).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Coluna 3: Tratativas da Unidade */}
        <Card title="Tratativa Formal da Unidade">
          {manifestacao.respostasUnidade.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-6 text-center">
              Aguardando registro de resposta formal pela unidade responsável.
            </div>
          ) : (
            <div className="space-y-3">
              {manifestacao.respostasUnidade.map((r, idx) => (
                <div key={r.id} className="p-3 rounded-lg bg-teal-50/50 border border-teal-200/70 text-xs">
                  <div className="flex justify-between text-[11px] text-teal-800 font-semibold mb-1">
                    <span>Resposta #{idx + 1}</span>
                    <span>{new Date(r.dataHora).toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-800">{r.conteudo}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Histórico Imutável de Auditoria (Trilha de Interações - Seção 6 e 9) */}
      <Card title="Trilha de Auditoria & Linha do Tempo (Interações Imutáveis)">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {manifestacao.interacoes.map((item) => (
            <div key={item.id} className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[var(--brand-primary)] ring-4 ring-white" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 font-mono">
                  {item.tipo.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(item.dataHora).toLocaleString('pt-BR')}
                </span>
                {item.statusNovo && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    Status: {item.statusNovo}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">{item.texto}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAIS DE AÇÃO DO DOMÍNIO POO */}

      {/* Modal Resposta da Unidade */}
      <Modal
        isOpen={modalResposta}
        onClose={() => setModalResposta(false)}
        title="Registrar Resposta Formal da Unidade"
        description="Esta resposta será enviada para auditoria da Ouvidoria e arquivada no histórico."
      >
        <form onSubmit={handleEnviarResposta} className="space-y-4">
          <textarea
            required
            rows={4}
            placeholder="Descreva as providências tomadas pela unidade clínica/operacional..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            value={conteudoResposta}
            onChange={(e) => setConteudoResposta(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalResposta(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={executandoAcao}>
              Enviar Resposta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Solicitar Complemento */}
      <Modal
        isOpen={modalComplemento}
        onClose={() => setModalComplemento(false)}
        title="Solicitar Complemento à Unidade"
        description="Devolve a manifestação para o status EM TRATAMENTO com os apontamentos da Ouvidoria."
      >
        <form onSubmit={handleSolicitarComplemento} className="space-y-4">
          <textarea
            required
            rows={3}
            placeholder="Explique o que precisa ser complementado ou esclarecido pela unidade..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            value={motivoComplemento}
            onChange={(e) => setMotivoComplemento(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalComplemento(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={executandoAcao}>
              Devolver para Complemento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Escalonamento */}
      <Modal
        isOpen={modalEscalonamento}
        onClose={() => setModalEscalonamento(false)}
        title="Escalonar Manifestação para Gestão"
        description="Eleva a prioridade para CRÍTICA e gera alerta de escalonamento."
      >
        <form onSubmit={handleEscalonar} className="space-y-4">
          <textarea
            required
            rows={3}
            placeholder="Motivo formal do escalonamento (ex: estouro de SLA, gravidade do relato)..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            value={motivoEscalonamento}
            onChange={(e) => setMotivoEscalonamento(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalEscalonamento(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" isLoading={executandoAcao}>
              Confirmar Escalonamento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Reencaminhar */}
      <Modal
        isOpen={modalEncaminhar}
        onClose={() => setModalEncaminhar(false)}
        title="Reencaminhar para Outra Unidade"
      >
        <form onSubmit={handleEncaminhar} className="space-y-4">
          <Select
            label="Nova Unidade de Destino"
            required
            value={novaUnidadeId}
            onChange={(e) => setNovaUnidadeId(e.target.value)}
            options={unidades
              .filter((u) => u.id !== manifestacao.unidadeId)
              .map((u) => ({ value: u.id, label: u.nome }))}
          />
          <textarea
            required
            rows={2}
            placeholder="Motivo do reencaminhamento..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            value={motivoEncaminhar}
            onChange={(e) => setMotivoEncaminhar(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalEncaminhar(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={executandoAcao}>
              Reencaminhar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Conclusão */}
      <Modal
        isOpen={modalConcluir}
        onClose={() => setModalConcluir(false)}
        title="Concluir Manifestação pela Ouvidoria"
        description="Esta ação trava a manifestação e registra o parecer final imutável."
      >
        <form onSubmit={handleConcluir} className="space-y-4">
          <textarea
            required
            rows={4}
            placeholder="Parecer final conclusivo da Ouvidoria após acolhimento da resposta..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            value={parecerConclusao}
            onChange={(e) => setParecerConclusao(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalConcluir(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={executandoAcao}>
              Concluir Manifestação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function DetalheManifestacaoPage() {
  return (
    <Suspense fallback={<DetalheManifestacaoSkeleton />}>
      <DetalheManifestacaoContent />
    </Suspense>
  );
}
