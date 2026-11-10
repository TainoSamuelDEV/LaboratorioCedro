import { RegraNegocioError } from '../errors/DomainErrors';

export class Escalonamento {
  constructor(
    public readonly id: string,
    public readonly manifestacaoId: string,
    public readonly motivo: string,
    public readonly nivel: number,
    public readonly usuarioId: string,
    public readonly dataHora: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID do escalonamento é obrigatório.');
    }
    if (!manifestacaoId || !manifestacaoId.trim()) {
      throw new RegraNegocioError('O ID da manifestação é obrigatório.');
    }
    if (!motivo || !motivo.trim()) {
      throw new RegraNegocioError('O motivo do escalonamento não pode ser vazio.');
    }
    if (nivel <= 0) {
      throw new RegraNegocioError('O nível de escalonamento deve ser positivo.');
    }
    if (!usuarioId || !usuarioId.trim()) {
      throw new RegraNegocioError('O ID do usuário que escalonou é obrigatório.');
    }
  }
}
