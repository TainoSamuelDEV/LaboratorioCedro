import { PerfilUsuario } from '../enums';
import { RegraNegocioError } from '../errors/DomainErrors';

export abstract class Usuario {
  constructor(
    public readonly id: string,
    protected _nome: string,
    protected _email: string,
    public readonly perfil: PerfilUsuario,
    public readonly unidadeId: string | null,
    protected _ativo: boolean = true,
    public readonly criadoEm: Date = new Date()
  ) {
    if (!id || !id.trim()) {
      throw new RegraNegocioError('O ID do usuário é obrigatório.');
    }
    if (!_nome || !_nome.trim()) {
      throw new RegraNegocioError('O nome do usuário é obrigatório.');
    }
    if (!_email || !_email.includes('@')) {
      throw new RegraNegocioError('Um e-mail válido é obrigatório.');
    }
  }

  get nome(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  public desativar(): void {
    this._ativo = false;
  }

  public ativar(): void {
    this._ativo = true;
  }

  public atualizarDados(nome: string, email: string): void {
    if (!nome || !nome.trim()) {
      throw new RegraNegocioError('O nome do usuário não pode ser vazio.');
    }
    if (!email || !email.includes('@')) {
      throw new RegraNegocioError('Um e-mail válido é obrigatório.');
    }
    this._nome = nome.trim();
    this._email = email.trim().toLowerCase();
  }

  // Métodos polimórficos que determinam o escopo de permissão por perfil e unidade
  public abstract podeVisualizarManifestacao(unidadeDaManifestacaoId: string): boolean;
  public abstract podeTratarPelaUnidade(unidadeDaManifestacaoId: string): boolean;
  public abstract podeEscalonar(): boolean;
  public abstract podeSolicitarComplemento(): boolean;
  public abstract podeConcluir(): boolean;
  public abstract podeGerenciarSistema(): boolean;
}

export class CoordenadorUnidade extends Usuario {
  constructor(
    id: string,
    nome: string,
    email: string,
    unidadeId: string,
    ativo = true,
    criadoEm = new Date()
  ) {
    if (!unidadeId || !unidadeId.trim()) {
      throw new RegraNegocioError(
        'Coordenador de Unidade deve estar obrigatoriamente vinculado a uma unidade.'
      );
    }
    super(id, nome, email, PerfilUsuario.COORDENADOR_UNIDADE, unidadeId, ativo, criadoEm);
  }

  public override podeVisualizarManifestacao(unidadeDaManifestacaoId: string): boolean {
    return this._ativo && this.unidadeId === unidadeDaManifestacaoId;
  }

  public override podeTratarPelaUnidade(unidadeDaManifestacaoId: string): boolean {
    return this._ativo && this.unidadeId === unidadeDaManifestacaoId;
  }

  public override podeEscalonar(): boolean {
    return false;
  }

  public override podeSolicitarComplemento(): boolean {
    return false;
  }

  public override podeConcluir(): boolean {
    return false;
  }

  public override podeGerenciarSistema(): boolean {
    return false;
  }
}

export class OperadorOuvidoria extends Usuario {
  constructor(id: string, nome: string, email: string, ativo = true, criadoEm = new Date()) {
    super(id, nome, email, PerfilUsuario.OPERADOR_OUVIDORIA, null, ativo, criadoEm);
  }

  public override podeVisualizarManifestacao(_unidadeDaManifestacaoId: string): boolean {
    return this._ativo;
  }

  public override podeTratarPelaUnidade(_unidadeDaManifestacaoId: string): boolean {
    return false;
  }

  public override podeEscalonar(): boolean {
    return this._ativo;
  }

  public override podeSolicitarComplemento(): boolean {
    return this._ativo;
  }

  public override podeConcluir(): boolean {
    return this._ativo;
  }

  public override podeGerenciarSistema(): boolean {
    return false;
  }
}

export class Administrador extends Usuario {
  constructor(id: string, nome: string, email: string, ativo = true, criadoEm = new Date()) {
    super(id, nome, email, PerfilUsuario.ADMINISTRADOR, null, ativo, criadoEm);
  }

  public override podeVisualizarManifestacao(_unidadeDaManifestacaoId: string): boolean {
    return this._ativo;
  }

  public override podeTratarPelaUnidade(_unidadeDaManifestacaoId: string): boolean {
    return false;
  }

  public override podeEscalonar(): boolean {
    return this._ativo;
  }

  public override podeSolicitarComplemento(): boolean {
    return this._ativo;
  }

  public override podeConcluir(): boolean {
    return this._ativo;
  }

  public override podeGerenciarSistema(): boolean {
    return this._ativo;
  }
}

export class UsuarioFactory {
  public static criar(params: {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    unidadeId?: string | null;
    ativo?: boolean;
    criadoEm?: Date;
  }): Usuario {
    switch (params.perfil) {
      case PerfilUsuario.COORDENADOR_UNIDADE:
        return new CoordenadorUnidade(
          params.id,
          params.nome,
          params.email,
          params.unidadeId ?? '',
          params.ativo ?? true,
          params.criadoEm ?? new Date()
        );
      case PerfilUsuario.OPERADOR_OUVIDORIA:
        return new OperadorOuvidoria(
          params.id,
          params.nome,
          params.email,
          params.ativo ?? true,
          params.criadoEm ?? new Date()
        );
      case PerfilUsuario.ADMINISTRADOR:
        return new Administrador(
          params.id,
          params.nome,
          params.email,
          params.ativo ?? true,
          params.criadoEm ?? new Date()
        );
      default:
        throw new RegraNegocioError(`Perfil de usuário inválido: ${String(params.perfil)}`);
    }
  }
}
