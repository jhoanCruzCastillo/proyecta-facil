import type { ActividadApi } from '../contracts/actividad';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/actividad exista.
export const actividadHttp: ActividadApi = {
  async list() {
    throw new Error('actividadHttp.list: backend real aún no implementado');
  },
  async push() {
    throw new Error('actividadHttp.push: backend real aún no implementado');
  },
};
