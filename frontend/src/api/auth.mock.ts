import { delay, readLocal, writeLocal } from './mock/_shared';
import { usuarios as usuariosSeed } from '@/data/usuarios';
import type { Sesion, Usuario } from '@/types';

const USUARIOS_KEY = 'vf_usuarios';
const SESION_KEY = 'vf_sesion';

function loadUsuarios(): Usuario[] {
  return readLocal<Usuario[]>(USUARIOS_KEY, usuariosSeed);
}

export async function login(usuario: string, password: string): Promise<Sesion | null> {
  await delay(200);
  const u = loadUsuarios().find(
    (candidato) =>
      candidato.usuario.toLowerCase() === usuario.trim().toLowerCase() &&
      candidato.password === password &&
      candidato.estado !== 'inactivo',
  );
  if (!u) return null;

  const sesion: Sesion = {
    usuarioId: u.id,
    nombre: u.nombre,
    usuario: u.usuario,
    rol: u.rol,
    iniciadaEn: new Date().toISOString(),
  };
  writeLocal(SESION_KEY, sesion);
  return sesion;
}

export function loadSesion(): Sesion | null {
  return readLocal<Sesion | null>(SESION_KEY, null);
}

export function saveSesion(sesion: Sesion): void {
  writeLocal(SESION_KEY, sesion);
}

export function clearSesion(): void {
  localStorage.removeItem(SESION_KEY);
}
