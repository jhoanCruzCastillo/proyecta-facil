<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTriangleExclamation, metodoPagoIcons, metodoPagoLabels } from '@/lib/icons';
import { useSessionStore } from '@/stores/session';
import { useFacturacionQuery, useActualizarFacturacion } from '@/composables/useFacturacion';
import { useUsuariosQuery, useActualizarUsuario, useEliminarUsuario } from '@/composables/useUsuarios';
import { usePushActividad } from '@/composables/useActividad';
import { useUiStore } from '@/stores/ui';
import { addOns, planes, calcularTotalMensual } from '@/data/planes';
import ConfirmModal from '@/components/ConfirmModal.vue';
import PlanesModal from './PlanesModal.vue';
import ActualizarPagoModal from './ActualizarPagoModal.vue';
import ComprarAddOnModal from './ComprarAddOnModal.vue';
import ColaboradorModal from './ColaboradorModal.vue';
import AddOnsGrid from './AddOnsGrid.vue';
import ColaboradoresTable from './ColaboradoresTable.vue';
import type { AddOn, Usuario } from '@/types';

const session = useSessionStore();
const ui = useUiStore();
const usuarioId = computed(() => session.sesion?.usuarioId ?? '');

const { data: facturacionData } = useFacturacionQuery(usuarioId);
const actualizarFacturacion = useActualizarFacturacion();
const { data: usuariosData } = useUsuariosQuery();
const actualizarUsuario = useActualizarUsuario();
const eliminarUsuario = useEliminarUsuario();
const pushActividad = usePushActividad();

const showPlanes = ref(false);
const showPago = ref(false);
const comprandoAddon = ref<AddOn | null>(null);
const colaboradorModal = ref<{ mode: 'nuevo' | 'editar'; usuario: Usuario | null } | null>(null);
const eliminarColaborador = ref<Usuario | null>(null);

const plan = computed(() => planes.find((p) => p.id === facturacionData.value?.planId) ?? planes[1]);
const totalMensual = computed(() => calcularTotalMensual(plan.value, facturacionData.value?.addons ?? {}));
const colaboradores = computed(() => (usuariosData.value ?? []).filter((u) => u.cuentaClienteId === usuarioId.value));
const asientosComprados = computed(() => facturacionData.value?.addons?.['usuario-adicional'] ?? 0);
const asientosTotales = computed(() => plan.value.limiteUsuariosBase + asientosComprados.value);

async function handleCancelar() {
  await actualizarFacturacion.mutateAsync({ usuarioId: usuarioId.value, data: { cancelada: true } });
  ui.toast('Tu plan se cancelará al finalizar el periodo actual');
}

async function handleReactivar() {
  await actualizarFacturacion.mutateAsync({ usuarioId: usuarioId.value, data: { cancelada: false } });
  ui.toast('Tu suscripción se reactivó');
}

async function handleQuitarAddon(addon: AddOn) {
  const actual = facturacionData.value?.addons ?? {};
  const cantidad = Math.max(0, (actual[addon.id] ?? 0) - 1);
  await actualizarFacturacion.mutateAsync({ usuarioId: usuarioId.value, data: { addons: { ...actual, [addon.id]: cantidad } } });
  ui.toast(`Quitaste 1 × ${addon.nombre}`);
}

async function toggleEstadoColaborador(c: Usuario) {
  const nuevoEstado = c.estado === 'inactivo' ? 'activo' : 'inactivo';
  await actualizarUsuario.mutateAsync({ id: c.id, data: { estado: nuevoEstado } });
  ui.toast(`"${c.nombre}" ahora está ${nuevoEstado}`);
}

async function handleEliminarColaborador() {
  if (!eliminarColaborador.value) return;
  await eliminarUsuario.mutateAsync(eliminarColaborador.value.id);
  await pushActividad.mutateAsync({ mensaje: `Se eliminó al colaborador "${eliminarColaborador.value.nombre}"`, color: 'red' });
  ui.toast(`Colaborador "${eliminarColaborador.value.nombre}" eliminado`);
  eliminarColaborador.value = null;
}
</script>

