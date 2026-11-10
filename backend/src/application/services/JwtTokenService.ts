import jwt from 'jsonwebtoken';
import { AcessoNegadoError } from '../../domain/errors/DomainErrors';
import { ITokenService, TokenPayload } from './ITokenService';

export class JwtTokenService implements ITokenService {
  constructor(private readonly segredo: string = process.env.JWT_SECRET || 'chave-secreta-cedro-nit-poo') {}

  public gerar(payload: TokenPayload, expiresIn: string = '8h'): string {
    return jwt.sign(payload, this.segredo, { expiresIn } as jwt.SignOptions);
  }

  public verificar(token: string): TokenPayload {
    try {
      const decodificado = jwt.verify(token, this.segredo) as TokenPayload;
      return {
        sub: decodificado.sub,
        nome: decodificado.nome,
        email: decodificado.email,
        perfil: decodificado.perfil,
        unidadeId: decodificado.unidadeId ?? null,
      };
    } catch {
      throw new AcessoNegadoError('Token de autenticação inválido ou expirado.');
    }
  }
}
