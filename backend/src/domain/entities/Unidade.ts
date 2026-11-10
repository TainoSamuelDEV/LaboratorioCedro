import { RegraNegocioError } from '../errors/DomainErrors';

export class Unidade {
  constructor(
    public readonly id: string,
    private _nome: string,
    private _responsavelNome: string | null = null,
    private _ativa: boolean = true,
    private _prazoPadraoHoras: number = 48,
    public readonly criadoEm: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID da unidade é obrigatório.');
    }
    if (!_nome || !_nome.trim()) {
      throw new RegraNegocioError('O nome da unidade é obrigatório.');
    }
    if (_prazoPadraoHoras <= 0) {
      throw new RegraNegocioError('O prazo padrão da unidade deve ser maior que zero.');
    }
  }

  get nome(): string {
    return this._nome;
  }

  get responsavelNome(): string | null {
    return this._responsavelNome;
  }

  get ativa(): boolean {
    return this._ativa;
  }

  get prazoPadraoHoras(): number {
    return this._prazoPadraoHoras;
  }

  public atualizarDados(nome: string, responsavelNome: string | null, prazoHoras?: number): void {
    if (!nome || !nome.trim()) {
      throw new RegraNegocioError('O nome da unidade não pode ser vazio.');
    }
    if (prazoHoras !== undefined && prazoHoras <= 0) {
      throw new RegraNegocioError('O prazo em horas deve ser positivo.');
    }
    this._nome = nome.trim();
    this._responsavelNome = responsavelNome;
    if (prazoHoras !== undefined) {
      this._prazoPadraoHoras = prazoHoras;
    }
  }

  public ativar(): void {
    this._ativa = true;
  }

  public desativar(): void {
    this._ativa = false;
  }
}
