import type { SectoresApi } from '../contracts/sectores';
import { delay, readLocal, writeLocal } from './_shared';
import { sectores as sectoresSeed } from '@/data/sectores';
import type { Sector } from '@/types';

const KEY = 'vf_sectores';

function load(): Sector[] {
  return readLocal<Sector[]>(KEY, sectoresSeed);
}

function save(data: Sector[]): void {
  writeLocal(KEY, data);
}

export const sectoresMock: SectoresApi = {
  async list() {
    await delay();
    return load();
  },

  async get(id) {
    await delay();
    return load().find((s) => s.id === id) ?? null;
  },

  async create(sector) {
    await delay();
    const data = load();
    data.push(sector);
    save(data);
    return sector;
  },

  async update(id, patch) {
    await delay();
    const data = load();
    const idx = data.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Sector ${id} no encontrado`);
    data[idx] = { ...data[idx], ...patch };
    save(data);
    return data[idx];
  },

  async remove(id) {
    await delay();
    save(load().filter((s) => s.id !== id));
  },
};
