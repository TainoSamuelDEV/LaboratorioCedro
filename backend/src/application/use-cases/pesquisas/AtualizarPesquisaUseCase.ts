import { IPesquisaRepository } from '../../../domain/repositories/IPesquisaRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { Pesquisa } from '../../../domain/entities/Pesquisa';
import { CanalPesquisa, PerfilUsuario } from '../../../domain/enums';
import {
  AcessoNegadoError,
  RecursoNaoEncontradoError,
  RegraNegocioError,
} from '../../../domain/errors/DomainErrors';

export interface AtualizarPesquisaInput {
  id: string;
  executadoPorUsuarioId: string;
  titulo?: string;
  descricao?: string;
  periodo?: string;
  canal?: CanalPesquisa;
  unidadePadraoId?: string | null;
  ativa?: boolean;
}

export class AtualizarPesquisaUseCase {
  constructor(
    private readonly pesquisaRepo: IPesquisaRepository,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly unidadeRepo: IUnidadeRepository
  ) {}

  public async executar(input: AtualizarPesquisaInput): Promise<Pesquisa> {
    const usuario = await this.usuarioRepo.buscarPorId(input.executadoPorUsuarioId);
    if (!usuario) {
      throw new RecursoNaoEncontradoError('Usuário executor não encontrado.');
    }

    if (usuario.perfil !== PerfilUsuario.ADMINISTRADOR) {
      throw new AcessoNegadoError('Apenas administradores podem atualizar ou desativar pesquisas.');
    }

    const pesquisa = await this.pesquisaRepo.buscarPorId(input.id);
    if (!pesquisa) {
      throw new RecursoNaoEncontradoError(`Pesquisa com ID '${input.id}' não encontrada.`);
    }

    // Se unidadePadraoId for fornecido, validar se existe
    if (input.unidadePadraoId) {
      const unidade = await this.unidadeRepo.buscarPorId(input.unidadePadraoId);
      if (!unidade) {
        throw new RegraNegocioError(`Unidade com ID '${input.unidadePadraoId}' não existe.`);
      }
    }

    // Atualizar dados cadastrais se algum foi informado
    const novoTitulo = input.titulo !== undefined ? input.titulo : pesquisa.titulo;
    const novaDescricao = input.descricao !== undefined ? input.descricao : pesquisa.descricao;
    const novoPeriodo = input.periodo !== undefined ? input.periodo : pesquisa.periodo;
    const novoCanal = input.canal !== undefined ? input.canal : pesquisa.canal;
    const novaUnidadeId =
      input.unidadePadraoId !== undefined ? input.unidadePadraoId : pesquisa.unidadePadraoId;

    pesquisa.atualizarDados(novoTitulo, novaDescricao, novoPeriodo, novoCanal, novaUnidadeId);

    // Soft delete / Reativação
    if (input.ativa !== undefined) {
      if (input.ativa) {
        pesquisa.ativar();
      } else {
        pesquisa.desativar();
      }
    }

    await this.pesquisaRepo.salvar(pesquisa);
    return pesquisa;
  }
}
