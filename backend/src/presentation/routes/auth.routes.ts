import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { criarAuthMiddleware } from '../middlewares/authMiddleware';
import { ITokenService } from '../../application/services/ITokenService';

export function criarAuthRouter(authController: AuthController, tokenService: ITokenService): Router {
  const router = Router();
  const authMiddleware = criarAuthMiddleware(tokenService);

  router.post('/login', authController.login);
  router.post('/signup', authController.signup);
  router.get('/unidades', authController.listarUnidadesPublicas);
  router.get('/me', authMiddleware, authController.me);

  return router;
}
