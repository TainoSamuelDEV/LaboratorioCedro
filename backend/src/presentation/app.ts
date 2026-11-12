import cors from 'cors';
import express, { Express } from 'express';
import { BcryptPasswordHasher } from '../application/services/BcryptPasswordHasher';
import { IPasswordHasher } from '../application/services/IPasswordHasher';
import { ITokenService } from '../application/services/ITokenService';
import { JwtTokenService } from '../application/services/JwtTokenService';
import { LoginUseCase } from '../application/use-cases/auth/LoginUseCase';
import { ObterUsuarioLogadoUseCase } from '../application/use-cases/auth/ObterUsuarioLogadoUseCase';
import { ListarManifestacoesUseCase } from '../application/use-cases/manifestacoes/ListarManifestacoesUseCase';
import { ObterManifestacaoPorIdUseCase } from '../application/use-cases/manifestacoes/ObterManifestacaoPorIdUseCase';
import { TratarManifestacaoUseCase } from '../application/use-cases/manifestacoes/TratarManifestacaoUseCase';
import { CriarPesquisaUseCase } from '../application/use-cases/pesquisas/CriarPesquisaUseCase';
import { ListarPesquisasUseCase } from '../application/use-cases/pesquisas/ListarPesquisasUseCase';
import { ObterPesquisaPublicaUseCase } from '../application/use-cases/pesquisas/ObterPesquisaPublicaUseCase';
import { ResponderPesquisaUseCase } from '../application/use-cases/pesquisas/ResponderPesquisaUseCase';
import { ObterPesquisaPorIdUseCase } from '../application/use-cases/pesquisas/ObterPesquisaPorIdUseCase';
import { AtualizarPesquisaUseCase } from '../application/use-cases/pesquisas/AtualizarPesquisaUseCase';
import { AtualizarUnidadeUseCase } from '../application/use-cases/unidades/AtualizarUnidadeUseCase';
import { CriarUnidadeUseCase } from '../application/use-cases/unidades/CriarUnidadeUseCase';
import { ListarUnidadesUseCase } from '../application/use-cases/unidades/ListarUnidadesUseCase';
import { ObterUnidadePorIdUseCase } from '../application/use-cases/unidades/ObterUnidadePorIdUseCase';
import { CriarUsuarioUseCase } from '../application/use-cases/usuarios/CriarUsuarioUseCase';
import { ListarUsuariosUseCase } from '../application/use-cases/usuarios/ListarUsuariosUseCase';
import { ObterUsuarioPorIdUseCase } from '../application/use-cases/usuarios/ObterUsuarioPorIdUseCase';
import { AtualizarUsuarioUseCase } from '../application/use-cases/usuarios/AtualizarUsuarioUseCase';
import { ObterIndicadoresDashboardUseCase } from '../application/use-cases/dashboard/ObterIndicadoresDashboardUseCase';
import { ExportarRelatorioUseCase } from '../application/use-cases/relatorios/ExportarRelatorioUseCase';
import { IManifestacaoRepository } from '../domain/repositories/IManifestacaoRepository';
import { IPesquisaRepository } from '../domain/repositories/IPesquisaRepository';
import { IRespostaPesquisaRepository } from '../domain/repositories/IRespostaPesquisaRepository';
import { IUnidadeRepository } from '../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../domain/repositories/IUsuarioRepository';
import { ConsoleNotificador, INotificador } from '../domain/services/INotificador';
import { IProtocoloService, ProtocoloService } from '../domain/services/IProtocoloService';
import { ISLACalculator, PoliticaSlaPorNota } from '../domain/services/ISLACalculator';
import { AuthController } from './controllers/AuthController';
import { DashboardController } from './controllers/DashboardController';
import { ManifestacaoController } from './controllers/ManifestacaoController';
import { PesquisaController } from './controllers/PesquisaController';
import { RelatorioController } from './controllers/RelatorioController';
import { UnidadeController } from './controllers/UnidadeController';
import { UsuarioController } from './controllers/UsuarioController';
import { criarAuthMiddleware } from './middlewares/authMiddleware';
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware';
import { criarAuthRouter } from './routes/auth.routes';
import { criarDashboardRouter } from './routes/dashboard.routes';
import { criarManifestacaoRouter } from './routes/manifestacao.routes';
import { criarPesquisaRouter, criarPublicPesquisaRouter } from './routes/pesquisa.routes';
import { criarRelatorioRouter } from './routes/relatorio.routes';
import { criarUnidadeRouter } from './routes/unidade.routes';
import { criarUsuarioRouter } from './routes/usuario.routes';

