import type { ArchivosExcelApi } from './contracts/archivosExcel';
import { archivosExcelMock } from './mock/archivosExcel.mock';
import { archivosExcelHttp } from './http/archivosExcel.http';

const useMock = import.meta.env.VITE_MOCK_ARCHIVOS_EXCEL !== 'false';

export const archivosExcelApi: ArchivosExcelApi = useMock ? archivosExcelMock : archivosExcelHttp;
