import { PerfilUsuario } from '../../domain/enums';

export interface LoginInput {
  email: string;
  senha: string;
}

export interface UsuarioOutput {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  unidadeId: string | null;
  ativo: boolean;
  criadoEm: Date;
}

export interface LoginOutput {
  token: string;
  usuario: UsuarioOutput;
}

export interface CriarUsuarioInput {
  executanteId: string;
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  unidadeId?: string | null;
}
