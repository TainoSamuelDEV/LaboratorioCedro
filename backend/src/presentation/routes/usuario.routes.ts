import { Router } from 'express';
import { ITokenService } from '../../application/services/ITokenService';
import { PerfilUsuario } from '../../domain/enums';
import { UsuarioController } from '../controllers/UsuarioController';
import { criarAuthMiddleware } from '../middlewares/authMiddleware';
import { autorizarPerfis } from '../middlewares/rbacMiddleware';

export function criarUsuarioRouter(usuarioController: UsuarioController, tokenService: ITokenService): Router {
  const router = Router();
  const authMiddleware = criarAuthMiddleware(tokenService);

  router.use(authMiddleware);

  router.get(
    '/',
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR_OUVIDORIA),
    usuarioController.listar
  );

  router.post(
    '/',
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR),
    usuarioController.criar
  );

  return router;
}
