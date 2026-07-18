import type { Sector } from '@/types';

export interface SectoresApi {
  list(): Promise<Sector[]>;
  get(id: string): Promise<Sector | null>;
  create(sector: Sector): Promise<Sector>;
  update(id: string, data: Partial<Sector>): Promise<Sector>;
  remove(id: string): Promise<void>;
}
