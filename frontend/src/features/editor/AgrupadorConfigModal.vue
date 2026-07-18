<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faGear } from '@/lib/icons';

defineProps<{
  isOpen: boolean;
  abarcaColumnas: number;
  totalColumnas: number;
}>();

const emit = defineEmits<{ close: []; change: [value: number] }>();

function handleInput(e: Event, totalColumnas: number) {
  const raw = Number((e.target as HTMLInputElement).value) || 1;
  emit('change', Math.min(Math.max(1, raw), totalColumnas));
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-xs" @click.stop>
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <FontAwesomeIcon :icon="faGear" class="w-3.5 h-3.5 text-brand-600" />
              <h2 class="text-sm font-bold text-heading">Fila de título de grupo</h2>
            </div>
            <button @click="emit('close')" class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="p-5 space-y-3">
            <p class="text-xs text-muted">
              Cantidad de <strong>cabeceras/columnas</strong> (no de columnas físicas de Excel) que fusiona el título de cada grupo, contando desde la primera cabecera de la tabla. Las cabeceras restantes quedan vacías en esa fila.
            </p>
            <p class="text-xs text-muted">
              Si alguna de esas cabeceras ya abarca varias columnas de Excel (configurado en la columna misma), el ancho real fusionado es la suma de todas ellas — ej. si la 1ª cabecera abarca 2 columnas y eliges "2", el título fusiona esa cabecera + la siguiente completa (3 columnas físicas en total).
            </p>
            <div>
              <label class="block text-[10px] font-medium text-muted mb-1">Abarca cabeceras/columnas</label>
              <input
                :value="abarcaColumnas"
                @input="handleInput($event, totalColumnas)"
                type="number"
                min="1"
                :max="totalColumnas"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <p class="text-[10px] text-muted mt-1">De un total de {{ totalColumnas }} cabecera{{ totalColumnas === 1 ? '' : 's' }}.</p>
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
