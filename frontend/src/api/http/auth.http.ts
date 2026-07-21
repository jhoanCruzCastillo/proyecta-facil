import { apiFetch } from './_shared';
import type { AuthApi } from '../contracts/auth';
import type { Sesion } from '@/types';

export const authHttp: AuthApi = {
  login(usuario, password) {
    return apiFetch<Sesion | null>('auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    });
  },

  me() {
    return apiFetch<Sesion | null>('auth/me');
  },

  async logout() {
    await apiFetch<unknown>('auth/logout', { method: 'POST' });
  },
};
