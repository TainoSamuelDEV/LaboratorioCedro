import { describe, expect, it } from 'vitest';
import { Unidade } from '../../src/domain/entities/Unidade';
import { RegraNegocioError } from '../../src/domain/errors/DomainErrors';

describe('Dominio POO: Entidade Unidade', () => {
  it('deve criar uma unidade com valores válidos', () => {
    const unidade = new Unidade('unid-1', 'Unidade Matriz', 'Dra. Beatriz', true, 48);

    expect(unidade.id).toBe('unid-1');
    expect(unidade.nome).toBe('Unidade Matriz');
    expect(unidade.responsavelNome).toBe('Dra. Beatriz');
    expect(unidade.prazoPadraoHoras).toBe(48);
    expect(unidade.ativa).toBe(true);
  });

  it('deve lançar erro se o prazo em horas for menor ou igual a zero', () => {
    expect(() => {
      new Unidade('unid-1', 'Unidade Matriz', null, true, 0);
    }).toThrow(RegraNegocioError);

    expect(() => {
      new Unidade('unid-1', 'Unidade Matriz', null, true, -5);
    }).toThrow(RegraNegocioError);
  });

  it('deve atualizar dados cadastrais e prazo corretamente', () => {
    const unidade = new Unidade('unid-1', 'Unidade Antiga', null, true, 48);
    unidade.atualizarDados('Unidade Renovada', 'Dr. Marcos', 72);

    expect(unidade.nome).toBe('Unidade Renovada');
    expect(unidade.responsavelNome).toBe('Dr. Marcos');
    expect(unidade.prazoPadraoHoras).toBe(72);
  });

  it('deve desativar e reativar a unidade', () => {
    const unidade = new Unidade('unid-1', 'Unidade Matriz');
    expect(unidade.ativa).toBe(true);

    unidade.desativar();
    expect(unidade.ativa).toBe(false);

    unidade.ativar();
    expect(unidade.ativa).toBe(true);
  });
});
