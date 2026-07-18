import type { SectoresApi } from './contracts/sectores';
import { sectoresMock } from './mock/sectores.mock';
import { sectoresHttp } from './http/sectores.http';

// Switch por recurso: VITE_MOCK_SECTORES=false pasa a hablar con el backend real. Ver .env.development.
const useMock = import.meta.env.VITE_MOCK_SECTORES !== 'false';

export const sectoresApi: SectoresApi = useMock ? sectoresMock : sectoresHttp;
