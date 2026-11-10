import { NextFunction, Request, Response } from 'express';
import { CriarPesquisaUseCase } from '../../application/use-cases/pesquisas/CriarPesquisaUseCase';
import { ListarPesquisasUseCase } from '../../application/use-cases/pesquisas/ListarPesquisasUseCase';
import { ObterPesquisaPublicaUseCase } from '../../application/use-cases/pesquisas/ObterPesquisaPublicaUseCase';
import { ResponderPesquisaUseCase } from '../../application/use-cases/pesquisas/ResponderPesquisaUseCase';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class PesquisaController {
  constructor(
    private readonly criarPesquisaUseCase: CriarPesquisaUseCase,
    private readonly listarPesquisasUseCase: ListarPesquisasUseCase,
    private readonly obterPesquisaPublicaUseCase: ObterPesquisaPublicaUseCase,
    private readonly responderPesquisaUseCase: ResponderPesquisaUseCase
  ) {}

  public criar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const { titulo, descricao, periodo, canal, unidadePadraoId } = req.body;

      const pesquisa = await this.criarPesquisaUseCase.executar({
        executanteId,
        titulo,
        descricao,
        periodo,
        canal,
        unidadePadraoId,
      });

      res.status(201).json(pesquisa);
    } catch (error) {
      next(error);
    }
  };

  public listar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apenasAtivas = req.query.apenasAtivas === 'true';
      const pesquisas = await this.listarPesquisasUseCase.executar(apenasAtivas);
      res.status(200).json(pesquisas);
    } catch (error) {
      next(error);
    }
  };

  public obterPublica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pesquisaPublica = await this.obterPesquisaPublicaUseCase.executar(id);
      res.status(200).json(pesquisaPublica);
    } catch (error) {
      next(error);
    }
  };

  public responderPublica = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { unidadeId, clienteAtendimento, nota, comentario } = req.body;

      const resultado = await this.responderPesquisaUseCase.executar({
        pesquisaId: id,
        unidadeId,
        clienteAtendimento,
        nota,
        comentario,
      });

      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}
