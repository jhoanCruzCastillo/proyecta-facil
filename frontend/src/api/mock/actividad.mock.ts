import type { ActividadApi } from '../contracts/actividad';
import { delay, readLocal, writeLocal, generateId } from './_shared';
import { actividadSeed } from '@/data/actividad';
import type { ActividadReciente } from '@/types';

const KEY = 'vf_actividad';

function load(): ActividadReciente[] {
  return readLocal<ActividadReciente[]>(KEY, actividadSeed);
}

function save(data: ActividadReciente[]): void {
  writeLocal(KEY, data);
}

export const actividadMock: ActividadApi = {
  async list() {
    await delay();
    return load();
  },

  async push(mensaje, color) {
    await delay();
    const entry: ActividadReciente = { id: generateId(), mensaje, fecha: 'Ahora', color };
    const next = [entry, ...load()].slice(0, 20);
    save(next);
    return entry;
  },
};
