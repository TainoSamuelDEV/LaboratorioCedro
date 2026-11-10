import { randomUUID } from 'crypto';
import { PrioridadeManifestacao, StatusManifestacao, TipoInteracao } from '../enums';
import { AcessoNegadoError, RegraNegocioError } from '../errors/DomainErrors';
import { IProtocoloService, ProtocoloService } from '../services/IProtocoloService';
import { ISLACalculator, PoliticaSlaPorNota } from '../services/ISLACalculator';
import { Escalonamento } from './Escalonamento';
import { Interacao } from './Interacao';
import { RespostaPesquisa } from './RespostaPesquisa';
import { RespostaUnidade } from './RespostaUnidade';
import { Unidade } from './Unidade';
import { Usuario } from './Usuario';

export interface ManifestacaoCriarParams {
  id?: string;
  resposta: RespostaPesquisa;
  unidade: Unidade;
  protocoloService?: IProtocoloService;
  slaCalculator?: ISLACalculator;
  criadoEm?: Date;
}

export interface ManifestacaoReconstituirParams {
  id: string;
  protocolo: string;
  respostaId: string;
  unidadeId: string;
  status: StatusManifestacao;
  prioridade: PrioridadeManifestacao;
  responsavelId: string | null;
  prazoResposta: Date;
  criadoEm: Date;
  concluidoEm: Date | null;
  interacoes: Interacao[];
  respostasUnidade: RespostaUnidade[];
  escalonamentos: Escalonamento[];
}

export class Manifestacao {
  private _status: StatusManifestacao;
  private _prioridade: PrioridadeManifestacao;
  private _unidadeId: string;
  private _responsavelId: string | null;
  private _prazoResposta: Date;
  private _concluidoEm: Date | null;
  private readonly _interacoes: Interacao[];
  private readonly _respostasUnidade: RespostaUnidade[];
  private readonly _escalonamentos: Escalonamento[];

  private constructor(
    public readonly id: string,
    public readonly protocolo: string,
    public readonly respostaId: string,
    unidadeId: string,
    status: StatusManifestacao,
    prioridade: PrioridadeManifestacao,
    responsavelId: string | null,
    prazoResposta: Date,
    public readonly criadoEm: Date,
    concluidoEm: Date | null,
    interacoes: Interacao[] = [],
    respostasUnidade: RespostaUnidade[] = [],
    escalonamentos: Escalonamento[] = []
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID da manifestação é obrigatório.');
    }
    if (!protocolo || !protocolo.trim()) {
      throw new RegraNegocioError('O protocolo da manifestação é obrigatório.');
    }
    if (!respostaId || !respostaId.trim()) {
      throw new RegraNegocioError('O ID da resposta originadora é obrigatório.');
    }
    if (!unidadeId || !unidadeId.trim()) {
      throw new RegraNegocioError('O ID da unidade vinculada é obrigatório.');
    }

