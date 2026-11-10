export interface IRepository<T> {
  salvar(entidade: T): Promise<void>;
  buscarPorId(id: string): Promise<T | null>;
}
