import { Unidade } from '../entities/Unidade';
import { IRepository } from './IRepository';

export interface IUnidadeRepository extends IRepository<Unidade> {
  listarTodas(apenasAtivas?: boolean): Promise<Unidade[]>;
  buscarPorNome(nome: string): Promise<Unidade | null>;
}
