import { SupabaseClient } from '@supabase/supabase-js';
import { Unidade } from '../../domain/entities/Unidade';
import { IUnidadeRepository } from '../../domain/repositories/IUnidadeRepository';
import { obterSupabaseClient } from '../supabase/client';

export class SupabaseUnidadeRepository implements IUnidadeRepository {
  constructor(private readonly client: SupabaseClient = obterSupabaseClient()) {}

  public async salvar(unidade: Unidade): Promise<void> {
    const { error } = await this.client.from('unidades').upsert({
      id: unidade.id,
      nome: unidade.nome,
      responsavel_nome: unidade.responsavelNome,
      ativa: unidade.ativa,
      prazo_padrao_horas: unidade.prazoPadraoHoras,
      criado_em: unidade.criadoEm.toISOString(),
    });

    if (error) {
      throw new Error(`Erro ao salvar unidade no Supabase: ${error.message}`);
    }
  }

  public async buscarPorId(id: string): Promise<Unidade | null> {
    const { data, error } = await this.client
      .from('unidades')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === '22P02') return null;
      throw new Error(`Erro ao buscar unidade por ID no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return new Unidade(
      data.id,
      data.nome,
      data.responsavel_nome,
      data.ativa,
      data.prazo_padrao_horas,
      new Date(data.criado_em)
    );
  }

  public async buscarPorNome(nome: string): Promise<Unidade | null> {
    const { data, error } = await this.client
      .from('unidades')
      .select('*')
      .ilike('nome', nome.trim())
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar unidade por nome no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return new Unidade(
      data.id,
      data.nome,
      data.responsavel_nome,
      data.ativa,
      data.prazo_padrao_horas,
      new Date(data.criado_em)
    );
  }

  public async listarTodas(apenasAtivas: boolean = false): Promise<Unidade[]> {
    let query = this.client.from('unidades').select('*').order('nome', { ascending: true });

    if (apenasAtivas) {
      query = query.eq('ativa', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar unidades no Supabase: ${error.message}`);
    }

    return (data || []).map(
      (row) =>
        new Unidade(
          row.id,
          row.nome,
          row.responsavel_nome,
          row.ativa,
          row.prazo_padrao_horas,
          new Date(row.criado_em)
        )
    );
  }
}
