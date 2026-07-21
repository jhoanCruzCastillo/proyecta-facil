import { apiFetch } from './_shared';
import type { TiposUsuarioApi } from '../contracts/tiposUsuario';
import type { TipoUsuario } from '@/types';

export const tiposUsuarioHttp: TiposUsuarioApi = {
  list() {
    return apiFetch<TipoUsuario[]>('tipos-usuario');
  },

  create(tipo) {
    return apiFetch<TipoUsuario>('tipos-usuario', { method: 'POST', body: JSON.stringify(tipo) });
  },

  update(id, data) {
    return apiFetch<TipoUsuario>(`tipos-usuario/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id) {
    await apiFetch<unknown>(`tipos-usuario/${id}`, { method: 'DELETE' });
  },
};
