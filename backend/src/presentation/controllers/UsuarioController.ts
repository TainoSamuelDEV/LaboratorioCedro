import { NextFunction, Response } from 'express';
import { CriarUsuarioUseCase } from '../../application/use-cases/usuarios/CriarUsuarioUseCase';
import { ListarUsuariosUseCase } from '../../application/use-cases/usuarios/ListarUsuariosUseCase';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class UsuarioController {
  constructor(
    private readonly criarUsuarioUseCase: CriarUsuarioUseCase,
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase
  ) {}

  public criar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const { nome, email, senha, perfil, unidadeId } = req.body;

      const usuarioCriado = await this.criarUsuarioUseCase.executar({
        executanteId,
        nome,
        email,
        senha,
        perfil,
        unidadeId,
      });

      res.status(201).json(usuarioCriado);
    } catch (error) {
      next(error);
    }
  };

  public listar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const usuarios = await this.listarUsuariosUseCase.executar(executanteId);
      res.status(200).json(usuarios);
    } catch (error) {
      next(error);
    }
  };
}
