import { Unidade } from '../../src/domain/entities/Unidade';
import { IUnidadeRepository } from '../../src/domain/repositories/IUnidadeRepository';

export class InMemoryUnidadeRepository implements IUnidadeRepository {
  public itens: Unidade[] = [];

  public async salvar(unidade: Unidade): Promise<void> {
    const index = this.itens.findIndex((u) => u.id === unidade.id);
    if (index >= 0) {
      this.itens[index] = unidade;
    } else {
      this.itens.push(unidade);
    }
  }

  public async buscarPorId(id: string): Promise<Unidade | null> {
    const unidade = this.itens.find((u) => u.id === id);
    return unidade ?? null;
  }

  public async buscarPorNome(nome: string): Promise<Unidade | null> {
    const unidade = this.itens.find((u) => u.nome.toLowerCase() === nome.toLowerCase());
    return unidade ?? null;
  }

  public async listarTodas(apenasAtivas: boolean = false): Promise<Unidade[]> {
    if (apenasAtivas) {
      return this.itens.filter((u) => u.ativa);
    }
    return [...this.itens];
  }
}
