import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { RecursoNaoEncontradoError } from '../../../domain/errors/DomainErrors';

export interface UsuarioDetalhadoDTO {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  unidadeId: string | null;
  unidadeNome: string | null;
  ativo: boolean;
  criadoEm: string;
  auditoria: {
    totalInteracoes: number;
    totalRespostasUnidade: number;
    totalEscalonamentos: number;
  };
}

export class ObterUsuarioPorIdUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly manifestacaoRepo: IManifestacaoRepository
  ) {}

  public async executar(id: string): Promise<UsuarioDetalhadoDTO> {
    const usuario = await this.usuarioRepo.buscarPorId(id);
    if (!usuario) {
      throw new RecursoNaoEncontradoError(`Usuário com ID '${id}' não encontrado.`);
    }

    let unidadeNome: string | null = null;
    if (usuario.unidadeId) {
      const unidade = await this.unidadeRepo.buscarPorId(usuario.unidadeId);
      if (unidade) {
        unidadeNome = unidade.nome;
      }
    }

    // Calcular resumo de auditoria a partir do histórico de manifestações
    const todasManifestacoes = await this.manifestacaoRepo.listar();

    let totalInteracoes = 0;
    let totalRespostasUnidade = 0;
    let totalEscalonamentos = 0;

    for (const m of todasManifestacoes) {
      totalInteracoes += m.interacoes.filter((i) => i.usuarioId === id).length;
      totalRespostasUnidade += m.respostasUnidade.filter((r) => r.usuarioId === id).length;
      totalEscalonamentos += m.escalonamentos.filter((e) => e.usuarioId === id).length;
    }

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      unidadeId: usuario.unidadeId,
      unidadeNome,
      ativo: usuario.ativo,
      criadoEm: usuario.criadoEm.toISOString(),
      auditoria: {
        totalInteracoes,
        totalRespostasUnidade,
        totalEscalonamentos,
      },
    };
  }
}
