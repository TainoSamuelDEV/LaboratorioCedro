import { NextFunction, Response } from 'express';
import { CriarUsuarioUseCase } from '../../application/use-cases/usuarios/CriarUsuarioUseCase';
import { ListarUsuariosUseCase } from '../../application/use-cases/usuarios/ListarUsuariosUseCase';
import { ObterUsuarioPorIdUseCase } from '../../application/use-cases/usuarios/ObterUsuarioPorIdUseCase';
import { AtualizarUsuarioUseCase } from '../../application/use-cases/usuarios/AtualizarUsuarioUseCase';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class UsuarioController {
  constructor(
    private readonly criarUsuarioUseCase: CriarUsuarioUseCase,
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
    private readonly obterUsuarioPorIdUseCase: ObterUsuarioPorIdUseCase,
    private readonly atualizarUsuarioUseCase: AtualizarUsuarioUseCase
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

  public obterPorId = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const usuarioDetalhado = await this.obterUsuarioPorIdUseCase.executar(id);
      res.status(200).json(usuarioDetalhado);
    } catch (error) {
      next(error);
    }
  };

  public atualizar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const executanteId = req.usuario!.sub;
      const { nome, email, perfil, unidadeId, senha, ativo } = req.body;

      const usuarioAtualizado = await this.atualizarUsuarioUseCase.executar({
        id,
        executanteId,
        nome,
        email,
        perfil,
        unidadeId,
        senha,
        ativo,
      });

      res.status(200).json(usuarioAtualizado);
    } catch (error) {
      next(error);
    }
  };
}
