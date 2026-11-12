import { IPesquisaRepository } from '../../../domain/repositories/IPesquisaRepository';
import { IRespostaPesquisaRepository } from '../../../domain/repositories/IRespostaPesquisaRepository';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { RecursoNaoEncontradoError } from '../../../domain/errors/DomainErrors';

export interface PesquisaDetalhadaDTO {
  id: string;
  titulo: string;
  descricao: string;
  periodo: string;
  canal: string;
  ativa: boolean;
  unidadePadraoId: string | null;
  unidadePadraoNome: string | null;
  criadoEm: string;
  indicadores: {
    totalRespostas: number;
    notaMedia: number;
    percentualSatisfeitos: number;
    totalManifestacoes: number;
    distribuicaoNotas: Array<{
      nota: number;
      quantidade: number;
      percentual: number;
    }>;
  };
  ultimasManifestacoes: Array<{
    id: string;
    protocolo: string;
    unidadeNome: string;
    nota: number;
    comentario: string;
    status: string;
    criadoEm: string;
  }>;
}

export class ObterPesquisaPorIdUseCase {
  constructor(
    private readonly pesquisaRepo: IPesquisaRepository,
    private readonly respostaRepo: IRespostaPesquisaRepository,
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly unidadeRepo: IUnidadeRepository
  ) {}

  public async executar(id: string): Promise<PesquisaDetalhadaDTO> {
    const pesquisa = await this.pesquisaRepo.buscarPorId(id);
    if (!pesquisa) {
      throw new RecursoNaoEncontradoError(`Pesquisa com ID '${id}' não encontrada.`);
    }

    // Carregar nome da unidade padrão se houver
    let unidadePadraoNome: string | null = null;
    if (pesquisa.unidadePadraoId) {
      const unidade = await this.unidadeRepo.buscarPorId(pesquisa.unidadePadraoId);
      if (unidade) {
        unidadePadraoNome = unidade.nome;
      }
    }

    // Carregar todas as respostas vinculadas a esta pesquisa
    const respostas = await this.respostaRepo.listarPorPesquisa(id);
    const totalRespostas = respostas.length;

    // Calcular nota média
    const somaNotas = respostas.reduce((acc, r) => acc + r.nota, 0);
    const notaMedia = totalRespostas > 0 ? Number((somaNotas / totalRespostas).toFixed(1)) : 0;

    // Calcular satisfeitos (notas 4 e 5)
    const totalSatisfeitos = respostas.filter((r) => r.nota >= 4).length;
    const percentualSatisfeitos =
      totalRespostas > 0 ? Math.round((totalSatisfeitos / totalRespostas) * 100) : 0;

    // Distribuição de notas de 5 a 1
    const contagemPorNota: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    respostas.forEach((r) => {
      if (r.nota >= 1 && r.nota <= 5) {
        contagemPorNota[r.nota]++;
      }
    });

    const distribuicaoNotas = [5, 4, 3, 2, 1].map((nota) => ({
      nota,
      quantidade: contagemPorNota[nota] || 0,
      percentual:
        totalRespostas > 0
          ? Math.round(((contagemPorNota[nota] || 0) / totalRespostas) * 100)
          : 0,
    }));

    // Carregar manifestações geradas por essas respostas
    const respostaIds = new Set(respostas.map((r) => r.id));
    const mapaRespostas = new Map(respostas.map((r) => [r.id, r]));

    // Carregar unidades para enriquecer com unidadeNome
    const todasUnidades = await this.unidadeRepo.listarTodas();
    const mapaUnidades = new Map(todasUnidades.map((u) => [u.id, u.nome]));

    const todasManifestacoes = await this.manifestacaoRepo.listar();
    const manifestacoesDaPesquisa = todasManifestacoes.filter((m) =>
      respostaIds.has(m.respostaId)
    );

    const ultimasManifestacoes = manifestacoesDaPesquisa.slice(0, 10).map((m) => {
      const resp = mapaRespostas.get(m.respostaId);
      return {
        id: m.id,
        protocolo: m.protocolo,
        unidadeNome: mapaUnidades.get(m.unidadeId) || 'Unidade',
        nota: resp ? resp.nota : 0,
        comentario: resp ? resp.comentario : '',
        status: m.status,
        criadoEm: m.criadoEm.toISOString(),
      };
    });

    return {
      id: pesquisa.id,
      titulo: pesquisa.titulo,
      descricao: pesquisa.descricao,
      periodo: pesquisa.periodo,
      canal: pesquisa.canal,
      ativa: pesquisa.ativa,
      unidadePadraoId: pesquisa.unidadePadraoId,
      unidadePadraoNome,
      criadoEm: pesquisa.criadoEm.toISOString(),
      indicadores: {
        totalRespostas,
        notaMedia,
        percentualSatisfeitos,
        totalManifestacoes: manifestacoesDaPesquisa.length,
        distribuicaoNotas,
      },
      ultimasManifestacoes,
    };
  }
}
