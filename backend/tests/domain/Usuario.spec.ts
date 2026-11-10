import { describe, expect, it } from 'vitest';
import {
  Administrador,
  CoordenadorUnidade,
  OperadorOuvidoria,
  UsuarioFactory,
} from '../../src/domain/entities/Usuario';
import { PerfilUsuario } from '../../src/domain/enums';
import { RegraNegocioError } from '../../src/domain/errors/DomainErrors';

describe('Dominio POO: Hierarquia e Polimorfismo de Usuario', () => {
  const unidadeA = 'unidade-uuid-001';
  const unidadeB = 'unidade-uuid-002';

  it('deve instanciar CoordenadorUnidade com unidade vinculada e validar acesso restrito', () => {
    const coord = new CoordenadorUnidade('u1', 'Carlos Coordenador', 'carlos@cedro.com.br', unidadeA);

    expect(coord.perfil).toBe(PerfilUsuario.COORDENADOR_UNIDADE);
    expect(coord.unidadeId).toBe(unidadeA);
    expect(coord.ativo).toBe(true);

    // Permissões restritas à sua unidade
    expect(coord.podeVisualizarManifestacao(unidadeA)).toBe(true);
    expect(coord.podeVisualizarManifestacao(unidadeB)).toBe(false);
    expect(coord.podeTratarPelaUnidade(unidadeA)).toBe(true);
    expect(coord.podeTratarPelaUnidade(unidadeB)).toBe(false);

    // Não possui permissão de ouvidoria/gestão global
    expect(coord.podeEscalonar()).toBe(false);
    expect(coord.podeSolicitarComplemento()).toBe(false);
    expect(coord.podeConcluir()).toBe(false);
    expect(coord.podeGerenciarSistema()).toBe(false);
  });

  it('deve lançar erro ao tentar instanciar CoordenadorUnidade sem vincular uma unidade', () => {
    expect(() => {
      new CoordenadorUnidade('u1', 'Carlos', 'carlos@cedro.com.br', '');
    }).toThrow(RegraNegocioError);
  });

  it('deve instanciar OperadorOuvidoria com permissões operacionais globais', () => {
    const op = new OperadorOuvidoria('u2', 'Marina Ouvidoria', 'marina@cedro.com.br');

    expect(op.perfil).toBe(PerfilUsuario.OPERADOR_OUVIDORIA);
    expect(op.unidadeId).toBeNull();

    // Visualiza qualquer unidade
    expect(op.podeVisualizarManifestacao(unidadeA)).toBe(true);
    expect(op.podeVisualizarManifestacao(unidadeB)).toBe(true);

    // Não responde em nome da unidade médica/operacional
    expect(op.podeTratarPelaUnidade(unidadeA)).toBe(false);

    // Pode escalonar, pedir complemento e concluir
    expect(op.podeEscalonar()).toBe(true);
    expect(op.podeSolicitarComplemento()).toBe(true);
    expect(op.podeConcluir()).toBe(true);
    expect(op.podeGerenciarSistema()).toBe(false);
  });

  it('deve instanciar Administrador com permissão total', () => {
    const admin = new Administrador('u3', 'Gabriel Admin', 'gabriel@cedro.com.br');

    expect(admin.perfil).toBe(PerfilUsuario.ADMINISTRADOR);
    expect(admin.podeVisualizarManifestacao(unidadeA)).toBe(true);
    expect(admin.podeEscalonar()).toBe(true);
    expect(admin.podeSolicitarComplemento()).toBe(true);
    expect(admin.podeConcluir()).toBe(true);
    expect(admin.podeGerenciarSistema()).toBe(true);
  });

  it('deve negar ações se o usuário estiver desativado', () => {
    const coord = new CoordenadorUnidade('u1', 'Carlos', 'carlos@cedro.com.br', unidadeA);
    coord.desativar();

    expect(coord.ativo).toBe(false);
    expect(coord.podeVisualizarManifestacao(unidadeA)).toBe(false);
    expect(coord.podeTratarPelaUnidade(unidadeA)).toBe(false);
  });

  it('deve instanciar usuários corretamente através de UsuarioFactory', () => {
    const user = UsuarioFactory.criar({
      id: 'u-fact-1',
      nome: 'Taino User',
      email: 'taino@cedro.com.br',
      perfil: PerfilUsuario.COORDENADOR_UNIDADE,
      unidadeId: unidadeA,
    });

    expect(user).toBeInstanceOf(CoordenadorUnidade);
    expect(user.perfil).toBe(PerfilUsuario.COORDENADOR_UNIDADE);
  });
});
