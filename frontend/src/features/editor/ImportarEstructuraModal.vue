<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faTriangleExclamation, faFileCode, faRotate } from '@/lib/icons';
import { parseDocumento, type DocumentoParseResult } from '@/lib/schemaImport';
import type { Seccion } from '@/types';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: []; import: [secciones: Seccion[]] }>();

const parsed = ref<DocumentoParseResult | null>(null);
const error = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

function reset() {
  parsed.value = null;
  error.value = '';
  isDragging.value = false;
}

function handleClose() {
  reset();
  emit('close');
}

function handleFile(file: File) {
  error.value = '';
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = JSON.parse(String(reader.result));
      parsed.value = parseDocumento(raw);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo leer el archivo.';
    }
  };
  reader.onerror = () => { error.value = 'No se pudo leer el archivo.'; };
  reader.readAsText(file);
}

function handleFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleFile(file);
  (e.target as HTMLInputElement).value = '';
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) handleFile(file);
}

function handleSubmit() {
  if (!parsed.value) return;
  emit('import', parsed.value.secciones);
  reset();
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="handleClose">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faRotate" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Importar estructura desde JSON</h2>
                <p class="text-sm text-muted">Reemplaza toda la estructura actual de esta plantilla</p>
              </div>
            </div>
            <button @click="handleClose" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 space-y-4">
            <div v-if="!parsed">
              <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="handleFileInput" />
              <button
                @click="fileInput?.click()"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
                type="button"
                class="w-full py-10 rounded-xl border-2 border-dashed text-sm font-medium transition-colors flex flex-col items-center gap-2"
                :class="isDragging ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600'"
              >
                <FontAwesomeIcon :icon="faFileCode" class="w-6 h-6" />
                {{ isDragging ? 'Suelta el archivo aquí' : 'Seleccionar o arrastrar archivo .json' }}
              </button>
              <div v-if="error" class="mt-3 flex items-start gap-2 text-sm text-red-600">
                <FontAwesomeIcon :icon="faTriangleExclamation" class="w-4 h-4 mt-0.5 shrink-0" />
                <span>{{ error }}</span>
              </div>
            </div>
            <template v-else>
              <div class="bg-brand-50 rounded-xl p-4 text-sm text-brand-700">
                Se detectaron <strong>{{ parsed.secciones.length }}</strong> secciones y
                <strong>{{ parsed.secciones.reduce((sum, s) => sum + s.cantidadCampos, 0) }}</strong> campos.
              </div>
              <div class="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl p-4">
                <FontAwesomeIcon :icon="faTriangleExclamation" class="w-4 h-4 mt-0.5 shrink-0" />
                <span>Esto reemplaza por completo las secciones, subsecciones y campos actuales de esta plantilla. No se puede deshacer una vez guardes.</span>
              </div>
            </template>

            <div class="flex justify-end gap-3 pt-2">
              <button @click="handleClose" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                Cancelar
              </button>
              <button
                v-if="parsed"
                @click="handleSubmit"
                class="px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon :icon="faRotate" class="w-3.5 h-3.5" />
                Reemplazar estructura
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
