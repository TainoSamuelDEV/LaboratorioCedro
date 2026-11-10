import { beforeEach, describe, expect, it } from 'vitest';
import { LoginUseCase } from '../../src/application/use-cases/auth/LoginUseCase';
import { ObterUsuarioLogadoUseCase } from '../../src/application/use-cases/auth/ObterUsuarioLogadoUseCase';
import { Administrador, CoordenadorUnidade } from '../../src/domain/entities/Usuario';
import { PerfilUsuario } from '../../src/domain/enums';
import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../src/domain/errors/DomainErrors';
import { BcryptPasswordHasher } from '../../src/application/services/BcryptPasswordHasher';
import { JwtTokenService } from '../../src/application/services/JwtTokenService';
import { InMemoryUsuarioRepository } from '../fakes/InMemoryUsuarioRepository';

describe('Application Layer: Casos de Uso de Autenticacao', () => {
  let usuarioRepo: InMemoryUsuarioRepository;
  let passwordHasher: BcryptPasswordHasher;
  let tokenService: JwtTokenService;
  let loginUseCase: LoginUseCase;
  let obterUsuarioLogadoUseCase: ObterUsuarioLogadoUseCase;

  beforeEach(async () => {
    usuarioRepo = new InMemoryUsuarioRepository();
    passwordHasher = new BcryptPasswordHasher(4); // 4 rounds para testes rápidos
    tokenService = new JwtTokenService('segredo-teste-cedro');
    loginUseCase = new LoginUseCase(usuarioRepo, passwordHasher, tokenService);
    obterUsuarioLogadoUseCase = new ObterUsuarioLogadoUseCase(usuarioRepo);

    // Seed de usuário inicial
    const admin = new Administrador('admin-id', 'Gabriel Admin', 'gabriel@cedro.com.br');
    const hash = await passwordHasher.hash('senha123');
    await usuarioRepo.salvarComSenha(admin, hash);
  });

  it('deve autenticar com sucesso e retornar token JWT e dados do usuario', async () => {
    const output = await loginUseCase.executar({
      email: 'gabriel@cedro.com.br',
      senha: 'senha123',
    });

    expect(output.token).toBeDefined();
    expect(output.usuario.id).toBe('admin-id');
    expect(output.usuario.nome).toBe('Gabriel Admin');
    expect(output.usuario.perfil).toBe(PerfilUsuario.ADMINISTRADOR);

    const decoded = tokenService.verificar(output.token);
    expect(decoded.sub).toBe('admin-id');
    expect(decoded.email).toBe('gabriel@cedro.com.br');
  });

  it('deve rejeitar senha incorreta', async () => {
    await expect(
      loginUseCase.executar({
        email: 'gabriel@cedro.com.br',
        senha: 'senha_errada',
      })
    ).rejects.toThrow(AcessoNegadoError);
  });

  it('deve rejeitar e-mail inexistente', async () => {
    await expect(
      loginUseCase.executar({
        email: 'inexistente@cedro.com.br',
        senha: 'senha123',
      })
    ).rejects.toThrow(AcessoNegadoError);
  });

  it('deve rejeitar login de usuário inativo', async () => {
    const inativo = new CoordenadorUnidade('coord-inativo', 'Dr. Inativo', 'inativo@cedro.com.br', 'unid-1', false);
    const hash = await passwordHasher.hash('senha123');
    await usuarioRepo.salvarComSenha(inativo, hash);

    await expect(
      loginUseCase.executar({
        email: 'inativo@cedro.com.br',
        senha: 'senha123',
      })
    ).rejects.toThrow(AcessoNegadoError);
  });

  it('deve retornar os dados do usuário autenticado no ObterUsuarioLogadoUseCase', async () => {
    const usuario = await obterUsuarioLogadoUseCase.executar('admin-id');
    expect(usuario.id).toBe('admin-id');
    expect(usuario.email).toBe('gabriel@cedro.com.br');
  });

  it('deve lançar erro caso o usuário logado não seja encontrado', async () => {
    await expect(obterUsuarioLogadoUseCase.executar('id-inexistente')).rejects.toThrow(
      ObjetoNaoEncontradoError
    );
  });
});
