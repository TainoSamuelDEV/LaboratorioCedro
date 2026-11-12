import { describe, it, expect, beforeEach } from 'vitest';
import { CanalPesquisa, StatusManifestacao, PrioridadeManifestacao } from '../../src/domain/enums';
import { Pesquisa } from '../../src/domain/entities/Pesquisa';
import { RespostaPesquisa } from '../../src/domain/entities/RespostaPesquisa';
import { Manifestacao } from '../../src/domain/entities/Manifestacao';
import { Unidade } from '../../src/domain/entities/Unidade';
import { Administrador, Usuario } from '../../src/domain/entities/Usuario';
import { IPesquisaRepository } from '../../src/domain/repositories/IPesquisaRepository';
import { IRespostaPesquisaRepository } from '../../src/domain/repositories/IRespostaPesquisaRepository';
import { IManifestacaoRepository } from '../../src/domain/repositories/IManifestacaoRepository';
import { IUnidadeRepository } from '../../src/domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../src/domain/repositories/IUsuarioRepository';
import { ObterPesquisaPorIdUseCase } from '../../src/application/use-cases/pesquisas/ObterPesquisaPorIdUseCase';
import { AtualizarPesquisaUseCase } from '../../src/application/use-cases/pesquisas/AtualizarPesquisaUseCase';
import { RegraNegocioError, RecursoNaoEncontradoError } from '../../src/domain/errors/DomainErrors';

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
}

describe('Casos de Uso de Gestão de Pesquisas', () => {
  let pesquisaRepo: FakePesquisaRepo;
  let respostaRepo: FakeRespostaRepo;
  let manifestacaoRepo: FakeManifestacaoRepo;
  let unidadeRepo: FakeUnidadeRepo;
  let usuarioRepo: FakeUsuarioRepo;

  let obterPesquisaPorIdUseCase: ObterPesquisaPorIdUseCase;
  let atualizarPesquisaUseCase: AtualizarPesquisaUseCase;

  const adminUser = new Administrador(
    'admin-1',
    'Admin Teste',
    'admin@cedro.com.br',
    true
  );

  const unidadeCohama = new Unidade(
    'unidade-cohama',
    'Unidade Cohama',
    'Rua das Palmeiras, 10',
    'Dr. Silva',
    48,
    true
  );

  const pesquisaPadrao = new Pesquisa(
    'pesquisa-1',
    'Pesquisa de Satisfação Geral',
    'Avalie sua experiência de atendimento e coleta',
    'Novembro/2026',
    CanalPesquisa.QR_CODE,
    true,
    unidadeCohama.id
  );

  beforeEach(async () => {
    pesquisaRepo = new FakePesquisaRepo();
    respostaRepo = new FakeRespostaRepo();
    manifestacaoRepo = new FakeManifestacaoRepo();
    unidadeRepo = new FakeUnidadeRepo();
    usuarioRepo = new FakeUsuarioRepo();

    await pesquisaRepo.salvar(pesquisaPadrao);
    await unidadeRepo.salvar(unidadeCohama);
    await usuarioRepo.salvar(adminUser);

    obterPesquisaPorIdUseCase = new ObterPesquisaPorIdUseCase(
      pesquisaRepo,
      respostaRepo,
      manifestacaoRepo,
      unidadeRepo
    );

    atualizarPesquisaUseCase = new AtualizarPesquisaUseCase(
      pesquisaRepo,
      usuarioRepo,
      unidadeRepo
    );
  });

  describe('ObterPesquisaPorIdUseCase', () => {
    it('deve retornar dados completos e indicadores de uma pesquisa com respostas', async () => {
      // 1 resposta nota 5 e 1 resposta nota 3
      const resp1 = new RespostaPesquisa(
        'resp-1',
        pesquisaPadrao.id,
        unidadeCohama.id,
        'Paciente 1',
        5,
        'Excelente atendimento!'
      );
      const resp2 = new RespostaPesquisa(
        'resp-2',
        pesquisaPadrao.id,
        unidadeCohama.id,
        'Paciente 2',
        3,
        'Demorou um pouco'
      );
      await respostaRepo.salvar(resp1);
      await respostaRepo.salvar(resp2);

      const man1 = Manifestacao.criar({
        id: 'man-1',
        resposta: resp1,
        unidade: unidadeCohama,
      });
      await manifestacaoRepo.salvar(man1);

      const resultado = await obterPesquisaPorIdUseCase.executar(pesquisaPadrao.id);

      expect(resultado.id).toBe(pesquisaPadrao.id);
      expect(resultado.titulo).toBe('Pesquisa de Satisfação Geral');
      expect(resultado.unidadePadraoNome).toBe('Unidade Cohama');
      expect(resultado.indicadores.totalRespostas).toBe(2);
      expect(resultado.indicadores.notaMedia).toBe(4);
      expect(resultado.indicadores.percentualSatisfeitos).toBe(50); // 1 de 2 foi nota >= 4
      expect(resultado.indicadores.totalManifestacoes).toBe(1);
      expect(resultado.ultimasManifestacoes).toHaveLength(1);
      expect(resultado.ultimasManifestacoes[0].protocolo).toBeDefined();
    });

    it('deve lançar RecursoNaoEncontradoError quando a pesquisa não existir', async () => {
      await expect(
        obterPesquisaPorIdUseCase.executar('id-inexistente')
      ).rejects.toThrow(RecursoNaoEncontradoError);
    });
  });

  describe('AtualizarPesquisaUseCase', () => {
    it('deve atualizar titulo, descricao, periodo, canal e unidade com sucesso por um administrador', async () => {
      const atualizada = await atualizarPesquisaUseCase.executar({
        id: pesquisaPadrao.id,
        executadoPorUsuarioId: adminUser.id,
        titulo: 'Pesquisa Atualizada 2026',
        descricao: 'Nova descrição',
        periodo: 'Dezembro/2026',
        canal: CanalPesquisa.LINK,
      });

      expect(atualizada.titulo).toBe('Pesquisa Atualizada 2026');
      expect(atualizada.descricao).toBe('Nova descrição');
      expect(atualizada.periodo).toBe('Dezembro/2026');
      expect(atualizada.canal).toBe(CanalPesquisa.LINK);
    });

    it('deve permitir desativar (Soft Delete) e reativar a pesquisa preservando dados', async () => {
      const desativada = await atualizarPesquisaUseCase.executar({
        id: pesquisaPadrao.id,
        executadoPorUsuarioId: adminUser.id,
        ativa: false,
      });

      expect(desativada.ativa).toBe(false);

      const reativada = await atualizarPesquisaUseCase.executar({
        id: pesquisaPadrao.id,
        executadoPorUsuarioId: adminUser.id,
        ativa: true,
      });

      expect(reativada.ativa).toBe(true);
    });

    it('deve impedir atualização com título vazio', async () => {
      await expect(
        atualizarPesquisaUseCase.executar({
          id: pesquisaPadrao.id,
          executadoPorUsuarioId: adminUser.id,
          titulo: '   ',
        })
      ).rejects.toThrow(RegraNegocioError);
    });
  });
});
