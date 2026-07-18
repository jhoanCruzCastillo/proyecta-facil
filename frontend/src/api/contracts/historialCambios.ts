import type { CambioFicha } from '@/types';

export interface HistorialCambiosApi {
  list(): Promise<CambioFicha[]>;
  listByEjemplo(ejemploId: string): Promise<CambioFicha[]>;
  registrar(entry: CambioFicha): Promise<CambioFicha>;
}
