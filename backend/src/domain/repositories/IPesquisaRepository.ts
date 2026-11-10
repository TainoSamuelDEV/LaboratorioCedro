import { Pesquisa } from '../entities/Pesquisa';
import { IRepository } from './IRepository';

export interface IPesquisaRepository extends IRepository<Pesquisa> {
  listarTodas(apenasAtivas?: boolean): Promise<Pesquisa[]>;
}
