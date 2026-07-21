import { apiFetch } from './_shared';
import type { MentoriasApi } from '../contracts/mentorias';
import type { SesionMentoria } from '@/types';

export const mentoriasHttp: MentoriasApi = {
  list() {
    return apiFetch<SesionMentoria[]>('mentorias');
  },

  inscribirse(sesionId, cuentaId) {
    return apiFetch<SesionMentoria>(`mentorias/${sesionId}/inscribirse`, {
      method: 'POST',
      body: JSON.stringify({ cuentaId }),
    });
  },

  enviarPregunta(sesionId, usuarioId, pregunta) {
    return apiFetch<SesionMentoria>(`mentorias/${sesionId}/preguntas`, {
      method: 'POST',
      body: JSON.stringify({ usuarioId, pregunta }),
    });
  },
};
