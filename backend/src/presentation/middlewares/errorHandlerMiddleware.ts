import { NextFunction, Request, Response } from 'express';
import { DominioError } from '../../domain/errors/DomainErrors';

export function errorHandlerMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof DominioError) {
    res.status(error.codigoHttpSugerido).json({
      erro: error.message,
      tipo: error.name,
    });
    return;
  }

  // Erro não mapeado (500)
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERRO_INTERNO_API]:', error);
  }

  res.status(500).json({
    erro: 'Ocorreu um erro interno no servidor ao processar a requisição.',
  });
}
