import type { HistorialCambiosApi } from './contracts/historialCambios';
import { historialCambiosMock } from './mock/historialCambios.mock';
import { historialCambiosHttp } from './http/historialCambios.http';

const useMock = import.meta.env.VITE_MOCK_HISTORIAL !== 'false';

export const historialCambiosApi: HistorialCambiosApi = useMock ? historialCambiosMock : historialCambiosHttp;
