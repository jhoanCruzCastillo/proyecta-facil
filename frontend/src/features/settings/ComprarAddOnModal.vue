<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faMinus, faPlus, faCartShopping } from '@/lib/icons';
import { useFacturacionQuery, useActualizarFacturacion } from '@/composables/useFacturacion';
import { generateId } from '@/api/mock/_shared';
import { useUiStore } from '@/stores/ui';
import type { AddOn } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  usuarioId: string;
  addon: AddOn | null;
}>();

const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const { data: facturacionData } = useFacturacionQuery(() => props.usuarioId);
const actualizarFacturacion = useActualizarFacturacion();
const cantidad = ref(1);

watch(
  () => props.isOpen,
  (open) => { if (open) cantidad.value = 1; },
);

const cantidadActual = computed(() => (props.addon ? facturacionData.value?.addons?.[props.addon.id] ?? 0 : 0));
const total = computed(() => (props.addon ? props.addon.precio * cantidad.value : 0));

async function handleConfirmar() {
  if (!props.addon || !facturacionData.value) return;
  const addon = props.addon;
  const addons = { ...(facturacionData.value.addons ?? {}) };
  addons[addon.id] = (addons[addon.id] ?? 0) + cantidad.value;
  const factura = {
    id: generateId(),
    fecha: new Date().toLocaleDateString('es-PE'),
    total: `$${total.value.toFixed(2)}`,
    estado: 'Pagado' as const,
  };
  await actualizarFacturacion.mutateAsync({
    usuarioId: props.usuarioId,
    data: { addons, facturas: [factura, ...facturacionData.value.facturas] },
  });
  ui.toast(`Compraste ${cantidad.value} × ${addon.nombre}`);
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen && addon" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6" @click.stop>
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-heading">Comprar add-on</h2>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="rounded-lg border border-gray-200 p-4 mb-4">
            <p class="text-sm font-semibold text-heading">{{ addon.nombre }}</p>
            <p class="text-xs text-muted mt-0.5">{{ addon.descripcion }}</p>
            <p class="text-xs text-gray-500 mt-1">${{ addon.precio }} c/u</p>
            <p v-if="cantidadActual > 0" class="text-xs text-brand-600 mt-1">
              Ya tienes {{ cantidadActual }} contratado{{ cantidadActual > 1 ? 's' : '' }}.
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-heading mb-1.5">Cantidad a comprar</label>
            <div class="flex items-center gap-3">
              <button
                @click="cantidad = Math.max(1, cantidad - 1)"
                :disabled="cantidad <= 1"
                type="button"
                class="w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-75"
              >
                <FontAwesomeIcon :icon="faMinus" class="w-2.5 h-2.5" />
              </button>
              <span class="w-8 text-center text-sm font-semibold text-heading">{{ cantidad }}</span>
              <button
                @click="cantidad += 1"
                type="button"
                class="w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors duration-75"
              >
                <FontAwesomeIcon :icon="faPlus" class="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 mb-6">
            <span class="text-sm text-muted">Total a pagar</span>
            <span class="text-lg font-bold text-heading">${{ total.toFixed(2) }}</span>
          </div>

          <div class="flex justify-end gap-3">
            <button @click="emit('close')" type="button" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
              Cancelar
            </button>
            <button
              @click="handleConfirmar"
              type="button"
              class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
            >
              <FontAwesomeIcon :icon="faCartShopping" class="w-3.5 h-3.5" />
              Confirmar compra
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: all 0.12s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(10px);
}
</style>
