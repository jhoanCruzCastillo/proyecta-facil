import type { ArchivosExcelApi } from '../contracts/archivosExcel';

// Implementación real contra CodeIgniter — se cablea cuando el endpoint /api/archivos-excel exista.
export const archivosExcelHttp: ArchivosExcelApi = {
  async getCatalogo() {
    throw new Error('archivosExcelHttp.getCatalogo: backend real aún no implementado');
  },
  async addArchivo() {
    throw new Error('archivosExcelHttp.addArchivo: backend real aún no implementado');
  },
  async deleteArchivo() {
    throw new Error('archivosExcelHttp.deleteArchivo: backend real aún no implementado');
  },
  async asignarArchivo() {
    throw new Error('archivosExcelHttp.asignarArchivo: backend real aún no implementado');
  },
};
