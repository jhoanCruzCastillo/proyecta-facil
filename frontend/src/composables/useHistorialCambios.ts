import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type MaybeRefOrGetter, toValue } from 'vue';
import { historialCambiosApi } from '@/api/historialCambios';
import type { CambioFicha } from '@/types';

export function useHistorialCambiosQuery() {
  return useQuery({
    queryKey: ['historialCambios'],
    queryFn: () => historialCambiosApi.list(),
  });
}

export function useHistorialFichaQuery(ejemploId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['historialCambios', ejemploId],
    queryFn: () => historialCambiosApi.listByEjemplo(toValue(ejemploId)),
  });
}

export function useRegistrarCambioFicha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: CambioFicha) => historialCambiosApi.registrar(entry),
    onSuccess: (_data, entry) => queryClient.invalidateQueries({ queryKey: ['historialCambios', entry.ejemploId] }),
  });
}
