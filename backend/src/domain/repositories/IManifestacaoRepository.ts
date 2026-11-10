import { Manifestacao } from '../entities/Manifestacao';
import { StatusManifestacao, PrioridadeManifestacao } from '../enums';
import { IRepository } from './IRepository';

export interface FiltrosManifestacao {
  dataInicio?: Date;
  dataFim?: Date;
  nota?: number;
  unidadeId?: string;
  status?: StatusManifestacao;
  prioridade?: PrioridadeManifestacao;
  responsavelId?: string;
  escalonada?: boolean;
  pendente?: boolean;
  busca?: string; // Protocolo ou texto
}

export interface IManifestacaoRepository extends IRepository<Manifestacao> {
  buscarPorProtocolo(protocolo: string): Promise<Manifestacao | null>;
  buscarPorRespostaId(respostaId: string): Promise<Manifestacao | null>;
  listar(filtros?: FiltrosManifestacao): Promise<Manifestacao[]>;
  listarPendencias(unidadeId?: string): Promise<Manifestacao[]>;
}
