import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioOutput } from '../../dtos/AuthDTOs';

export class ObterUsuarioLogadoUseCase {
  constructor(private readonly usuarioRepo: IUsuarioRepository) {}

  public async executar(usuarioId: string): Promise<UsuarioOutput> {
    const usuario = await this.usuarioRepo.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário não encontrado.');
    }

    if (!usuario.ativo) {
      throw new AcessoNegadoError('Usuário inativo.');
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      unidadeId: usuario.unidadeId,
      ativo: usuario.ativo,
      criadoEm: usuario.criadoEm,
    };
  }
}
