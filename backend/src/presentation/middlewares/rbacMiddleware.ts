import { NextFunction, Response } from 'express';
import { PerfilUsuario } from '../../domain/enums';
import { RequestAutenticada } from '../types/RequestAutenticada';

export function autorizarPerfis(...perfisPermitidos: PerfilUsuario[]) {
  return (req: RequestAutenticada, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({
        erro: 'Usuário não autenticado.',
      });
      return;
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      res.status(403).json({
        erro: 'Acesso negado: Seu perfil não possui permissão para executar esta ação.',
        perfilAtual: req.usuario.perfil,
        perfisPermitidos,
      });
      return;
    }

    next();
  };
}
