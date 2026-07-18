import type { EjemplosApi } from '../contracts/ejemplos';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/ejemplos exista.
export const ejemplosHttp: EjemplosApi = {
  async list() {
    throw new Error('ejemplosHttp.list: backend real aún no implementado');
  },
  async listByPlantilla() {
    throw new Error('ejemplosHttp.listByPlantilla: backend real aún no implementado');
  },
  async get() {
    throw new Error('ejemplosHttp.get: backend real aún no implementado');
  },
  async create() {
    throw new Error('ejemplosHttp.create: backend real aún no implementado');
  },
  async update() {
    throw new Error('ejemplosHttp.update: backend real aún no implementado');
  },
  async remove() {
    throw new Error('ejemplosHttp.remove: backend real aún no implementado');
  },
};
