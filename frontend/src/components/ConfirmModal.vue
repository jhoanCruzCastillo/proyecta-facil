<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTriangleExclamation } from '@/lib/icons';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    /** 0-100: si se define, reemplaza los botones por una barra de progreso y bloquea el cierre */
    progress?: number | null;
  }>(),
  { confirmLabel: 'Eliminar', progress: null },
);

const emit = defineEmits<{ confirm: []; close: [] }>();

function handleOverlayClick() {
  if (props.progress == null) emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click="handleOverlayClick"
    >
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-md p-6" @click.stop>
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon :icon="faTriangleExclamation" class="w-4 h-4" />
            </div>
            <div class="flex-1">
              <h2 class="text-lg font-bold text-heading mb-1">{{ title }}</h2>
              <p class="text-sm text-muted leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <div v-if="progress != null" class="mt-6">
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full bg-brand-600 rounded-full transition-[width] duration-150" :style="{ width: `${progress}%` }" />
            </div>
            <p class="text-xs text-muted mt-2 text-right">{{ progress }}%</p>
          </div>
          <div v-else class="flex justify-end gap-3 mt-6">
            <button
              @click="emit('close')"
              class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
            >
              Cancelar
            </button>
            <button
              @click="emit('confirm')"
              class="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors duration-75"
            >
              {{ confirmLabel }}
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
