import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { UnidadeOutput } from '../../dtos/UnidadeDTOs';

export class ListarUnidadesUseCase {
  constructor(private readonly unidadeRepo: IUnidadeRepository) {}

  public async executar(apenasAtivas: boolean = false): Promise<UnidadeOutput[]> {
    const unidades = await this.unidadeRepo.listarTodas(apenasAtivas);
    return unidades.map((u) => ({
      id: u.id,
      nome: u.nome,
      responsavelNome: u.responsavelNome,
      ativa: u.ativa,
      prazoPadraoHoras: u.prazoPadraoHoras,
      criadoEm: u.criadoEm,
    }));
  }
}
