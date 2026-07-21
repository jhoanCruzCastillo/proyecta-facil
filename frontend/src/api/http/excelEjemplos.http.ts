import { apiFetch } from './_shared';
import type { ExcelEjemplosApi } from '../contracts/excelEjemplos';
import type { ArchivoExcel } from '@/types';

export const excelEjemplosHttp: ExcelEjemplosApi = {
  get(ejemploId) {
    return apiFetch<ArchivoExcel | null>(`ejemplos/${ejemploId}/excel`);
  },

  set(ejemploId, archivo) {
    return apiFetch<ArchivoExcel>(`ejemplos/${ejemploId}/excel`, {
      method: 'POST',
      body: JSON.stringify({ nombre: archivo.nombre, dataUrl: archivo.dataUrl }),
    });
  },
};
