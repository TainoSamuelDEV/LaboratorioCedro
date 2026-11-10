import { Usuario } from '../../src/domain/entities/Usuario';
import { IUsuarioRepository } from '../../src/domain/repositories/IUsuarioRepository';

export class InMemoryUsuarioRepository implements IUsuarioRepository {
  public itens: Usuario[] = [];

  public async salvar(usuario: Usuario): Promise<void> {
    const index = this.itens.findIndex((u) => u.id === usuario.id);
    if (index >= 0) {
      this.itens[index] = usuario;
    } else {
      this.itens.push(usuario);
    }
  }

  public async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = this.itens.find((u) => u.id === id);
    return usuario ?? null;
  }

  public async buscarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = this.itens.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return usuario ?? null;
  }

  public async listarTodos(): Promise<Usuario[]> {
    return [...this.itens];
  }

  public async listarPorUnidade(unidadeId: string): Promise<Usuario[]> {
    return this.itens.filter((u) => u.unidadeId === unidadeId);
  }
}
