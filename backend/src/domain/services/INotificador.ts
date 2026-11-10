export enum TipoNotificacao {
  MANIFESTACAO_CRIADA = 'MANIFESTACAO_CRIADA',
  MANIFESTACAO_ENCAMINHADA = 'MANIFESTACAO_ENCAMINHADA',
  RESPOSTA_REGISTRADA = 'RESPOSTA_REGISTRADA',
  MANIFESTACAO_ESCALONADA = 'MANIFESTACAO_ESCALONADA',
  SOLICITACAO_COMPLEMENTO = 'SOLICITACAO_COMPLEMENTO',
  MANIFESTACAO_CONCLUIDA = 'MANIFESTACAO_CONCLUIDA',
}

export interface NotificacaoPayload {
  tipo: TipoNotificacao;
  destinatario: string;
  protocolo: string;
  mensagem: string;
  metadados?: Record<string, unknown>;
  dataEnvio?: Date;
}

export interface INotificador {
  enviar(payload: NotificacaoPayload): Promise<void>;
}

export class ConsoleNotificador implements INotificador {
  public async enviar(payload: NotificacaoPayload): Promise<void> {
    console.log(
      `[NOTIFICADOR] Tipo: ${payload.tipo} | Destinatário: ${payload.destinatario} | Protocolo: ${payload.protocolo} | Mensagem: ${payload.mensagem}`
    );
  }
}
