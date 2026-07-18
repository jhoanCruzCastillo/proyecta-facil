<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faFileCode, faCopy, faCheck } from '@/lib/icons';

defineProps<{
  isOpen: boolean;
  title: string;
  json: string;
}>();

const emit = defineEmits<{ close: [] }>();

const copied = ref(false);

async function handleCopy(json: string) {
  await navigator.clipboard.writeText(json);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1500);
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-[90vw] h-[85vh] flex flex-col overflow-hidden" @click.stop>
          <div class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon :icon="faFileCode" class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <h2 class="text-base font-bold text-heading truncate">{{ title }}</h2>
                <p class="text-xs text-muted">Documento JSON generado — esquema oficial</p>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="handleCopy(json)"
                type="button"
                class="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon :icon="copied ? faCheck : faCopy" class="w-3.5 h-3.5" />
                {{ copied ? 'Copiado' : 'Copiar' }}
              </button>
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

          <div class="flex-1 overflow-auto bg-gray-50 p-4">
            <pre class="text-xs font-mono text-heading whitespace-pre-wrap break-words">{{ json }}</pre>
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
