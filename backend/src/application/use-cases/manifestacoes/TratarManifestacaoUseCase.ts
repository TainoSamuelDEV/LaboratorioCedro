import { ObjetoNaoEncontradoError } from '../../../domain/errors/DomainErrors';
import { IManifestacaoRepository } from '../../../domain/repositories/IManifestacaoRepository';
import { IUnidadeRepository } from '../../../domain/repositories/IUnidadeRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { INotificador, TipoNotificacao } from '../../../domain/services/INotificador';
import {
  ConcluirInput,
  EncaminharInput,
  EscalonarInput,
  IniciarTratamentoInput,
  ResponderUnidadeInput,
  SolicitarComplementoInput,
} from '../../dtos/ManifestacaoDTOs';

export class TratarManifestacaoUseCase {
  constructor(
    private readonly manifestacaoRepo: IManifestacaoRepository,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly unidadeRepo: IUnidadeRepository,
    private readonly notificador: INotificador
  ) {}

  public async iniciarTratamento(input: IniciarTratamentoInput): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário não encontrado.');
    }

    const manifestacao = await this.manifestacaoRepo.buscarPorId(input.manifestacaoId);
    if (!manifestacao) {
      throw new ObjetoNaoEncontradoError('Manifestação não encontrada.');
    }

    manifestacao.iniciarTratamento(usuario);
    await this.manifestacaoRepo.salvar(manifestacao);
  }

  public async responderPelaUnidade(input: ResponderUnidadeInput): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário não encontrado.');
    }

    const manifestacao = await this.manifestacaoRepo.buscarPorId(input.manifestacaoId);
    if (!manifestacao) {
      throw new ObjetoNaoEncontradoError('Manifestação não encontrada.');
    }

    const resposta = manifestacao.registrarRespostaUnidade(usuario, input.conteudo);
    await this.manifestacaoRepo.salvar(manifestacao);

    await this.notificador.enviar({
      tipo: TipoNotificacao.RESPOSTA_REGISTRADA,
      destinatario: 'Equipe de Ouvidoria Cedro',
      protocolo: manifestacao.protocolo,
      mensagem: `A unidade registrou uma resposta formal para a manifestação ${manifestacao.protocolo}.`,
      metadados: {
        manifestacaoId: manifestacao.id,
        respostaId: resposta.id,
      },
    });
  }

  public async solicitarComplemento(input: SolicitarComplementoInput): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário não encontrado.');
    }

    const manifestacao = await this.manifestacaoRepo.buscarPorId(input.manifestacaoId);
    if (!manifestacao) {
      throw new ObjetoNaoEncontradoError('Manifestação não encontrada.');
    }

    manifestacao.solicitarComplemento(usuario, input.motivo);
    await this.manifestacaoRepo.salvar(manifestacao);

    await this.notificador.enviar({
      tipo: TipoNotificacao.SOLICITACAO_COMPLEMENTO,
      destinatario: `Coordenador da Unidade ${manifestacao.unidadeId}`,
      protocolo: manifestacao.protocolo,
      mensagem: `A Ouvidoria solicitou complemento para a manifestação ${manifestacao.protocolo}: ${input.motivo}`,
      metadados: {
        manifestacaoId: manifestacao.id,
        motivo: input.motivo,
      },
    });
  }

  public async escalonar(input: EscalonarInput): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário não encontrado.');
    }

    const manifestacao = await this.manifestacaoRepo.buscarPorId(input.manifestacaoId);
    if (!manifestacao) {
      throw new ObjetoNaoEncontradoError('Manifestação não encontrada.');
    }

    const esc = manifestacao.escalonar(usuario, input.motivo, input.nivel ?? 1);
    await this.manifestacaoRepo.salvar(manifestacao);

    await this.notificador.enviar({
      tipo: TipoNotificacao.MANIFESTACAO_ESCALONADA,
      destinatario: 'Gestão Geral e Coordenação de Unidade',
      protocolo: manifestacao.protocolo,
      mensagem: `Manifestação ${manifestacao.protocolo} ESCALONADA para prioridade CRÍTICA (Nível ${esc.nivel}). Motivo: ${input.motivo}`,
      metadados: {
        manifestacaoId: manifestacao.id,
        escalonamentoId: esc.id,
        nivel: esc.nivel,
      },
    });
  }

  public async encaminhar(input: EncaminharInput): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário não encontrado.');
    }

    const manifestacao = await this.manifestacaoRepo.buscarPorId(input.manifestacaoId);
    if (!manifestacao) {
      throw new ObjetoNaoEncontradoError('Manifestação não encontrada.');
    }

    const novaUnidade = await this.unidadeRepo.buscarPorId(input.novaUnidadeId);
    if (!novaUnidade) {
      throw new ObjetoNaoEncontradoError('Nova unidade não encontrada.');
    }

    manifestacao.encaminharParaUnidade(usuario, novaUnidade, input.motivo);
    await this.manifestacaoRepo.salvar(manifestacao);

    await this.notificador.enviar({
      tipo: TipoNotificacao.MANIFESTACAO_ENCAMINHADA,
      destinatario: novaUnidade.responsavelNome ?? `Coordenação ${novaUnidade.nome}`,
      protocolo: manifestacao.protocolo,
      mensagem: `Manifestação ${manifestacao.protocolo} reencaminhada para sua unidade. Motivo: ${input.motivo}`,
      metadados: {
        manifestacaoId: manifestacao.id,
        novaUnidadeId: novaUnidade.id,
      },
    });
  }

  public async concluir(input: ConcluirInput): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(input.usuarioId);
    if (!usuario) {
      throw new ObjetoNaoEncontradoError('Usuário não encontrado.');
    }

    const manifestacao = await this.manifestacaoRepo.buscarPorId(input.manifestacaoId);
    if (!manifestacao) {
      throw new ObjetoNaoEncontradoError('Manifestação não encontrada.');
    }

    manifestacao.concluir(usuario, input.parecerFinal);
    await this.manifestacaoRepo.salvar(manifestacao);

    await this.notificador.enviar({
      tipo: TipoNotificacao.MANIFESTACAO_CONCLUIDA,
      destinatario: `Coordenação da Unidade e Arquivo da Ouvidoria`,
      protocolo: manifestacao.protocolo,
      mensagem: `Manifestação ${manifestacao.protocolo} concluída com parecer: ${input.parecerFinal}`,
      metadados: {
        manifestacaoId: manifestacao.id,
      },
    });
  }
}
