import { PrioridadeManifestacao } from '../enums';

export interface ResultadoCalculoSla {
  prazoResposta: Date;
  prioridade: PrioridadeManifestacao;
  horasEfetivas: number;
}

export interface ISLACalculator {
  calcular(prazoPadraoHoras: number, nota: number, dataBase?: Date): ResultadoCalculoSla;
}

export class PoliticaSlaPorNota implements ISLACalculator {
  public calcular(
    prazoPadraoHoras: number,
    nota: number,
    dataBase: Date = new Date()
  ): ResultadoCalculoSla {
    let prioridade: PrioridadeManifestacao;
    let horasEfetivas: number;

    // Regra acordada: Notas detratoras (1 e 2) reduzem o prazo pela metade e elevam prioridade para ALTA
    if (nota <= 2) {
      prioridade = PrioridadeManifestacao.ALTA;
      horasEfetivas = Math.max(1, Math.floor(prazoPadraoHoras / 2));
    } else if (nota === 3) {
      prioridade = PrioridadeManifestacao.MEDIA;
      horasEfetivas = prazoPadraoHoras;
    } else {
      prioridade = PrioridadeManifestacao.BAIXA;
      horasEfetivas = prazoPadraoHoras;
    }

    const prazoResposta = new Date(dataBase.getTime() + horasEfetivas * 60 * 60 * 1000);

    return {
      prazoResposta,
      prioridade,
      horasEfetivas,
    };
  }
}
