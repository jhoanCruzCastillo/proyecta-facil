import type { PlantillasApi } from './contracts/plantillas';
import { plantillasMock } from './mock/plantillas.mock';
import { plantillasHttp } from './http/plantillas.http';

const useMock = import.meta.env.VITE_MOCK_PLANTILLAS !== 'false';

export const plantillasApi: PlantillasApi = useMock ? plantillasMock : plantillasHttp;
