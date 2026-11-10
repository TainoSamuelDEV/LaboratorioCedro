import { RespostaPesquisa } from '../../src/domain/entities/RespostaPesquisa';
import { IRespostaPesquisaRepository } from '../../src/domain/repositories/IRespostaPesquisaRepository';

export class InMemoryRespostaPesquisaRepository implements IRespostaPesquisaRepository {
  public itens: RespostaPesquisa[] = [];

  public async salvar(resposta: RespostaPesquisa): Promise<void> {
    const index = this.itens.findIndex((r) => r.id === resposta.id);
    if (index >= 0) {
      this.itens[index] = resposta;
    } else {
      this.itens.push(resposta);
    }
  }

  public async buscarPorId(id: string): Promise<RespostaPesquisa | null> {
    const resposta = this.itens.find((r) => r.id === id);
    return resposta ?? null;
  }

  public async listarPorPesquisa(pesquisaId: string): Promise<RespostaPesquisa[]> {
    return this.itens.filter((r) => r.pesquisaId === pesquisaId);
  }

  public async listarPorUnidade(unidadeId: string): Promise<RespostaPesquisa[]> {
    return this.itens.filter((r) => r.unidadeId === unidadeId);
  }

  public async listarTodos(unidadeId?: string): Promise<RespostaPesquisa[]> {
    if (unidadeId) {
      return this.itens.filter((r) => r.unidadeId === unidadeId);
    }
    return [...this.itens];
  }
}
