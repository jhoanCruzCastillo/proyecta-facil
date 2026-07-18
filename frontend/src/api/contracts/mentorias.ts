import type { SesionMentoria } from '@/types';

export interface MentoriasApi {
  list(): Promise<SesionMentoria[]>;
  inscribirse(sesionId: string, cuentaId: string): Promise<SesionMentoria>;
  enviarPregunta(sesionId: string, usuarioId: string, pregunta: string): Promise<SesionMentoria>;
}
