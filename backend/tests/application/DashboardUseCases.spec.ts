import { describe, expect, it, beforeEach } from 'vitest';
import { Administrador, CoordenadorUnidade } from '../../src/domain/entities/Usuario';
import { Unidade } from '../../src/domain/entities/Unidade';
import { Pesquisa } from '../../src/domain/entities/Pesquisa';
import { RespostaPesquisa } from '../../src/domain/entities/RespostaPesquisa';
import { Manifestacao } from '../../src/domain/entities/Manifestacao';
import { CanalPesquisa, PrioridadeManifestacao, StatusManifestacao } from '../../src/domain/enums';
import { ObterIndicadoresDashboardUseCase } from '../../src/application/use-cases/dashboard/ObterIndicadoresDashboardUseCase';
import { ExportarRelatorioUseCase } from '../../src/application/use-cases/relatorios/ExportarRelatorioUseCase';
import { InMemoryUsuarioRepository } from '../fakes/InMemoryUsuarioRepository';
import { InMemoryUnidadeRepository } from '../fakes/InMemoryUnidadeRepository';
import { InMemoryPesquisaRepository } from '../fakes/InMemoryPesquisaRepository';
import { InMemoryRespostaPesquisaRepository } from '../fakes/InMemoryRespostaPesquisaRepository';
import { InMemoryManifestacaoRepository } from '../fakes/InMemoryManifestacaoRepository';

