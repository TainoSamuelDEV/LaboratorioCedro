import { beforeEach, describe, expect, it } from 'vitest';
import { ListarManifestacoesUseCase } from '../../src/application/use-cases/manifestacoes/ListarManifestacoesUseCase';
import { ObterManifestacaoPorIdUseCase } from '../../src/application/use-cases/manifestacoes/ObterManifestacaoPorIdUseCase';
import { TratarManifestacaoUseCase } from '../../src/application/use-cases/manifestacoes/TratarManifestacaoUseCase';
import { Manifestacao } from '../../src/domain/entities/Manifestacao';
import { RespostaPesquisa } from '../../src/domain/entities/RespostaPesquisa';
import { Unidade } from '../../src/domain/entities/Unidade';
import { Administrador, CoordenadorUnidade, OperadorOuvidoria } from '../../src/domain/entities/Usuario';
import { PrioridadeManifestacao, StatusManifestacao } from '../../src/domain/enums';
import { TipoNotificacao } from '../../src/domain/services/INotificador';
import { AcessoNegadoError, RegraNegocioError } from '../../src/domain/errors/DomainErrors';
import { ProtocoloService } from '../../src/domain/services/IProtocoloService';
import { PoliticaSlaPorNota } from '../../src/domain/services/ISLACalculator';
import { FakeNotificador } from '../fakes/FakeNotificador';
import { InMemoryManifestacaoRepository } from '../fakes/InMemoryManifestacaoRepository';
import { InMemoryRespostaPesquisaRepository } from '../fakes/InMemoryRespostaPesquisaRepository';
import { InMemoryUnidadeRepository } from '../fakes/InMemoryUnidadeRepository';
import { InMemoryUsuarioRepository } from '../fakes/InMemoryUsuarioRepository';

