import type { HistorialCambiosApi } from '../contracts/historialCambios';
import { delay, readLocal, writeLocal } from './_shared';
import type { CambioFicha } from '@/types';

const KEY = 'vf_historial_cambios';

function load(): CambioFicha[] {
  return readLocal<CambioFicha[]>(KEY, []);
}

function save(data: CambioFicha[]): void {
  writeLocal(KEY, data);
}

export const historialCambiosMock: HistorialCambiosApi = {
  async list() {
    await delay();
    return load();
  },

  async listByEjemplo(ejemploId) {
    await delay();
    return load().filter((c) => c.ejemploId === ejemploId);
  },

  async registrar(entry) {
    await delay();
    const data = load();
    const next = [entry, ...data].slice(0, 500);
    save(next);
    return entry;
  },
};
