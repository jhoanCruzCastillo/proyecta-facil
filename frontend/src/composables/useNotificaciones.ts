import { type MaybeRefOrGetter, toValue } from 'vue';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { notificacionesHttp } from '@/api/http/notificaciones.http';

// Polling desde la campanita del Sidebar — visible en toda la app, no solo mientras se está en un
// chat de asesoría (por eso el intervalo es más relajado que el de useMensajesQuery).
const INTERVALO_MS = 15_000;

export function useNotificacionesQuery(usuarioId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['notificaciones', usuarioId],
    queryFn: () => notificacionesHttp.list(toValue(usuarioId)),
    enabled: () => !!toValue(usuarioId),
    refetchInterval: INTERVALO_MS,
  });
}

export function useMarcarNotificacionLeida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificacionesHttp.marcarLeida(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  });
}
