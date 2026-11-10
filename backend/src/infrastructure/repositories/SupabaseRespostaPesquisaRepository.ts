import { SupabaseClient } from '@supabase/supabase-js';
import { RespostaPesquisa } from '../../domain/entities/RespostaPesquisa';
import { IRespostaPesquisaRepository } from '../../domain/repositories/IRespostaPesquisaRepository';
import { obterSupabaseClient } from '../supabase/client';

export class SupabaseRespostaPesquisaRepository implements IRespostaPesquisaRepository {
  constructor(private readonly client: SupabaseClient = obterSupabaseClient()) {}

  public async salvar(resposta: RespostaPesquisa): Promise<void> {
    const { error } = await this.client.from('respostas_pesquisa').upsert({
      id: resposta.id,
      pesquisa_id: resposta.pesquisaId,
      unidade_id: resposta.unidadeId,
      cliente_atendimento: resposta.clienteAtendimento,
      nota: resposta.nota,
      comentario: resposta.comentario,
      data_hora: resposta.dataHora.toISOString(),
    });

    if (error) {
      throw new Error(`Erro ao salvar resposta de pesquisa no Supabase: ${error.message}`);
    }
  }

  public async buscarPorId(id: string): Promise<RespostaPesquisa | null> {
    const { data, error } = await this.client
      .from('respostas_pesquisa')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar resposta por ID no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return new RespostaPesquisa(
      data.id,
      data.pesquisa_id,
      data.unidade_id,
      data.cliente_atendimento,
      data.nota,
      data.comentario,
      new Date(data.data_hora)
    );
  }

  public async listarPorPesquisa(pesquisaId: string): Promise<RespostaPesquisa[]> {
    const { data, error } = await this.client
      .from('respostas_pesquisa')
      .select('*')
      .eq('pesquisa_id', pesquisaId)
      .order('data_hora', { ascending: false });

    if (error) {
      throw new Error(`Erro ao listar respostas por pesquisa no Supabase: ${error.message}`);
    }

    return (data || []).map(
      (row) =>
        new RespostaPesquisa(
          row.id,
          row.pesquisa_id,
          row.unidade_id,
          row.cliente_atendimento,
          row.nota,
          row.comentario,
          new Date(row.data_hora)
        )
    );
  }

  public async listarPorUnidade(unidadeId: string): Promise<RespostaPesquisa[]> {
    const { data, error } = await this.client
      .from('respostas_pesquisa')
      .select('*')
      .eq('unidade_id', unidadeId)
      .order('data_hora', { ascending: false });

    if (error) {
      throw new Error(`Erro ao listar respostas por unidade no Supabase: ${error.message}`);
    }

    return (data || []).map(
      (row) =>
        new RespostaPesquisa(
          row.id,
          row.pesquisa_id,
          row.unidade_id,
          row.cliente_atendimento,
          row.nota,
          row.comentario,
          new Date(row.data_hora)
        )
    );
  }

  public async listarTodos(unidadeId?: string): Promise<RespostaPesquisa[]> {
    let query = this.client.from('respostas_pesquisa').select('*').order('data_hora', { ascending: false });

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar todas as respostas no Supabase: ${error.message}`);
    }

    return (data || []).map(
      (row) =>
        new RespostaPesquisa(
          row.id,
          row.pesquisa_id,
          row.unidade_id,
          row.cliente_atendimento,
          row.nota,
          row.comentario,
          new Date(row.data_hora)
        )
    );
  }
}
