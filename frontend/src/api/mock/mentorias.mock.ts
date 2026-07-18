import type { MentoriasApi } from '../contracts/mentorias';
import { delay, readLocal, writeLocal, generateId } from './_shared';
import { mentoriasSeed } from '@/data/mentorias';
import type { SesionMentoria } from '@/types';

const KEY = 'vf_mentorias';

function load(): SesionMentoria[] {
  return readLocal<SesionMentoria[]>(KEY, mentoriasSeed);
}

function save(data: SesionMentoria[]): void {
  writeLocal(KEY, data);
}

export const mentoriasMock: MentoriasApi = {
  async list() {
    await delay();
    return load();
  },

  async inscribirse(sesionId, cuentaId) {
    await delay();
    const data = load();
    const sesion = data.find((m) => m.id === sesionId);
    if (!sesion) throw new Error(`Sesión de mentoría ${sesionId} no encontrada`);
    if (!sesion.inscritos.includes(cuentaId) && sesion.inscritos.length < sesion.cuposTotales) {
      sesion.inscritos = [...sesion.inscritos, cuentaId];
    }
    save(data);
    return sesion;
  },

  async enviarPregunta(sesionId, usuarioId, pregunta) {
    await delay();
    const data = load();
    const sesion = data.find((m) => m.id === sesionId);
    if (!sesion) throw new Error(`Sesión de mentoría ${sesionId} no encontrada`);
    sesion.preguntas = [
      ...sesion.preguntas,
      { id: generateId(), usuarioId, pregunta, fechaPregunta: new Date().toISOString() },
    ];
    save(data);
    return sesion;
  },
};
