export interface IProtocoloService {
  gerarProtocolo(ano?: number): string;
}

export class ProtocoloService implements IProtocoloService {
  private static contadorSequencial: number = 1;

  constructor(private readonly prefixo: string = 'CED') {}

  public gerarProtocolo(ano: number = new Date().getFullYear()): string {
    const sequencialFormatado = String(ProtocoloService.contadorSequencial++).padStart(6, '0');
    return `${this.prefixo}-${ano}-${sequencialFormatado}`;
  }

  // Método auxiliar para testes/resets se necessário
  public static resetarContador(valor: number = 1): void {
    ProtocoloService.contadorSequencial = valor;
  }
}
