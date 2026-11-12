import { PerfilUsuario } from '../../../domain/enums';
import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IRespostaPesquisaRepository } from '../../../domain/repositories/IRespostaPesquisaRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { FiltrosListagemManifestacaoInput, ManifestacaoDetalheOutput } from '../../dtos/ManifestacaoDTOs';

export class ListarManifestacoesUseCase {
  constructor(
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly unidadeRepo?: IUnidadeRepository,
    private readonly respostaRepo?: IRespostaPesquisaRepository
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

    // Mapeamento em lote de nomes de unidades e dados da resposta original
    const unidades = this.unidadeRepo ? await this.unidadeRepo.listarTodas() : [];
    const mapaUnidades = new Map<string, string>();
    unidades.forEach((u) => mapaUnidades.set(u.id, u.nome));

    const respostas = this.respostaRepo ? await this.respostaRepo.listarTodos(unidadeFiltro) : [];
    const mapaRespostas = new Map<
      string,
      { nota: number; comentario: string; clienteAtendimento: string }
    >();
    respostas.forEach((r) =>
      mapaRespostas.set(r.id, {
        nota: r.nota,
        comentario: r.comentario,
        clienteAtendimento: r.clienteAtendimento,
      })
    );

    return manifestacoes.map((m) => {
      const respInfo = mapaRespostas.get(m.respostaId);
      return {
        id: m.id,
        protocolo: m.protocolo,
        status: m.status,
        prioridade: m.prioridade,
        unidadeId: m.unidadeId,
        unidadeNome: mapaUnidades.get(m.unidadeId) || 'Unidade não identificada',
        respostaId: m.respostaId,
        clienteAtendimento: respInfo?.clienteAtendimento,
        nota: respInfo?.nota,
        comentarioCliente: respInfo?.comentario,
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
      };
    });
  }
}
