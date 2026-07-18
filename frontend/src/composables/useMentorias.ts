import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { mentoriasApi } from '@/api/mentorias';

const queryKey = ['mentorias'] as const;

export function useMentoriasQuery() {
  return useQuery({ queryKey, queryFn: mentoriasApi.list });
}

export function useInscribirseAMentoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sesionId, cuentaId }: { sesionId: string; cuentaId: string }) => mentoriasApi.inscribirse(sesionId, cuentaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useEnviarPreguntaMentoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sesionId, usuarioId, pregunta }: { sesionId: string; usuarioId: string; pregunta: string }) =>
      mentoriasApi.enviarPregunta(sesionId, usuarioId, pregunta),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}
