import { Usuario } from '../../src/domain/entities/Usuario';
import {
  IUsuarioRepository,
  UsuarioComCredenciais,
} from '../../src/domain/repositories/IUsuarioRepository';

export class InMemoryUsuarioRepository implements IUsuarioRepository {
  public itens: Usuario[] = [];
  public senhasHash: Map<string, string> = new Map();

  public async salvar(usuario: Usuario): Promise<void> {
    const index = this.itens.findIndex((u) => u.id === usuario.id);
    if (index >= 0) {
      this.itens[index] = usuario;
    } else {
      this.itens.push(usuario);
    }
  }

  public async salvarComSenha(usuario: Usuario, senhaHash: string): Promise<void> {
    await this.salvar(usuario);
    this.senhasHash.set(usuario.id, senhaHash);
  }

  public async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = this.itens.find((u) => u.id === id);
    return usuario ?? null;
  }

  public async buscarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = this.itens.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return usuario ?? null;
  }

  public async buscarPorEmailComSenha(email: string): Promise<UsuarioComCredenciais | null> {
    const usuario = await this.buscarPorEmail(email);
    if (!usuario) return null;
    const senhaHash = this.senhasHash.get(usuario.id) ?? '';
    return { usuario, senhaHash };
  }

  public async listarTodos(): Promise<Usuario[]> {
    return [...this.itens];
  }

  public async listarPorUnidade(unidadeId: string): Promise<Usuario[]> {
    return this.itens.filter((u) => u.unidadeId === unidadeId);
  }
}
