import { Usuario } from '../entities/Usuario';
import { IRepository } from './IRepository';

export interface UsuarioComCredenciais {
  usuario: Usuario;
  senhaHash: string;
}

export interface IUsuarioRepository extends IRepository<Usuario> {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorEmailComSenha(email: string): Promise<UsuarioComCredenciais | null>;
  salvarComSenha(usuario: Usuario, senhaHash: string): Promise<void>;
  listarTodos(): Promise<Usuario[]>;
  listarPorUnidade(unidadeId: string): Promise<Usuario[]>;
}
