import { CanalPesquisa } from '../enums';
import { RegraNegocioError } from '../errors/DomainErrors';

export class Pesquisa {
  private _descricao: string;
  private _canal: CanalPesquisa;
  private _unidadePadraoId: string | null;

  constructor(
    public readonly id: string,
    private _titulo: string,
    descricao: string | null | undefined,
    private _periodo: string,
    canal: CanalPesquisa,
    private _ativa: boolean = true,
    unidadePadraoId: string | null = null,
    public readonly criadoEm: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID da pesquisa é obrigatório.');
    }
    if (!_titulo || !_titulo.trim()) {
      throw new RegraNegocioError('O título da pesquisa é obrigatório.');
    }
    if (!_periodo || !_periodo.trim()) {
      throw new RegraNegocioError('O período da pesquisa é obrigatório.');
    }
    if (!canal) {
      throw new RegraNegocioError('O canal da pesquisa é obrigatório.');
    }

    this._descricao = descricao ? descricao.trim() : '';
    this._canal = canal;
    this._unidadePadraoId = unidadePadraoId || null;
  }

  get titulo(): string {
    return this._titulo;
  }

  get descricao(): string {
    return this._descricao;
  }

  get periodo(): string {
    return this._periodo;
  }

  get canal(): CanalPesquisa {
    return this._canal;
  }

  get unidadePadraoId(): string | null {
    return this._unidadePadraoId;
  }

  get ativa(): boolean {
    return this._ativa;
  }

  public ativar(): void {
    this._ativa = true;
  }

  public desativar(): void {
    this._ativa = false;
  }

  public validarRecebimentoResposta(): void {
    if (!this._ativa) {
      throw new RegraNegocioError(
        'Não é possível enviar resposta para uma pesquisa desativada ou encerrada.'
      );
    }
  }

  public atualizarDados(
    titulo: string,
    descricao: string | null | undefined,
    periodo: string,
    canal?: CanalPesquisa,
    unidadePadraoId?: string | null
  ): void {
    if (!titulo || !titulo.trim()) {
      throw new RegraNegocioError('O título da pesquisa não pode ser vazio.');
    }
    if (!periodo || !periodo.trim()) {
      throw new RegraNegocioError('O período da pesquisa não pode ser vazio.');
    }
    this._titulo = titulo.trim();
    this._descricao = descricao ? descricao.trim() : '';
    this._periodo = periodo.trim();
    if (canal) {
      this._canal = canal;
    }
    if (unidadePadraoId !== undefined) {
      this._unidadePadraoId = unidadePadraoId;
    }
  }
}
