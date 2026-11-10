import { INotificador, NotificacaoPayload } from '../../src/domain/services/INotificador';

export class FakeNotificador implements INotificador {
  public enviadas: NotificacaoPayload[] = [];

  public async enviar(payload: NotificacaoPayload): Promise<void> {
    this.enviadas.push({
      ...payload,
      dataEnvio: payload.dataEnvio ?? new Date(),
    });
  }

  public limpar(): void {
    this.enviadas = [];
  }
}
