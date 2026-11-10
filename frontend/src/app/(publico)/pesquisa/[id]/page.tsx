'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Star } from 'lucide-react';
import { BrandLogo } from '../../../../components/brand/BrandLogo';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { pesquisaService } from '../../../../services/pesquisa.service';
import { PesquisaPublicaDTO, RespostaComManifestacaoDTO } from '../../../../types/api';

function PesquisaPublicaContent() {
  const params = useParams();
  const pesquisaId = String(params?.id || '');

  const [pesquisa, setPesquisa] = useState<PesquisaPublicaDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Campos do formulário
  const [unidadeId, setUnidadeId] = useState('');
  const [clienteAtendimento, setClienteAtendimento] = useState('');
  const [nota, setNota] = useState<number>(5);
  const [comentario, setComentario] = useState('');

  // Sucesso
  const [sucesso, setSucesso] = useState<RespostaComManifestacaoDTO | null>(null);

  useEffect(() => {
    if (!pesquisaId) return;

    pesquisaService
      .obterPublica(pesquisaId)
      .then((data) => {
        setPesquisa(data);
        if (data.unidadePadraoId) {
          setUnidadeId(data.unidadePadraoId);
        } else if (data.unidadesAtivas.length > 0) {
          setUnidadeId(data.unidadesAtivas[0].id);
        }
      })
      .catch((err: any) => {
        setErro(err?.message || 'Pesquisa não encontrada ou encerrada.');
      })
      .finally(() => setCarregando(false));
  }, [pesquisaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadeId) {
      setErro('Por favor, selecione a unidade atendida.');
      return;
    }
    setErro(null);
    setEnviando(true);

    try {
      const res = await pesquisaService.responderPublica(pesquisaId, {
        unidadeId,
        clienteAtendimento: clienteAtendimento.trim(),
        nota,
        comentario: comentario.trim(),
      });
      setSucesso(res);
    } catch (err: any) {
      setErro(err?.message || 'Falha ao registrar sua avaliação.');
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent" />
        <span className="text-sm text-slate-500 mt-3">Carregando formulário...</span>
      </div>
    );
  }

  if (sucesso) {
    return (
      <Card className="p-8 text-center animate-fade-in border-emerald-200 shadow-md">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900">Agradecemos sua Avaliação!</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Sua opinião é fundamental para aprimorarmos continuamente os serviços do Laboratório Cedro.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 inline-block text-left w-full max-w-sm">
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Protocolo Gerado na Ouvidoria
          </div>
          <div className="text-lg font-mono font-bold text-[var(--brand-primary)] mt-0.5">
            {sucesso.manifestacao.protocolo}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Status inicial: <span className="font-medium text-slate-700">{sucesso.manifestacao.status}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-sm">
      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
        <BrandLogo size="md" />
        <h1 className="text-xl font-bold text-slate-900 mt-3">{pesquisa?.titulo}</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md">{pesquisa?.descricao}</p>
      </div>

      {erro && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Select
          label="Unidade em que realizou o atendimento"
          required
          value={unidadeId}
          onChange={(e) => setUnidadeId(e.target.value)}
          options={(pesquisa?.unidadesAtivas || []).map((u) => ({
            value: u.id,
            label: u.nome,
          }))}
        />

        <Input
          label="Seu Nome ou Número de Atendimento"
          required
          placeholder="Ex: Maria Santos ou Atendimento #98214"
          value={clienteAtendimento}
          onChange={(e) => setClienteAtendimento(e.target.value)}
        />

        {/* Avaliação por estrelas (1 a 5) */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-2">
            Como você avalia a sua experiência hoje? (Nota de 1 a 5)
          </label>
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setNota(val)}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-lg border transition-all cursor-pointer ${
                  nota === val
                    ? 'bg-[var(--brand-primary-light)] border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Star
                  className={`w-5 h-5 mb-1 ${
                    nota >= val ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
                <span className="text-xs">{val}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
            <span>Muito insatisfeito</span>
            <span>Muito satisfeito</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1.5">
            Comentário, elogio ou relato sobre o atendimento
          </label>
          <textarea
            required
            rows={3}
            placeholder="Conte-nos o que aconteceu para podermos aprimorar nossos processos..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={enviando}>
          Enviar Avaliação
        </Button>
      </form>
    </Card>
  );
}

export default function PesquisaPublicaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center text-xs text-slate-400">
          Carregando formulário de avaliação...
        </div>
      }
    >
      <PesquisaPublicaContent />
    </Suspense>
  );
}
