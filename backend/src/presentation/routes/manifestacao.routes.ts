import { Router } from 'express';
import { ITokenService } from '../../application/services/ITokenService';
import { PerfilUsuario } from '../../domain/enums';
import { ManifestacaoController } from '../controllers/ManifestacaoController';
import { criarAuthMiddleware } from '../middlewares/authMiddleware';
import { autorizarPerfis } from '../middlewares/rbacMiddleware';

export function criarManifestacaoRouter(
  manifestacaoController: ManifestacaoController,
  tokenService: ITokenService
): Router {
  const router = Router();
  const authMiddleware = criarAuthMiddleware(tokenService);

  router.use(authMiddleware);

  // Consultas
  router.get('/', manifestacaoController.listar);
  router.get('/:id', manifestacaoController.obterPorId);

  // Ações de Tratativa da Unidade
  router.patch(
    '/:id/iniciar-tratamento',
    autorizarPerfis(PerfilUsuario.COORDENADOR_UNIDADE),
    manifestacaoController.iniciarTratamento
  );

  router.post(
    '/:id/respostas-unidade',
    autorizarPerfis(PerfilUsuario.COORDENADOR_UNIDADE),
    manifestacaoController.responderPelaUnidade
  );

  // Ações da Ouvidoria e Administração
  router.patch(
    '/:id/solicitar-complemento',
    autorizarPerfis(PerfilUsuario.OPERADOR_OUVIDORIA, PerfilUsuario.ADMINISTRADOR),
    manifestacaoController.solicitarComplemento
  );

  router.post(
    '/:id/escalonar',
    autorizarPerfis(PerfilUsuario.OPERADOR_OUVIDORIA, PerfilUsuario.ADMINISTRADOR),
    manifestacaoController.escalonar
  );

  router.patch(
    '/:id/encaminhar',
    autorizarPerfis(PerfilUsuario.OPERADOR_OUVIDORIA, PerfilUsuario.ADMINISTRADOR),
    manifestacaoController.encaminhar
  );

  router.patch(
    '/:id/concluir',
    autorizarPerfis(PerfilUsuario.OPERADOR_OUVIDORIA, PerfilUsuario.ADMINISTRADOR),
    manifestacaoController.concluir
  );

  return router;
}
