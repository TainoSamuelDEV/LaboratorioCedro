import { CanalPesquisa } from '../enums';
import { RegraNegocioError } from '../errors/DomainErrors';

export class Pesquisa {
  constructor(
    public readonly id: string,
    private _titulo: string,
    private _descricao: string,
    private _periodo: string,
    public readonly canal: CanalPesquisa,
    private _ativa: boolean = true,
    public readonly unidadePadraoId: string | null = null,
    public readonly criadoEm: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID da pesquisa é obrigatório.');
    }
    if (!_titulo || !_titulo.trim()) {
      throw new RegraNegocioError('O título da pesquisa é obrigatório.');
    }
    if (!_descricao || !_descricao.trim()) {
      throw new RegraNegocioError('A descrição da pesquisa é obrigatória.');
    }
    if (!_periodo || !_periodo.trim()) {
      throw new RegraNegocioError('O período da pesquisa é obrigatório.');
    }
    if (!canal) {
      throw new RegraNegocioError('O canal da pesquisa é obrigatório.');
    }
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
      throw new RegraNegocioError('Não é possível enviar resposta para uma pesquisa desativada ou encerrada.');
    }
  }

  public atualizarDados(titulo: string, descricao: string, periodo: string): void {
    if (!titulo || !titulo.trim()) {
      throw new RegraNegocioError('O título da pesquisa não pode ser vazio.');
    }
    if (!descricao || !descricao.trim()) {
      throw new RegraNegocioError('A descrição da pesquisa não pode ser vazia.');
    }
    if (!periodo || !periodo.trim()) {
      throw new RegraNegocioError('O período da pesquisa não pode ser vazio.');
    }
    this._titulo = titulo.trim();
    this._descricao = descricao.trim();
    this._periodo = periodo.trim();
  }
}
