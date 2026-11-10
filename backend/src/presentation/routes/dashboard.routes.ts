import { Router } from 'express';
import { ITokenService } from '../../application/services/ITokenService';
import { DashboardController } from '../controllers/DashboardController';
import { criarAuthMiddleware } from '../middlewares/authMiddleware';

export function criarDashboardRouter(
  controller: DashboardController,
  tokenService: ITokenService
): Router {
  const router = Router();
  const authMiddleware = criarAuthMiddleware(tokenService);

  // GET /api/dashboard/indicadores (Todos os perfis autenticados - escopo por perfil)
  router.get('/indicadores', authMiddleware, controller.obterIndicadores);

  return router;
}
