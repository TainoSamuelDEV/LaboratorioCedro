import { randomUUID } from 'crypto';
import { Unidade } from '../../../domain/entities/Unidade';
import { AcessoNegadoError, ObjetoNaoEncontradoError, RegraNegocioError } from '../../../domain/errors/DomainErrors';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { CriarUnidadeInput, UnidadeOutput } from '../../dtos/UnidadeDTOs';

export class CriarUnidadeUseCase {
  constructor(
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async executar(input: CriarUnidadeInput): Promise<UnidadeOutput> {
    const executante = await this.usuarioRepo.buscarPorId(input.executanteId);
    if (!executante) {
      throw new ObjetoNaoEncontradoError('Usuário executante não encontrado.');
    }

    if (!executante.podeGerenciarSistema()) {
      throw new AcessoNegadoError('Apenas administradores podem cadastrar novas unidades.');
    }

    const existente = await this.unidadeRepo.buscarPorNome(input.nome);
    if (existente) {
      throw new RegraNegocioError(`Já existe uma unidade cadastrada com o nome "${input.nome}".`);
    }

    const unidade = new Unidade(
      randomUUID(),
      input.nome,
      input.responsavelNome ?? null,
      true,
      input.prazoPadraoHoras ?? 48
    );

    await this.unidadeRepo.salvar(unidade);

    return {
      id: unidade.id,
      nome: unidade.nome,
      responsavelNome: unidade.responsavelNome,
      ativa: unidade.ativa,
      prazoPadraoHoras: unidade.prazoPadraoHoras,
      criadoEm: unidade.criadoEm,
    };
  }
}
