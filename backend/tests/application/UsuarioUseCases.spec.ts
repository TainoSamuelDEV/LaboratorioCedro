import { beforeEach, describe, expect, it } from 'vitest';
import { CriarUsuarioUseCase } from '../../src/application/use-cases/usuarios/CriarUsuarioUseCase';
import { ListarUsuariosUseCase } from '../../src/application/use-cases/usuarios/ListarUsuariosUseCase';
import { Administrador, CoordenadorUnidade, OperadorOuvidoria } from '../../src/domain/entities/Usuario';
import { PerfilUsuario } from '../../src/domain/enums';
import { AcessoNegadoError, RegraNegocioError } from '../../src/domain/errors/DomainErrors';
import { BcryptPasswordHasher } from '../../src/application/services/BcryptPasswordHasher';
import { InMemoryUsuarioRepository } from '../fakes/InMemoryUsuarioRepository';

describe('Application Layer: Casos de Uso de Gestao de Usuarios', () => {
  let usuarioRepo: InMemoryUsuarioRepository;
  let passwordHasher: BcryptPasswordHasher;
  let criarUsuarioUseCase: CriarUsuarioUseCase;
  let listarUsuariosUseCase: ListarUsuariosUseCase;

  beforeEach(async () => {
    usuarioRepo = new InMemoryUsuarioRepository();
    passwordHasher = new BcryptPasswordHasher(4);
    criarUsuarioUseCase = new CriarUsuarioUseCase(usuarioRepo, passwordHasher);
    listarUsuariosUseCase = new ListarUsuariosUseCase(usuarioRepo);

    const admin = new Administrador('admin-1', 'Admin Master', 'admin@cedro.com.br');
    const ouvidor = new OperadorOuvidoria('ouv-1', 'Ouvidor Silva', 'ouvidor@cedro.com.br');
    const coord = new CoordenadorUnidade('coord-1', 'Dr. Roberto', 'coord@cedro.com.br', 'unid-1');

    await usuarioRepo.salvar(admin);
    await usuarioRepo.salvar(ouvidor);
    await usuarioRepo.salvar(coord);
  });

  it('deve permitir que o Administrador crie um novo Coordenador de Unidade com senha hasheada', async () => {
    const output = await criarUsuarioUseCase.executar({
      executanteId: 'admin-1',
      nome: 'Dra. Vanessa',
      email: 'vanessa@cedro.com.br',
      senha: 'segredoForte123',
      perfil: PerfilUsuario.COORDENADOR_UNIDADE,
      unidadeId: 'unid-2',
    });

    expect(output.id).toBeDefined();
    expect(output.nome).toBe('Dra. Vanessa');
    expect(output.perfil).toBe(PerfilUsuario.COORDENADOR_UNIDADE);
    expect(output.unidadeId).toBe('unid-2');

    const credenciais = await usuarioRepo.buscarPorEmailComSenha('vanessa@cedro.com.br');
    expect(credenciais).not.toBeNull();
    const senhaBate = await passwordHasher.comparar('segredoForte123', credenciais!.senhaHash);
    expect(senhaBate).toBe(true);
  });

  it('deve barrar criação de usuário caso executante não seja Administrador', async () => {
    await expect(
      criarUsuarioUseCase.executar({
        executanteId: 'ouv-1', // Operador não pode gerenciar sistema
        nome: 'Teste',
        email: 'teste@cedro.com.br',
        senha: '123456',
        perfil: PerfilUsuario.COORDENADOR_UNIDADE,
        unidadeId: 'unid-1',
      })
    ).rejects.toThrow(AcessoNegadoError);
  });

  it('deve barrar criação com e-mail duplicado', async () => {
    await expect(
      criarUsuarioUseCase.executar({
        executanteId: 'admin-1',
        nome: 'Outro Admin',
        email: 'admin@cedro.com.br', // Já existe
        senha: '123456',
        perfil: PerfilUsuario.ADMINISTRADOR,
      })
    ).rejects.toThrow(RegraNegocioError);
  });

  it('deve permitir listar usuários para Administrador e Ouvidoria, mas barrar Coordenador', async () => {
    const listaAdmin = await listarUsuariosUseCase.executar('admin-1');
    expect(listaAdmin).toHaveLength(3);

    const listaOuvidor = await listarUsuariosUseCase.executar('ouv-1');
    expect(listaOuvidor).toHaveLength(3);

    await expect(listarUsuariosUseCase.executar('coord-1')).rejects.toThrow(AcessoNegadoError);
  });
});
