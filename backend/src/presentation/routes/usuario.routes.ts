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

  // Listagem de usuários
  router.get(
    '/',
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR_OUVIDORIA),
    usuarioController.listar
  );

  // Ficha detalhada do usuário
  router.get(
    '/:id',
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR_OUVIDORIA),
    usuarioController.obterPorId
  );

  // Cadastro de novo usuário (apenas Admin)
  router.post(
    '/',
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR),
    usuarioController.criar
  );

  // Atualização ou Soft Delete (apenas Admin)
  router.patch(
    '/:id',
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR),
    usuarioController.atualizar
  );

  return router;
}
