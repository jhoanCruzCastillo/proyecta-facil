import type { MentoriasApi } from './contracts/mentorias';
import { mentoriasMock } from './mock/mentorias.mock';
import { mentoriasHttp } from './http/mentorias.http';

const useMock = import.meta.env.VITE_MOCK_MENTORIAS !== 'false';

export const mentoriasApi: MentoriasApi = useMock ? mentoriasMock : mentoriasHttp;
