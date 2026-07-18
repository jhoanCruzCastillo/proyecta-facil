import type { FacturacionApi } from './contracts/facturacion';
import { facturacionMock } from './mock/facturacion.mock';
import { facturacionHttp } from './http/facturacion.http';

const useMock = import.meta.env.VITE_MOCK_FACTURACION !== 'false';

export const facturacionApi: FacturacionApi = useMock ? facturacionMock : facturacionHttp;
