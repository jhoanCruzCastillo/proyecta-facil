import type { FacturacionApi } from '../contracts/facturacion';
import { delay, readLocal, writeLocal, generateId } from './_shared';
import type { FacturacionMock } from '@/types';

const KEY = 'vf_facturacion';

function generarFacturacionDefault(): FacturacionMock {
  const hoy = new Date();
  const renovacion = new Date(hoy);
  renovacion.setMonth(renovacion.getMonth() + 1);
  const facturaMesPasado = new Date(hoy);
  facturaMesPasado.setMonth(facturaMesPasado.getMonth() - 1);
  const facturaDosMeses = new Date(hoy);
  facturaDosMeses.setMonth(facturaDosMeses.getMonth() - 2);

  return {
    planId: 'nivel-1',
    plan: 'Nivel 1 — Profesional',
    precio: '$150',
    periodicidad: 'Mensual',
    cancelada: false,
    fechaRenovacion: renovacion.toLocaleDateString('es-PE'),
    metodoPago: 'tarjeta',
    tarjetaMarca: 'Visa',
    tarjetaUltimos4: '4242',
    facturas: [
      { id: generateId(), fecha: facturaMesPasado.toLocaleDateString('es-PE'), total: '$150.00', estado: 'Pagado' },
      { id: generateId(), fecha: facturaDosMeses.toLocaleDateString('es-PE'), total: '$150.00', estado: 'Pagado' },
    ],
    addons: {},
  };
}

function load(): Record<string, FacturacionMock> {
  const data = readLocal<Record<string, FacturacionMock>>(KEY, {});
  // Compatibilidad con registros guardados antes de que existieran `planId`/`addons`/`metodoPago`.
  for (const registro of Object.values(data)) {
    if (!registro.planId) registro.planId = 'nivel-1';
    if (!registro.addons) registro.addons = {};
    if (!registro.metodoPago) registro.metodoPago = 'tarjeta';
  }
  return data;
}

function save(data: Record<string, FacturacionMock>): void {
  writeLocal(KEY, data);
}

export const facturacionMock: FacturacionApi = {
  async get(usuarioId) {
    await delay();
    return load()[usuarioId] ?? generarFacturacionDefault();
  },

  async update(usuarioId, patch) {
    await delay();
    const data = load();
    const actual = data[usuarioId] ?? generarFacturacionDefault();
    data[usuarioId] = { ...actual, ...patch };
    save(data);
    return data[usuarioId];
  },
};
