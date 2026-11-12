import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IRespostaPesquisaRepository } from '../../../domain/repositories/IRespostaPesquisaRepository';
import { IPesquisaRepository } from '../../../domain/repositories/IPesquisaRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { RecursoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { StatusManifestacao } from '../../../domain/enums';

export interface UnidadeDetalhadaDTO {
  id: string;
  nome: string;
  responsavelNome: string | null;
  ativa: boolean;
  prazoPadraoHoras: number;
  criadoEm: string;
  indicadores: {
    totalManifestacoes: number;
    pendenciasAbertas: number;
    pendenciasAtrasadas: number;
    notaMediaGeral: number;
    totalRespostas: number;
  };
  desempenhoPorPesquisa: Array<{
    pesquisaId: string;
    titulo: string;
    totalRespostas: number;
    notaMedia: number;
  }>;
  coordenadores: Array<{
    id: string;
    nome: string;
    email: string;
    ativo: boolean;
  }>;
}

export class ObterUnidadePorIdUseCase {
  constructor(
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly respostaRepo: IRespostaPesquisaRepository,
    private readonly pesquisaRepo: IPesquisaRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async executar(id: string): Promise<UnidadeDetalhadaDTO> {
    const unidade = await this.unidadeRepo.buscarPorId(id);
    if (!unidade) {
      throw new RecursoNaoEncontradoError(`Unidade com ID '${id}' não encontrada.`);
    }

    // Manifestações da unidade
    const todasManifestacoes = await this.manifestacaoRepo.listar({ unidadeId: id });
    const manifestacoesDaUnidade = todasManifestacoes.filter((m) => m.unidadeId === id);

    const agora = Date.now();
    const pendenciasAbertas = manifestacoesDaUnidade.filter(
      (m) => m.status !== StatusManifestacao.CONCLUIDA && m.status !== StatusManifestacao.RESPONDIDA
    ).length;

    const pendenciasAtrasadas = manifestacoesDaUnidade.filter((m) => {
      if (m.status === StatusManifestacao.CONCLUIDA || m.status === StatusManifestacao.RESPONDIDA) {
        return false;
      }
      return agora > m.prazoResposta.getTime();
    }).length;

    // Respostas da unidade
    const respostas = await this.respostaRepo.listarPorUnidade(id);
    const totalRespostas = respostas.length;
    const somaNotas = respostas.reduce((acc, r) => acc + r.nota, 0);
    const notaMediaGeral = totalRespostas > 0 ? Number((somaNotas / totalRespostas).toFixed(1)) : 0;

    // Agrupar respostas por pesquisa
    const respostasPorPesquisa = new Map<string, typeof respostas>();
    for (const r of respostas) {
      const lista = respostasPorPesquisa.get(r.pesquisaId) || [];
      lista.push(r);
      respostasPorPesquisa.set(r.pesquisaId, lista);
    }

    const desempenhoPorPesquisa: UnidadeDetalhadaDTO['desempenhoPorPesquisa'] = [];
    for (const [pesquisaId, listaRespostas] of respostasPorPesquisa.entries()) {
      const p = await this.pesquisaRepo.buscarPorId(pesquisaId);
      const soma = listaRespostas.reduce((acc, r) => acc + r.nota, 0);
      const media = Number((soma / listaRespostas.length).toFixed(1));
      desempenhoPorPesquisa.push({
        pesquisaId,
        titulo: p ? p.titulo : 'Pesquisa',
        totalRespostas: listaRespostas.length,
        notaMedia: media,
      });
    }

    // Coordenadores alocados
    const coordenadoresEntidades = await this.usuarioRepo.listarPorUnidade(id);
    const coordenadores = coordenadoresEntidades.map((c) => ({
      id: c.id,
      nome: c.nome,
      email: c.email,
      ativo: c.ativo,
    }));

    return {
      id: unidade.id,
      nome: unidade.nome,
      responsavelNome: unidade.responsavelNome,
      ativa: unidade.ativa,
      prazoPadraoHoras: unidade.prazoPadraoHoras,
      criadoEm: unidade.criadoEm.toISOString(),
      indicadores: {
        totalManifestacoes: manifestacoesDaUnidade.length,
        pendenciasAbertas,
        pendenciasAtrasadas,
        notaMediaGeral,
        totalRespostas,
      },
      desempenhoPorPesquisa,
      coordenadores,
    };
  }
}
