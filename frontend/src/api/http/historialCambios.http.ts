import { apiFetch } from './_shared';
import type { HistorialCambiosApi } from '../contracts/historialCambios';
import type { CambioFicha } from '@/types';

export const historialCambiosHttp: HistorialCambiosApi = {
  list() {
    return apiFetch<CambioFicha[]>('historial-cambios');
  },

  listByEjemplo(ejemploId) {
    return apiFetch<CambioFicha[]>(`ejemplos/${ejemploId}/historial-cambios`);
  },

  registrar(entry) {
    return apiFetch<CambioFicha>('historial-cambios', { method: 'POST', body: JSON.stringify(entry) });
  },
};
