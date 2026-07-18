import type { TiposUsuarioApi } from './contracts/tiposUsuario';
import { tiposUsuarioMock } from './mock/tiposUsuario.mock';
import { tiposUsuarioHttp } from './http/tiposUsuario.http';

const useMock = import.meta.env.VITE_MOCK_USUARIOS !== 'false';

export const tiposUsuarioApi: TiposUsuarioApi = useMock ? tiposUsuarioMock : tiposUsuarioHttp;
