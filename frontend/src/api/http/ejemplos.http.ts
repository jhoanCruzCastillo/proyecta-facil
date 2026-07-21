import { apiFetch } from './_shared';
import type { EjemplosApi } from '../contracts/ejemplos';
import type { Ejemplo } from '@/types';

export const ejemplosHttp: EjemplosApi = {
  list() {
    return apiFetch<Ejemplo[]>('ejemplos');
  },

  listByPlantilla(plantillaId) {
    return apiFetch<Ejemplo[]>(`plantillas/${plantillaId}/ejemplos`);
  },

  async get(id) {
    try {
      return await apiFetch<Ejemplo>(`ejemplos/${id}`);
    } catch {
      return null;
    }
  },

  create(ejemplo) {
    return apiFetch<Ejemplo>('ejemplos', { method: 'POST', body: JSON.stringify(ejemplo) });
  },

  update(id, data) {
    return apiFetch<Ejemplo>(`ejemplos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id) {
    await apiFetch<unknown>(`ejemplos/${id}`, { method: 'DELETE' });
  },
};
