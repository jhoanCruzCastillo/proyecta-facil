import type { ArchivoExcel } from '@/types';

export interface ExcelEjemplosApi {
  get(ejemploId: string): Promise<ArchivoExcel | null>;
  set(ejemploId: string, archivo: ArchivoExcel): Promise<ArchivoExcel>;
}
