import type { TipoUsuario } from '@/types';

export interface TiposUsuarioApi {
  list(): Promise<TipoUsuario[]>;
  create(tipo: TipoUsuario): Promise<TipoUsuario>;
  update(id: string, data: Partial<TipoUsuario>): Promise<TipoUsuario>;
  remove(id: string): Promise<void>;
}
