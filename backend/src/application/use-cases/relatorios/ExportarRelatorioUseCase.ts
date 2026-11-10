import { AcessoNegadoError, ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { FiltrosRelatorioDTO, ItemRelatorioDTO } from '../../dtos/RelatorioDTOs';

export interface ResultadoExportacao {
  conteudo: string;
  mimeType: string;
  nomeArquivo: string;
}

export class ExportarRelatorioUseCase {
  constructor(
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly usuarioRepo: IUsuarioRepository
  ) {}

  public async execute(
    usuarioId: string,
    filtros: FiltrosRelatorioDTO = {}
  ): Promise<ResultadoExportacao> {
    const usuario = await this.usuarioRepo.buscarPorId(usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário solicitante não encontrado.');
    }

    if (!usuario.ativo) {
      throw new AcessoNegadoError('Usuário inativo.');
    }

    // Regra polimórfica: Coordenador de Unidade só exporta da própria unidade
    let unidadeIdEfetiva = filtros.unidadeId;
    if (usuario.unidadeId) {
      unidadeIdEfetiva = usuario.unidadeId;
    }

    const unidades = await this.unidadeRepo.listarTodas();
    const mapaUnidades = new Map<string, string>();
    unidades.forEach((u) => mapaUnidades.set(u.id, u.nome));

    const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : undefined;
    const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : undefined;

    const manifestacoes = await this.manifestacaoRepo.listar({
      dataInicio,
      dataFim,
      unidadeId: unidadeIdEfetiva,
      status: filtros.status,
      prioridade: filtros.prioridade,
    });

    const itens: ItemRelatorioDTO[] = manifestacoes.map((m) => {
      const unidadeNome = mapaUnidades.get(m.unidadeId) || 'Unidade Desconhecida';
      let tempoRespostaHoras: number | null = null;
      if (m.respostasUnidade.length > 0) {
        const primeira = m.respostasUnidade[0];
        tempoRespostaHoras = Number(
          ((primeira.dataHora.getTime() - m.criadoEm.getTime()) / (1000 * 60 * 60)).toFixed(1)
        );
      }

      let tempoConclusaoHoras: number | null = null;
      if (m.concluidoEm) {
        tempoConclusaoHoras = Number(
          ((m.concluidoEm.getTime() - m.criadoEm.getTime()) / (1000 * 60 * 60)).toFixed(1)
        );
      }

      return {
        protocolo: m.protocolo,
        unidadeNome,
        status: m.status,
        prioridade: m.prioridade,
        prazoResposta: m.prazoResposta.toISOString(),
        criadoEm: m.criadoEm.toISOString(),
        concluidoEm: m.concluidoEm ? m.concluidoEm.toISOString() : '-',
        tempoRespostaHoras,
        tempoConclusaoHoras,
        totalInteracoes: m.interacoes.length,
        totalEscalonamentos: m.escalonamentos.length,
        totalRespostasUnidade: m.respostasUnidade.length,
      };
    });

    const formato = filtros.formato === 'json' ? 'json' : 'csv';

    if (formato === 'json') {
      return {
        conteudo: JSON.stringify(itens, null, 2),
        mimeType: 'application/json; charset=utf-8',
        nomeArquivo: `relatorio-manifestacoes-${new Date().toISOString().slice(0, 10)}.json`,
      };
    }

    // Gerar CSV
    const cabecalho = [
      'Protocolo',
      'Unidade',
      'Status',
      'Prioridade',
      'Prazo_Resposta',
      'Criado_Em',
      'Concluido_Em',
      'Tempo_Resposta_Horas',
      'Tempo_Conclusao_Horas',
      'Qtd_Interacoes',
      'Qtd_Escalonamentos',
      'Qtd_Respostas_Unidade',
    ].join(';');

    const linhas = itens.map((item) =>
      [
        `"${item.protocolo}"`,
        `"${item.unidadeNome.replace(/"/g, '""')}"`,
        `"${item.status}"`,
        `"${item.prioridade}"`,
        `"${item.prazoResposta}"`,
        `"${item.criadoEm}"`,
        `"${item.concluidoEm}"`,
        item.tempoRespostaHoras !== null ? item.tempoRespostaHoras : '',
        item.tempoConclusaoHoras !== null ? item.tempoConclusaoHoras : '',
        item.totalInteracoes,
        item.totalEscalonamentos,
        item.totalRespostasUnidade,
      ].join(';')
    );

    const conteudoCsv = [cabecalho, ...linhas].join('\r\n');

    return {
      conteudo: `\uFEFF${conteudoCsv}`, // BOM para Excel abrir acentos UTF-8 perfeitamente
      mimeType: 'text/csv; charset=utf-8',
      nomeArquivo: `relatorio-manifestacoes-${new Date().toISOString().slice(0, 10)}.csv`,
    };
  }
}
