<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faGear } from '@/lib/icons';
import type { Seccion } from '@/types';

defineProps<{ isOpen: boolean; seccion: Seccion | null }>();
const emit = defineEmits<{ close: []; change: [hoja: string] }>();
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen && seccion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-xs" @click.stop>
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <FontAwesomeIcon :icon="faGear" class="w-3.5 h-3.5 text-brand-600" />
              <h2 class="text-sm font-bold text-heading">Hoja de Excel</h2>
            </div>
            <button @click="emit('close')" class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="p-5 space-y-3">
            <p class="text-xs text-muted">
              Pestaña de Excel donde se ubican los campos de la sección "{{ seccion.nombre }}".
            </p>
            <div>
              <label class="block text-[10px] font-medium text-muted mb-1">Nombre de la hoja</label>
              <input
                :value="seccion.hoja || ''"
                @input="emit('change', ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="Ej. DATOS GENERALES"
                autofocus
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
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
