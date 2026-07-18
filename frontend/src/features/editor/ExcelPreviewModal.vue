<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faFileExcel, faDownload } from '@/lib/icons';
import ExcelViewer from '@/components/ExcelViewer.vue';

defineProps<{
  isOpen: boolean;
  fileUrl: string | null;
  fileName?: string;
  title: string;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-[95vw] h-[95vh] flex flex-col overflow-hidden" @click.stop>
          <div class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon :icon="faFileExcel" class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <h2 class="text-base font-bold text-heading truncate">{{ title }}</h2>
                <p class="text-xs text-muted">{{ fileUrl ? 'Previsualización — solo lectura' : 'Sin Excel asignado' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a
                v-if="fileUrl"
                :href="fileUrl"
                :download="fileName ?? ''"
                class="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon :icon="faDownload" class="w-3.5 h-3.5" />
                Descargar
              </a>
              <button
                @click="emit('close')"
                type="button"
                class="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
                title="Cerrar"
              >
                <FontAwesomeIcon :icon="faXmark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="flex-1 min-h-0">
            <ExcelViewer :file-url="fileUrl" />
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
  transform: scale(0.98) translateY(10px);
}
</style>
