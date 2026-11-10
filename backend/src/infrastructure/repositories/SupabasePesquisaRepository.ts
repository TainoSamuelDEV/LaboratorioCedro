import { SupabaseClient } from '@supabase/supabase-js';
import { Pesquisa } from '../../domain/entities/Pesquisa';
import { IPesquisaRepository } from '../../domain/repositories/IPesquisaRepository';
import { obterSupabaseClient } from '../supabase/client';

export class SupabasePesquisaRepository implements IPesquisaRepository {
  constructor(private readonly client: SupabaseClient = obterSupabaseClient()) {}

  public async salvar(pesquisa: Pesquisa): Promise<void> {
    const { error } = await this.client.from('pesquisas').upsert({
      id: pesquisa.id,
      titulo: pesquisa.titulo,
      descricao: pesquisa.descricao,
      periodo: pesquisa.periodo,
      canal: pesquisa.canal,
      ativa: pesquisa.ativa,
      unidade_padrao_id: pesquisa.unidadePadraoId,
      criado_em: pesquisa.criadoEm.toISOString(),
    });

    if (error) {
      throw new Error(`Erro ao salvar pesquisa no Supabase: ${error.message}`);
    }
  }

  public async buscarPorId(id: string): Promise<Pesquisa | null> {
    const { data, error } = await this.client
      .from('pesquisas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === '22P02') return null;
      throw new Error(`Erro ao buscar pesquisa por ID no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return new Pesquisa(
      data.id,
      data.titulo,
      data.descricao,
      data.periodo,
      data.canal,
      data.ativa,
      data.unidade_padrao_id,
      new Date(data.criado_em)
    );
  }

  public async listarTodas(apenasAtivas: boolean = false): Promise<Pesquisa[]> {
    let query = this.client.from('pesquisas').select('*').order('criado_em', { ascending: false });

    if (apenasAtivas) {
      query = query.eq('ativa', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar pesquisas no Supabase: ${error.message}`);
    }

    return (data || []).map(
      (row) =>
        new Pesquisa(
          row.id,
          row.titulo,
          row.descricao,
          row.periodo,
          row.canal,
          row.ativa,
          row.unidade_padrao_id,
          new Date(row.criado_em)
        )
    );
  }
}
