import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type MaybeRefOrGetter, toValue } from 'vue';
import { plantillasApi } from '@/api/plantillas';
import type { Plantilla } from '@/types';

export function usePlantillasBySectorQuery(sectorId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['plantillas', 'bySector', sectorId],
    queryFn: () => plantillasApi.listBySector(toValue(sectorId)),
  });
}

export function usePlantillasQuery() {
  return useQuery({ queryKey: ['plantillas'], queryFn: plantillasApi.list });
}

export function usePlantillaQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['plantillas', id],
    queryFn: () => plantillasApi.get(toValue(id)),
  });
}

export function useActualizarPlantilla() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Plantilla> }) => plantillasApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plantillas'] }),
  });
}
