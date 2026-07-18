<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, faCircleQuestion, faPen, faEye } from '@/lib/icons';
import { renderMarkdown } from '@/lib/markdown';
import type { Subseccion } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  subseccion: Subseccion;
  /** true = modo edición (admin, Estructura); false = solo lectura (Ejemplos, cliente, vista) */
  editable?: boolean;
}>();

const emit = defineEmits<{ close: []; save: [texto: string] }>();

const texto = ref('');
const tab = ref<'editar' | 'preview'>('editar');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      texto.value = props.subseccion.ayuda ?? '';
      tab.value = 'editar';
    }
  },
);

const previewHtml = computed(() => renderMarkdown(texto.value));
const readonlyHtml = computed(() => renderMarkdown(props.subseccion.ayuda ?? ''));

function handleGuardar() {
  emit('save', texto.value.trim());
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div
          class="bg-white rounded-2xl shadow-modal w-full flex flex-col"
          :class="editable ? 'max-w-2xl h-[85vh]' : 'max-w-md max-h-[85vh]'"
          @click.stop
        >
          <div class="flex items-start justify-between p-6 pb-4 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon :icon="faCircleQuestion" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-base font-bold text-heading">Ayuda para llenar</h2>
                <p class="text-xs text-muted">{{ subseccion.codigo }} — {{ subseccion.nombre }}</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100 shrink-0">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <template v-if="editable">
            <div class="flex gap-1 px-6 shrink-0">
              <button
                @click="tab = 'editar'"
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-75"
                :class="tab === 'editar' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400 hover:text-gray-600'"
              >
                <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
                Editar (Markdown)
              </button>
              <button
                @click="tab = 'preview'"
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-75"
                :class="tab === 'preview' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400 hover:text-gray-600'"
              >
                <FontAwesomeIcon :icon="faEye" class="w-3 h-3" />
                Vista previa
              </button>
            </div>

            <div class="flex-1 min-h-0 px-6 py-4">
              <textarea
                v-if="tab === 'editar'"
                v-model="texto"
                placeholder="Explica cómo debe llenarse esta subsección. Soporta Markdown..."
                class="w-full h-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <div v-else class="w-full h-full overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                <div v-if="texto.trim()" v-html="previewHtml" />
                <p v-else class="text-sm text-muted italic">Nada que previsualizar todavía.</p>
              </div>
            </div>

            <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button @click="emit('close')" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                Cancelar
              </button>
              <button @click="handleGuardar" class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2">
                <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                Guardar ayuda
              </button>
            </div>
          </template>
          <div v-else class="px-6 pb-6 overflow-y-auto">
            <div v-if="subseccion.ayuda?.trim()" v-html="readonlyHtml" />
            <p v-else class="text-sm text-muted italic">Todavía no hay ayuda para esta subsección.</p>
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
