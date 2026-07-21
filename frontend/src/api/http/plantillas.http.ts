import { apiFetch } from './_shared';
import type { PlantillasApi } from '../contracts/plantillas';
import type { Plantilla } from '@/types';

export const plantillasHttp: PlantillasApi = {
  list() {
    return apiFetch<Plantilla[]>('plantillas');
  },

  listBySector(sectorId) {
    return apiFetch<Plantilla[]>(`sectores/${sectorId}/plantillas`);
  },

  async get(id) {
    try {
      return await apiFetch<Plantilla>(`plantillas/${id}`);
    } catch {
      return null;
    }
  },

  create(plantilla) {
    return apiFetch<Plantilla>('plantillas', { method: 'POST', body: JSON.stringify(plantilla) });
  },

  update(id, data) {
    return apiFetch<Plantilla>(`plantillas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  async remove(id) {
    await apiFetch<unknown>(`plantillas/${id}`, { method: 'DELETE' });
  },
};
