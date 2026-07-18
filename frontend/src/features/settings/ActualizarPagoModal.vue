<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, metodoPagoIcons, metodoPagoLabels } from '@/lib/icons';
import { useFacturacionQuery, useActualizarFacturacion } from '@/composables/useFacturacion';
import { useUiStore } from '@/stores/ui';
import type { MetodoPago } from '@/types';

const props = defineProps<{ isOpen: boolean; usuarioId: string }>();
const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const { data: facturacionData } = useFacturacionQuery(() => props.usuarioId);
const actualizarFacturacion = useActualizarFacturacion();

const marcas = ['Visa', 'Mastercard', 'American Express'];
const metodos: MetodoPago[] = ['tarjeta', 'yape', 'plin', 'mercado_pago', '360pay'];
const esBilletera = (m: MetodoPago) => m === 'yape' || m === 'plin';
const esPasarelaExterna = (m: MetodoPago) => m === 'mercado_pago' || m === '360pay';

const metodo = ref<MetodoPago>('tarjeta');
const marca = ref(marcas[0]);
const ultimos4 = ref('');
const telefono = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      metodo.value = facturacionData.value?.metodoPago ?? 'tarjeta';
      marca.value = facturacionData.value?.tarjetaMarca ?? marcas[0];
      ultimos4.value = '';
      telefono.value = '';
    }
  },
);

const puedeGuardar = computed(() =>
  metodo.value === 'tarjeta'
    ? ultimos4.value.length === 4
    : esBilletera(metodo.value)
      ? telefono.value.length === 9
      : true,
);

function handleUltimos4Input(e: Event) {
  ultimos4.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
}

function handleTelefonoInput(e: Event) {
  telefono.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 9);
}

async function handleGuardar() {
  if (!puedeGuardar.value) return;
  await actualizarFacturacion.mutateAsync({
    usuarioId: props.usuarioId,
    data: {
      metodoPago: metodo.value,
      ...(metodo.value === 'tarjeta' ? { tarjetaMarca: marca.value, tarjetaUltimos4: ultimos4.value } : {}),
      ...(esBilletera(metodo.value) ? { telefonoPago: telefono.value } : {}),
    },
  });
  ui.toast('Método de pago actualizado');
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6" @click.stop>
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-heading">Actualizar método de pago</h2>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <p class="text-xs text-muted mb-4">Datos de muestra — este panel no procesa pagos reales.</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">Método de pago</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="m in metodos"
                  :key="m"
                  @click="metodo = m"
                  type="button"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors duration-75"
                  :class="metodo === m ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                >
                  <FontAwesomeIcon :icon="metodoPagoIcons[m]" class="w-3.5 h-3.5" />
                  {{ metodoPagoLabels[m] }}
                </button>
              </div>
            </div>

            <template v-if="metodo === 'tarjeta'">
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Marca de tarjeta</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="m in marcas"
                    :key="m"
                    @click="marca = m"
                    type="button"
                    class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors duration-75"
                    :class="marca === m ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                  >
                    {{ m }}
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Últimos 4 dígitos</label>
                <input
                  type="text"
                  inputmode="numeric"
                  maxlength="4"
                  :value="ultimos4"
                  @input="handleUltimos4Input"
                  placeholder="0000"
                  class="w-28 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </template>

            <div v-if="esBilletera(metodo)">
              <label class="block text-sm font-medium text-heading mb-1.5">Número {{ metodoPagoLabels[metodo] }}</label>
              <input
                type="text"
                inputmode="numeric"
                maxlength="9"
                :value="telefono"
                @input="handleTelefonoInput"
                placeholder="9XXXXXXXX"
                class="w-40 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <p v-if="esPasarelaExterna(metodo)" class="text-xs text-muted px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
              Al guardar, se simula la conexión con tu cuenta de {{ metodoPagoLabels[metodo] }}. La conexión real se hace vía redirección a la pasarela.
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-100">
            <button @click="emit('close')" type="button" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
              Cancelar
            </button>
            <button
              @click="handleGuardar"
              :disabled="!puedeGuardar"
              type="button"
              class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
            >
              <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
              Guardar
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
