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
      throw new RegraNegocioError('A unidade de atendimento é obrigatória.');
    }
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      throw new RegraNegocioError('A nota de avaliação é obrigatória e deve ser um número inteiro entre 1 e 5.');
    }

    // Regra UC01 (docs/05-diagramas-uml-casos-de-uso.md):
    // Comentário é OBRIGATÓRIO para notas de 1 a 3 e OPCIONAL para notas 4 e 5.
    const comentarioLimpo = comentario ? comentario.trim() : '';
    if (nota <= 3 && !comentarioLimpo) {
      throw new RegraNegocioError(
        'O comentário é obrigatório para avaliações com nota de 1 a 3.'
      );
    }

    this.comentario = comentarioLimpo;

    // Regra UC01 / Seção 9 (LGPD): Identificação do cliente/atendimento é OPCIONAL
    this.clienteAtendimento =
      clienteAtendimento && clienteAtendimento.trim()
        ? clienteAtendimento.trim()
        : 'Não informado';
  }

  public exigePrioridadeAlta(): boolean {
    return this.nota <= 2;
  }
}
