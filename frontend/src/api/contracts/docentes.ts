import type { Docente, HorarioDocente } from '@/types';

export type BloqueHorario = Pick<HorarioDocente, 'diaSemana' | 'horaInicio' | 'horaFin'>;

export interface DocentesApi {
  list(): Promise<Docente[]>;
  actualizarHorario(docenteId: string, horario: BloqueHorario[]): Promise<HorarioDocente[]>;
}
