import { SupabaseClient } from '@supabase/supabase-js';
import { Usuario, UsuarioFactory } from '../../domain/entities/Usuario';
import {
  IUsuarioRepository,
  UsuarioComCredenciais,
} from '../../domain/repositories/IUsuarioRepository';
import { obterSupabaseClient } from '../supabase/client';

export class SupabaseUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly client: SupabaseClient = obterSupabaseClient()) {}

  public async salvar(usuario: Usuario): Promise<void> {
    const { error } = await this.client.from('usuarios').upsert(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        unidade_id: usuario.unidadeId,
        ativo: usuario.ativo,
        criado_em: usuario.criadoEm.toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );

    if (error) {
      throw new Error(`Erro ao salvar usuário no Supabase: ${error.message}`);
    }
  }

  public async salvarComSenha(usuario: Usuario, senhaHash: string): Promise<void> {
    const { error } = await this.client.from('usuarios').upsert(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        senha_hash: senhaHash,
        perfil: usuario.perfil,
        unidade_id: usuario.unidadeId,
        ativo: usuario.ativo,
        criado_em: usuario.criadoEm.toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      throw new Error(`Erro ao salvar usuário com credenciais no Supabase: ${error.message}`);
    }
  }

  public async buscarPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar usuário por ID no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return UsuarioFactory.criar({
      id: data.id,
      nome: data.nome,
      email: data.email,
      perfil: data.perfil,
      unidadeId: data.unidade_id,
      ativo: data.ativo,
      criadoEm: new Date(data.criado_em),
    });
  }

  public async buscarPorEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar usuário por e-mail no Supabase: ${error.message}`);
    }

    if (!data) return null;

    return UsuarioFactory.criar({
      id: data.id,
      nome: data.nome,
      email: data.email,
      perfil: data.perfil,
      unidadeId: data.unidade_id,
      ativo: data.ativo,
      criadoEm: new Date(data.criado_em),
    });
  }

  public async buscarPorEmailComSenha(email: string): Promise<UsuarioComCredenciais | null> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error) {
      throw new Error(`Erro ao buscar credenciais de usuário no Supabase: ${error.message}`);
    }

    if (!data) return null;

    const usuario = UsuarioFactory.criar({
      id: data.id,
      nome: data.nome,
      email: data.email,
      perfil: data.perfil,
      unidadeId: data.unidade_id,
      ativo: data.ativo,
      criadoEm: new Date(data.criado_em),
    });

    return {
      usuario,
      senhaHash: data.senha_hash,
    };
  }

  public async listarTodos(): Promise<Usuario[]> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar usuários no Supabase: ${error.message}`);
    }

    return (data || []).map((row) =>
      UsuarioFactory.criar({
        id: row.id,
        nome: row.nome,
        email: row.email,
        perfil: row.perfil,
        unidadeId: row.unidade_id,
        ativo: row.ativo,
        criadoEm: new Date(row.criado_em),
      })
    );
  }

  public async listarPorUnidade(unidadeId: string): Promise<Usuario[]> {
    const { data, error } = await this.client
      .from('usuarios')
      .select('*')
      .eq('unidade_id', unidadeId)
      .order('nome', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar usuários por unidade no Supabase: ${error.message}`);
    }

    return (data || []).map((row) =>
      UsuarioFactory.criar({
        id: row.id,
        nome: row.nome,
        email: row.email,
        perfil: row.perfil,
        unidadeId: row.unidade_id,
        ativo: row.ativo,
        criadoEm: new Date(row.criado_em),
      })
    );
  }
}
