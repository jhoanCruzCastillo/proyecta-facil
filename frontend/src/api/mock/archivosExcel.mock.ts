import type { ArchivosExcelApi } from '../contracts/archivosExcel';
import { delay, readLocal, writeLocal } from './_shared';
import type { CatalogoExcelPlantilla } from '@/types';

const KEY = 'vf_excel_catalogos';

function load(): Record<string, CatalogoExcelPlantilla> {
  return readLocal<Record<string, CatalogoExcelPlantilla>>(KEY, {});
}

function save(data: Record<string, CatalogoExcelPlantilla>): void {
  writeLocal(KEY, data);
}

export const archivosExcelMock: ArchivosExcelApi = {
  async getCatalogo(plantillaId) {
    await delay();
    return load()[plantillaId] ?? { archivos: [] };
  },

  async addArchivo(plantillaId, archivo) {
    await delay();
    const data = load();
    const actual = data[plantillaId] ?? { archivos: [] };
    data[plantillaId] = { archivos: [...actual.archivos, archivo], asignadoId: actual.asignadoId ?? archivo.id };
    save(data);
    return data[plantillaId];
  },

  async deleteArchivo(plantillaId, archivoId) {
    await delay();
    const data = load();
    const actual = data[plantillaId];
    if (!actual) return { archivos: [] };
    data[plantillaId] = {
      archivos: actual.archivos.filter((a) => a.id !== archivoId),
      asignadoId: actual.asignadoId === archivoId ? undefined : actual.asignadoId,
    };
    save(data);
    return data[plantillaId];
  },

  async asignarArchivo(plantillaId, archivoId) {
    await delay();
    const data = load();
    const actual = data[plantillaId] ?? { archivos: [] };
    data[plantillaId] = { ...actual, asignadoId: archivoId };
    save(data);
    return data[plantillaId];
  },
};
