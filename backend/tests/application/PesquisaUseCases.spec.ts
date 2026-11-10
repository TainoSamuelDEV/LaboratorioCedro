import { beforeEach, describe, expect, it } from 'vitest';
import { CriarPesquisaUseCase } from '../../src/application/use-cases/pesquisas/CriarPesquisaUseCase';
import { ObterPesquisaPublicaUseCase } from '../../src/application/use-cases/pesquisas/ObterPesquisaPublicaUseCase';
import { ResponderPesquisaUseCase } from '../../src/application/use-cases/pesquisas/ResponderPesquisaUseCase';
import { Unidade } from '../../src/domain/entities/Unidade';
import { Administrador, OperadorOuvidoria } from '../../src/domain/entities/Usuario';
import { CanalPesquisa, PrioridadeManifestacao, StatusManifestacao } from '../../src/domain/enums';
import { AcessoNegadoError, RegraNegocioError } from '../../src/domain/errors/DomainErrors';
import { ProtocoloService } from '../../src/domain/services/IProtocoloService';
import { PoliticaSlaPorNota } from '../../src/domain/services/ISLACalculator';
import { FakeNotificador } from '../fakes/FakeNotificador';
import { InMemoryManifestacaoRepository } from '../fakes/InMemoryManifestacaoRepository';
import { InMemoryPesquisaRepository } from '../fakes/InMemoryPesquisaRepository';
import { InMemoryRespostaPesquisaRepository } from '../fakes/InMemoryRespostaPesquisaRepository';
import { InMemoryUnidadeRepository } from '../fakes/InMemoryUnidadeRepository';
import { InMemoryUsuarioRepository } from '../fakes/InMemoryUsuarioRepository';

