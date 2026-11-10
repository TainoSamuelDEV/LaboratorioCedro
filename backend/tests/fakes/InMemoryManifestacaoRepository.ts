import { Manifestacao } from '../../src/domain/entities/Manifestacao';
import { StatusManifestacao } from '../../src/domain/enums';
import {
  FiltrosManifestacao,
  IManifestacaoRepository,
} from '../../src/domain/repositories/IManifestacaoRepository';

export class InMemoryManifestacaoRepository implements IManifestacaoRepository {
  public itens: Manifestacao[] = [];

  public async salvar(manifestacao: Manifestacao): Promise<void> {
    const index = this.itens.findIndex((m) => m.id === manifestacao.id);
    if (index >= 0) {
      this.itens[index] = manifestacao;
    } else {
      this.itens.push(manifestacao);
    }
  }

  public async buscarPorId(id: string): Promise<Manifestacao | null> {
    const manifestacao = this.itens.find((m) => m.id === id);
    return manifestacao ?? null;
  }

  public async buscarPorProtocolo(protocolo: string): Promise<Manifestacao | null> {
    const manifestacao = this.itens.find(
      (m) => m.protocolo.toLowerCase() === protocolo.toLowerCase()
    );
    return manifestacao ?? null;
  }

  public async buscarPorRespostaId(respostaId: string): Promise<Manifestacao | null> {
    const manifestacao = this.itens.find((m) => m.respostaId === respostaId);
    return manifestacao ?? null;
  }

  public async listar(filtros?: FiltrosManifestacao): Promise<Manifestacao[]> {
    return this.itens.filter((m) => {
      if (filtros?.unidadeId && m.unidadeId !== filtros.unidadeId) return false;
      if (filtros?.status && m.status !== filtros.status) return false;
      if (filtros?.prioridade && m.prioridade !== filtros.prioridade) return false;
      if (filtros?.responsavelId && m.responsavelId !== filtros.responsavelId) return false;
      if (filtros?.escalonada !== undefined) {
        const temEscalonamento = m.escalonamentos.length > 0;
        if (filtros.escalonada !== temEscalonamento) return false;
      }
      if (filtros?.pendente) {
        const isPendente =
          m.status === StatusManifestacao.NAO_RESPONDIDA ||
          m.status === StatusManifestacao.ESCALONADA ||
          m.prazoResposta.getTime() < Date.now();
        if (!isPendente) return false;
      }
      if (filtros?.busca) {
        const termo = filtros.busca.toLowerCase();
        const matchesProtocolo = m.protocolo.toLowerCase().includes(termo);
        if (!matchesProtocolo) return false;
      }
      return true;
    });
  }

  public async listarPendencias(unidadeId?: string): Promise<Manifestacao[]> {
    const agora = Date.now();
    return this.itens.filter((m) => {
      if (unidadeId && m.unidadeId !== unidadeId) return false;
      const ehNaoRespondida = m.status === StatusManifestacao.NAO_RESPONDIDA;
      const ehEscalonada = m.status === StatusManifestacao.ESCALONADA;
      const estAtrasada =
        m.status !== StatusManifestacao.CONCLUIDA &&
        m.status !== StatusManifestacao.RESPONDIDA &&
        m.prazoResposta.getTime() < agora;

      return ehNaoRespondida || ehEscalonada || estAtrasada;
    });
  }
}
