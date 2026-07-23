import type { Plan, AddOn } from '@/types';

export const planes: Plan[] = [
  {
    id: 'nivel-0',
    numeroNivel: 0,
    nombre: 'Pedagógico',
    precio: 50,
    periodicidad: 'Único',
    limiteFichasBase: 2,
    limiteConsultasBase: 1,
    limiteUsuariosBase: 1,
    features: [
      'Uso para entrenar el llenado de las plantillas',
      'Limitado a pruebas concretas y ejercicios ya diseñados',
      'Permite experimentar con la herramienta hasta 2 ejercicios simultáneos',
      '1 consulta de asesoría 1:1 con un docente',
      '4 semanas activo (semanas finales)',
    ],
  },
  {
    id: 'nivel-1',
    numeroNivel: 1,
    nombre: 'Profesional',
    precio: 150,
    periodicidad: 'Mensual',
    limiteFichasBase: 3,
    limiteConsultasBase: 3,
    limiteUsuariosBase: 1,
    features: [
      'Llenado de plantillas con proyectos reales',
      'Ayuda de la inteligencia artificial para mejorar títulos y textos',
      'Asistencia de dónde encontrar referencias de llenado en el curso',
      'Asesor de IA 24/7 para llenado de las plantillas',
      'Límite de 1 usuario y hasta 3 plantillas simultáneas',
      '3 consultas de asesoría 1:1 con un docente',
      'Acceso a mentorías grupales en línea',
      'Incluye todos los formatos',
    ],
  },
  {
    id: 'nivel-2',
    numeroNivel: 2,
    nombre: 'Premium',
    precio: 250,
    periodicidad: 'Mensual',
    limiteFichasBase: 10,
    limiteConsultasBase: 6,
    limiteUsuariosBase: 3,
    features: [
      'Hasta 3 usuarios colaborativos',
      'Hasta 10 plantillas simultáneas',
      '6 consultas de asesoría 1:1 con un docente',
      'Histórico de cambio en las plantillas llenadas',
      'Sugerencias inteligentes de IA',
      'Acceso a sección de preguntas y respuestas en las mentorías grupales',
    ],
  },
];

export const addOns: AddOn[] = [
  {
    id: 'consultoria-1a1',
    nombre: 'Consultoría 1 a 1',
    descripcion: 'Una consulta adicional de asesoría 1:1 con un docente, para cuando ya usaste las que incluye tu plan — disponible desde cualquier nivel.',
    precio: 550,
    recurrente: false,
  },
  {
    id: 'usuario-adicional',
    nombre: 'Usuario adicional',
    descripcion: 'Usuarios adicionales para los niveles 1 y 2',
    precio: 45,
    recurrente: true,
    nivelesDisponibles: [1, 2],
  },
  {
    id: 'plantilla-adicional',
    nombre: 'Plantilla adicional',
    descripcion: 'Plantillas simultáneas adicionales para los niveles 1 y 2',
    precio: 15,
    recurrente: true,
    nivelesDisponibles: [1, 2],
  },
];

// Costo mensual total = precio base del plan + add-ons recurrentes contratados (los de cargo
// único, como la consultoría 1 a 1, no suman aquí — ya se cobraron en su propia factura).
export function calcularTotalMensual(plan: Plan, addons: Record<string, number>): number {
  const recurrentes = addOns.reduce((sum, a) => {
    if (!a.recurrente) return sum;
    const cantidad = addons[a.id] ?? 0;
    return sum + cantidad * a.precio;
  }, 0);
  return plan.precio + recurrentes;
}
