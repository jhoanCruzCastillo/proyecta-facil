import type { FacturacionApi } from '../contracts/facturacion';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/facturacion exista.
export const facturacionHttp: FacturacionApi = {
  async get() {
    throw new Error('facturacionHttp.get: backend real aún no implementado');
  },
  async update() {
    throw new Error('facturacionHttp.update: backend real aún no implementado');
  },
};
