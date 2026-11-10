import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { AtualizarUnidadeInput, UnidadeOutput } from '../../dtos/UnidadeDTOs';

export class AtualizarUnidadeUseCase {
  constructor(
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async executar(input: AtualizarUnidadeInput): Promise<UnidadeOutput> {
    const executante = await this.usuarioRepo.buscarPorId(input.executanteId);
    if (!executante) {
      throw new ObjetoNaoEncontradoError('Usuário executante não encontrado.');
    }

    if (!executante.podeGerenciarSistema()) {
      throw new AcessoNegadoError('Apenas administradores podem alterar dados de unidades.');
    }

    const unidade = await this.unidadeRepo.buscarPorId(input.unidadeId);
    if (!unidade) {
      throw new ObjetoNaoEncontradoError('Unidade não encontrada.');
    }

    unidade.atualizarDados(input.nome, input.responsavelNome ?? null, input.prazoPadraoHoras);

    if (input.ativa !== undefined) {
      if (input.ativa) {
        unidade.ativar();
      } else {
        unidade.desativar();
      }
    }

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
