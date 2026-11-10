import { RegraNegocioError } from '../errors/DomainErrors';

export class RespostaPesquisa {
  public readonly clienteAtendimento: string;
  public readonly comentario: string;

  constructor(
    public readonly id: string,
    public readonly pesquisaId: string,
    public readonly unidadeId: string,
    clienteAtendimento: string | null | undefined,
    public readonly nota: number,
    comentario: string | null | undefined,
    public readonly dataHora: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID da resposta é obrigatório.');
    }
    if (!pesquisaId || !pesquisaId.trim()) {
      throw new RegraNegocioError('O ID da pesquisa vinculada é obrigatório.');
    }
    if (!unidadeId || !unidadeId.trim()) {
      throw new RegraNegocioError('O ID da unidade avaliada é obrigatório.');
    }
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      throw new RegraNegocioError('A nota de avaliação deve ser um número inteiro entre 1 e 5.');
    }

    // Campos opcionais conforme modelo oficial de avaliação e schema.sql
    this.clienteAtendimento =
      clienteAtendimento && clienteAtendimento.trim()
        ? clienteAtendimento.trim()
        : 'Atendimento não informado';

    this.comentario =
      comentario && comentario.trim()
        ? comentario.trim()
        : 'Sem comentário adicional.';
  }

  public exigePrioridadeAlta(): boolean {
    return this.nota <= 2;
  }
}
