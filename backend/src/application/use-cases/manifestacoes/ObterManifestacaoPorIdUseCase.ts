import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IRespostaPesquisaRepository } from '../../../domain/repositories/IRespostaPesquisaRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { ManifestacaoDetalheOutput } from '../../dtos/ManifestacaoDTOs';

export class ObterManifestacaoPorIdUseCase {
  constructor(
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly respostaRepo: IRespostaPesquisaRepository
  ) {}

  public async executar(manifestacaoId: string, executanteId: string): Promise<ManifestacaoDetalheOutput> {
    const usuario = await this.usuarioRepo.buscarPorId(executanteId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário executante não encontrado.');
    }

    const manifestacao = await this.manifestacaoRepo.buscarPorId(manifestacaoId);
    if (!manifestacao) {
      throw new ObjetoNaoEncontradoError('Manifestação não encontrada.');
    }

    // Validação polimórfica de visualização por perfil/unidade
    if (!usuario.podeVisualizarManifestacao(manifestacao.unidadeId)) {
      throw new AcessoNegadoError('Acesso não autorizado aos dados desta manifestação.');
    }

    const [unidade, resposta] = await Promise.all([
      this.unidadeRepo.buscarPorId(manifestacao.unidadeId),
      this.respostaRepo.buscarPorId(manifestacao.respostaId),
    ]);

    return {
      id: manifestacao.id,
      protocolo: manifestacao.protocolo,
      status: manifestacao.status,
      prioridade: manifestacao.prioridade,
      unidadeId: manifestacao.unidadeId,
      unidadeNome: unidade?.nome,
      respostaId: manifestacao.respostaId,
      clienteAtendimento: resposta?.clienteAtendimento,
      nota: resposta?.nota,
      comentarioCliente: resposta?.comentario,
      responsavelId: manifestacao.responsavelId,
      prazoResposta: manifestacao.prazoResposta,
      criadoEm: manifestacao.criadoEm,
      concluidoEm: manifestacao.concluidoEm,
      interacoes: manifestacao.interacoes.map((i) => ({
        id: i.id,
        usuarioId: i.usuarioId,
        tipo: i.tipo,
        texto: i.texto,
        statusAnterior: i.statusAnterior,
        statusNovo: i.statusNovo,
        dataHora: i.dataHora,
      })),
      respostasUnidade: manifestacao.respostasUnidade.map((r) => ({
        id: r.id,
        usuarioId: r.usuarioId,
        conteudo: r.conteudo,
        dataHora: r.dataHora,
      })),
      escalonamentos: manifestacao.escalonamentos.map((e) => ({
        id: e.id,
        usuarioId: e.usuarioId,
        motivo: e.motivo,
        nivel: e.nivel,
        dataHora: e.dataHora,
      })),
    };
  }
}
