import { type MaybeRefOrGetter, toValue } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { asesoriaHttp } from '@/api/http/asesoria.http';
import type { CrearSolicitudAsesoriaData } from '@/api/contracts/asesoria';

// Mientras haya una conversación activa, ambos lados hacen polling — no hay WebSockets en el
// proyecto. 15s para la lista de solicitudes (el docente no necesita saber al segundo que llegó
// una, ya lo avisa la campanita de notificaciones), 3s para los mensajes de un chat abierto.
const INTERVALO_SOLICITUDES_MS = 15_000;
const INTERVALO_MENSAJES_MS = 3_000;

export function useMisSolicitudesQuery(usuarioId: MaybeRefOrGetter<string>, rol: 'cliente' | 'docente') {
  return useQuery({
    queryKey: ['asesoria', 'solicitudes', rol, usuarioId],
    queryFn: () => asesoriaHttp.misSolicitudes(toValue(usuarioId), rol),
    enabled: () => !!toValue(usuarioId),
    refetchInterval: INTERVALO_SOLICITUDES_MS,
  });
}

export function useCrearSolicitudAsesoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearSolicitudAsesoriaData) => asesoriaHttp.crear(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asesoria', 'solicitudes'] }),
  });
}

export function useAceptarSolicitud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ solicitudId, linkReunion }: { solicitudId: string; linkReunion?: string }) =>
      asesoriaHttp.aceptar(solicitudId, linkReunion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asesoria', 'solicitudes'] }),
  });
}

export function useRechazarSolicitud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (solicitudId: string) => asesoriaHttp.rechazar(solicitudId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asesoria', 'solicitudes'] }),
  });
}

export function useFinalizarSolicitud() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (solicitudId: string) => asesoriaHttp.finalizar(solicitudId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['asesoria', 'solicitudes'] }),
  });
}

export function useMensajesQuery(solicitudId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: ['asesoria', 'mensajes', solicitudId],
    queryFn: () => asesoriaHttp.mensajes(toValue(solicitudId) as string),
    enabled: () => !!toValue(solicitudId),
    refetchInterval: INTERVALO_MENSAJES_MS,
  });
}

export function useEnviarMensaje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ solicitudId, autorId, texto }: { solicitudId: string; autorId: string; texto: string }) =>
      asesoriaHttp.enviarMensaje(solicitudId, autorId, texto),
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ['asesoria', 'mensajes', vars.solicitudId] }),
  });
}
