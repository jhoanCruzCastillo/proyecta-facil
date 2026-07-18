import type { ActividadApi } from './contracts/actividad';
import { actividadMock } from './mock/actividad.mock';
import { actividadHttp } from './http/actividad.http';

const useMock = import.meta.env.VITE_MOCK_ACTIVIDAD !== 'false';

export const actividadApi: ActividadApi = useMock ? actividadMock : actividadHttp;