describe('Application Layer: Casos de Uso de Tratativa de Manifestacao (Entregas 5, 6 e 7)', () => {
  let manifestacaoRepo: InMemoryManifestacaoRepository;
  let usuarioRepo: InMemoryUsuarioRepository;
  let unidadeRepo: InMemoryUnidadeRepository;
  let respostaRepo: InMemoryRespostaPesquisaRepository;
  let notificador: FakeNotificador;

  let obterPorIdUseCase: ObterManifestacaoPorIdUseCase;
  let listarUseCase: ListarManifestacoesUseCase;
  let tratarUseCase: TratarManifestacaoUseCase;

  const unidadeSulId = 'unid-sul';
  const unidadeNorteId = 'unid-norte';
  const coordSulId = 'u-coord-sul';
  const coordNorteId = 'u-coord-norte';
  const ouvidorId = 'u-ouvidor';
  const adminId = 'u-admin';

  let manifestacaoId: string;

  beforeEach(async () => {
    manifestacaoRepo = new InMemoryManifestacaoRepository();
    usuarioRepo = new InMemoryUsuarioRepository();
    unidadeRepo = new InMemoryUnidadeRepository();
    respostaRepo = new InMemoryRespostaPesquisaRepository();
    notificador = new FakeNotificador();

    obterPorIdUseCase = new ObterManifestacaoPorIdUseCase(
      manifestacaoRepo,
      usuarioRepo,
      unidadeRepo,
      respostaRepo
    );
    listarUseCase = new ListarManifestacoesUseCase(manifestacaoRepo, usuarioRepo);
    tratarUseCase = new TratarManifestacaoUseCase(
      manifestacaoRepo,
      usuarioRepo,
      unidadeRepo,
      notificador
    );

    // Unidades
    const unidadeSul = new Unidade(unidadeSulId, 'Unidade Sul', 'Dr. Roberto', true, 48);
    const unidadeNorte = new Unidade(unidadeNorteId, 'Unidade Norte', 'Dra. Julia', true, 48);
    await unidadeRepo.salvar(unidadeSul);
    await unidadeRepo.salvar(unidadeNorte);

    // Usuários
    await usuarioRepo.salvar(new CoordenadorUnidade(coordSulId, 'Dr. Roberto', 'roberto@cedro.com.br', unidadeSulId));
    await usuarioRepo.salvar(new CoordenadorUnidade(coordNorteId, 'Dra. Julia', 'julia@cedro.com.br', unidadeNorteId));
    await usuarioRepo.salvar(new OperadorOuvidoria(ouvidorId, 'Amanda Ouvidoria', 'amanda@cedro.com.br'));
    await usuarioRepo.salvar(new Administrador(adminId, 'Gabriel Tech Lead', 'gabriel@cedro.com.br'));

    // Resposta e Manifestação vinculada à unidade Sul
    const resposta = new RespostaPesquisa(
      'resp-01',
      'pesq-01',
      unidadeSulId,
      'Paciente Clara Luz',
      2,
      'Atraso significativo no exame de ultrassom.'
    );
    await respostaRepo.salvar(resposta);

    const manifestacao = Manifestacao.criar({
      id: 'manif-001',
      resposta,
      unidade: unidadeSul,
      protocoloService: new ProtocoloService('CED'),
      slaCalculator: new PoliticaSlaPorNota(),
    });
    await manifestacaoRepo.salvar(manifestacao);
    manifestacaoId = manifestacao.id;
  });

  it('deve obter detalhe da manifestação (14 campos) apenas se o usuário tiver permissão', async () => {
    // Coordenador da unidade Norte não pode visualizar manifestação da unidade Sul
    await expect(obterPorIdUseCase.executar(manifestacaoId, coordNorteId)).rejects.toThrow(
      AcessoNegadoError
    );

    // Coordenador da unidade Sul e Ouvidoria podem visualizar
    const detalheCoord = await obterPorIdUseCase.executar(manifestacaoId, coordSulId);
    expect(detalheCoord.protocolo).toBeDefined();
    expect(detalheCoord.unidadeNome).toBe('Unidade Sul');
    expect(detalheCoord.clienteAtendimento).toBe('Paciente Clara Luz');
    expect(detalheCoord.nota).toBe(2);

    const detalheOuvidor = await obterPorIdUseCase.executar(manifestacaoId, ouvidorId);
    expect(detalheOuvidor.id).toBe(manifestacaoId);
  });

  it('deve listar manifestações filtrando automaticamente pela unidade do coordenador', async () => {
    const listaCoordSul = await listarUseCase.executar({
      usuarioExecutanteId: coordSulId,
    });
    expect(listaCoordSul).toHaveLength(1);
    expect(listaCoordSul[0].unidadeId).toBe(unidadeSulId);

    const listaCoordNorte = await listarUseCase.executar({
      usuarioExecutanteId: coordNorteId,
    });
    expect(listaCoordNorte).toHaveLength(0); // Nenhuma manifestação para a unidade Norte
  });

  it('deve executar o ciclo completo de tratativa da manifestação ponta a ponta', async () => {
    // 1. Iniciar Tratamento
    await tratarUseCase.iniciarTratamento({
      manifestacaoId,
      usuarioId: coordSulId,
    });

    let manifAtual = await manifestacaoRepo.buscarPorId(manifestacaoId);
    expect(manifAtual!.status).toBe(StatusManifestacao.EM_TRATAMENTO);

    // 2. Responder pela Unidade
    await tratarUseCase.responderPelaUnidade({
      manifestacaoId,
      usuarioId: coordSulId,
      conteudo: 'Houve uma urgência obstétrica que atrasou a sala 2. O paciente foi acolhido.',
    });

    manifAtual = await manifestacaoRepo.buscarPorId(manifestacaoId);
    expect(manifAtual!.status).toBe(StatusManifestacao.RESPONDIDA);
    expect(notificador.enviadas.some((n) => n.tipo === TipoNotificacao.RESPOSTA_REGISTRADA)).toBe(true);

    // 3. Ouvidoria solicita complemento
    await tratarUseCase.solicitarComplemento({
      manifestacaoId,
      usuarioId: ouvidorId,
      motivo: 'Favor informar se o voucher de cortesia foi entregue.',
    });

    manifAtual = await manifestacaoRepo.buscarPorId(manifestacaoId);
    expect(manifAtual!.status).toBe(StatusManifestacao.EM_TRATAMENTO);

    // 4. Unidade responde novamente
    await tratarUseCase.responderPelaUnidade({
      manifestacaoId,
      usuarioId: coordSulId,
      conteudo: 'Sim, o voucher foi entregue na recepção e o paciente agradeceu o retorno.',
    });

    manifAtual = await manifestacaoRepo.buscarPorId(manifestacaoId);
    expect(manifAtual!.status).toBe(StatusManifestacao.RESPONDIDA);

    // 5. Conclusão pela Ouvidoria
    await tratarUseCase.concluir({
      manifestacaoId,
      usuarioId: ouvidorId,
      parecerFinal: 'Caso finalizado e arquivado após compensação e satisfação do paciente.',
    });

    manifAtual = await manifestacaoRepo.buscarPorId(manifestacaoId);
    expect(manifAtual!.status).toBe(StatusManifestacao.CONCLUIDA);
    expect(manifAtual!.concluidoEm).not.toBeNull();
    expect(notificador.enviadas.some((n) => n.tipo === TipoNotificacao.MANIFESTACAO_CONCLUIDA)).toBe(true);
  });

  it('deve escalonar a manifestação elevando prioridade para CRÍTICA', async () => {
    await tratarUseCase.escalonar({
      manifestacaoId,
      usuarioId: ouvidorId,
      motivo: 'Prazo expirado e reincidência de queixa técnica.',
      nivel: 2,
    });

    const manif = await manifestacaoRepo.buscarPorId(manifestacaoId);
    expect(manif!.status).toBe(StatusManifestacao.ESCALONADA);
    expect(manif!.prioridade).toBe(PrioridadeManifestacao.CRITICA);
    expect(notificador.enviadas.some((n) => n.tipo === TipoNotificacao.MANIFESTACAO_ESCALONADA)).toBe(true);
  });

  it('deve reencaminhar a manifestação para outra unidade e notificar a nova unidade', async () => {
    await tratarUseCase.encaminhar({
      manifestacaoId,
      usuarioId: ouvidorId,
      novaUnidadeId: unidadeNorteId,
      motivo: 'Paciente confirmou que o exame foi realizado na unidade Norte.',
    });

    const manif = await manifestacaoRepo.buscarPorId(manifestacaoId);
    expect(manif!.unidadeId).toBe(unidadeNorteId);
    expect(notificador.enviadas.some((n) => n.tipo === TipoNotificacao.MANIFESTACAO_ENCAMINHADA)).toBe(true);
  });
});
