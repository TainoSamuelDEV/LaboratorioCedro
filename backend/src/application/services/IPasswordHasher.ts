export interface IPasswordHasher {
  hash(senhaPlana: string): Promise<string>;
  comparar(senhaPlana: string, hash: string): Promise<boolean>;
}
