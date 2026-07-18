import type { PlantillasApi } from '../contracts/plantillas';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/plantillas exista.
export const plantillasHttp: PlantillasApi = {
  async list() {
    throw new Error('plantillasHttp.list: backend real aún no implementado');
  },
  async listBySector() {
    throw new Error('plantillasHttp.listBySector: backend real aún no implementado');
  },
  async get() {
    throw new Error('plantillasHttp.get: backend real aún no implementado');
  },
  async create() {
    throw new Error('plantillasHttp.create: backend real aún no implementado');
  },
  async update() {
    throw new Error('plantillasHttp.update: backend real aún no implementado');
  },
  async remove() {
    throw new Error('plantillasHttp.remove: backend real aún no implementado');
  },
};
