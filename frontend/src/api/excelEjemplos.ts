import type { ExcelEjemplosApi } from './contracts/excelEjemplos';
import { excelEjemplosMock } from './mock/excelEjemplos.mock';
import { excelEjemplosHttp } from './http/excelEjemplos.http';

const useMock = import.meta.env.VITE_MOCK_ARCHIVOS_EXCEL !== 'false';

export const excelEjemplosApi: ExcelEjemplosApi = useMock ? excelEjemplosMock : excelEjemplosHttp;
