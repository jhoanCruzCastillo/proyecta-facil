<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, faFileAlt, faFileExcel, faTriangleExclamation, tipologiaIoarrLabels } from '@/lib/icons';
import type { TipologiaIoarr } from '@/types';

// `hasExcelAsignado` solo lo pasa el editor de Ficha Técnica (cada ejemplo necesita su propia
// copia del Excel asignado a la plantilla) — el editor de Perfil no maneja catálogo de Excel y
// deja el default `true`, igual que el componente original.
const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    mostrarTipologiasIoarr?: boolean;
    hasExcelAsignado?: boolean;
  }>(),
  { hasExcelAsignado: true },
);

const emit = defineEmits<{
  close: [];
  create: [nombre: string, subtitulo: string, detalle: string, tipologiasIoarr: TipologiaIoarr[] | undefined];
  'assign-excel': [];
}>();

const nombre = ref('');
const subtitulo = ref('');
const detalle = ref('');
const tipologias = ref<TipologiaIoarr[]>([]);

function toggleTipologia(t: TipologiaIoarr) {
  tipologias.value = tipologias.value.includes(t) ? tipologias.value.filter((x) => x !== t) : [...tipologias.value, t];
}

function reset() {
  nombre.value = '';
  subtitulo.value = '';
  detalle.value = '';
  tipologias.value = [];
}

function handleSubmit() {
  if (!nombre.value.trim()) return;
  emit('create', nombre.value.trim(), subtitulo.value.trim(), detalle.value.trim(), props.mostrarTipologiasIoarr ? tipologias.value : undefined);
  reset();
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-md" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faFileAlt" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Nuevo ejemplo</h2>
                <p class="text-sm text-muted">Caso resuelto de referencia para la IA</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div v-if="!hasExcelAsignado" class="px-6 pb-6 space-y-4">
            <div class="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <FontAwesomeIcon :icon="faTriangleExclamation" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p class="text-sm text-amber-800 leading-relaxed">
                Esta plantilla no tiene un Excel asignado. Cada ejemplo necesita su propia copia del Excel,
                así que primero debes asignar uno.
              </p>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button @click="emit('close')" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                Cancelar
              </button>
              <button
                @click="emit('assign-excel')"
                type="button"
                class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon :icon="faFileExcel" class="w-3.5 h-3.5" />
                Asignar Excel ahora
              </button>
            </div>
          </div>
          <div v-else class="px-6 pb-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                v-model="nombre"
                type="text"
                placeholder="Ej. I.E. N° 50123 — Wanchaq, Cusco"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                autofocus
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">Subtítulo</label>
              <input
                v-model="subtitulo"
                type="text"
                placeholder="Ej. Educación inicial"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">Detalle</label>
              <input
                v-model="detalle"
                type="text"
                placeholder="Ej. 365 alumnos"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div v-if="mostrarTipologiasIoarr">
              <label class="block text-sm font-medium text-heading mb-1.5">
                Tipología(s) que representa este caso <span class="text-muted font-normal">(opcional)</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(label, t) in tipologiaIoarrLabels"
                  :key="t"
                  type="button"
                  @click="toggleTipologia(t as TipologiaIoarr)"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75"
                  :class="tipologias.includes(t as TipologiaIoarr) ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                >
                  {{ label }}
                </button>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button @click="emit('close')" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                Cancelar
              </button>
              <button
                @click="handleSubmit"
                :disabled="!nombre.trim()"
                class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                Crear ejemplo
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
