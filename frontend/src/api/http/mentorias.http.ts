import type { MentoriasApi } from '../contracts/mentorias';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/mentorias exista.
export const mentoriasHttp: MentoriasApi = {
  async list() {
    throw new Error('mentoriasHttp.list: backend real aún no implementado');
  },
  async inscribirse() {
    throw new Error('mentoriasHttp.inscribirse: backend real aún no implementado');
  },
  async enviarPregunta() {
    throw new Error('mentoriasHttp.enviarPregunta: backend real aún no implementado');
  },
};
