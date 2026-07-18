import type { TiposUsuarioApi } from '../contracts/tiposUsuario';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/tipos-usuario exista.
export const tiposUsuarioHttp: TiposUsuarioApi = {
  async list() {
    throw new Error('tiposUsuarioHttp.list: backend real aún no implementado');
  },
  async create() {
    throw new Error('tiposUsuarioHttp.create: backend real aún no implementado');
  },
  async update() {
    throw new Error('tiposUsuarioHttp.update: backend real aún no implementado');
  },
  async remove() {
    throw new Error('tiposUsuarioHttp.remove: backend real aún no implementado');
  },
};
