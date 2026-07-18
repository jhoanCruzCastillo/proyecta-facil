import type { UsuariosApi } from './contracts/usuarios';
import { usuariosMock } from './mock/usuarios.mock';
import { usuariosHttp } from './http/usuarios.http';

const useMock = import.meta.env.VITE_MOCK_USUARIOS !== 'false';

export const usuariosApi: UsuariosApi = useMock ? usuariosMock : usuariosHttp;
