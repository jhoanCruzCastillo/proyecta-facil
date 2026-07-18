import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type MaybeRefOrGetter, toValue } from 'vue';
import { ejemplosApi } from '@/api/ejemplos';
import type { Ejemplo } from '@/types';

export function useEjemplosQuery() {
  return useQuery({
    queryKey: ['ejemplos'],
    queryFn: () => ejemplosApi.list(),
  });
}

export function useEjemploQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['ejemplos', id],
    queryFn: () => ejemplosApi.get(toValue(id)),
  });
}

export function useEjemplosByPlantillaQuery(plantillaId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['ejemplos', 'byPlantilla', plantillaId],
    queryFn: () => ejemplosApi.listByPlantilla(toValue(plantillaId)),
  });
}

export function useCrearEjemplo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ejemplo: Ejemplo) => ejemplosApi.create(ejemplo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ejemplos'] }),
  });
}

export function useActualizarEjemplo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ejemplo> }) => ejemplosApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ejemplos'] }),
  });
}

export function useEliminarEjemplo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ejemplosApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ejemplos'] }),
  });
}
