import type { PlantillasApi } from '../contracts/plantillas';
import { delay, readLocal, writeLocal } from './_shared';
import { plantillas as plantillasSeed } from '@/data/plantillas';
import type { Plantilla } from '@/types';

const KEY = 'vf_plantillas';

function load(): Plantilla[] {
  return readLocal<Plantilla[]>(KEY, plantillasSeed);
}

function save(data: Plantilla[]): void {
  writeLocal(KEY, data);
}

export const plantillasMock: PlantillasApi = {
  async list() {
    await delay();
    return load();
  },

  async listBySector(sectorId) {
    await delay();
    return load().filter((p) => p.sectorId === sectorId);
  },

  async get(id) {
    await delay();
    return load().find((p) => p.id === id) ?? null;
  },

  async create(plantilla) {
    await delay();
    const data = load();
    data.push(plantilla);
    save(data);
    return plantilla;
  },

  async update(id, patch) {
    await delay();
    const data = load();
    const idx = data.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error(`Plantilla ${id} no encontrada`);
    data[idx] = { ...data[idx], ...patch };
    save(data);
    return data[idx];
  },

  async remove(id) {
    await delay();
    save(load().filter((p) => p.id !== id));
  },
};
