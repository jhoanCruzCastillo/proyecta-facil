import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type MaybeRefOrGetter, toValue } from 'vue';
import { archivosExcelApi } from '@/api/archivosExcel';
import type { ArchivoExcel } from '@/types';

export function useCatalogoExcelQuery(plantillaId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['archivosExcel', plantillaId],
    queryFn: () => archivosExcelApi.getCatalogo(toValue(plantillaId)),
  });
}

export function useAgregarArchivoExcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plantillaId, archivo }: { plantillaId: string; archivo: ArchivoExcel }) => archivosExcelApi.addArchivo(plantillaId, archivo),
    onSuccess: (_data, { plantillaId }) => queryClient.invalidateQueries({ queryKey: ['archivosExcel', plantillaId] }),
  });
}

export function useEliminarArchivoExcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plantillaId, archivoId }: { plantillaId: string; archivoId: string }) => archivosExcelApi.deleteArchivo(plantillaId, archivoId),
    onSuccess: (_data, { plantillaId }) => queryClient.invalidateQueries({ queryKey: ['archivosExcel', plantillaId] }),
  });
}

export function useAsignarArchivoExcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plantillaId, archivoId }: { plantillaId: string; archivoId: string }) => archivosExcelApi.asignarArchivo(plantillaId, archivoId),
    onSuccess: (_data, { plantillaId }) => queryClient.invalidateQueries({ queryKey: ['archivosExcel', plantillaId] }),
  });
}
