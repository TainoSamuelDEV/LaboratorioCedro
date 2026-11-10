import { ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IPesquisaRepository } from '../../../domain/repositories/IPesquisaRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { PesquisaPublicaOutput } from '../../dtos/PesquisaDTOs';

export class ObterPesquisaPublicaUseCase {
  constructor(
    private readonly pesquisaRepo: IPesquisaRepository,
    private readonly unidadeRepo: IUnidadeRepository
  ) {}

  public async executar(pesquisaId: string): Promise<PesquisaPublicaOutput> {
    const pesquisa = await this.pesquisaRepo.buscarPorId(pesquisaId);
    if (!pesquisa) {
      throw new ObjetoNaoEncontradoError('Pesquisa de satisfação não encontrada.');
    }

    pesquisa.validarRecebimentoResposta();

    const unidadesAtivas = await this.unidadeRepo.listarTodas(true);

    return {
      id: pesquisa.id,
      titulo: pesquisa.titulo,
      descricao: pesquisa.descricao,
      unidadePadraoId: pesquisa.unidadePadraoId,
      unidadesAtivas: unidadesAtivas.map((u) => ({
        id: u.id,
        nome: u.nome,
        responsavelNome: u.responsavelNome,
        ativa: u.ativa,
        prazoPadraoHoras: u.prazoPadraoHoras,
        criadoEm: u.criadoEm,
      })),
    };
  }
}
