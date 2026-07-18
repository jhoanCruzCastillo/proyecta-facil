import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type MaybeRefOrGetter, toValue } from 'vue';
import { excelEjemplosApi } from '@/api/excelEjemplos';
import type { ArchivoExcel } from '@/types';

export function useExcelEjemploQuery(ejemploId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: ['excelEjemplos', ejemploId],
    queryFn: () => excelEjemplosApi.get(toValue(ejemploId) as string),
    enabled: () => !!toValue(ejemploId),
  });
}

export function useSetExcelEjemplo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ejemploId, archivo }: { ejemploId: string; archivo: ArchivoExcel }) => excelEjemplosApi.set(ejemploId, archivo),
    onSuccess: (_data, { ejemploId }) => queryClient.invalidateQueries({ queryKey: ['excelEjemplos', ejemploId] }),
  });
}