<template>
  <div v-if="facturacionData" class="space-y-6">
    <div class="py-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-heading">{{ facturacionData.plan }}</p>
          <p class="text-xs text-muted">${{ plan.precio }} · {{ facturacionData.periodicidad }}</p>
        </div>
        <button @click="showPlanes = true" type="button" class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
          Ajustar plan
        </button>
      </div>
      <div v-if="totalMensual !== plan.precio" class="mt-3 px-3 py-2 rounded-lg bg-gray-50 text-xs text-gray-600 space-y-1">
        <div class="flex justify-between">
          <span>{{ plan.nombre }} (base)</span>
          <span>${{ plan.precio }}</span>
        </div>
        <div v-for="a in addOns.filter((x) => x.recurrente && (facturacionData!.addons?.[x.id] ?? 0) > 0)" :key="a.id" class="flex justify-between">
          <span>{{ facturacionData!.addons![a.id] }} × {{ a.nombre }}</span>
          <span>${{ facturacionData!.addons![a.id] * a.precio }}</span>
        </div>
        <div class="flex justify-between font-semibold text-heading pt-1 border-t border-gray-200">
          <span>Total por periodo</span>
          <span>${{ totalMensual }}</span>
        </div>
      </div>
    </div>

    <div v-if="facturacionData.cancelada" class="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
      <div class="flex items-center gap-2 text-amber-800 text-sm">
        <FontAwesomeIcon :icon="faTriangleExclamation" class="w-3.5 h-3.5" />
        Tu plan se cancelará el {{ facturacionData.fechaRenovacion }}.
      </div>
      <button @click="handleReactivar" type="button" class="px-3 py-1.5 rounded-md bg-white border border-amber-300 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors duration-75 shrink-0">
        Volver a suscribirse
      </button>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-heading mb-3">Pago</h3>
      <div class="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200">
        <div class="flex items-center gap-3">
          <FontAwesomeIcon :icon="metodoPagoIcons[facturacionData.metodoPago ?? 'tarjeta']" class="w-5 h-5 text-gray-400" />
          <span class="text-sm text-heading">
            <template v-if="facturacionData.metodoPago === 'yape' || facturacionData.metodoPago === 'plin'">
              {{ metodoPagoLabels[facturacionData.metodoPago] }} · {{ facturacionData.telefonoPago ?? '—' }}
            </template>
            <template v-else-if="facturacionData.metodoPago === 'mercado_pago' || facturacionData.metodoPago === '360pay'">
              {{ metodoPagoLabels[facturacionData.metodoPago] }}
            </template>
            <template v-else>{{ facturacionData.tarjetaMarca }} •••• {{ facturacionData.tarjetaUltimos4 }}</template>
          </span>
        </div>
        <button @click="showPago = true" type="button" class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
          Actualizar
        </button>
      </div>
      <button v-if="!facturacionData.cancelada" @click="handleCancelar" type="button" class="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors duration-75">
        Cancelar plan
      </button>
    </div>

    <AddOnsGrid :plan="plan" :addons="facturacionData.addons ?? {}" @comprar="comprandoAddon = $event" @quitar="handleQuitarAddon" />

    <ColaboradoresTable
      v-if="asientosTotales > 1"
      :colaboradores="colaboradores"
      :plan="plan"
      :asientos-comprados="asientosComprados"
      :asientos-totales="asientosTotales"
      @toggle-estado="toggleEstadoColaborador"
      @editar="colaboradorModal = { mode: 'editar', usuario: $event }"
      @eliminar="eliminarColaborador = $event"
      @agregar="colaboradorModal = { mode: 'nuevo', usuario: null }"
    />

    <div v-if="facturacionData.facturas.length > 0">
      <h3 class="text-sm font-semibold text-heading mb-3">Facturas</h3>
      <div class="rounded-lg border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left font-medium text-muted px-4 py-2">Fecha</th>
              <th class="text-left font-medium text-muted px-4 py-2">Total</th>
              <th class="text-left font-medium text-muted px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in facturacionData.facturas" :key="f.id" class="border-b border-gray-100 last:border-0">
              <td class="px-4 py-2.5 text-gray-600">{{ f.fecha }}</td>
              <td class="px-4 py-2.5 text-gray-600">{{ f.total }}</td>
              <td class="px-4 py-2.5">
                <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">{{ f.estado }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <PlanesModal :is-open="showPlanes" :usuario-id="usuarioId" @close="showPlanes = false" />
    <ActualizarPagoModal :is-open="showPago" :usuario-id="usuarioId" @close="showPago = false" />
    <ComprarAddOnModal :is-open="!!comprandoAddon" :usuario-id="usuarioId" :addon="comprandoAddon" @close="comprandoAddon = null" />
    <ColaboradorModal
      :is-open="!!colaboradorModal"
      :cuenta-cliente-id="usuarioId"
      :colaborador="colaboradorModal?.usuario ?? null"
      :usuarios="usuariosData ?? []"
      @close="colaboradorModal = null"
    />
    <ConfirmModal
      :is-open="!!eliminarColaborador"
      title="Eliminar colaborador"
      :message="`¿Seguro que deseas eliminar a &quot;${eliminarColaborador?.nombre}&quot;? Esta acción no se puede deshacer.`"
      @confirm="handleEliminarColaborador"
      @close="eliminarColaborador = null"
    />
  </div>
</template>
