import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type MaybeRefOrGetter, toValue } from 'vue';
import { sectoresApi } from '@/api/sectores';
import { generateId } from '@/api/mock/_shared';
import type { Sector } from '@/types';

const queryKey = ['sectores'] as const;

export function useSectoresQuery() {
  return useQuery({ queryKey, queryFn: sectoresApi.list });
}

export function useSectorQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['sectores', id],
    queryFn: () => sectoresApi.get(toValue(id)),
  });
}

export function useCrearSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sector: Omit<Sector, 'id'>) => sectoresApi.create({ ...sector, id: generateId() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useActualizarSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sector> }) => sectoresApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useEliminarSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sectoresApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}
