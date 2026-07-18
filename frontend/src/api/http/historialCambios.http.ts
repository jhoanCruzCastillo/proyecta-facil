import type { HistorialCambiosApi } from '../contracts/historialCambios';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/historial-cambios exista.
export const historialCambiosHttp: HistorialCambiosApi = {
  async list() {
    throw new Error('historialCambiosHttp.list: backend real aún no implementado');
  },
  async listByEjemplo() {
    throw new Error('historialCambiosHttp.listByEjemplo: backend real aún no implementado');
  },
  async registrar() {
    throw new Error('historialCambiosHttp.registrar: backend real aún no implementado');
  },
};
