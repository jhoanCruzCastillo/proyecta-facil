import type { UsuariosApi } from '../contracts/usuarios';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/usuarios exista.
export const usuariosHttp: UsuariosApi = {
  async list() {
    throw new Error('usuariosHttp.list: backend real aún no implementado');
  },
  async create() {
    throw new Error('usuariosHttp.create: backend real aún no implementado');
  },
  async update() {
    throw new Error('usuariosHttp.update: backend real aún no implementado');
  },
  async remove() {
    throw new Error('usuariosHttp.remove: backend real aún no implementado');
  },
};
