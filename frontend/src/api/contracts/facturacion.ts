import type { FacturacionMock } from '@/types';

export interface FacturacionApi {
  get(usuarioId: string): Promise<FacturacionMock>;
  update(usuarioId: string, data: Partial<FacturacionMock>): Promise<FacturacionMock>;
}
