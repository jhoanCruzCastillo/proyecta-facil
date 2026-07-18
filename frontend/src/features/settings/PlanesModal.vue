<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck } from '@/lib/icons';
import { useFacturacionQuery, useActualizarFacturacion } from '@/composables/useFacturacion';
import { useUiStore } from '@/stores/ui';
import { planes } from '@/data/planes';
import type { Plan } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  usuarioId: string;
}>();

const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const { data: facturacionData } = useFacturacionQuery(() => props.usuarioId);
const actualizarFacturacion = useActualizarFacturacion();

async function handleElegir(p: Plan) {
  const renovacion = new Date();
  renovacion.setMonth(renovacion.getMonth() + 1);
  await actualizarFacturacion.mutateAsync({
    usuarioId: props.usuarioId,
    data: {
      planId: p.id,
      plan: `Nivel ${p.numeroNivel} — ${p.nombre}`,
      precio: `$${p.precio}`,
      periodicidad: p.periodicidad,
      cancelada: false,
      fechaRenovacion: renovacion.toLocaleDateString('es-PE'),
      fechaInicioPlan: new Date().toISOString(),
    },
  });
  ui.toast(`Ahora estás en el Nivel ${p.numeroNivel} — ${p.nombre}`);
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-heading">Elige un plan</h2>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              v-for="p in planes"
              :key="p.id"
              class="flex flex-col rounded-xl border p-4"
              :class="facturacionData?.planId === p.id ? 'border-brand-300 bg-brand-50' : 'border-gray-200'"
            >
              <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Nivel {{ p.numeroNivel }}</p>
              <p class="text-base font-bold text-heading mb-1">{{ p.nombre }}</p>
              <p class="text-2xl font-bold text-heading">
                ${{ p.precio }}
                <span class="text-xs font-normal text-muted"> · {{ p.periodicidad }}</span>
              </p>
              <ul class="flex-1 space-y-1.5 my-4">
                <li v-for="(f, i) in p.features" :key="i" class="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                  <FontAwesomeIcon :icon="faCheck" class="w-2.5 h-2.5 text-brand-500 mt-0.5 shrink-0" />
                  {{ f }}
                </li>
              </ul>
              <span
                v-if="facturacionData?.planId === p.id"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-brand-700 bg-brand-100"
              >
                <FontAwesomeIcon :icon="faCheck" class="w-3 h-3" />
                Plan actual
              </span>
              <button
                v-else
                @click="handleElegir(p)"
                type="button"
                class="px-4 py-2 rounded-md bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors duration-75"
              >
                Elegir
              </button>
            </div>
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