describe('Application Layer: Casos de Uso de Pesquisa e Respostas (Entregas 2, 3 e 4)', () => {
  let pesquisaRepo: InMemoryPesquisaRepository;
  let unidadeRepo: InMemoryUnidadeRepository;
  let respostaRepo: InMemoryRespostaPesquisaRepository;
  let manifestacaoRepo: InMemoryManifestacaoRepository;
  let usuarioRepo: InMemoryUsuarioRepository;
  let notificador: FakeNotificador;
  let protocoloService: ProtocoloService;
  let slaCalculator: PoliticaSlaPorNota;

  let criarPesquisaUseCase: CriarPesquisaUseCase;
  let obterPesquisaPublicaUseCase: ObterPesquisaPublicaUseCase;
  let responderPesquisaUseCase: ResponderPesquisaUseCase;

  const adminId = 'admin-001';
  const ouvidorId = 'ouvidor-001';
  const unidadeSulId = 'unid-sul-001';

  beforeEach(async () => {
    pesquisaRepo = new InMemoryPesquisaRepository();
    unidadeRepo = new InMemoryUnidadeRepository();
    respostaRepo = new InMemoryRespostaPesquisaRepository();
    manifestacaoRepo = new InMemoryManifestacaoRepository();
    usuarioRepo = new InMemoryUsuarioRepository();
    notificador = new FakeNotificador();
    protocoloService = new ProtocoloService('CED');
    slaCalculator = new PoliticaSlaPorNota();
    ProtocoloService.resetarContador(500);

    criarPesquisaUseCase = new CriarPesquisaUseCase(pesquisaRepo, usuarioRepo);
    obterPesquisaPublicaUseCase = new ObterPesquisaPublicaUseCase(pesquisaRepo, unidadeRepo);
    responderPesquisaUseCase = new ResponderPesquisaUseCase(
      pesquisaRepo,
      unidadeRepo,
      respostaRepo,
      manifestacaoRepo,
      notificador,
      protocoloService,
      slaCalculator
    );

    // Seed inicial
    await usuarioRepo.salvar(new Administrador(adminId, 'Admin Master', 'admin@cedro.com.br'));
    await usuarioRepo.salvar(new OperadorOuvidoria(ouvidorId, 'Ouvidor Silva', 'ouvidor@cedro.com.br'));

    await unidadeRepo.salvar(new Unidade(unidadeSulId, 'Unidade Sul Coletas', 'Dr. Marcos', true, 48));
    await unidadeRepo.salvar(new Unidade('unid-inativa', 'Unidade Fechada', null, false, 48));
  });

  it('deve permitir que o Administrador crie uma nova pesquisa e impedir Operador de Ouvidoria', async () => {
    const output = await criarPesquisaUseCase.executar({
      executanteId: adminId,
      titulo: 'Pesquisa Satisfação 2026',
      descricao: 'Avaliação de coleta e exames',
      periodo: '2026-Q1',
      canal: CanalPesquisa.QR_CODE,
      unidadePadraoId: unidadeSulId,
    });

    expect(output.id).toBeDefined();
    expect(output.titulo).toBe('Pesquisa Satisfação 2026');
    expect(output.ativa).toBe(true);

    await expect(
      criarPesquisaUseCase.executar({
        executanteId: ouvidorId,
        titulo: 'Pesquisa Barrada',
        descricao: 'Teste',
        periodo: '2026-Q1',
        canal: CanalPesquisa.LINK,
      })
    ).rejects.toThrow(AcessoNegadoError);
  });

  it('deve retornar dados públicos da pesquisa e unidades ativas para o cliente (QR Code)', async () => {
    const pesquisa = await criarPesquisaUseCase.executar({
      executanteId: adminId,
      titulo: 'Pesquisa Pública QR',
      descricao: 'Avalie seu atendimento',
      periodo: '2026',
      canal: CanalPesquisa.QR_CODE,
    });

    const publica = await obterPesquisaPublicaUseCase.executar(pesquisa.id);
    expect(publica.id).toBe(pesquisa.id);
    expect(publica.unidadesAtivas).toHaveLength(1); // Apenas a unidade Sul ativa, desconsiderando a inativa
    expect(publica.unidadesAtivas[0].id).toBe(unidadeSulId);
  });

  it('deve registrar resposta do cliente, gerar automaticamente a manifestacao, auditoria e notificacao', async () => {
    const pesquisa = await criarPesquisaUseCase.executar({
      executanteId: adminId,
      titulo: 'Pesquisa Coletas',
      descricao: 'Avaliação',
      periodo: '2026',
      canal: CanalPesquisa.QR_CODE,
    });

    const output = await responderPesquisaUseCase.executar({
      pesquisaId: pesquisa.id,
      unidadeId: unidadeSulId,
      clienteAtendimento: 'Atendimento #5544 - Lucas Santos',
      nota: 1, // Nota detratora
      comentario: 'Demora excessiva e falta de estacionamento.',
    });

    expect(output.respostaId).toBeDefined();
    expect(output.manifestacao.id).toBeDefined();
    expect(output.manifestacao.protocolo).toBe('CED-2026-000500');
    expect(output.manifestacao.status).toBe(StatusManifestacao.NAO_RESPONDIDA);
    expect(output.manifestacao.prioridade).toBe(PrioridadeManifestacao.ALTA);

    // Valida persistência nos repositórios
    const manifestacaoSalva = await manifestacaoRepo.buscarPorId(output.manifestacao.id);
    expect(manifestacaoSalva).not.toBeNull();
    expect(manifestacaoSalva!.interacoes).toHaveLength(1);
    expect(manifestacaoSalva!.interacoes[0].texto).toContain('Lucas Santos');

    const respostaSalva = await respostaRepo.buscarPorId(output.respostaId);
    expect(respostaSalva).not.toBeNull();
    expect(respostaSalva!.nota).toBe(1);

    // Valida envio de notificação
    expect(notificador.enviadas).toHaveLength(1);
    expect(notificador.enviadas[0].protocolo).toBe('CED-2026-000500');
    expect(notificador.enviadas[0].mensagem).toContain('Prioridade: ALTA');
  });

  it('deve rejeitar resposta se a unidade selecionada estiver inativa', async () => {
    const pesquisa = await criarPesquisaUseCase.executar({
      executanteId: adminId,
      titulo: 'Pesquisa Coletas',
      descricao: 'Avaliação',
      periodo: '2026',
      canal: CanalPesquisa.QR_CODE,
    });

    await expect(
      responderPesquisaUseCase.executar({
        pesquisaId: pesquisa.id,
        unidadeId: 'unid-inativa',
        clienteAtendimento: 'Paciente Teste',
        nota: 4,
        comentario: 'Ok',
      })
    ).rejects.toThrow(RegraNegocioError);
  });
});