    this._unidadeId = unidadeId;
    this._status = status;
    this._prioridade = prioridade;
    this._responsavelId = responsavelId;
    this._prazoResposta = prazoResposta;
    this._concluidoEm = concluidoEm;
    this._interacoes = [...interacoes];
    this._respostasUnidade = [...respostasUnidade];
    this._escalonamentos = [...escalonamentos];
  }

  // --- Getters Encapsulados (Sem Setters Públicos Livres) ---
  get unidadeId(): string {
    return this._unidadeId;
  }

  get status(): StatusManifestacao {
    return this._status;
  }

  get prioridade(): PrioridadeManifestacao {
    return this._prioridade;
  }

  get responsavelId(): string | null {
    return this._responsavelId;
  }

  get prazoResposta(): Date {
    return new Date(this._prazoResposta.getTime());
  }

  get concluidoEm(): Date | null {
    return this._concluidoEm ? new Date(this._concluidoEm.getTime()) : null;
  }

  get interacoes(): ReadonlyArray<Interacao> {
    return Object.freeze([...this._interacoes]);
  }

  get respostasUnidade(): ReadonlyArray<RespostaUnidade> {
    return Object.freeze([...this._respostasUnidade]);
  }

  get escalonamentos(): ReadonlyArray<Escalonamento> {
    return Object.freeze([...this._escalonamentos]);
  }

  // --- Factory: Criação de Nova Manifestação com Regras de Negócio ---
  public static criar(params: ManifestacaoCriarParams): Manifestacao {
    const id = params.id ?? randomUUID();
    const criadoEm = params.criadoEm ?? new Date();
    const protocoloService = params.protocoloService ?? new ProtocoloService();
    const slaCalculator = params.slaCalculator ?? new PoliticaSlaPorNota();

    const protocolo = protocoloService.gerarProtocolo(criadoEm.getFullYear());
    const calculoSla = slaCalculator.calcular(
      params.unidade.prazoPadraoHoras,
      params.resposta.nota,
      criadoEm
    );

    const interacaoAbertura = new Interacao(
      randomUUID(),
      id,
      null, // Sistema
      TipoInteracao.ABERTURA_AUTOMATICA,
      `Manifestação gerada automaticamente para o ${params.resposta.clienteAtendimento} com nota ${params.resposta.nota}.`,
      null,
      StatusManifestacao.NAO_RESPONDIDA,
      criadoEm
    );

    return new Manifestacao(
      id,
      protocolo,
      params.resposta.id,
      params.unidade.id,
      StatusManifestacao.NAO_RESPONDIDA,
      calculoSla.prioridade,
      null,
      calculoSla.prazoResposta,
      criadoEm,
      null,
      [interacaoAbertura],
      [],
      []
    );
  }

  // --- Factory: Reconstituição de Estado a partir da Persistência (Banco) ---
  public static reconstituir(params: ManifestacaoReconstituirParams): Manifestacao {
    if (params.status === StatusManifestacao.CONCLUIDA) {
      if (!params.concluidoEm) {
        throw new RegraNegocioError(
          'Inconsistência de dados: Manifestação concluída deve possuir data de conclusão.'
        );
      }
      if (params.respostasUnidade.length === 0) {
        throw new RegraNegocioError(
          'Inconsistência de dados: Manifestação concluída deve conter ao menos uma resposta da unidade.'
        );
      }
    }

    return new Manifestacao(
      params.id,
      params.protocolo,
      params.respostaId,
      params.unidadeId,
      params.status,
      params.prioridade,
      params.responsavelId,
      params.prazoResposta,
      params.criadoEm,
      params.concluidoEm,
      params.interacoes,
      params.respostasUnidade,
      params.escalonamentos
    );
  }

  // --- Máquina de Estados e Métodos de Negócio Encapsulados ---

  private validarImutabilidadePosConclusao(): void {
    if (this._status === StatusManifestacao.CONCLUIDA) {
      throw new RegraNegocioError(
        'Esta manifestação já se encontra CONCLUÍDA e não pode receber novas alterações.'
      );
    }
  }

  public iniciarTratamento(usuario: Usuario, interacaoId: string = randomUUID()): Interacao {
    this.validarImutabilidadePosConclusao();

    if (!usuario.podeTratarPelaUnidade(this._unidadeId)) {
      throw new AcessoNegadoError(
        'Apenas o coordenador vinculado à unidade desta manifestação pode iniciar o tratamento.'
      );
    }

    if (
      this._status !== StatusManifestacao.NAO_RESPONDIDA &&
      this._status !== StatusManifestacao.ESCALONADA
    ) {
      throw new RegraNegocioError(
        `Não é possível iniciar o tratamento de uma manifestação no status ${this._status}.`
      );
    }

    const statusAnterior = this._status;
    this._status = StatusManifestacao.EM_TRATAMENTO;
    this._responsavelId = usuario.id;

    const interacao = new Interacao(
      interacaoId,
      this.id,
      usuario.id,
      TipoInteracao.INICIO_TRATAMENTO,
      `Tratamento iniciado pelo coordenador ${usuario.nome}.`,
      statusAnterior,
      this._status,
      new Date()
    );

    this._interacoes.push(interacao);
    return interacao;
  }

  public registrarRespostaUnidade(
    usuario: Usuario,
    conteudo: string,
    respostaId: string = randomUUID(),
    interacaoId: string = randomUUID()
  ): RespostaUnidade {
    this.validarImutabilidadePosConclusao();

    if (!usuario.podeTratarPelaUnidade(this._unidadeId)) {
      throw new AcessoNegadoError(
        'Apenas o coordenador da unidade responsável tem permissão para responder a esta manifestação.'
      );
    }

    if (
      this._status !== StatusManifestacao.NAO_RESPONDIDA &&
      this._status !== StatusManifestacao.EM_TRATAMENTO &&
      this._status !== StatusManifestacao.ESCALONADA
    ) {
      throw new RegraNegocioError(
        `Não é permitido registrar resposta da unidade para manifestação no status ${this._status}.`
      );
    }

    const novaResposta = new RespostaUnidade(
      respostaId,
      this.id,
      usuario.id,
      conteudo,
      new Date()
    );

    const statusAnterior = this._status;
    this._status = StatusManifestacao.RESPONDIDA;
    this._respostasUnidade.push(novaResposta);

    const interacao = new Interacao(
      interacaoId,
      this.id,
      usuario.id,
      TipoInteracao.RESPOSTA_UNIDADE,
      `Resposta formal registrada pela unidade por ${usuario.nome}.`,
      statusAnterior,
      this._status,
      new Date()
    );

    this._interacoes.push(interacao);
    return novaResposta;
  }

  public solicitarComplemento(
    usuario: Usuario,
    motivo: string,
    interacaoId: string = randomUUID()
  ): Interacao {
    this.validarImutabilidadePosConclusao();

    if (!usuario.podeSolicitarComplemento()) {
      throw new AcessoNegadoError(
        'Apenas operadores da ouvidoria ou administradores podem solicitar complemento da resposta.'
      );
    }

    if (this._status !== StatusManifestacao.RESPONDIDA) {
      throw new RegraNegocioError(
        'Solicitação de complemento só pode ser realizada para manifestações com status RESPONDIDA.'
      );
    }

    if (!motivo || !motivo.trim()) {
      throw new RegraNegocioError('O motivo da solicitação de complemento deve ser informado.');
    }

    const statusAnterior = this._status;
    this._status = StatusManifestacao.EM_TRATAMENTO;

    const interacao = new Interacao(
      interacaoId,
      this.id,
      usuario.id,
      TipoInteracao.SOLICITACAO_COMPLEMENTO,
      `Complemento solicitado por ${usuario.nome}: ${motivo.trim()}`,
      statusAnterior,
      this._status,
      new Date()
    );

    this._interacoes.push(interacao);
    return interacao;
  }

  public escalonar(
    usuario: Usuario,
    motivo: string,
    nivel: number = 1,
    escalonamentoId: string = randomUUID(),
    interacaoId: string = randomUUID()
  ): Escalonamento {
    this.validarImutabilidadePosConclusao();

    if (!usuario.podeEscalonar()) {
      throw new AcessoNegadoError(
        'Usuário sem permissão para realizar escalonamento de manifestação.'
      );
    }

    if (
      this._status === StatusManifestacao.RESPONDIDA ||
      this._status === StatusManifestacao.CONCLUIDA
    ) {
      throw new RegraNegocioError(
        `Não é permitido escalonar uma manifestação no status ${this._status}.`
      );
    }

    const novoEscalonamento = new Escalonamento(
      escalonamentoId,
      this.id,
      motivo,
      nivel,
      usuario.id,
      new Date()
    );

    const statusAnterior = this._status;
    this._status = StatusManifestacao.ESCALONADA;
    this._prioridade = PrioridadeManifestacao.CRITICA;
    this._escalonamentos.push(novoEscalonamento);

    const interacao = new Interacao(
      interacaoId,
      this.id,
      usuario.id,
      TipoInteracao.ESCALONAMENTO,
      `Manifestação escalonada (Nível ${nivel}) por ${usuario.nome}. Motivo: ${motivo.trim()}`,
      statusAnterior,
      this._status,
      new Date()
    );

    this._interacoes.push(interacao);
    return novoEscalonamento;
  }

  public encaminharParaUnidade(
    usuario: Usuario,
    novaUnidade: Unidade,
    motivo: string,
    interacaoId: string = randomUUID()
  ): Interacao {
    this.validarImutabilidadePosConclusao();

    if (!usuario.podeEscalonar()) {
      throw new AcessoNegadoError(
        'Apenas operadores da ouvidoria ou administradores podem reencaminhar manifestações.'
      );
    }

    if (!novaUnidade.ativa) {
      throw new RegraNegocioError(
        'Não é permitido encaminhar manifestação para uma unidade desativada.'
      );
    }

    if (novaUnidade.id === this._unidadeId) {
      throw new RegraNegocioError(
        'A manifestação já está vinculada a esta mesma unidade.'
      );
    }

    const unidadeAnteriorId = this._unidadeId;
    this._unidadeId = novaUnidade.id;
    this._responsavelId = null; // Reseta o coordenador que estava tratando

    const interacao = new Interacao(
      interacaoId,
      this.id,
      usuario.id,
      TipoInteracao.ENCAMINHAMENTO,
      `Manifestação reencaminhada da unidade ${unidadeAnteriorId} para a unidade ${novaUnidade.nome} (${novaUnidade.id}) por ${usuario.nome}. Motivo: ${motivo.trim()}`,
      this._status,
      this._status,
      new Date()
    );

    this._interacoes.push(interacao);
    return interacao;
  }

  public concluir(
    usuario: Usuario,
    parecerFinal: string,
    interacaoId: string = randomUUID()
  ): Interacao {
    this.validarImutabilidadePosConclusao();

    if (!usuario.podeConcluir()) {
      throw new AcessoNegadoError(
        'Apenas operadores da ouvidoria ou administradores têm permissão para concluir a manifestação.'
      );
    }

    if (this._status !== StatusManifestacao.RESPONDIDA) {
      throw new RegraNegocioError(
        `Uma manifestação só pode ser concluída quando estiver no status RESPONDIDA. Status atual: ${this._status}.`
      );
    }

    if (this._respostasUnidade.length === 0) {
      throw new RegraNegocioError(
        'Não é possível concluir uma manifestação sem antes registrar uma resposta formal da unidade.'
      );
    }

    if (!parecerFinal || !parecerFinal.trim()) {
      throw new RegraNegocioError('O parecer final da ouvidoria para conclusão é obrigatório.');
    }

    const statusAnterior = this._status;
    this._status = StatusManifestacao.CONCLUIDA;
    this._concluidoEm = new Date();

    const interacao = new Interacao(
      interacaoId,
      this.id,
      usuario.id,
      TipoInteracao.CONCLUSAO,
      `Manifestação CONCLUÍDA pela Ouvidoria por ${usuario.nome}. Parecer: ${parecerFinal.trim()}`,
      statusAnterior,
      this._status,
      this._concluidoEm
    );

    this._interacoes.push(interacao);
    return interacao;
  }
}
