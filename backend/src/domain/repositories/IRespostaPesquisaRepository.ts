import { RespostaPesquisa } from '../entities/RespostaPesquisa';
import { IRepository } from './IRepository';

export interface IRespostaPesquisaRepository extends IRepository<RespostaPesquisa> {
  listarPorPesquisa(pesquisaId: string): Promise<RespostaPesquisa[]>;
  listarPorUnidade(unidadeId: string): Promise<RespostaPesquisa[]>;
  listarTodos(unidadeId?: string): Promise<RespostaPesquisa[]>;
}
