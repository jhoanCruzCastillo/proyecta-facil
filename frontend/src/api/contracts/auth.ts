import type { Sesion } from '@/types';

export interface AuthApi {
  login(usuario: string, password: string): Promise<Sesion | null>;
  me(): Promise<Sesion | null>;
  logout(): Promise<void>;
}
