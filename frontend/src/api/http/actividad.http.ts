import { apiFetch } from './_shared';
import type { ActividadApi } from '../contracts/actividad';
import type { ActividadReciente } from '@/types';

export const actividadHttp: ActividadApi = {
  list() {
    return apiFetch<ActividadReciente[]>('actividad');
  },

  push(mensaje, color) {
    return apiFetch<ActividadReciente>('actividad', { method: 'POST', body: JSON.stringify({ mensaje, color }) });
  },
};
