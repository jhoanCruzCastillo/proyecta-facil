import type { ExcelEjemplosApi } from '../contracts/excelEjemplos';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/excel-ejemplos exista.
export const excelEjemplosHttp: ExcelEjemplosApi = {
  async get() {
    throw new Error('excelEjemplosHttp.get: backend real aún no implementado');
  },
  async set() {
    throw new Error('excelEjemplosHttp.set: backend real aún no implementado');
  },
};
