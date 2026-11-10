import { NextFunction, Response } from 'express';
import { ITokenService } from '../../application/services/ITokenService';
import { RequestAutenticada } from '../types/RequestAutenticada';

export function criarAuthMiddleware(tokenService: ITokenService) {
  return (req: RequestAutenticada, res: Response, next: NextFunction): void => {
    const headerAuth = req.headers.authorization;

    if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
      res.status(401).json({
        erro: 'Token de autenticação não fornecido. Utilize o formato: Bearer <token>.',
      });
      return;
    }

    const token = headerAuth.split(' ')[1];

    try {
      const payload = tokenService.verificar(token);
      req.usuario = payload;
      next();
    } catch {
      res.status(401).json({
        erro: 'Token de autenticação inválido ou expirado.',
      });
    }
  };
}
