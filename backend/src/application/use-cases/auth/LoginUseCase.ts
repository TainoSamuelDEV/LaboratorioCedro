import { AcessoNegadoError, RegraNegocioError } from '../../../domain/errors/DomainErrors';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { LoginInput, LoginOutput } from '../../dtos/AuthDTOs';
import { IPasswordHasher } from '../../services/IPasswordHasher';
import { ITokenService } from '../../services/ITokenService';

export class LoginUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  public async executar(input: LoginInput): Promise<LoginOutput> {
    if (!input.email || !input.senha) {
      throw new RegraNegocioError('E-mail e senha são obrigatórios.');
    }

    const credenciais = await this.usuarioRepo.buscarPorEmailComSenha(input.email);
    if (!credenciais) {
      throw new AcessoNegadoError('Credenciais inválidas.');
    }

    const { usuario, senhaHash } = credenciais;

    if (!usuario.ativo) {
      throw new AcessoNegadoError('Usuário inativo. Entre em contato com o administrador.');
    }

    const senhaValida = await this.passwordHasher.comparar(input.senha, senhaHash);
    if (!senhaValida) {
      throw new AcessoNegadoError('Credenciais inválidas.');
    }

    const token = this.tokenService.gerar({
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      unidadeId: usuario.unidadeId,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        unidadeId: usuario.unidadeId,
        ativo: usuario.ativo,
        criadoEm: usuario.criadoEm,
      },
    };
  }
}
