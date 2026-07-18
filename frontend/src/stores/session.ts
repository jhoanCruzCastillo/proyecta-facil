import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as authApi from '@/api/auth.mock';
import type { Sesion } from '@/types';

export const useSessionStore = defineStore('session', () => {
  const sesion = ref<Sesion | null>(authApi.loadSesion());

  async function login(usuario: string, password: string): Promise<Sesion | null> {
    const nueva = await authApi.login(usuario, password);
    if (nueva) sesion.value = nueva;
    return nueva;
  }

  function logout() {
    authApi.clearSesion();
    sesion.value = null;
  }

  function actualizarNombreSesion(nombre: string) {
    if (!sesion.value) return;
    sesion.value = { ...sesion.value, nombre };
    authApi.saveSesion(sesion.value);
  }

  return { sesion, login, logout, actualizarNombreSesion };
});
