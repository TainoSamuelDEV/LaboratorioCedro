import { Router } from 'express';
import { ITokenService } from '../../application/services/ITokenService';
import { PerfilUsuario } from '../../domain/enums';
import { UnidadeController } from '../controllers/UnidadeController';
import { criarAuthMiddleware } from '../middlewares/authMiddleware';
import { autorizarPerfis } from '../middlewares/rbacMiddleware';

export function criarUnidadeRouter(unidadeController: UnidadeController, tokenService: ITokenService): Router {
  const router = Router();
  const authMiddleware = criarAuthMiddleware(tokenService);

  // Listagem pode ser acessada por usuários autenticados
  router.get('/', authMiddleware, unidadeController.listar);

  // Cadastro e alteração restritos ao Administrador
  router.post(
    '/',
    authMiddleware,
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR),
    unidadeController.criar
  );

  router.patch(
    '/:id',
    authMiddleware,
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR),
    unidadeController.atualizar
  );

  return router;
}
