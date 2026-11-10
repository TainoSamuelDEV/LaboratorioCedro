import { NextFunction, Response } from 'express';
import { ObterIndicadoresDashboardUseCase } from '../../application/use-cases/dashboard/ObterIndicadoresDashboardUseCase';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class DashboardController {
  constructor(private readonly obterIndicadoresUseCase: ObterIndicadoresDashboardUseCase) {}

  public obterIndicadores = async (
    req: RequestAutenticada,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const unidadeId = typeof req.query.unidadeId === 'string' ? req.query.unidadeId : undefined;

      const indicadores = await this.obterIndicadoresUseCase.execute(usuarioId, unidadeId);
      res.status(200).json(indicadores);
    } catch (error) {
      next(error);
    }
  };
}
