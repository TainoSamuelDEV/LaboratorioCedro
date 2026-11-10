import { Usuario } from '../entities/Usuario';
import { IRepository } from './IRepository';

export interface IUsuarioRepository extends IRepository<Usuario> {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  listarTodos(): Promise<Usuario[]>;
  listarPorUnidade(unidadeId: string): Promise<Usuario[]>;
}
