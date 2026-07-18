import type { ExcelEjemplosApi } from '../contracts/excelEjemplos';
import { delay, readLocal, writeLocal } from './_shared';
import type { ArchivoExcel } from '@/types';

const KEY = 'vf_excel_ejemplos';

function load(): Record<string, ArchivoExcel> {
  return readLocal<Record<string, ArchivoExcel>>(KEY, {});
}

function save(data: Record<string, ArchivoExcel>): void {
  writeLocal(KEY, data);
}

export const excelEjemplosMock: ExcelEjemplosApi = {
  async get(ejemploId) {
    await delay();
    return load()[ejemploId] ?? null;
  },

  async set(ejemploId, archivo) {
    await delay();
    const data = load();
    data[ejemploId] = archivo;
    save(data);
    return archivo;
  },
};
