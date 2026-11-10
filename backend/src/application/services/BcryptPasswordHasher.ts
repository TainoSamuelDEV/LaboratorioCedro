import bcrypt from 'bcryptjs';
import { IPasswordHasher } from './IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly saltRounds: number = 10) {}

  public async hash(senhaPlana: string): Promise<string> {
    return bcrypt.hash(senhaPlana, this.saltRounds);
  }

  public async comparar(senhaPlana: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senhaPlana, hash);
  }
}
