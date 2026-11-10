import { StatusManifestacao } from '../../../domain/enums';
import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IRespostaPesquisaRepository } from '../../../domain/repositories/IRespostaPesquisaRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import {
  DistribuicaoNotaDTO,
  IndicadoresDashboardDTO,
  PendenciaPorUnidadeDTO,
  VolumePorUnidadeDTO,
} from '../../dtos/DashboardDTOs';

export class ObterIndicadoresDashboardUseCase {
  constructor(
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly respostaRepo: IRespostaPesquisaRepository,
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async execute(
    usuarioId: string,
    unidadeFiltroId?: string
  ): Promise<IndicadoresDashboardDTO> {
    const usuario = await this.usuarioRepo.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário solicitante não encontrado.');
    }

    if (!usuario.ativo) {
      throw new AcessoNegadoError('Usuário inativo.');
    }

    // Regra de escopo polimórfico: Coordenador de Unidade só vê os dados da própria unidade
    let unidadeIdEfetiva = unidadeFiltroId;
    if (usuario.unidadeId) {
      unidadeIdEfetiva = usuario.unidadeId;
    }

    const unidades = await this.unidadeRepo.listarTodas();
    const mapaUnidades = new Map<string, string>();
    unidades.forEach((u) => mapaUnidades.set(u.id, u.nome));

    const manifestacoes = await this.manifestacaoRepo.listar(
      unidadeIdEfetiva ? { unidadeId: unidadeIdEfetiva } : undefined
    );
    const respostas = await this.respostaRepo.listarTodos(unidadeIdEfetiva);

    // 1. Total de respostas
    const totalRespostas = respostas.length;

    // 2. Distribuição de notas (1 a 5)
    const distribuicaoNotas: DistribuicaoNotaDTO[] = [1, 2, 3, 4, 5].map((nota) => {
      const quantidade = respostas.filter((r) => r.nota === nota).length;
      const porcentagem =
        totalRespostas > 0 ? Number(((quantidade / totalRespostas) * 100).toFixed(1)) : 0;
      return { nota, quantidade, porcentagem };
    });

    // 3, 4, 5, 6. Status
    const totalAbertas = manifestacoes.filter(
      (m) => m.status !== StatusManifestacao.CONCLUIDA
    ).length;
    const totalNaoRespondidas = manifestacoes.filter(
      (m) => m.status === StatusManifestacao.NAO_RESPONDIDA
    ).length;
    const totalEscalonadas = manifestacoes.filter(
      (m) => m.status === StatusManifestacao.ESCALONADA
    ).length;
    const totalConcluidas = manifestacoes.filter(
      (m) => m.status === StatusManifestacao.CONCLUIDA
    ).length;

    // 7. Tempo médio de resposta da unidade (em horas)
    const comResposta = manifestacoes.filter((m) => m.respostasUnidade.length > 0);
    let tempoMedioRespostaHoras = 0;
    if (comResposta.length > 0) {
      const somaHoras = comResposta.reduce((acc, m) => {
        const primeiraResposta = m.respostasUnidade[0];
        const diferencaMs = primeiraResposta.dataHora.getTime() - m.criadoEm.getTime();
        return acc + Math.max(0, diferencaMs / (1000 * 60 * 60));
      }, 0);
      tempoMedioRespostaHoras = Number((somaHoras / comResposta.length).toFixed(1));
    }

    // 8. Tempo médio de conclusão (em horas)
    const comConclusao = manifestacoes.filter((m) => m.concluidoEm !== null);
    let tempoMedioConclusaoHoras = 0;
    if (comConclusao.length > 0) {
      const somaHoras = comConclusao.reduce((acc, m) => {
        const diferencaMs = m.concluidoEm!.getTime() - m.criadoEm.getTime();
        return acc + Math.max(0, diferencaMs / (1000 * 60 * 60));
      }, 0);
      tempoMedioConclusaoHoras = Number((somaHoras / comConclusao.length).toFixed(1));
    }

    // 9. Pendências por unidade
    // 10. Volume por unidade
    const unidadesFiltradas = unidadeIdEfetiva
      ? unidades.filter((u) => u.id === unidadeIdEfetiva)
      : unidades;

    const pendenciasPorUnidade: PendenciaPorUnidadeDTO[] = unidadesFiltradas.map((u) => {
      const pendencias = manifestacoes.filter(
        (m) => m.unidadeId === u.id && m.isPendente()
      ).length;
      return {
        unidadeId: u.id,
        unidadeNome: u.nome,
        pendencias,
      };
    });

    const volumePorUnidade: VolumePorUnidadeDTO[] = unidadesFiltradas.map((u) => {
      const total = manifestacoes.filter((m) => m.unidadeId === u.id).length;
      return {
        unidadeId: u.id,
        unidadeNome: u.nome,
        total,
      };
    });

    return {
      totalRespostas,
      distribuicaoNotas,
      totalAbertas,
      totalNaoRespondidas,
      totalEscalonadas,
      totalConcluidas,
      tempoMedioRespostaHoras,
      tempoMedioConclusaoHoras,
      pendenciasPorUnidade,
      volumePorUnidade,
    };
  }
}
