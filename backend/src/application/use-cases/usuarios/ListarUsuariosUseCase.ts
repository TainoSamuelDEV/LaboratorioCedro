import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UsuarioOutput } from '../../dtos/AuthDTOs';

export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepo: IUsuarioRepository) {}

  public async executar(executanteId: string): Promise<UsuarioOutput[]> {
    const executante = await this.usuarioRepo.buscarPorId(executanteId);
    if (!executante) {
      throw new ObjetoNaoEncontradoError('Usuário executante não encontrado.');
    }

    // Apenas Administrador ou Operador de Ouvidoria podem listar os usuários internos
    if (!executante.podeGerenciarSistema() && !executante.podeEscalonar()) {
      throw new AcessoNegadoError('Acesso não autorizado para listagem de usuários.');
    }

    const usuarios = await this.usuarioRepo.listarTodos();
    return usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      unidadeId: u.unidadeId,
      ativo: u.ativo,
      criadoEm: u.criadoEm,
    }));
  }
}
