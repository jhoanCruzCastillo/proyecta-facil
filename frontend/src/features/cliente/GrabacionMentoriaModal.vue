<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCirclePlay } from '@/lib/icons';
import { useUiStore } from '@/stores/ui';

defineProps<{
  isOpen: boolean;
  tema: string;
}>();

const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-2xl overflow-hidden" @click.stop>
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <div class="flex items-center gap-2.5 min-w-0">
              <FontAwesomeIcon :icon="faCirclePlay" class="w-4 h-4 text-brand-600 shrink-0" />
              <h2 class="text-sm font-bold text-heading truncate">{{ tema }}</h2>
            </div>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100 shrink-0">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>
          <button
            @click="ui.toast('Esto es un prototipo — aquí se reproduciría la grabación real de la sesión')"
            type="button"
            class="w-full aspect-video bg-gray-900 flex items-center justify-center group"
          >
            <div class="w-16 h-16 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-100">
              <FontAwesomeIcon :icon="faCirclePlay" class="w-8 h-8 text-white" />
            </div>
          </button>
          <p class="px-4 py-2 text-[11px] text-muted">Video de muestra — no es la grabación real de esta sesión.</p>
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
