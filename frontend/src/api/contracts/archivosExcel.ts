import type { ArchivoExcel, CatalogoExcelPlantilla } from '@/types';

export interface ArchivosExcelApi {
  getCatalogo(plantillaId: string): Promise<CatalogoExcelPlantilla>;
  addArchivo(plantillaId: string, archivo: ArchivoExcel): Promise<CatalogoExcelPlantilla>;
  deleteArchivo(plantillaId: string, archivoId: string): Promise<CatalogoExcelPlantilla>;
  asignarArchivo(plantillaId: string, archivoId: string): Promise<CatalogoExcelPlantilla>;
}
