import { Router } from 'express';
import { ITokenService } from '../../application/services/ITokenService';
import { PerfilUsuario } from '../../domain/enums';
import { RelatorioController } from '../controllers/RelatorioController';
import { criarAuthMiddleware } from '../middlewares/authMiddleware';
import { autorizarPerfis } from '../middlewares/rbacMiddleware';

export function criarRelatorioRouter(
  controller: RelatorioController,
  tokenService: ITokenService
): Router {
  const router = Router();
  const authMiddleware = criarAuthMiddleware(tokenService);

  // GET /api/relatorios/exportar (Admin e Ouvidoria)
  router.get(
    '/exportar',
    authMiddleware,
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR_OUVIDORIA),
    controller.exportar
  );

  return router;
}
