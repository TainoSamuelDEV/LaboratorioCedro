import { describe, expect, it } from 'vitest';
import { PrioridadeManifestacao } from '../../src/domain/enums';
import { PoliticaSlaPorNota } from '../../src/domain/services/ISLACalculator';

describe('Dominio POO: PoliticaSlaPorNota e Calculo de Prazos', () => {
  const calculadora = new PoliticaSlaPorNota();
  const dataBase = new Date('2026-11-10T10:00:00.000Z');

  it('deve cortar o prazo pela metade e definir prioridade ALTA para nota 1 ou 2', () => {
    const prazoPadrao = 48; // 48 horas padrão

    const resultadoNota1 = calculadora.calcular(prazoPadrao, 1, dataBase);
    expect(resultadoNota1.prioridade).toBe(PrioridadeManifestacao.ALTA);
    expect(resultadoNota1.horasEfetivas).toBe(24);
    expect(resultadoNota1.prazoResposta.toISOString()).toBe('2026-11-11T10:00:00.000Z');

    const resultadoNota2 = calculadora.calcular(prazoPadrao, 2, dataBase);
    expect(resultadoNota2.prioridade).toBe(PrioridadeManifestacao.ALTA);
    expect(resultadoNota2.horasEfetivas).toBe(24);
  });

  it('deve manter o prazo integral e definir prioridade MEDIA para nota 3', () => {
    const prazoPadrao = 48;

    const resultado = calculadora.calcular(prazoPadrao, 3, dataBase);
    expect(resultado.prioridade).toBe(PrioridadeManifestacao.MEDIA);
    expect(resultado.horasEfetivas).toBe(48);
    expect(resultado.prazoResposta.toISOString()).toBe('2026-11-12T10:00:00.000Z');
  });

  it('deve manter o prazo integral e definir prioridade BAIXA para notas 4 e 5', () => {
    const prazoPadrao = 72;

    const resultadoNota4 = calculadora.calcular(prazoPadrao, 4, dataBase);
    expect(resultadoNota4.prioridade).toBe(PrioridadeManifestacao.BAIXA);
    expect(resultadoNota4.horasEfetivas).toBe(72);

    const resultadoNota5 = calculadora.calcular(prazoPadrao, 5, dataBase);
    expect(resultadoNota5.prioridade).toBe(PrioridadeManifestacao.BAIXA);
    expect(resultadoNota5.horasEfetivas).toBe(72);
  });
});
