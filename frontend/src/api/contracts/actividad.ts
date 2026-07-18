import type { ActividadReciente } from '@/types';

export interface ActividadApi {
  list(): Promise<ActividadReciente[]>;
  push(mensaje: string, color: ActividadReciente['color']): Promise<ActividadReciente>;
}
