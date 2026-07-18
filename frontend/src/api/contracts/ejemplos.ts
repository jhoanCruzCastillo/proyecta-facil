import type { Ejemplo } from '@/types';

export interface EjemplosApi {
  list(): Promise<Ejemplo[]>;
  listByPlantilla(plantillaId: string): Promise<Ejemplo[]>;
  get(id: string): Promise<Ejemplo | null>;
  create(ejemplo: Ejemplo): Promise<Ejemplo>;
  update(id: string, data: Partial<Ejemplo>): Promise<Ejemplo>;
  remove(id: string): Promise<void>;
}
