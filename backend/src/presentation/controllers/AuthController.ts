import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { IPasswordHasher } from '../../application/services/IPasswordHasher';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { ObterUsuarioLogadoUseCase } from '../../application/use-cases/auth/ObterUsuarioLogadoUseCase';
import { UsuarioFactory } from '../../domain/entities/Usuario';
import { PerfilUsuario } from '../../domain/enums';
import { RegraNegocioError } from '../../domain/errors/DomainErrors';
import { IUnidadeRepository } from '../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly obterUsuarioLogadoUseCase: ObterUsuarioLogadoUseCase,
    private readonly usuarioRepo?: IUsuarioRepository,
    private readonly passwordHasher?: IPasswordHasher,
    private readonly unidadeRepo?: IUnidadeRepository
  ) {}

  public login = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, senha } = req.body;
      const resultado = await this.loginUseCase.executar({ email, senha });
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.usuarioRepo || !this.passwordHasher) {
        throw new RegraNegocioError('Serviço de auto-cadastro não disponível.');
      }

      const { nome, email, senha, perfil, unidadeId } = req.body;

      if (!senha || String(senha).length < 6) {
        throw new RegraNegocioError('A senha deve possuir no mínimo 6 caracteres.');
      }

      const emailNormalizado = String(email || '').trim().toLowerCase();
      const existente = await this.usuarioRepo.buscarPorEmail(emailNormalizado);
      if (existente) {
        throw new RegraNegocioError(`Já existe uma conta cadastrada com o e-mail ${emailNormalizado}.`);
      }

      const perfilEscolhido = (perfil as PerfilUsuario) || PerfilUsuario.COORDENADOR_UNIDADE;

      const novoUsuario = UsuarioFactory.criar({
        id: randomUUID(),
        nome: String(nome || '').trim(),
        email: emailNormalizado,
        perfil: perfilEscolhido,
        unidadeId: perfilEscolhido === PerfilUsuario.COORDENADOR_UNIDADE ? unidadeId : undefined,
        ativo: true,
        criadoEm: new Date(),
      });

      const senhaHash = await this.passwordHasher.hash(String(senha));
      await this.usuarioRepo.salvarComSenha(novoUsuario, senhaHash);

      const resultadoLogin = await this.loginUseCase.executar({
        email: emailNormalizado,
        senha: String(senha),
      });

      res.status(201).json(resultadoLogin);
    } catch (error) {
      next(error);
    }
  };

  public listarUnidadesPublicas = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.unidadeRepo) {
        res.status(200).json([]);
        return;
      }
      const unidades = await this.unidadeRepo.listarAtivas();
      res.status(200).json(
        unidades.map((u) => ({
          id: u.id,
          nome: u.nome,
        }))
      );
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const usuario = await this.obterUsuarioLogadoUseCase.executar(usuarioId);
      res.status(200).json(usuario);
    } catch (error) {
      next(error);
    }
  };
}
