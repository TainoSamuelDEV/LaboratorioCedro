import { describe, expect, it } from 'vitest';
import { Pesquisa } from '../../src/domain/entities/Pesquisa';
import { RespostaPesquisa } from '../../src/domain/entities/RespostaPesquisa';
import { CanalPesquisa } from '../../src/domain/enums';
import { RegraNegocioError } from '../../src/domain/errors/DomainErrors';

describe('Dominio POO: Entidades Pesquisa e RespostaPesquisa', () => {
  it('deve criar uma pesquisa válida e permitir recebimento de resposta enquanto ativa', () => {
    const pesquisa = new Pesquisa(
      'pesq-1',
      'Pesquisa de Satisfação Laboratório 2026',
      'Avaliação da experiência de coleta',
      '2026-Q1',
      CanalPesquisa.QR_CODE
    );

    expect(pesquisa.ativa).toBe(true);
    expect(() => pesquisa.validarRecebimentoResposta()).not.toThrow();

    pesquisa.desativar();
    expect(pesquisa.ativa).toBe(false);
    expect(() => pesquisa.validarRecebimentoResposta()).toThrow(RegraNegocioError);
  });

  it('deve criar uma RespostaPesquisa válida com nota entre 1 e 5', () => {
    const resposta = new RespostaPesquisa(
      'resp-1',
      'pesq-1',
      'unid-1',
      'Atendimento #1002 - João Pedro',
      4,
      'Atendimento rápido e equipe muito atenciosa.'
    );

    expect(resposta.nota).toBe(4);
    expect(resposta.exigePrioridadeAlta()).toBe(false);
  });

  it('deve classificar nota detratora (1 ou 2) como exigência de prioridade alta', () => {
    const respostaNota1 = new RespostaPesquisa(
      'resp-1',
      'pesq-1',
      'unid-1',
      'Cliente Ana',
      1,
      'Demora excessiva e perda de amostra.'
    );
    expect(respostaNota1.exigePrioridadeAlta()).toBe(true);

    const respostaNota2 = new RespostaPesquisa(
      'resp-2',
      'pesq-1',
      'unid-1',
      'Cliente Carlos',
      2,
      'Falta de informação na recepção.'
    );
    expect(respostaNota2.exigePrioridadeAlta()).toBe(true);
  });

  it('deve rejeitar notas fora da escala de 1 a 5 ou não inteiras', () => {
    expect(() => {
      new RespostaPesquisa('r', 'p', 'u', 'Cli', 0, 'Comentário');
    }).toThrow(RegraNegocioError);

    expect(() => {
      new RespostaPesquisa('r', 'p', 'u', 'Cli', 6, 'Comentário');
    }).toThrow(RegraNegocioError);

    expect(() => {
      new RespostaPesquisa('r', 'p', 'u', 'Cli', 3.5, 'Comentário');
    }).toThrow(RegraNegocioError);
  });
});
