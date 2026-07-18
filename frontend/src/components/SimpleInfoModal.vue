<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faXmark } from '@/lib/icons';

defineProps<{
  isOpen: boolean;
  icon: IconDefinition;
  title: string;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-md p-6" @click.stop>
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="icon" class="w-4 h-4" />
              </div>
              <h2 class="text-lg font-bold text-heading">{{ title }}</h2>
            </div>
            <button
              @click="emit('close')"
              class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
            >
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>
          <div class="text-sm text-muted leading-relaxed space-y-3">
            <slot />
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
