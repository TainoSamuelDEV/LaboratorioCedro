import { IPesquisaRepository } from '../../../domain/repositories/IPesquisaRepository';
import { PesquisaOutput } from '../../dtos/PesquisaDTOs';

export class ListarPesquisasUseCase {
  constructor(private readonly pesquisaRepo: IPesquisaRepository) {}

  public async executar(apenasAtivas: boolean = false): Promise<PesquisaOutput[]> {
    const pesquisas = await this.pesquisaRepo.listarTodas(apenasAtivas);
    return pesquisas.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      descricao: p.descricao,
      periodo: p.periodo,
      canal: p.canal,
      ativa: p.ativa,
      unidadePadraoId: p.unidadePadraoId,
      criadoEm: p.criadoEm,
    }));
  }
}
