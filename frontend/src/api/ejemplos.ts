import type { EjemplosApi } from './contracts/ejemplos';
import { ejemplosMock } from './mock/ejemplos.mock';
import { ejemplosHttp } from './http/ejemplos.http';

const useMock = import.meta.env.VITE_MOCK_EJEMPLOS !== 'false';

export const ejemplosApi: EjemplosApi = useMock ? ejemplosMock : ejemplosHttp;
