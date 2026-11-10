export abstract class DominioError extends Error {
  public readonly codigoHttpSugerido: number;

  protected constructor(mensagem: string, codigoHttpSugerido = 400) {
    super(mensagem);
    this.name = this.constructor.name;
    this.codigoHttpSugerido = codigoHttpSugerido;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RegraNegocioError extends DominioError {
  constructor(mensagem: string) {
    super(mensagem, 422);
  }
}

export class AcessoNegadoError extends DominioError {
  constructor(mensagem: string) {
    super(mensagem, 403);
  }
}

export class TransicaoStatusInvalidaError extends RegraNegocioError {
  constructor(statusAtual: string, statusTentado: string, motivo?: string) {
    const detalhe = motivo ? ` Motivo: ${motivo}` : '';
    super(`Transição de status inválida de '${statusAtual}' para '${statusTentado}'.${detalhe}`);
  }
}
