import { apiFetch } from './_shared';
import type { ArchivosExcelApi } from '../contracts/archivosExcel';
import type { CatalogoExcelPlantilla } from '@/types';

export const archivosExcelHttp: ArchivosExcelApi = {
  getCatalogo(plantillaId) {
    return apiFetch<CatalogoExcelPlantilla>(`plantillas/${plantillaId}/archivos`);
  },

  addArchivo(plantillaId, archivo) {
    return apiFetch<CatalogoExcelPlantilla>(`plantillas/${plantillaId}/archivos`, {
      method: 'POST',
      body: JSON.stringify({ nombre: archivo.nombre, dataUrl: archivo.dataUrl }),
    });
  },

  deleteArchivo(plantillaId, archivoId) {
    return apiFetch<CatalogoExcelPlantilla>(`plantillas/${plantillaId}/archivos/${archivoId}`, { method: 'DELETE' });
  },

  asignarArchivo(plantillaId, archivoId) {
    return apiFetch<CatalogoExcelPlantilla>(`plantillas/${plantillaId}/archivos/${archivoId}/asignar`, { method: 'POST' });
  },
};
