import { NextFunction, Response } from 'express';
import { ExportarRelatorioUseCase } from '../../application/use-cases/relatorios/ExportarRelatorioUseCase';
import { PrioridadeManifestacao, StatusManifestacao } from '../../domain/enums';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class RelatorioController {
  constructor(private readonly exportarRelatorioUseCase: ExportarRelatorioUseCase) {}

  public exportar = async (
    req: RequestAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const { dataInicio, dataFim, unidadeId, status, prioridade, formato } = req.query;

      const resultado = await this.exportarRelatorioUseCase.execute(usuarioId, {
        dataInicio: typeof dataInicio === 'string' ? dataInicio : undefined,
        dataFim: typeof dataFim === 'string' ? dataFim : undefined,
        unidadeId: typeof unidadeId === 'string' ? unidadeId : undefined,
        status: typeof status === 'string' ? (status as StatusManifestacao) : undefined,
        prioridade: typeof prioridade === 'string' ? (prioridade as PrioridadeManifestacao) : undefined,
        formato: formato === 'json' ? 'json' : 'csv',
      });

      res.setHeader('Content-Type', resultado.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${resultado.nomeArquivo}"`);
      res.status(200).send(resultado.conteudo);
    } catch (error) {
      next(error);
    }
  };
}
