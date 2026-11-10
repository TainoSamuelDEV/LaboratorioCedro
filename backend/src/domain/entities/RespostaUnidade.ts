import { RegraNegocioError } from '../errors/DomainErrors';

export class RespostaUnidade {
  constructor(
    public readonly id: string,
    public readonly manifestacaoId: string,
    public readonly usuarioId: string,
    private _conteudo: string,
    public readonly dataHora: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID da resposta da unidade é obrigatório.');
    }
    if (!manifestacaoId || !manifestacaoId.trim()) {
      throw new RegraNegocioError('O ID da manifestação é obrigatório.');
    }
    if (!usuarioId || !usuarioId.trim()) {
      throw new RegraNegocioError('O ID do usuário autor da resposta é obrigatório.');
    }
    if (!_conteudo || !_conteudo.trim()) {
      throw new RegraNegocioError('O conteúdo da resposta da unidade não pode ser vazio.');
    }
  }

  get conteudo(): string {
    return this._conteudo;
  }
}
