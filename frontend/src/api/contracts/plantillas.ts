import type { Plantilla } from '@/types';

export interface PlantillasApi {
  list(): Promise<Plantilla[]>;
  listBySector(sectorId: string): Promise<Plantilla[]>;
  get(id: string): Promise<Plantilla | null>;
  create(plantilla: Plantilla): Promise<Plantilla>;
  update(id: string, data: Partial<Plantilla>): Promise<Plantilla>;
  remove(id: string): Promise<void>;
}
