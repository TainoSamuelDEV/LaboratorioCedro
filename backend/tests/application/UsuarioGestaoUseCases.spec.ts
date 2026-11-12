import { describe, it, expect, beforeEach } from 'vitest';
import { PerfilUsuario, StatusManifestacao, PrioridadeManifestacao, TipoInteracao } from '../../src/domain/enums';
import { Administrador, CoordenadorUnidade, OperadorOuvidoria, Usuario } from '../../src/domain/entities/Usuario';
import { Unidade } from '../../src/domain/entities/Unidade';
import { Manifestacao } from '../../src/domain/entities/Manifestacao';
import { Interacao } from '../../src/domain/entities/Interacao';
import { RespostaUnidade } from '../../src/domain/entities/RespostaUnidade';
import { IUsuarioRepository, UsuarioComCredenciais } from '../../src/domain/repositories/IUsuarioRepository';
import { IUnidadeRepository } from '../../src/domain/repositories/IUnidadeRepository';
import { IManifestacaoRepository } from '../../src/domain/repositories/IManifestacaoRepository';
import { IPasswordHasher } from '../../src/application/services/IPasswordHasher';
import { ObterUsuarioPorIdUseCase } from '../../src/application/use-cases/usuarios/ObterUsuarioPorIdUseCase';
import { AtualizarUsuarioUseCase } from '../../src/application/use-cases/usuarios/AtualizarUsuarioUseCase';
import { AcessoNegadoError, RecursoNaoEncontradoError, RegraNegocioError } from '../../src/domain/errors/DomainErrors';

class FakePasswordHasher implements IPasswordHasher {
  async hash(senha: string): Promise<string> {
    return `hashed_${senha}`;
  }
  async comparar(senha: string, hash: string): Promise<boolean> {
    return hash === `hashed_${senha}`;
  }
}

class FakeUsuarioRepo implements IUsuarioRepository {
  public usuarios: Map<string, Usuario> = new Map();
  public senhas: Map<string, string> = new Map();

  async salvar(u: Usuario): Promise<void> {
    this.usuarios.set(u.id, u);
  }

