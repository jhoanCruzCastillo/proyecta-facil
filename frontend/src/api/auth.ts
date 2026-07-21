import type { AuthApi } from './contracts/auth';
import { authMock } from './mock/auth.mock';
import { authHttp } from './http/auth.http';

// Switch por recurso: VITE_MOCK_AUTH=false pasa a hablar con el backend real. Ver .env.development.
const useMock = import.meta.env.VITE_MOCK_AUTH !== 'false';

export const authApi: AuthApi = useMock ? authMock : authHttp;