export interface AppDependencies {
  usuarioRepo: IUsuarioRepository;
  unidadeRepo: IUnidadeRepository;
  pesquisaRepo: IPesquisaRepository;
  respostaRepo: IRespostaPesquisaRepository;
  manifestacaoRepo: IManifestacaoRepository;
  notificador?: INotificador;
  passwordHasher?: IPasswordHasher;
  tokenService?: ITokenService;
  protocoloService?: IProtocoloService;
  slaCalculator?: ISLACalculator;
}

export function criarApp(deps: AppDependencies): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Serviços
  const passwordHasher = deps.passwordHasher ?? new BcryptPasswordHasher();
  const tokenService = deps.tokenService ?? new JwtTokenService();
  const notificador = deps.notificador ?? new ConsoleNotificador();
  const protocoloService = deps.protocoloService ?? new ProtocoloService();
  const slaCalculator = deps.slaCalculator ?? new PoliticaSlaPorNota();

  // Casos de Uso - Auth & Usuários
  const loginUseCase = new LoginUseCase(deps.usuarioRepo, passwordHasher, tokenService);
  const obterUsuarioLogadoUseCase = new ObterUsuarioLogadoUseCase(deps.usuarioRepo);
  const criarUsuarioUseCase = new CriarUsuarioUseCase(deps.usuarioRepo, passwordHasher);
  const listarUsuariosUseCase = new ListarUsuariosUseCase(deps.usuarioRepo);
  const obterUsuarioPorIdUseCase = new ObterUsuarioPorIdUseCase(
    deps.usuarioRepo,
    deps.unidadeRepo,
    deps.manifestacaoRepo
  );
  const atualizarUsuarioUseCase = new AtualizarUsuarioUseCase(
    deps.usuarioRepo,
    deps.unidadeRepo,
    passwordHasher
  );

  // Casos de Uso - Unidades
  const criarUnidadeUseCase = new CriarUnidadeUseCase(deps.unidadeRepo, deps.usuarioRepo);
  const atualizarUnidadeUseCase = new AtualizarUnidadeUseCase(deps.unidadeRepo, deps.usuarioRepo);
  const listarUnidadesUseCase = new ListarUnidadesUseCase(deps.unidadeRepo);
  const obterUnidadePorIdUseCase = new ObterUnidadePorIdUseCase(
    deps.unidadeRepo,
    deps.manifestacaoRepo,
    deps.respostaRepo,
    deps.pesquisaRepo,
    deps.usuarioRepo
  );

  // Casos de Uso - Pesquisas
  const criarPesquisaUseCase = new CriarPesquisaUseCase(deps.pesquisaRepo, deps.usuarioRepo);
  const listarPesquisasUseCase = new ListarPesquisasUseCase(deps.pesquisaRepo);
  const obterPesquisaPublicaUseCase = new ObterPesquisaPublicaUseCase(deps.pesquisaRepo, deps.unidadeRepo);
  const obterPesquisaPorIdUseCase = new ObterPesquisaPorIdUseCase(
    deps.pesquisaRepo,
    deps.respostaRepo,
    deps.manifestacaoRepo,
    deps.unidadeRepo
  );
  const atualizarPesquisaUseCase = new AtualizarPesquisaUseCase(
    deps.pesquisaRepo,
    deps.usuarioRepo,
    deps.unidadeRepo
  );
  const responderPesquisaUseCase = new ResponderPesquisaUseCase(
    deps.pesquisaRepo,
    deps.unidadeRepo,
    deps.respostaRepo,
    deps.manifestacaoRepo,
    notificador,
    protocoloService,
    slaCalculator
  );

  // Casos de Uso - Manifestações
  const obterManifestacaoPorIdUseCase = new ObterManifestacaoPorIdUseCase(
    deps.manifestacaoRepo,
    deps.usuarioRepo,
    deps.unidadeRepo,
    deps.respostaRepo
  );
  const listarManifestacoesUseCase = new ListarManifestacoesUseCase(
    deps.manifestacaoRepo,
    deps.usuarioRepo,
    deps.unidadeRepo,
    deps.respostaRepo
  );
  const tratarManifestacaoUseCase = new TratarManifestacaoUseCase(
    deps.manifestacaoRepo,
    deps.usuarioRepo,
    deps.unidadeRepo,
    notificador
  );

  // Casos de Uso - Dashboard e Relatórios (Entrega 8)
  const obterIndicadoresDashboardUseCase = new ObterIndicadoresDashboardUseCase(
    deps.manifestacaoRepo,
    deps.respostaRepo,
    deps.unidadeRepo,
    deps.usuarioRepo,
    deps.pesquisaRepo
  );
  const exportarRelatorioUseCase = new ExportarRelatorioUseCase(
    deps.manifestacaoRepo,
    deps.unidadeRepo,
    deps.usuarioRepo
  );

  // Controllers
  const authController = new AuthController(loginUseCase, obterUsuarioLogadoUseCase);
  const usuarioController = new UsuarioController(
    criarUsuarioUseCase,
    listarUsuariosUseCase,
    obterUsuarioPorIdUseCase,
    atualizarUsuarioUseCase
  );
  const unidadeController = new UnidadeController(
    criarUnidadeUseCase,
    atualizarUnidadeUseCase,
    listarUnidadesUseCase,
    obterUnidadePorIdUseCase
  );
  const pesquisaController = new PesquisaController(
    criarPesquisaUseCase,
    listarPesquisasUseCase,
    obterPesquisaPublicaUseCase,
    responderPesquisaUseCase,
    obterPesquisaPorIdUseCase,
    atualizarPesquisaUseCase
  );
  const manifestacaoController = new ManifestacaoController(
    obterManifestacaoPorIdUseCase,
    listarManifestacoesUseCase,
    tratarManifestacaoUseCase
  );
  const dashboardController = new DashboardController(obterIndicadoresDashboardUseCase);
  const relatorioController = new RelatorioController(exportarRelatorioUseCase);

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', servico: 'Cedro NIT API (POO)', timestamp: new Date() });
  });

  // Mapeamento de Rotas Oficiais
  app.use('/api/auth', criarAuthRouter(authController, tokenService));
  app.use('/api/usuarios', criarUsuarioRouter(usuarioController, tokenService));
  app.use('/api/unidades', criarUnidadeRouter(unidadeController, tokenService));
  app.use('/api/pesquisas', criarPesquisaRouter(pesquisaController, tokenService));
  app.use('/api/public/pesquisas', criarPublicPesquisaRouter(pesquisaController));
  app.use('/api/manifestacoes', criarManifestacaoRouter(manifestacaoController, tokenService));
  app.use('/api/dashboard', criarDashboardRouter(dashboardController, tokenService));
  app.use('/api/relatorios', criarRelatorioRouter(relatorioController, tokenService));

  // Rota de Pendências (Tela 6)
  const authMiddleware = criarAuthMiddleware(tokenService);
  app.get('/api/pendencias', authMiddleware, manifestacaoController.listarPendencias);

  // Middleware Global de Tratamento de Erros
  app.use(errorHandlerMiddleware);

  return app;
}
