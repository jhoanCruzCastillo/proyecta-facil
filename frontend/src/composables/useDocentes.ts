import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { docentesHttp } from '@/api/http/docentes.http';
import type { BloqueHorario } from '@/api/contracts/docentes';

const queryKey = ['docentes'] as const;

export function useDocentesQuery() {
  return useQuery({ queryKey, queryFn: docentesHttp.list });
}

export function useActualizarHorarioDocente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docenteId, horario }: { docenteId: string; horario: BloqueHorario[] }) =>
      docentesHttp.actualizarHorario(docenteId, horario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}
