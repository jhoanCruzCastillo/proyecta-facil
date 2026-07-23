import type { NotificacionUsuario } from '@/types';

export interface NotificacionesApi {
  list(usuarioId: string): Promise<NotificacionUsuario[]>;
  marcarLeida(id: string): Promise<void>;
}
