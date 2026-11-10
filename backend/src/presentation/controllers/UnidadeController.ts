import { NextFunction, Response } from 'express';
import { AtualizarUnidadeUseCase } from '../../application/use-cases/unidades/AtualizarUnidadeUseCase';
import { CriarUnidadeUseCase } from '../../application/use-cases/unidades/CriarUnidadeUseCase';
import { ListarUnidadesUseCase } from '../../application/use-cases/unidades/ListarUnidadesUseCase';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class UnidadeController {
  constructor(
    private readonly criarUnidadeUseCase: CriarUnidadeUseCase,
    private readonly atualizarUnidadeUseCase: AtualizarUnidadeUseCase,
    private readonly listarUnidadesUseCase: ListarUnidadesUseCase
  ) {}

  public criar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const { nome, responsavelNome, prazoPadraoHoras } = req.body;

      const unidade = await this.criarUnidadeUseCase.executar({
        executanteId,
        nome,
        responsavelNome,
        prazoPadraoHoras,
      });

      res.status(201).json(unidade);
    } catch (error) {
      next(error);
    }
  };

  public atualizar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const { id } = req.params;
      const { nome, responsavelNome, prazoPadraoHoras, ativa } = req.body;

      const unidade = await this.atualizarUnidadeUseCase.executar({
        executanteId,
        unidadeId: id,
        nome,
        responsavelNome,
        prazoPadraoHoras,
        ativa,
      });

      res.status(200).json(unidade);
    } catch (error) {
      next(error);
    }
  };

  public listar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apenasAtivas = req.query.apenasAtivas === 'true';
      const unidades = await this.listarUnidadesUseCase.executar(apenasAtivas);
      res.status(200).json(unidades);
    } catch (error) {
      next(error);
    }
  };
}
