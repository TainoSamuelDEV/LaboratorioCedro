import { describe, expect, it } from 'vitest';
import { Manifestacao } from '../../src/domain/entities/Manifestacao';
import { RespostaPesquisa } from '../../src/domain/entities/RespostaPesquisa';
import { Unidade } from '../../src/domain/entities/Unidade';
import {
  Administrador,
  CoordenadorUnidade,
  OperadorOuvidoria,
} from '../../src/domain/entities/Usuario';
import {
  PrioridadeManifestacao,
  StatusManifestacao,
  TipoInteracao,
} from '../../src/domain/enums';
import { AcessoNegadoError, RegraNegocioError } from '../../src/domain/errors/DomainErrors';
import { ProtocoloService } from '../../src/domain/services/IProtocoloService';
import { PoliticaSlaPorNota } from '../../src/domain/services/ISLACalculator';

describe('Dominio POO: Agregado Manifestacao, Encapsulamento e Maquina de Estados', () => {
  const unidadeCedroSul = new Unidade('unid-sul', 'Cedro Sul Coletas', 'Dr. Ricardo', true, 48);
  const unidadeCedroNorte = new Unidade('unid-norte', 'Cedro Norte Diagnósticos', 'Dra. Luiza', true, 48);

  const coordSul = new CoordenadorUnidade('u-coord-sul', 'Dr. Roberto', 'roberto@cedro.com.br', 'unid-sul');
  const coordNorte = new CoordenadorUnidade('u-coord-norte', 'Dra. Julia', 'julia@cedro.com.br', 'unid-norte');
  const ouvidoria = new OperadorOuvidoria('u-ouv', 'Amanda Ouvidoria', 'amanda@cedro.com.br');
  const admin = new Administrador('u-admin', 'Gabriel Tech Lead', 'gabriel@cedro.com.br');

  const criarManifestacaoPadrao = (nota: number = 2) => {
    const resposta = new RespostaPesquisa(
      'resp-101',
      'pesq-01',
      unidadeCedroSul.id,
      'Paciente Carlos Ferreira',
      nota,
      'Demora no resultado do exame de sangue.'
    );

    return Manifestacao.criar({
      id: 'manif-uuid-1',
      resposta,
      unidade: unidadeCedroSul,
      protocoloService: new ProtocoloService('CED'),
      slaCalculator: new PoliticaSlaPorNota(),
      criadoEm: new Date('2026-11-10T08:00:00.000Z'),
    });
  };

  it('deve criar uma Manifestacao automaticamente no status NAO_RESPONDIDA com auditoria inicial', () => {
    ProtocoloService.resetarContador(100);
    const m = criarManifestacaoPadrao(2); // Nota 2 (detratora)

    expect(m.id).toBe('manif-uuid-1');
    expect(m.protocolo).toBe('CED-2026-000100');
    expect(m.status).toBe(StatusManifestacao.NAO_RESPONDIDA);
    expect(m.prioridade).toBe(PrioridadeManifestacao.ALTA); // SLA reduzido e prioridade ALTA
    expect(m.unidadeId).toBe(unidadeCedroSul.id);
    expect(m.responsavelId).toBeNull();
    expect(m.concluidoEm).toBeNull();

    // Valida auditoria inicial automática
    expect(m.interacoes).toHaveLength(1);
    expect(m.interacoes[0].tipo).toBe(TipoInteracao.ABERTURA_AUTOMATICA);
    expect(m.interacoes[0].statusAnterior).toBeNull();
    expect(m.interacoes[0].statusNovo).toBe(StatusManifestacao.NAO_RESPONDIDA);
  });

  it('deve garantir encapsulamento impedindo mutação externa direta das listas internas', () => {
    const m = criarManifestacaoPadrao(4);

    expect(() => {
      // @ts-expect-error Tentativa de mutação de array congelado/imutável
      m.interacoes.push({ id: 'fake' });
    }).toThrow();
  });

  it('deve permitir que apenas o coordenador da unidade responsável inicie o tratamento', () => {
    const m = criarManifestacaoPadrao(3);

    // Coordenador da unidade Norte tentando tratar caso da unidade Sul
    expect(() => {
      m.iniciarTratamento(coordNorte);
    }).toThrow(AcessoNegadoError);

    // Coordenador correto da unidade Sul
    const interacao = m.iniciarTratamento(coordSul);

    expect(m.status).toBe(StatusManifestacao.EM_TRATAMENTO);
    expect(m.responsavelId).toBe(coordSul.id);
    expect(interacao.tipo).toBe(TipoInteracao.INICIO_TRATAMENTO);
    expect(interacao.usuarioId).toBe(coordSul.id);
    expect(m.interacoes).toHaveLength(2);
  });

  it('deve registrar resposta formal da unidade e transicionar para status RESPONDIDA', () => {
    const m = criarManifestacaoPadrao(2);
    m.iniciarTratamento(coordSul);

    // Coordenador de outra unidade é bloqueado
    expect(() => {
      m.registrarRespostaUnidade(coordNorte, 'Tentativa de resposta indevida');
    }).toThrow(AcessoNegadoError);

    const respostaFormal = m.registrarRespostaUnidade(
      coordSul,
      'Identificamos que o equipamento de hematologia passou por calibração. Amostra já liberada.'
    );

    expect(respostaFormal.conteudo).toContain('calibração');
    expect(m.status).toBe(StatusManifestacao.RESPONDIDA);
    expect(m.respostasUnidade).toHaveLength(1);
    expect(m.interacoes).toHaveLength(3);
    expect(m.interacoes[2].tipo).toBe(TipoInteracao.RESPOSTA_UNIDADE);
  });

  it('deve permitir que a Ouvidoria solicite complemento devolvendo a manifestação para EM_TRATAMENTO', () => {
    const m = criarManifestacaoPadrao(1);
    m.iniciarTratamento(coordSul);
    m.registrarRespostaUnidade(coordSul, 'Aguardando laudo.');

    // Coordenador não pode solicitar complemento (apenas Ouvidoria/Admin)
    expect(() => {
      m.solicitarComplemento(coordSul, 'Preciso de mais dados');
    }).toThrow(AcessoNegadoError);

    const interacaoComp = m.solicitarComplemento(
      ouvidoria,
      'Favor anexar o laudo de calibração e confirmar se o cliente já foi contatado.'
    );

    expect(m.status).toBe(StatusManifestacao.EM_TRATAMENTO);
    expect(interacaoComp.tipo).toBe(TipoInteracao.SOLICITACAO_COMPLEMENTO);
    expect(interacaoComp.texto).toContain('anexar o laudo');
  });

  it('deve permitir que a Ouvidoria escalone a manifestação elevando prioridade para CRITICA', () => {
    const m = criarManifestacaoPadrao(2);

    // Coordenador não tem permissão para escalonar
    expect(() => {
      m.escalonar(coordSul, 'Falta de reagente');
    }).toThrow(AcessoNegadoError);

    const esc = m.escalonar(ouvidoria, 'SLA de 24 horas estourado sem resposta inicial da unidade.', 2);

    expect(esc.nivel).toBe(2);
    expect(m.status).toBe(StatusManifestacao.ESCALONADA);
    expect(m.prioridade).toBe(PrioridadeManifestacao.CRITICA);
    expect(m.escalonamentos).toHaveLength(1);
    expect(m.interacoes[1].tipo).toBe(TipoInteracao.ESCALONAMENTO);
  });

  it('deve reencaminhar para outra unidade apenas se solicitado pela Ouvidoria ou Administrador', () => {
    const m = criarManifestacaoPadrao(3);

    expect(() => {
      m.encaminharParaUnidade(coordSul, unidadeCedroNorte, 'Erro de triagem');
    }).toThrow(AcessoNegadoError);

    m.encaminharParaUnidade(ouvidoria, unidadeCedroNorte, 'Paciente realizou coleta na unidade Norte, não Sul.');

    expect(m.unidadeId).toBe(unidadeCedroNorte.id);
    expect(m.responsavelId).toBeNull(); // Reseta responsável anterior
  });

  it('deve BLOQUEAR a conclusão se não houver resposta formal registrada pela unidade', () => {
    const m = criarManifestacaoPadrao(3);

    // Não pode concluir no status NAO_RESPONDIDA nem sem RespostaUnidade
    expect(() => {
      m.concluir(ouvidoria, 'Conclusão arbitrária');
    }).toThrow(RegraNegocioError);
  });

  it('deve concluir a manifestação com sucesso após resposta da unidade e travar alterações posteriores', () => {
    const m = criarManifestacaoPadrao(2);
    m.iniciarTratamento(coordSul);
    m.registrarRespostaUnidade(coordSul, 'Paciente acolhido e novo exame agendado sem custos.');

    // Coordenador não pode concluir
    expect(() => {
      m.concluir(coordSul, 'Finalizado');
    }).toThrow(AcessoNegadoError);

    // Ouvidoria conclui
    const interacaoConclusao = m.concluir(
      ouvidoria,
      'Manifestação finalizada a contento com acolhimento direto ao paciente.'
    );

    expect(m.status).toBe(StatusManifestacao.CONCLUIDA);
    expect(m.concluidoEm).not.toBeNull();
    expect(interacaoConclusao.tipo).toBe(TipoInteracao.CONCLUSAO);

    // Imutabilidade pós-conclusão: qualquer tentativa posterior de transição é rejeitada
    expect(() => {
      m.iniciarTratamento(coordSul);
    }).toThrow(RegraNegocioError);

    expect(() => {
      m.registrarRespostaUnidade(coordSul, 'Tentando responder após conclusão');
    }).toThrow(RegraNegocioError);

    expect(() => {
      m.escalonar(ouvidoria, 'Escalonar caso já fechado');
    }).toThrow(RegraNegocioError);
  });

  it('deve validar consistência ao reconstituir manifestação vinda do banco de dados', () => {
    // Tenta reconstituir CONCLUIDA sem respostas -> deve rejeitar
    expect(() => {
      Manifestacao.reconstituir({
        id: 'm-db-1',
        protocolo: 'CED-2026-000001',
        respostaId: 'r-1',
        unidadeId: 'u-1',
        status: StatusManifestacao.CONCLUIDA,
        prioridade: PrioridadeManifestacao.MEDIA,
        responsavelId: null,
        prazoResposta: new Date(),
        criadoEm: new Date(),
        concluidoEm: new Date(),
        interacoes: [],
        respostasUnidade: [], // Inconsistente!
        escalonamentos: [],
      });
    }).toThrow(RegraNegocioError);
  });
});
