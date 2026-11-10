import { randomUUID } from 'crypto';
import { Manifestacao } from '../../../domain/entities/Manifestacao';
import { RespostaPesquisa } from '../../../domain/entities/RespostaPesquisa';
import { ObjetoNaoEncontradoError, RegraNegocioError } from '../../../domain/errors/DomainErrors';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IPesquisaRepository } from '../../../domain/repositories/IPesquisaRepository';
import { IRespostaPesquisaRepository } from '../../../domain/repositories/IRespostaPesquisaRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { INotificador, TipoNotificacao } from '../../../domain/services/INotificador';
import { IProtocoloService, ProtocoloService } from '../../../domain/services/IProtocoloService';
import { ISLACalculator, PoliticaSlaPorNota } from '../../../domain/services/ISLACalculator';
import { ResponderPesquisaInput, RespostaComManifestacaoOutput } from '../../dtos/PesquisaDTOs';

export class ResponderPesquisaUseCase {
  constructor(
    private readonly pesquisaRepo: IPesquisaRepository,
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly respostaRepo: IRespostaPesquisaRepository,
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly notificador: INotificador,
    private readonly protocoloService: IProtocoloService = new ProtocoloService(),
    private readonly slaCalculator: ISLACalculator = new PoliticaSlaPorNota()
  ) {}

  public async executar(input: ResponderPesquisaInput): Promise<RespostaComManifestacaoOutput> {
    const pesquisa = await this.pesquisaRepo.buscarPorId(input.pesquisaId);
    if (!pesquisa) {
      throw new ObjetoNaoEncontradoError('Pesquisa não encontrada.');
    }

    pesquisa.validarRecebimentoResposta();

    if (!input.unidadeId || !input.unidadeId.trim()) {
      throw new RegraNegocioError('A seleção da unidade de atendimento é obrigatória.');
    }

    const unidade = await this.unidadeRepo.buscarPorId(input.unidadeId);
    if (!unidade) {
      throw new ObjetoNaoEncontradoError('Unidade selecionada não encontrada.');
    }

    if (!unidade.ativa) {
      throw new RegraNegocioError('A unidade selecionada está desativada para recebimento de avaliações.');
    }

    const resposta = new RespostaPesquisa(
      randomUUID(),
      pesquisa.id,
      unidade.id,
      input.clienteAtendimento,
      input.nota,
      input.comentario,
      new Date()
    );

    let manifestacao = Manifestacao.criar({
      id: randomUUID(),
      resposta,
      unidade,
      protocoloService: this.protocoloService,
      slaCalculator: this.slaCalculator,
      criadoEm: resposta.dataHora,
    });

    // Garante que o protocolo gerado não colida com protocolos já persistidos no banco
    let tentativas = 0;
    while (
      (await this.manifestacaoRepo.buscarPorProtocolo(manifestacao.protocolo)) !== null &&
      tentativas < 1000
    ) {
      tentativas++;
      manifestacao = Manifestacao.criar({
        id: randomUUID(),
        resposta,
        unidade,
        protocoloService: this.protocoloService,
        slaCalculator: this.slaCalculator,
        criadoEm: resposta.dataHora,
      });
    }

    await this.respostaRepo.salvar(resposta);
    await this.manifestacaoRepo.salvar(manifestacao);

    // Disparo de notificação (Abstração / Polimorfismo)
    await this.notificador.enviar({
      tipo: TipoNotificacao.MANIFESTACAO_CRIADA,
      destinatario: unidade.responsavelNome ?? `Coordenador ${unidade.nome}`,
      protocolo: manifestacao.protocolo,
      mensagem: `Nova manifestação aberta para a unidade ${unidade.nome} com nota ${resposta.nota}. Prioridade: ${manifestacao.prioridade}.`,
      metadados: {
        manifestacaoId: manifestacao.id,
        unidadeId: unidade.id,
        nota: resposta.nota,
        prioridade: manifestacao.prioridade,
      },
    });

    return {
      respostaId: resposta.id,
      manifestacao: {
        id: manifestacao.id,
        protocolo: manifestacao.protocolo,
        status: manifestacao.status,
        prioridade: manifestacao.prioridade,
        unidadeId: manifestacao.unidadeId,
        prazoResposta: manifestacao.prazoResposta,
        criadoEm: manifestacao.criadoEm,
      },
    };
  }
}
