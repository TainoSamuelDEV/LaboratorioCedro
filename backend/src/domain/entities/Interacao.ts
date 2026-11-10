import { StatusManifestacao, TipoInteracao } from '../enums';
import { RegraNegocioError } from '../errors/DomainErrors';

export class Interacao {
  constructor(
    public readonly id: string,
    public readonly manifestacaoId: string,
    public readonly usuarioId: string | null,
    public readonly tipo: TipoInteracao,
    public readonly texto: string,
    public readonly statusAnterior: StatusManifestacao | null,
    public readonly statusNovo: StatusManifestacao,
    public readonly dataHora: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID da interação é obrigatório.');
    }
    if (!manifestacaoId || !manifestacaoId.trim()) {
      throw new RegraNegocioError('O ID da manifestação vinculada é obrigatório.');
    }
    if (!tipo) {
      throw new RegraNegocioError('O tipo da interação é obrigatório.');
    }
    if (!texto || !texto.trim()) {
      throw new RegraNegocioError('O texto da interação não pode ser vazio.');
    }
    if (!statusNovo) {
      throw new RegraNegocioError('O novo status da interação é obrigatório.');
    }
  }
}
