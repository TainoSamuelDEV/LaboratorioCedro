import { NextFunction, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { ObterUsuarioLogadoUseCase } from '../../application/use-cases/auth/ObterUsuarioLogadoUseCase';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly obterUsuarioLogadoUseCase: ObterUsuarioLogadoUseCase
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
