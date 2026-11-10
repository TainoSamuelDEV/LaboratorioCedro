import { SupabaseClient } from '@supabase/supabase-js';
import { Escalonamento } from '../../domain/entities/Escalonamento';
import { Interacao } from '../../domain/entities/Interacao';
import { Manifestacao } from '../../domain/entities/Manifestacao';
import { RespostaUnidade } from '../../domain/entities/RespostaUnidade';
import { StatusManifestacao } from '../../domain/enums';
import {
  FiltrosManifestacao,
  IManifestacaoRepository,
} from '../../domain/repositories/IManifestacaoRepository';
import { obterSupabaseClient } from '../supabase/client';

export class SupabaseManifestacaoRepository implements IManifestacaoRepository {
  constructor(private readonly client: SupabaseClient = obterSupabaseClient()) {}

  public async salvar(manifestacao: Manifestacao): Promise<void> {
    // 1. Salva ou atualiza a manifestação principal
    const { error: erroManif } = await this.client.from('manifestacoes').upsert({
      id: manifestacao.id,
      protocolo: manifestacao.protocolo,
      resposta_id: manifestacao.respostaId,
      unidade_id: manifestacao.unidadeId,
      status: manifestacao.status,
      prioridade: manifestacao.prioridade,
      responsavel_id: manifestacao.responsavelId,
      prazo_resposta: manifestacao.prazoResposta.toISOString(),
      criado_em: manifestacao.criadoEm.toISOString(),
      concluido_em: manifestacao.concluidoEm ? manifestacao.concluidoEm.toISOString() : null,
    });

    if (erroManif) {
      throw new Error(`Erro ao salvar manifestação no Supabase: ${erroManif.message}`);
    }

    // 2. Insere interações (utilizando ignoreDuplicates para respeitar trigger de imutabilidade)
    if (manifestacao.interacoes.length > 0) {
      const rowsInteracoes = manifestacao.interacoes.map((i) => ({
        id: i.id,
        manifestacao_id: manifestacao.id,
        usuario_id: i.usuarioId,
        tipo: i.tipo,
        texto: i.texto,
        status_anterior: i.statusAnterior,
        status_novo: i.statusNovo,
        data_hora: i.dataHora.toISOString(),
      }));

      const { error: erroInteracoes } = await this.client
        .from('interacoes')
        .upsert(rowsInteracoes, { onConflict: 'id', ignoreDuplicates: true });

      if (erroInteracoes) {
        throw new Error(`Erro ao salvar interações no Supabase: ${erroInteracoes.message}`);
      }
    }

    // 3. Insere respostas da unidade
    if (manifestacao.respostasUnidade.length > 0) {
      const rowsRespostas = manifestacao.respostasUnidade.map((r) => ({
        id: r.id,
        manifestacao_id: manifestacao.id,
        usuario_id: r.usuarioId,
        conteudo: r.conteudo,
        data_hora: r.dataHora.toISOString(),
      }));

      const { error: erroRespostas } = await this.client
        .from('respostas_unidade')
        .upsert(rowsRespostas, { onConflict: 'id', ignoreDuplicates: true });

      if (erroRespostas) {
        throw new Error(`Erro ao salvar respostas da unidade no Supabase: ${erroRespostas.message}`);
      }
    }

    // 4. Insere escalonamentos
    if (manifestacao.escalonamentos.length > 0) {
      const rowsEscalonamentos = manifestacao.escalonamentos.map((e) => ({
        id: e.id,
        manifestacao_id: manifestacao.id,
        motivo: e.motivo,
        nivel: e.nivel,
        usuario_id: e.usuarioId,
        data_hora: e.dataHora.toISOString(),
      }));

      const { error: erroEscalonamentos } = await this.client
        .from('escalonamentos')
        .upsert(rowsEscalonamentos, { onConflict: 'id', ignoreDuplicates: true });

      if (erroEscalonamentos) {
        throw new Error(`Erro ao salvar escalonamentos no Supabase: ${erroEscalonamentos.message}`);
      }
    }
  }

