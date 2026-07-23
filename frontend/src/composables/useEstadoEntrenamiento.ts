import { computed } from 'vue';
import { useSessionStore } from '@/stores/session';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useFacturacionQuery } from '@/composables/useFacturacion';
import { cuentaEfectivaDe } from '@/lib/permisos';
import {
  esPlanEntrenamiento,
  entrenamientoVencido,
  diasRestantesEntrenamiento,
  limiteFichasSimultaneas,
  limiteConsultas,
  numeroNivelDe,
} from '@/lib/planAcceso';

// Estado del plan del cliente/colaborador en sesión (nivel, vigencia del Nivel 0, cupo de fichas
// simultáneas) — la facturación vive bajo la cuenta del titular, no de cada colaborador (ver
// cuentaEfectivaDe).
export function useEstadoEntrenamiento() {
  const session = useSessionStore();
  const { data: usuariosData } = useUsuariosQuery();
  const cuentaId = computed(() => (session.sesion ? cuentaEfectivaDe(usuariosData.value ?? [], session.sesion) : ''));
  const { data: facturacionData } = useFacturacionQuery(cuentaId);

  return {
    numeroNivel: computed(() => (facturacionData.value ? numeroNivelDe(facturacionData.value.planId) : 1)),
    esNivel0: computed(() => (facturacionData.value ? esPlanEntrenamiento(facturacionData.value.planId) : false)),
    vencido: computed(() => (facturacionData.value ? entrenamientoVencido(facturacionData.value) : false)),
    diasRestantes: computed(() => (facturacionData.value ? diasRestantesEntrenamiento(facturacionData.value) : 0)),
    limiteFichas: computed(() => (facturacionData.value ? limiteFichasSimultaneas(facturacionData.value) : 3)),
    limiteConsultas: computed(() => (facturacionData.value ? limiteConsultas(facturacionData.value) : 3)),
  };
}
