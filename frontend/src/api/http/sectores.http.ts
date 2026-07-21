import { apiFetch } from './_shared';
import type { SectoresApi } from '../contracts/sectores';
import type { Sector } from '@/types';

export const sectoresHttp: SectoresApi = {
  list() {
    return apiFetch<Sector[]>('sectores');
  },

  async get(id) {
    try {
      return await apiFetch<Sector>(`sectores/${id}`);
    } catch {
      return null;
    }
  },

  create(sector) {
    return apiFetch<Sector>('sectores', { method: 'POST', body: JSON.stringify(sector) });
  },

  update(id, data) {
    return apiFetch<Sector>(`sectores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id) {
    await apiFetch<unknown>(`sectores/${id}`, { method: 'DELETE' });
  },
};
