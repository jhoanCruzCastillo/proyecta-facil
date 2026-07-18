import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { actividadApi } from '@/api/actividad';
import type { ActividadReciente } from '@/types';

const queryKey = ['actividad'] as const;

export function useActividadQuery() {
  return useQuery({ queryKey, queryFn: actividadApi.list });
}

export function usePushActividad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mensaje, color }: { mensaje: string; color: ActividadReciente['color'] }) => actividadApi.push(mensaje, color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}
