import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { usuariosApi } from '@/api/usuarios';
import type { Usuario } from '@/types';

export function useUsuariosQuery() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.list(),
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (usuario: Usuario) => usuariosApi.create(usuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useActualizarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Usuario> }) => usuariosApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
