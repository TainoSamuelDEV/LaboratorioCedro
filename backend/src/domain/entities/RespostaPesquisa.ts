import { RegraNegocioError } from '../errors/DomainErrors';

export class RespostaPesquisa {
  constructor(
    public readonly id: string,
    public readonly pesquisaId: string,
    public readonly unidadeId: string,
    public readonly clienteAtendimento: string,
    public readonly nota: number,
    public readonly comentario: string,
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
    if (!clienteAtendimento || !clienteAtendimento.trim()) {
      throw new RegraNegocioError('A identificação do atendimento/cliente é obrigatória.');
    }
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      throw new RegraNegocioError('A nota de avaliação deve ser um número inteiro entre 1 e 5.');
    }
    if (!comentario || !comentario.trim()) {
      throw new RegraNegocioError('O comentário ou relato da avaliação é obrigatório.');
    }
  }

  public exigePrioridadeAlta(): boolean {
    return this.nota <= 2;
  }
}
