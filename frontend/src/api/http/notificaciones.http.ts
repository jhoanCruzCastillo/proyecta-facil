import { apiFetch } from './_shared';
import type { NotificacionesApi } from '../contracts/notificaciones';
import type { NotificacionUsuario } from '@/types';

export const notificacionesHttp: NotificacionesApi = {
  list(usuarioId) {
    return apiFetch<NotificacionUsuario[]>(`notificaciones?usuarioId=${usuarioId}`);
  },

  async marcarLeida(id) {
    await apiFetch<{ ok: boolean }>(`notificaciones/${id}/leida`, { method: 'POST' });
  },
};
