<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck, faXmark } from '@/lib/icons';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="item in ui.toasts"
        :key="item.id"
        class="flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white"
        :class="item.type === 'success' ? 'bg-brand-600' : 'bg-red-600'"
      >
        <FontAwesomeIcon :icon="item.type === 'success' ? faCheck : faXmark" class="w-3.5 h-3.5" />
        {{ item.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.15s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
