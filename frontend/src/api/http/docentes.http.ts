import { apiFetch } from './_shared';
import type { DocentesApi } from '../contracts/docentes';
import type { Docente, HorarioDocente } from '@/types';

export const docentesHttp: DocentesApi = {
  list() {
    return apiFetch<Docente[]>('docentes');
  },

  actualizarHorario(docenteId, horario) {
    return apiFetch<HorarioDocente[]>(`docentes/${docenteId}/horario`, {
      method: 'PUT',
      body: JSON.stringify({ horario }),
    });
  },
};
