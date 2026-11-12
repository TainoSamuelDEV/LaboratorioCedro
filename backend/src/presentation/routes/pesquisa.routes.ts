import { Router } from 'express';
import { ITokenService } from '../../application/services/ITokenService';
import { PerfilUsuario } from '../../domain/enums';
import { PesquisaController } from '../controllers/PesquisaController';
import { criarAuthMiddleware } from '../middlewares/authMiddleware';
import { autorizarPerfis } from '../middlewares/rbacMiddleware';

export function criarPesquisaRouter(pesquisaController: PesquisaController, tokenService: ITokenService): Router {
  const router = Router();
  const authMiddleware = criarAuthMiddleware(tokenService);

  // Rotas Privadas (Gestão Interna)
  router.get(
    '/',
    authMiddleware,
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR_OUVIDORIA),
    pesquisaController.listar
  );

  router.get(
    '/:id',
    authMiddleware,
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.OPERADOR_OUVIDORIA),
    pesquisaController.obterPorId
  );

  router.post(
    '/',
    authMiddleware,
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR),
    pesquisaController.criar
  );

  router.patch(
    '/:id',
    authMiddleware,
    autorizarPerfis(PerfilUsuario.ADMINISTRADOR),
    pesquisaController.atualizar
  );

  return router;
}

export function criarPublicPesquisaRouter(pesquisaController: PesquisaController): Router {
  const router = Router();

  // Rotas Públicas do Cliente (QR Code / Link)
  router.get('/:id', pesquisaController.obterPublica);
  router.post('/:id/respostas', pesquisaController.responderPublica);

  return router;
}
