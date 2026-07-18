import type { SectoresApi } from '../contracts/sectores';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/sectores exista.
// Mientras tanto queda como stub estructural: si VITE_MOCK_SECTORES=false sin backend disponible,
// falla explícitamente en vez de devolver datos silenciosamente incorrectos.
export const sectoresHttp: SectoresApi = {
  async list() {
    throw new Error('sectoresHttp.list: backend real aún no implementado');
  },
  async get() {
    throw new Error('sectoresHttp.get: backend real aún no implementado');
  },
  async create() {
    throw new Error('sectoresHttp.create: backend real aún no implementado');
  },
  async update() {
    throw new Error('sectoresHttp.update: backend real aún no implementado');
  },
  async remove() {
    throw new Error('sectoresHttp.remove: backend real aún no implementado');
  },
};
