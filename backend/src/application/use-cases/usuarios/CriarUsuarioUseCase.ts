import { randomUUID } from 'crypto';
import { UsuarioFactory } from '../../../domain/entities/Usuario';
import { AcessoNegadoError, ObjetoNaoEncontradoError, RegraNegocioError } from '../../../domain/errors/DomainErrors';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { CriarUsuarioInput, UsuarioOutput } from '../../dtos/AuthDTOs';
import { IPasswordHasher } from '../../services/IPasswordHasher';

export class CriarUsuarioUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async executar(input: CriarUsuarioInput): Promise<UsuarioOutput> {
    const executante = await this.usuarioRepo.buscarPorId(input.executanteId);
    if (!executante) {
      throw new ObjetoNaoEncontradoError('Usuário executante não encontrado.');
    }

    if (!executante.podeGerenciarSistema()) {
      throw new AcessoNegadoError('Apenas administradores podem cadastrar novos usuários.');
    }

    if (!input.senha || input.senha.length < 6) {
      throw new RegraNegocioError('A senha do usuário deve possuir no mínimo 6 caracteres.');
    }

    const emailExistente = await this.usuarioRepo.buscarPorEmail(input.email);
    if (emailExistente) {
      throw new RegraNegocioError(`Já existe um usuário cadastrado com o e-mail ${input.email}.`);
    }

    const novoUsuario = UsuarioFactory.criar({
      id: randomUUID(),
      nome: input.nome,
      email: input.email,
      perfil: input.perfil,
      unidadeId: input.unidadeId,
      ativo: true,
      criadoEm: new Date(),
    });

    const senhaHash = await this.passwordHasher.hash(input.senha);
    await this.usuarioRepo.salvarComSenha(novoUsuario, senhaHash);

    return {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      perfil: novoUsuario.perfil,
      unidadeId: novoUsuario.unidadeId,
      ativo: novoUsuario.ativo,
      criadoEm: novoUsuario.criadoEm,
    };
  }
}
