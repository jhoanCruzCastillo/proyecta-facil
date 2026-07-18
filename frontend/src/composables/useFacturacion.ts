import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type MaybeRefOrGetter, toValue } from 'vue';
import { facturacionApi } from '@/api/facturacion';
import type { FacturacionMock } from '@/types';

export function useFacturacionQuery(usuarioId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['facturacion', usuarioId],
    queryFn: () => facturacionApi.get(toValue(usuarioId)),
    enabled: () => !!toValue(usuarioId),
  });
}

export function useActualizarFacturacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, data }: { usuarioId: string; data: Partial<FacturacionMock> }) => facturacionApi.update(usuarioId, data),
    onSuccess: (_data, { usuarioId }) => queryClient.invalidateQueries({ queryKey: ['facturacion', usuarioId] }),
  });
}