describe('Dashboard e Relatórios: Casos de Uso (Entrega 8)', () => {
  let usuarioRepo: InMemoryUsuarioRepository;
  let unidadeRepo: InMemoryUnidadeRepository;
  let pesquisaRepo: InMemoryPesquisaRepository;
  let respostaRepo: InMemoryRespostaPesquisaRepository;
  let manifestacaoRepo: InMemoryManifestacaoRepository;

  let admin: Administrador;
  let coordSul: CoordenadorUnidade;
  let unidadeMatriz: Unidade;
  let unidadeSul: Unidade;

  beforeEach(async () => {
    usuarioRepo = new InMemoryUsuarioRepository();
    unidadeRepo = new InMemoryUnidadeRepository();
    pesquisaRepo = new InMemoryPesquisaRepository();
    respostaRepo = new InMemoryRespostaPesquisaRepository();
    manifestacaoRepo = new InMemoryManifestacaoRepository();

    admin = new Administrador('usr-admin', 'Admin Geral', 'admin@cedro.com.br');
    coordSul = new CoordenadorUnidade('usr-coord', 'Coord Sul', 'coord@cedro.com.br', 'unid-sul');
    await usuarioRepo.salvar(admin);
    await usuarioRepo.salvar(coordSul);

    unidadeMatriz = new Unidade('unid-matriz', 'Cedro Matriz', 'Dra. Beatriz', true, 48);
    unidadeSul = new Unidade('unid-sul', 'Cedro Sul', 'Dr. Roberto', true, 48);
    await unidadeRepo.salvar(unidadeMatriz);
    await unidadeRepo.salvar(unidadeSul);

    const pesquisa = new Pesquisa(
      'pesq-1',
      'Satisfação Geral',
      'Avaliação dos exames',
      '2026-Q1',
      CanalPesquisa.QR_CODE,
      true
    );
    await pesquisaRepo.salvar(pesquisa);

    // Resposta 1 (Nota 5 na Matriz) -> sem manifestação grave ou concluída
    const resp1 = new RespostaPesquisa('resp-1', 'pesq-1', 'unid-matriz', 'Cliente 1', 5, 'Excelente');
    await respostaRepo.salvar(resp1);

    // Resposta 2 (Nota 1 na Sul) -> Manifestação Alta
    const resp2 = new RespostaPesquisa('resp-2', 'pesq-1', 'unid-sul', 'Cliente 2', 1, 'Muito demorado');
    await respostaRepo.salvar(resp2);

    const agora = new Date();
    const manifestacao1 = Manifestacao.criar({
      id: 'manif-1',
      resposta: resp2,
      unidade: unidadeSul,
      criadoEm: new Date(agora.getTime() - 1000 * 60 * 60 * 5), // 5 horas atrás
    });
    await manifestacaoRepo.salvar(manifestacao1);

    // Resposta 3 (Nota 2 na Sul) -> Manifestação que foi respondida e concluída
    const resp3 = new RespostaPesquisa('resp-3', 'pesq-1', 'unid-sul', 'Cliente 3', 2, 'Recepção fria');
    await respostaRepo.salvar(resp3);

    const manifestacao2 = Manifestacao.criar({
      id: 'manif-2',
      resposta: resp3,
      unidade: unidadeSul,
      criadoEm: new Date(agora.getTime() - 1000 * 60 * 60 * 10), // 10 horas atrás
    });
    manifestacao2.iniciarTratamento(coordSul);
    manifestacao2.registrarRespostaUnidade(coordSul, 'Entramos em contato com o paciente.');
    manifestacao2.concluir(admin, 'Caso finalizado e arquivado.');
    await manifestacaoRepo.salvar(manifestacao2);
  });

  describe('ObterIndicadoresDashboardUseCase', () => {
    it('deve retornar os 10 indicadores globais para o Administrador', async () => {
      const useCase = new ObterIndicadoresDashboardUseCase(
        manifestacaoRepo,
        respostaRepo,
        unidadeRepo,
        usuarioRepo
      );

      const resultado = await useCase.execute(admin.id);

      expect(resultado.totalRespostas).toBe(3);
      expect(resultado.distribuicaoNotas.length).toBe(5);
      // Nota 1 = 1 (33.3%), Nota 2 = 1 (33.3%), Nota 5 = 1 (33.3%)
      const nota1 = resultado.distribuicaoNotas.find((d) => d.nota === 1);
      expect(nota1?.quantidade).toBe(1);
      expect(nota1?.porcentagem).toBe(33.3);

      expect(resultado.totalAbertas).toBe(1); // manif-1
      expect(resultado.totalNaoRespondidas).toBe(1);
      expect(resultado.totalConcluidas).toBe(1); // manif-2

      expect(resultado.tempoMedioRespostaHoras).toBeGreaterThanOrEqual(0);
      expect(resultado.tempoMedioConclusaoHoras).toBeGreaterThanOrEqual(0);

      expect(resultado.pendenciasPorUnidade.length).toBe(2);
      const pendenciasSul = resultado.pendenciasPorUnidade.find((p) => p.unidadeId === 'unid-sul');
      expect(pendenciasSul?.pendencias).toBe(1);

      expect(resultado.volumePorUnidade.length).toBe(2);
      const volumeSul = resultado.volumePorUnidade.find((v) => v.unidadeId === 'unid-sul');
      expect(volumeSul?.total).toBe(2);
    });

    it('deve filtrar os indicadores pela unidade do CoordenadorUnidade (polimorfismo)', async () => {
      const useCase = new ObterIndicadoresDashboardUseCase(
        manifestacaoRepo,
        respostaRepo,
        unidadeRepo,
        usuarioRepo
      );

      const resultado = await useCase.execute(coordSul.id);

      // Respostas da Unidade Sul: resp-2 e resp-3
      expect(resultado.totalRespostas).toBe(2);
      expect(resultado.volumePorUnidade.length).toBe(1);
      expect(resultado.volumePorUnidade[0].unidadeId).toBe('unid-sul');
    });
  });

  describe('ExportarRelatorioUseCase', () => {
    it('deve gerar relatório em formato CSV com cabeçalho delimitado por ponto e vírgula', async () => {
      const useCase = new ExportarRelatorioUseCase(manifestacaoRepo, unidadeRepo, usuarioRepo);

      const resultado = await useCase.execute(admin.id, { formato: 'csv' });

      expect(resultado.mimeType).toContain('text/csv');
      expect(resultado.nomeArquivo).toMatch(/relatorio-manifestacoes-.*\.csv/);
      expect(resultado.conteudo).toContain('Protocolo;Unidade;Status;Prioridade');
      expect(resultado.conteudo).toContain('Cedro Sul');
    });

    it('deve gerar relatório em formato JSON quando solicitado', async () => {
      const useCase = new ExportarRelatorioUseCase(manifestacaoRepo, unidadeRepo, usuarioRepo);

      const resultado = await useCase.execute(admin.id, { formato: 'json' });

      expect(resultado.mimeType).toContain('application/json');
      const parsed = JSON.parse(resultado.conteudo);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0].protocolo).toBeDefined();
    });
  });
});
