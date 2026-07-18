import type { Usuario } from '@/types';

export interface UsuariosApi {
  list(): Promise<Usuario[]>;
  create(usuario: Usuario): Promise<Usuario>;
  update(id: string, data: Partial<Usuario>): Promise<Usuario>;
  remove(id: string): Promise<void>;
}