  async salvarComSenha(u: Usuario, senhaHash: string): Promise<void> {
    this.usuarios.set(u.id, u);
    this.senhas.set(u.id, senhaHash);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.get(id) || null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    for (const u of this.usuarios.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  async buscarPorEmailComSenha(email: string): Promise<UsuarioComCredenciais | null> {
    const u = await this.buscarPorEmail(email);
    if (!u) return null;
    return { usuario: u, senhaHash: this.senhas.get(u.id) || 'hash' };
  }

  async listarTodos(): Promise<Usuario[]> {
    return Array.from(this.usuarios.values());
  }

  async listarPorUnidade(unidadeId: string): Promise<Usuario[]> {
    return Array.from(this.usuarios.values()).filter((u) => u.unidadeId === unidadeId);
  }
}

class FakeUnidadeRepo implements IUnidadeRepository {
  private unidades: Map<string, Unidade> = new Map();

  async salvar(u: Unidade): Promise<void> {
    this.unidades.set(u.id, u);
  }

  async buscarPorId(id: string): Promise<Unidade | null> {
    return this.unidades.get(id) || null;
  }

  async listarTodas(): Promise<Unidade[]> {
    return Array.from(this.unidades.values());
  }
}

class FakeManifestacaoRepo implements IManifestacaoRepository {
  public manifestacoes: Manifestacao[] = [];

  async salvar(m: Manifestacao): Promise<void> {
    const idx = this.manifestacoes.findIndex((x) => x.id === m.id);
    if (idx >= 0) this.manifestacoes[idx] = m;
    else this.manifestacoes.push(m);
  }

  async buscarPorId(id: string): Promise<Manifestacao | null> {
    return this.manifestacoes.find((m) => m.id === id) || null;
  }

  async buscarPorProtocolo(protocolo: string): Promise<Manifestacao | null> {
    return this.manifestacoes.find((m) => m.protocolo === protocolo) || null;
  }

  async buscarPorRespostaId(respostaId: string): Promise<Manifestacao | null> {
    return this.manifestacoes.find((m) => m.respostaId === respostaId) || null;
  }

  async listar(): Promise<Manifestacao[]> {
    return [...this.manifestacoes];
  }

  async listarPendencias(): Promise<Manifestacao[]> {
    return this.manifestacoes.filter((m) => m.status !== StatusManifestacao.CONCLUIDA);
  }
}

describe('Casos de Uso de Gestão de Usuários', () => {
  let usuarioRepo: FakeUsuarioRepo;
  let unidadeRepo: FakeUnidadeRepo;
  let manifestacaoRepo: FakeManifestacaoRepo;
  let passwordHasher: FakePasswordHasher;

  let obterUsuarioPorIdUseCase: ObterUsuarioPorIdUseCase;
  let atualizarUsuarioUseCase: AtualizarUsuarioUseCase;

  const admin = new Administrador('admin-1', 'Admin Master', 'admin@cedro.com.br', true);
  const ouvidor = new OperadorOuvidoria('ouv-1', 'Amanda Ouvidoria', 'amanda@cedro.com.br', true);
  const unidadeCohama = new Unidade('unid-cohama', 'Unidade Cohama', 'Dr. Silva', true, 48);
  const coord = new CoordenadorUnidade('coord-1', 'Dr. Roberto', 'roberto@cedro.com.br', unidadeCohama.id, true);

  beforeEach(async () => {
    usuarioRepo = new FakeUsuarioRepo();
    unidadeRepo = new FakeUnidadeRepo();
    manifestacaoRepo = new FakeManifestacaoRepo();
    passwordHasher = new FakePasswordHasher();

    await usuarioRepo.salvar(admin);
    await usuarioRepo.salvar(ouvidor);
    await usuarioRepo.salvar(coord);
    await unidadeRepo.salvar(unidadeCohama);

    obterUsuarioPorIdUseCase = new ObterUsuarioPorIdUseCase(usuarioRepo, unidadeRepo, manifestacaoRepo);
    atualizarUsuarioUseCase = new AtualizarUsuarioUseCase(usuarioRepo, unidadeRepo, passwordHasher);
  });

  describe('ObterUsuarioPorIdUseCase', () => {
    it('deve retornar ficha detalhada do usuário e resumo de auditoria', async () => {
      // Criar uma manifestação com 1 interação registrada por Amanda (ouv-1)
      const interacao = new Interacao(
        'int-1',
        'man-1',
        ouvidor.id,
        TipoInteracao.ENCAMINHAMENTO,
        'Encaminhado para a unidade',
        StatusManifestacao.NOVA,
        StatusManifestacao.EM_TRATAMENTO,
        new Date()
      );

      const man = Manifestacao.reconstituir({
        id: 'man-1',
        protocolo: 'CED-2026-000099',
        respostaId: 'resp-1',
        unidadeId: unidadeCohama.id,
        status: StatusManifestacao.EM_TRATAMENTO,
        prioridade: PrioridadeManifestacao.MEDIA,
        responsavelId: null,
        prazoResposta: new Date(Date.now() + 86400000),
        criadoEm: new Date(),
        concluidoEm: null,
        interacoes: [interacao],
        respostasUnidade: [],
        escalonamentos: [],
      });
      await manifestacaoRepo.salvar(man);

      const resultado = await obterUsuarioPorIdUseCase.executar(ouvidor.id);

      expect(resultado.id).toBe(ouvidor.id);
      expect(resultado.nome).toBe('Amanda Ouvidoria');
      expect(resultado.perfil).toBe(PerfilUsuario.OPERADOR_OUVIDORIA);
      expect(resultado.auditoria.totalInteracoes).toBe(1);
      expect(resultado.auditoria.totalRespostasUnidade).toBe(0);
    });

    it('deve retornar dados do coordenador com nome da unidade vinculada', async () => {
      const resultado = await obterUsuarioPorIdUseCase.executar(coord.id);

      expect(resultado.id).toBe(coord.id);
      expect(resultado.nome).toBe('Dr. Roberto');
      expect(resultado.perfil).toBe(PerfilUsuario.COORDENADOR_UNIDADE);
      expect(resultado.unidadeNome).toBe('Unidade Cohama');
    });

    it('deve lançar RecursoNaoEncontradoError se o usuário não existir', async () => {
      await expect(obterUsuarioPorIdUseCase.executar('inexistente')).rejects.toThrow(RecursoNaoEncontradoError);
    });
  });

  describe('AtualizarUsuarioUseCase', () => {
    it('deve atualizar nome, email e senha de um usuário pelo Administrador', async () => {
      const atualizado = await atualizarUsuarioUseCase.executar({
        id: ouvidor.id,
        executanteId: admin.id,
        nome: 'Amanda Santos Ouvidoria',
        email: 'amanda.santos@cedro.com.br',
        senha: 'novaSenhaForte123',
      });

      expect(atualizado.nome).toBe('Amanda Santos Ouvidoria');
      expect(atualizado.email).toBe('amanda.santos@cedro.com.br');
      expect(usuarioRepo.senhas.get(ouvidor.id)).toBe('hashed_novaSenhaForte123');
    });

    it('deve permitir desativar (Soft Delete) e reativar usuário', async () => {
      const desativado = await atualizarUsuarioUseCase.executar({
        id: coord.id,
        executanteId: admin.id,
        ativo: false,
      });

      expect(desativado.ativo).toBe(false);

      const reativado = await atualizarUsuarioUseCase.executar({
        id: coord.id,
        executanteId: admin.id,
        ativo: true,
      });

      expect(reativado.ativo).toBe(true);
    });

    it('deve impedir que usuário não-administrador altere outro usuário', async () => {
      await expect(
        atualizarUsuarioUseCase.executar({
          id: coord.id,
          executanteId: ouvidor.id,
          nome: 'Nome Inválido',
        })
      ).rejects.toThrow(AcessoNegadoError);
    });

    it('deve impedir criação ou atualização de Coordenador sem Unidade vinculada', async () => {
      await expect(
        atualizarUsuarioUseCase.executar({
          id: coord.id,
          executanteId: admin.id,
          perfil: PerfilUsuario.COORDENADOR_UNIDADE,
          unidadeId: null,
        })
      ).rejects.toThrow(RegraNegocioError);
    });
  });
});
