import type { TiposUsuarioApi } from '../contracts/tiposUsuario';
import { delay, readLocal, writeLocal } from './_shared';
import type { TipoUsuario } from '@/types';

const KEY = 'vf_tipos_usuario';

function load(): TipoUsuario[] {
  return readLocal<TipoUsuario[]>(KEY, []);
}

function save(data: TipoUsuario[]): void {
  writeLocal(KEY, data);
}

export const tiposUsuarioMock: TiposUsuarioApi = {
  async list() {
    await delay();
    return load();
  },

  async create(tipo) {
    await delay();
    const data = load();
    data.push(tipo);
    save(data);
    return tipo;
  },

  async update(id, patch) {
    await delay();
    const data = load();
    const idx = data.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Tipo de usuario ${id} no encontrado`);
    data[idx] = { ...data[idx], ...patch };
    save(data);
    return data[idx];
  },

  async remove(id) {
    await delay();
    save(load().filter((t) => t.id !== id));
  },
};
