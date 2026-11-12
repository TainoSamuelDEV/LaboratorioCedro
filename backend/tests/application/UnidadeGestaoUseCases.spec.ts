import { describe, it, expect, beforeEach } from 'vitest';
import { CanalPesquisa, PerfilUsuario, StatusManifestacao, PrioridadeManifestacao } from '../../src/domain/enums';
import { Unidade } from '../../src/domain/entities/Unidade';
import { Pesquisa } from '../../src/domain/entities/Pesquisa';
import { RespostaPesquisa } from '../../src/domain/entities/RespostaPesquisa';
import { Manifestacao } from '../../src/domain/entities/Manifestacao';
import { CoordenadorUnidade, Usuario } from '../../src/domain/entities/Usuario';
import { IUnidadeRepository } from '../../src/domain/repositories/IUnidadeRepository';
import { IManifestacaoRepository } from '../../src/domain/repositories/IManifestacaoRepository';
import { IRespostaPesquisaRepository } from '../../src/domain/repositories/IRespostaPesquisaRepository';
import { IPesquisaRepository } from '../../src/domain/repositories/IPesquisaRepository';
import { IUsuarioRepository } from '../../src/domain/repositories/IUsuarioRepository';
import { ObterUnidadePorIdUseCase } from '../../src/application/use-cases/unidades/ObterUnidadePorIdUseCase';
import { RecursoNaoEncontradoError } from '../../src/domain/errors/DomainErrors';

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

class FakeRespostaRepo implements IRespostaPesquisaRepository {
  public respostas: RespostaPesquisa[] = [];

  async salvar(r: RespostaPesquisa): Promise<void> {
    this.respostas.push(r);
  }

  async buscarPorId(id: string): Promise<RespostaPesquisa | null> {
    return this.respostas.find((r) => r.id === id) || null;
  }

  async listarPorPesquisa(pesquisaId: string): Promise<RespostaPesquisa[]> {
    return this.respostas.filter((r) => r.pesquisaId === pesquisaId);
  }

  async listarPorUnidade(unidadeId: string): Promise<RespostaPesquisa[]> {
    return this.respostas.filter((r) => r.unidadeId === unidadeId);
  }

  async listarTodos(): Promise<RespostaPesquisa[]> {
    return [...this.respostas];
  }
}

class FakePesquisaRepo implements IPesquisaRepository {
  private pesquisas: Map<string, Pesquisa> = new Map();

  async salvar(p: Pesquisa): Promise<void> {
    this.pesquisas.set(p.id, p);
  }

  async buscarPorId(id: string): Promise<Pesquisa | null> {
    return this.pesquisas.get(id) || null;
  }

  async listarTodas(apenasAtivas?: boolean): Promise<Pesquisa[]> {
    const todas = Array.from(this.pesquisas.values());
    return apenasAtivas ? todas.filter((p) => p.ativa) : todas;
  }
}

class FakeUsuarioRepo implements IUsuarioRepository {
  private usuarios: Map<string, Usuario> = new Map();

  async salvar(u: Usuario): Promise<void> {
    this.usuarios.set(u.id, u);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.get(id) || null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    for (const u of this.usuarios.values()) {
      if (u.email === email) return u;
    }
    return null;
  }

  async listarTodos(): Promise<Usuario[]> {
    return Array.from(this.usuarios.values());
  }

  async listarPorUnidade(unidadeId: string): Promise<Usuario[]> {
    return Array.from(this.usuarios.values()).filter((u) => u.unidadeId === unidadeId);
  }
}

describe('ObterUnidadePorIdUseCase', () => {
  let unidadeRepo: FakeUnidadeRepo;
  let manifestacaoRepo: FakeManifestacaoRepo;
  let respostaRepo: FakeRespostaRepo;
  let pesquisaRepo: FakePesquisaRepo;
  let usuarioRepo: FakeUsuarioRepo;

  let useCase: ObterUnidadePorIdUseCase;

  const unidade = new Unidade(
    'unidade-cohama',
    'Unidade Cohama',
    'Dra. Carla Medeiros',
    true,
    48
  );

  const pesquisa = new Pesquisa(
    'pesquisa-1',
    'Satisfação Coleta',
    'Avaliação',
    'Novembro/2026',
    CanalPesquisa.QR_CODE,
    true,
    unidade.id
  );

  const coordenador = new CoordenadorUnidade(
    'coord-1',
    'Dr. Roberto',
    'roberto@cedro.com.br',
    unidade.id,
    true
  );

  beforeEach(async () => {
    unidadeRepo = new FakeUnidadeRepo();
    manifestacaoRepo = new FakeManifestacaoRepo();
    respostaRepo = new FakeRespostaRepo();
    pesquisaRepo = new FakePesquisaRepo();
    usuarioRepo = new FakeUsuarioRepo();

    await unidadeRepo.salvar(unidade);
    await pesquisaRepo.salvar(pesquisa);
    await usuarioRepo.salvar(coordenador);

    useCase = new ObterUnidadePorIdUseCase(
      unidadeRepo,
      manifestacaoRepo,
      respostaRepo,
      pesquisaRepo,
      usuarioRepo
    );
  });

  it('deve retornar dados completos e indicadores de uma unidade', async () => {
    // 2 respostas da unidade na pesquisa-1 (notas 5 e 3 -> media 4.0)
    const resp1 = new RespostaPesquisa('r1', pesquisa.id, unidade.id, 'Paciente A', 5, 'Excelente');
    const resp2 = new RespostaPesquisa('r2', pesquisa.id, unidade.id, 'Paciente B', 3, 'Demorou');
    await respostaRepo.salvar(resp1);
    await respostaRepo.salvar(resp2);

    const man1 = Manifestacao.criar({
      id: 'm1',
      resposta: resp1,
      unidade,
    });
    await manifestacaoRepo.salvar(man1);

    const resultado = await useCase.executar(unidade.id);

    expect(resultado.id).toBe(unidade.id);
    expect(resultado.nome).toBe('Unidade Cohama');
    expect(resultado.responsavelNome).toBe('Dra. Carla Medeiros');
    expect(resultado.prazoPadraoHoras).toBe(48);
    expect(resultado.indicadores.totalManifestacoes).toBe(1);
    expect(resultado.indicadores.totalRespostas).toBe(2);
    expect(resultado.indicadores.notaMediaGeral).toBe(4);
    expect(resultado.coordenadores).toHaveLength(1);
    expect(resultado.coordenadores[0].nome).toBe('Dr. Roberto');
    expect(resultado.desempenhoPorPesquisa).toHaveLength(1);
    expect(resultado.desempenhoPorPesquisa[0].titulo).toBe('Satisfação Coleta');
    expect(resultado.desempenhoPorPesquisa[0].totalRespostas).toBe(2);
  });

  it('deve lançar RecursoNaoEncontradoError se a unidade não existir', async () => {
    await expect(useCase.executar('unidade-inexistente')).rejects.toThrow(
      RecursoNaoEncontradoError
    );
  });
});
