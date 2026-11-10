import { PerfilUsuario } from '../../domain/enums';

export interface TokenPayload {
  sub: string; // Usuario ID
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  unidadeId: string | null;
}

export interface ITokenService {
  gerar(payload: TokenPayload, expiresIn?: string): string;
  verificar(token: string): TokenPayload;
}