  private mapearParaDominio(row: any): Manifestacao {
    const interacoes = (row.interacoes || [])
      .map(
        (i: any) =>
          new Interacao(
            i.id,
            i.manifestacao_id,
            i.usuario_id,
            i.tipo,
            i.texto,
            i.status_anterior,
            i.status_novo,
            new Date(i.data_hora)
          )
      )
      .sort((a: Interacao, b: Interacao) => a.dataHora.getTime() - b.dataHora.getTime());

    const respostasUnidade = (row.respostas_unidade || [])
      .map(
        (r: any) =>
          new RespostaUnidade(
            r.id,
            r.manifestacao_id,
            r.usuario_id,
            r.conteudo,
            new Date(r.data_hora)
          )
      )
      .sort((a: RespostaUnidade, b: RespostaUnidade) => a.dataHora.getTime() - b.dataHora.getTime());

    const escalonamentos = (row.escalonamentos || [])
      .map(
        (e: any) =>
          new Escalonamento(
            e.id,
            e.manifestacao_id,
            e.motivo,
            e.nivel,
            e.usuario_id,
            new Date(e.data_hora)
          )
      )
      .sort((a: Escalonamento, b: Escalonamento) => a.dataHora.getTime() - b.dataHora.getTime());

    return Manifestacao.reconstituir({
      id: row.id,
      protocolo: row.protocolo,
      respostaId: row.resposta_id,
      unidadeId: row.unidade_id,
      status: row.status,
      prioridade: row.prioridade,
      responsavelId: row.responsavel_id,
      prazoResposta: new Date(row.prazo_resposta),
      criadoEm: new Date(row.criado_em),
      concluidoEm: row.concluido_em ? new Date(row.concluido_em) : null,
      interacoes,
      respostasUnidade,
      escalonamentos,
    });
  }

  public async buscarPorId(id: string): Promise<Manifestacao | null> {
    const { data, error } = await this.client
      .from('manifestacoes')
      .select('*, interacoes(*), respostas_unidade(*), escalonamentos(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar manifestação por ID no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return this.mapearParaDominio(data);
  }

  public async buscarPorProtocolo(protocolo: string): Promise<Manifestacao | null> {
    const { data, error } = await this.client
      .from('manifestacoes')
      .select('*, interacoes(*), respostas_unidade(*), escalonamentos(*)')
      .ilike('protocolo', protocolo.trim())
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar manifestação por protocolo no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return this.mapearParaDominio(data);
  }

  public async buscarPorRespostaId(respostaId: string): Promise<Manifestacao | null> {
    const { data, error } = await this.client
      .from('manifestacoes')
      .select('*, interacoes(*), respostas_unidade(*), escalonamentos(*)')
      .eq('resposta_id', respostaId)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar manifestação por respostaId no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return this.mapearParaDominio(data);
  }

  public async listar(filtros?: FiltrosManifestacao): Promise<Manifestacao[]> {
    let query = this.client
      .from('manifestacoes')
      .select('*, interacoes(*), respostas_unidade(*), escalonamentos(*)')
      .order('criado_em', { ascending: false });

    if (filtros?.unidadeId) query = query.eq('unidade_id', filtros.unidadeId);
    if (filtros?.status) query = query.eq('status', filtros.status);
    if (filtros?.prioridade) query = query.eq('prioridade', filtros.prioridade);
    if (filtros?.responsavelId) query = query.eq('responsavel_id', filtros.responsavelId);
    if (filtros?.dataInicio) query = query.gte('criado_em', filtros.dataInicio.toISOString());
    if (filtros?.dataFim) query = query.lte('criado_em', filtros.dataFim.toISOString());
    if (filtros?.busca) query = query.ilike('protocolo', `%${filtros.busca.trim()}%`);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar manifestações no Supabase: ${error.message}`);
    }

    const manifestacoes = (data || []).map((row) => this.mapearParaDominio(row));

    // Filtros em memória para critérios calculados (escalonada / pendente)
    return manifestacoes.filter((m) => {
      if (filtros?.escalonada !== undefined) {
        if (filtros.escalonada !== m.escalonamentos.length > 0) return false;
      }
      if (filtros?.pendente) {
        const isPendente =
          m.status === StatusManifestacao.NAO_RESPONDIDA ||
          m.status === StatusManifestacao.ESCALONADA ||
          m.prazoResposta.getTime() < Date.now();
        if (!isPendente) return false;
      }
      return true;
    });
  }

  public async listarPendencias(unidadeId?: string): Promise<Manifestacao[]> {
    let query = this.client
      .from('manifestacoes')
      .select('*, interacoes(*), respostas_unidade(*), escalonamentos(*)')
      .order('prazo_resposta', { ascending: true });

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar pendências no Supabase: ${error.message}`);
    }

    const agora = Date.now();
    const manifestacoes = (data || []).map((row) => this.mapearParaDominio(row));

    return manifestacoes.filter((m) => {
      const ehNaoRespondida = m.status === StatusManifestacao.NAO_RESPONDIDA;
      const ehEscalonada = m.status === StatusManifestacao.ESCALONADA;
      const estAtrasada =
        m.status !== StatusManifestacao.CONCLUIDA &&
        m.status !== StatusManifestacao.RESPONDIDA &&
        m.prazoResposta.getTime() < agora;

      return ehNaoRespondida || ehEscalonada || estAtrasada;
    });
  }
}
