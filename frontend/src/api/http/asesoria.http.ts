import { apiFetch } from './_shared';
import type { AsesoriaApi } from '../contracts/asesoria';
import type { SolicitudAsesoria, MensajeAsesoria } from '@/types';

export const asesoriaHttp: AsesoriaApi = {
  misSolicitudes(usuarioId, rol) {
    return apiFetch<SolicitudAsesoria[]>(`asesoria/solicitudes?usuarioId=${usuarioId}&rol=${rol}`);
  },

  crear(data) {
    return apiFetch<SolicitudAsesoria>('asesoria/solicitudes', { method: 'POST', body: JSON.stringify(data) });
  },

  aceptar(solicitudId, linkReunion) {
    return apiFetch<SolicitudAsesoria>(`asesoria/solicitudes/${solicitudId}/aceptar`, {
      method: 'POST',
      body: JSON.stringify({ linkReunion }),
    });
  },

  rechazar(solicitudId) {
    return apiFetch<SolicitudAsesoria>(`asesoria/solicitudes/${solicitudId}/rechazar`, { method: 'POST' });
  },

  finalizar(solicitudId) {
    return apiFetch<SolicitudAsesoria>(`asesoria/solicitudes/${solicitudId}/finalizar`, { method: 'POST' });
  },

  mensajes(solicitudId) {
    return apiFetch<MensajeAsesoria[]>(`asesoria/solicitudes/${solicitudId}/mensajes`);
  },

  enviarMensaje(solicitudId, autorId, texto) {
    return apiFetch<MensajeAsesoria[]>(`asesoria/solicitudes/${solicitudId}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ autorId, texto }),
    });
  },
};
