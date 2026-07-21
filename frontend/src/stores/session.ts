import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from '@/api/auth';
import type { Sesion } from '@/types';

export const useSessionStore = defineStore('session', () => {
  const sesion = ref<Sesion | null>(null);

  // Se llama una vez desde main.ts, antes de montar la app, para que el guard de rutas ya tenga la
  // sesión resuelta en la primera navegación (evita el flash a /login mientras resuelve el fetch).
  async function restaurar(): Promise<void> {
    sesion.value = await authApi.me();
  }

  async function login(usuario: string, password: string): Promise<Sesion | null> {
    const nueva = await authApi.login(usuario, password);
    if (nueva) sesion.value = nueva;
    return nueva;
  }

  function logout() {
    sesion.value = null;
    void authApi.logout();
  }

  // Solo en memoria: la sesión real no tiene un endpoint propio de "renombrar" (eso es
  // Usuario.nombre, vía el CRUD de usuarios del Módulo 3, aún no implementado) — no persiste
  // recargando la página hasta que ese endpoint exista.
  function actualizarNombreSesion(nombre: string) {
    if (!sesion.value) return;
    sesion.value = { ...sesion.value, nombre };
  }

  return { sesion, restaurar, login, logout, actualizarNombreSesion };
});
