import { Pesquisa } from '../../src/domain/entities/Pesquisa';
import { IPesquisaRepository } from '../../src/domain/repositories/IPesquisaRepository';

export class InMemoryPesquisaRepository implements IPesquisaRepository {
  public itens: Pesquisa[] = [];

  public async salvar(pesquisa: Pesquisa): Promise<void> {
    const index = this.itens.findIndex((p) => p.id === pesquisa.id);
    if (index >= 0) {
      this.itens[index] = pesquisa;
    } else {
      this.itens.push(pesquisa);
    }
  }

  public async buscarPorId(id: string): Promise<Pesquisa | null> {
    const pesquisa = this.itens.find((p) => p.id === id);
    return pesquisa ?? null;
  }

  public async listarTodas(apenasAtivas: boolean = false): Promise<Pesquisa[]> {
    if (apenasAtivas) {
      return this.itens.filter((p) => p.ativa);
    }
    return [...this.itens];
  }
}
