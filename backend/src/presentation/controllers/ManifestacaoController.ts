import { NextFunction, Response } from 'express';
import { PrioridadeManifestacao, StatusManifestacao } from '../../domain/enums';
import { ListarManifestacoesUseCase } from '../../application/use-cases/manifestacoes/ListarManifestacoesUseCase';
import { ObterManifestacaoPorIdUseCase } from '../../application/use-cases/manifestacoes/ObterManifestacaoPorIdUseCase';
import { TratarManifestacaoUseCase } from '../../application/use-cases/manifestacoes/TratarManifestacaoUseCase';
import { RequestAutenticada } from '../types/RequestAutenticada';

export class ManifestacaoController {
  constructor(
    private readonly obterManifestacaoPorIdUseCase: ObterManifestacaoPorIdUseCase,
    private readonly listarManifestacoesUseCase: ListarManifestacoesUseCase,
    private readonly tratarManifestacaoUseCase: TratarManifestacaoUseCase
  ) {}

  public obterPorId = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const { id } = req.params;
      const manifestacao = await this.obterManifestacaoPorIdUseCase.executar(id, executanteId);
      res.status(200).json(manifestacao);
    } catch (error) {
      next(error);
    }
  };

  public listar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const {
        dataInicio,
        dataFim,
        nota,
        unidadeId,
        status,
        prioridade,
        responsavelId,
        escalonada,
        pendente,
        busca,
      } = req.query;

      const manifestacoes = await this.listarManifestacoesUseCase.executar({
        usuarioExecutanteId: executanteId,
        dataInicio: dataInicio ? new Date(String(dataInicio)) : undefined,
        dataFim: dataFim ? new Date(String(dataFim)) : undefined,
        nota: nota ? Number(nota) : undefined,
        unidadeId: unidadeId ? String(unidadeId) : undefined,
        status: status ? (status as StatusManifestacao) : undefined,
        prioridade: prioridade ? (prioridade as PrioridadeManifestacao) : undefined,
        responsavelId: responsavelId ? String(responsavelId) : undefined,
        escalonada: escalonada !== undefined ? escalonada === 'true' : undefined,
        pendente: pendente !== undefined ? pendente === 'true' : undefined,
        busca: busca ? String(busca) : undefined,
      });

      res.status(200).json(manifestacoes);
    } catch (error) {
      next(error);
    }
  };

  public listarPendencias = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const executanteId = req.usuario!.sub;
      const manifestacoes = await this.listarManifestacoesUseCase.executar({
        usuarioExecutanteId: executanteId,
        pendente: true,
      });

      res.status(200).json(manifestacoes);
    } catch (error) {
      next(error);
    }
  };

  public iniciarTratamento = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const { id } = req.params;

      await this.tratarManifestacaoUseCase.iniciarTratamento({
        manifestacaoId: id,
        usuarioId,
      });

      res.status(200).json({ mensagem: 'Tratamento da manifestação iniciado com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  public responderPelaUnidade = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const { id } = req.params;
      const { conteudo } = req.body;

      await this.tratarManifestacaoUseCase.responderPelaUnidade({
        manifestacaoId: id,
        usuarioId,
        conteudo,
      });

      res.status(201).json({ mensagem: 'Resposta da unidade registrada com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  public solicitarComplemento = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const { id } = req.params;
      const { motivo } = req.body;

      await this.tratarManifestacaoUseCase.solicitarComplemento({
        manifestacaoId: id,
        usuarioId,
        motivo,
      });

      res.status(200).json({ mensagem: 'Solicitação de complemento registrada com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  public escalonar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const { id } = req.params;
      const { motivo, nivel } = req.body;

      await this.tratarManifestacaoUseCase.escalonar({
        manifestacaoId: id,
        usuarioId,
        motivo,
        nivel: nivel ? Number(nivel) : 1,
      });

      res.status(200).json({ mensagem: 'Manifestação escalonada com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  public encaminhar = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const { id } = req.params;
      const { novaUnidadeId, motivo } = req.body;

      await this.tratarManifestacaoUseCase.encaminhar({
        manifestacaoId: id,
        usuarioId,
        novaUnidadeId,
        motivo,
      });

      res.status(200).json({ mensagem: 'Manifestação reencaminhada com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  public concluir = async (req: RequestAutenticada, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.usuario!.sub;
      const { id } = req.params;
      const { parecerFinal } = req.body;

      await this.tratarManifestacaoUseCase.concluir({
        manifestacaoId: id,
        usuarioId,
        parecerFinal,
      });

      res.status(200).json({ mensagem: 'Manifestação concluída com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}
