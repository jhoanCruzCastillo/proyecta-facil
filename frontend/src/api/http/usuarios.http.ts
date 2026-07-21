import { apiFetch } from './_shared';
import type { UsuariosApi } from '../contracts/usuarios';
import type { Usuario } from '@/types';

export const usuariosHttp: UsuariosApi = {
  list() {
    return apiFetch<Usuario[]>('usuarios');
  },

  create(usuario) {
    return apiFetch<Usuario>('usuarios', { method: 'POST', body: JSON.stringify(usuario) });
  },

  update(id, data) {
    return apiFetch<Usuario>(`usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id) {
    await apiFetch<unknown>(`usuarios/${id}`, { method: 'DELETE' });
  },
};
