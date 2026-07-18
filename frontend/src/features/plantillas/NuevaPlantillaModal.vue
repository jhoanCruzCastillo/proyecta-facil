<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck } from '@/lib/icons';
import { instrumentoIcons } from '@/lib/icons';
import InstrumentoSelector, { instrumentoAccent } from './InstrumentoSelector.vue';
import type { TipoInstrumento, TipologiaIoarr } from '@/types';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{
  close: [];
  create: [codigo: string, nombre: string, descripcion: string, instrumento: TipoInstrumento, tipologiasIoarr: TipologiaIoarr[] | undefined];
}>();

const subtitulos: Record<TipoInstrumento, string> = {
  formato: 'Define la estructura de un formato de registro',
  ioarr: 'Define la estructura de un formato IOARR',
  ficha_tecnica: 'Define la estructura de una ficha técnica',
  perfil: 'Define la estructura de un estudio de preinversión a nivel de Perfil',
};

const placeholders: Record<TipoInstrumento, { codigo: string; nombre: string }> = {
  formato: { codigo: '5A', nombre: 'Registro de idea de proyecto...' },
  ioarr: { codigo: '7C', nombre: 'Registro de IOARR...' },
  ficha_tecnica: { codigo: '6A-test', nombre: 'Ficha Técnica General...' },
  perfil: { codigo: 'PERFIL-1', nombre: 'Perfil de Proyecto...' },
};

const instrumento = ref<TipoInstrumento>('formato');
const tipologias = ref<TipologiaIoarr[]>([]);
const codigo = ref('');
const nombre = ref('');
const descripcion = ref('');

const accent = computed(() => instrumentoAccent[instrumento.value]);

function reset() {
  codigo.value = '';
  nombre.value = '';
  descripcion.value = '';
  instrumento.value = 'formato';
  tipologias.value = [];
}

function handleSubmit() {
  if (!codigo.value.trim() || !nombre.value.trim()) return;
  emit(
    'create',
    codigo.value.trim(),
    nombre.value.trim(),
    descripcion.value.trim(),
    instrumento.value,
    instrumento.value === 'ioarr' ? tipologias.value : undefined,
  );
  reset();
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="accent.iconBg">
                <FontAwesomeIcon :icon="instrumentoIcons[instrumento]" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Nueva plantilla</h2>
                <p class="text-sm text-muted">{{ subtitulos[instrumento] }}</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 space-y-4">
            <InstrumentoSelector
              :instrumento="instrumento"
              :tipologias="tipologias"
              @update:instrumento="instrumento = $event"
              @update:tipologias="tipologias = $event"
            />

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">
                  Código <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="codigo"
                  type="text"
                  :placeholder="placeholders[instrumento].codigo"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  style="text-transform: uppercase"
                  autofocus
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-heading mb-1.5">
                  Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="nombre"
                  type="text"
                  :placeholder="placeholders[instrumento].nombre"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Descripción <span class="text-muted font-normal">(opcional)</span>
              </label>
              <textarea
                v-model="descripcion"
                rows="2"
                placeholder="Breve descripción del formato..."
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button @click="emit('close')" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                Cancelar
              </button>
              <button
                @click="handleSubmit"
                :disabled="!codigo.trim() || !nombre.trim()"
                class="px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                :class="accent.btn"
              >
                <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                Crear plantilla
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
