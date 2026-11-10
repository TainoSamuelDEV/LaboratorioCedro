import { CanalPesquisa } from '../../domain/enums';
import { UnidadeOutput } from './UnidadeDTOs';

export interface CriarPesquisaInput {
  executanteId: string;
  titulo: string;
  descricao: string;
  periodo: string;
  canal: CanalPesquisa;
  unidadePadraoId?: string | null;
}

export interface PesquisaOutput {
  id: string;
  titulo: string;
  descricao: string;
  periodo: string;
  canal: CanalPesquisa;
  ativa: boolean;
  unidadePadraoId: string | null;
  criadoEm: Date;
}

export interface PesquisaPublicaOutput {
  id: string;
  titulo: string;
  descricao: string;
  unidadesAtivas: UnidadeOutput[];
  unidadePadraoId: string | null;
}

export interface ResponderPesquisaInput {
  pesquisaId: string;
  unidadeId: string;
  clienteAtendimento: string;
  nota: number;
  comentario: string;
}

export interface RespostaComManifestacaoOutput {
  respostaId: string;
  manifestacao: {
    id: string;
    protocolo: string;
    status: string;
    prioridade: string;
    unidadeId: string;
    prazoResposta: Date;
    criadoEm: Date;
  };
}
