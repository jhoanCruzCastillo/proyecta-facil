import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { tiposUsuarioApi } from '@/api/tiposUsuario';
import type { TipoUsuario } from '@/types';

export function useTiposUsuarioQuery() {
  return useQuery({
    queryKey: ['tiposUsuario'],
    queryFn: () => tiposUsuarioApi.list(),
  });
}

export function useCrearTipoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tipo: TipoUsuario) => tiposUsuarioApi.create(tipo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiposUsuario'] }),
  });
}

export function useActualizarTipoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TipoUsuario> }) => tiposUsuarioApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiposUsuario'] }),
  });
}

export function useEliminarTipoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tiposUsuarioApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiposUsuario'] }),
  });
}
