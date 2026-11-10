import { randomUUID } from 'crypto';
import { Pesquisa } from '../../../domain/entities/Pesquisa';
import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IPesquisaRepository } from '../../../domain/repositories/IPesquisaRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { CriarPesquisaInput, PesquisaOutput } from '../../dtos/PesquisaDTOs';

export class CriarPesquisaUseCase {
  constructor(
    private readonly pesquisaRepo: IPesquisaRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async executar(input: CriarPesquisaInput): Promise<PesquisaOutput> {
    const executante = await this.usuarioRepo.buscarPorId(input.executanteId);
    if (!executante) {
      throw new ObjetoNaoEncontradoError('Usuário executante não encontrado.');
    }

    if (!executante.podeGerenciarSistema()) {
      throw new AcessoNegadoError('Apenas administradores podem criar novas pesquisas de satisfação.');
    }

    const pesquisa = new Pesquisa(
      randomUUID(),
      input.titulo,
      input.descricao,
      input.periodo,
      input.canal,
      true,
      input.unidadePadraoId ?? null
    );

    await this.pesquisaRepo.salvar(pesquisa);

    return {
      id: pesquisa.id,
      titulo: pesquisa.titulo,
      descricao: pesquisa.descricao,
      periodo: pesquisa.periodo,
      canal: pesquisa.canal,
      ativa: pesquisa.ativa,
      unidadePadraoId: pesquisa.unidadePadraoId,
      criadoEm: pesquisa.criadoEm,
    };
  }
}
