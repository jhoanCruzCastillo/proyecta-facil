<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, faFileImport, faTriangleExclamation, faFileCode } from '@/lib/icons';
import InstrumentoSelector, { instrumentoAccent } from './InstrumentoSelector.vue';
import { parseDocumento, type DocumentoParseResult } from '@/lib/schemaImport';
import type { TipoInstrumento, TipologiaIoarr, Seccion } from '@/types';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{
  close: [];
  import: [data: { codigo: string; nombre: string; instrumento: TipoInstrumento; tipologiasIoarr: TipologiaIoarr[] | undefined; secciones: Seccion[] }];
}>();

const parsed = ref<DocumentoParseResult | null>(null);
const error = ref('');
const instrumento = ref<TipoInstrumento>('ficha_tecnica');
const tipologias = ref<TipologiaIoarr[]>([]);
const codigo = ref('');
const nombre = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const accent = computed(() => instrumentoAccent[instrumento.value]);

function reset() {
  parsed.value = null;
  error.value = '';
  instrumento.value = 'ficha_tecnica';
  tipologias.value = [];
  codigo.value = '';
  nombre.value = '';
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
      const result = parseDocumento(raw);
      parsed.value = result;
      codigo.value = result.codigo;
      nombre.value = result.nombre;
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

function handleSubmit() {
  if (!parsed.value || !codigo.value.trim() || !nombre.value.trim()) return;
  emit('import', {
    codigo: codigo.value.trim(),
    nombre: nombre.value.trim(),
    instrumento: instrumento.value,
    tipologiasIoarr: instrumento.value === 'ioarr' ? tipologias.value : undefined,
    secciones: parsed.value.secciones,
  });
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
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faFileImport" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Importar plantilla desde JSON</h2>
                <p class="text-sm text-muted">Documento con el esquema oficial (tipo_version: "estructura")</p>
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
                type="button"
                class="w-full py-10 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-colors flex flex-col items-center gap-2"
              >
                <FontAwesomeIcon :icon="faFileCode" class="w-6 h-6" />
                Seleccionar archivo .json
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

              <InstrumentoSelector
                :instrumento="instrumento"
                :tipologias="tipologias"
                @update:instrumento="instrumento = $event"
                @update:tipologias="tipologias = $event"
              />

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-heading mb-1.5">Código</label>
                  <input
                    v-model="codigo"
                    type="text"
                    class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    style="text-transform: uppercase"
                  />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-heading mb-1.5">Nombre</label>
                  <input
                    v-model="nombre"
                    type="text"
                    class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>
            </template>

            <div class="flex justify-end gap-3 pt-2">
              <button @click="handleClose" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                Cancelar
              </button>
              <button
                v-if="parsed"
                @click="handleSubmit"
                :disabled="!codigo.trim() || !nombre.trim()"
                class="px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                :class="accent.btn"
              >
                <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                Importar plantilla
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
