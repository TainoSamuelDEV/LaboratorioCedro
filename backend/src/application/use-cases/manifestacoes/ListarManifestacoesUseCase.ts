import { PerfilUsuario } from '../../../domain/enums';
import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { FiltrosListagemManifestacaoInput, ManifestacaoDetalheOutput } from '../../dtos/ManifestacaoDTOs';

export class ListarManifestacoesUseCase {
  constructor(
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async executar(filtros: FiltrosListagemManifestacaoInput): Promise<ManifestacaoDetalheOutput[]> {
    const usuario = await this.usuarioRepo.buscarPorId(filtros.usuarioExecutanteId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário executante não encontrado.');
    }

    if (!usuario.ativo) {
      throw new AcessoNegadoError('Usuário inativo.');
    }

    // Regra de segurança/escopo: Coordenador de Unidade só pode listar de sua própria unidade vinculada
    let unidadeFiltro = filtros.unidadeId;
    if (usuario.perfil === PerfilUsuario.COORDENADOR_UNIDADE) {
      if (!usuario.unidadeId) {
        throw new AcessoNegadoError('Coordenador sem unidade vinculada.');
      }
      unidadeFiltro = usuario.unidadeId;
    }

    const manifestacoes = await this.manifestacaoRepo.listar({
      ...filtros,
      unidadeId: unidadeFiltro,
    });

    return manifestacoes.map((m) => ({
      id: m.id,
      protocolo: m.protocolo,
      status: m.status,
      prioridade: m.prioridade,
      unidadeId: m.unidadeId,
      respostaId: m.respostaId,
      responsavelId: m.responsavelId,
      prazoResposta: m.prazoResposta,
      criadoEm: m.criadoEm,
      concluidoEm: m.concluidoEm,
      interacoes: m.interacoes.map((i) => ({
        id: i.id,
        usuarioId: i.usuarioId,
        tipo: i.tipo,
        texto: i.texto,
        statusAnterior: i.statusAnterior,
        statusNovo: i.statusNovo,
        dataHora: i.dataHora,
      })),
      respostasUnidade: m.respostasUnidade.map((r) => ({
        id: r.id,
        usuarioId: r.usuarioId,
        conteudo: r.conteudo,
        dataHora: r.dataHora,
      })),
      escalonamentos: m.escalonamentos.map((e) => ({
        id: e.id,
        usuarioId: e.usuarioId,
        motivo: e.motivo,
        nivel: e.nivel,
        dataHora: e.dataHora,
      })),
    }));
  }
}
