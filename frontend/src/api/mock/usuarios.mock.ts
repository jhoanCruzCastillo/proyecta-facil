import type { UsuariosApi } from '../contracts/usuarios';
import { delay, readLocal, writeLocal } from './_shared';
import { usuarios as usuariosSeed } from '@/data/usuarios';
import type { Usuario } from '@/types';

// Misma clave que api/auth.mock.ts (vf_usuarios) — ambos leen/escriben la misma lista, así que
// crear/editar un usuario acá se refleja de inmediato en el login.
const KEY = 'vf_usuarios';

function load(): Usuario[] {
  return readLocal<Usuario[]>(KEY, usuariosSeed);
}

function save(data: Usuario[]): void {
  writeLocal(KEY, data);
}

export const usuariosMock: UsuariosApi = {
  async list() {
    await delay();
    return load();
  },

  async create(usuario) {
    await delay();
    const data = load();
    data.push(usuario);
    save(data);
    return usuario;
  },

  async update(id, patch) {
    await delay();
    const data = load();
    const idx = data.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`Usuario ${id} no encontrado`);
    data[idx] = { ...data[idx], ...patch };
    save(data);
    return data[idx];
  },

  async remove(id) {
    await delay();
    save(load().filter((u) => u.id !== id));
  },
};
