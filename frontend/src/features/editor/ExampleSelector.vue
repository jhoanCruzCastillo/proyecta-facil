<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronDown, faSearch, faPlus, faCheck, faCircle } from '@/lib/icons';
import type { Ejemplo } from '@/types';

// Dropdown de ejemplo activo — solo se usa en el editor de Perfil (PlantillaPerfilPage), a
// diferencia del panel resizable con búsqueda (ExamplesPanel) del editor de Ficha Técnica.
const props = defineProps<{
  ejemplos: Ejemplo[];
  activeEjemplo: Ejemplo | null;
}>();

const emit = defineEmits<{
  select: [ejemplo: Ejemplo];
  'new-example': [];
}>();

const isOpen = ref(false);
const search = ref('');
const rootRef = shallowRef<HTMLElement | null>(null);

function handleOutsideClick(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) isOpen.value = false;
}
onMounted(() => document.addEventListener('mousedown', handleOutsideClick));
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick));

const filtered = computed(() =>
  props.ejemplos.filter(
    (ej) => ej.nombre.toLowerCase().includes(search.value.toLowerCase()) || ej.subtitulo.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

function handleSelect(ej: Ejemplo) {
  emit('select', ej);
  isOpen.value = false;
}
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="text-xs font-bold uppercase tracking-widest text-brand-600">Ejemplo activo</span>
    <div ref="rootRef" class="relative">
      <button
        @click="isOpen = !isOpen"
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:border-brand-300 transition-colors min-w-70"
      >
        <span class="w-2 h-2 rounded-full bg-green-500" />
        <span class="flex-1 text-left truncate text-heading font-medium">{{ activeEjemplo?.nombre || 'Seleccionar ejemplo' }}</span>
        <FontAwesomeIcon :icon="faChevronDown" class="w-3 h-3 text-gray-400" />
      </button>

      <Transition name="drop">
        <div
          v-if="isOpen"
          class="absolute top-full left-0 mt-1 w-90 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
        >
          <div class="p-3 border-b border-gray-100">
            <div class="relative">
              <FontAwesomeIcon :icon="faSearch" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input
                v-model="search"
                type="text"
                placeholder="Buscar ejemplo por nombre o ubicación..."
                class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                autofocus
              />
            </div>
          </div>

          <div class="max-h-60 overflow-y-auto">
            <button
              v-for="ej in filtered"
              :key="ej.id"
              @click="handleSelect(ej)"
              type="button"
              class="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              :class="activeEjemplo?.id === ej.id ? 'bg-brand-50/50' : ''"
            >
              <FontAwesomeIcon :icon="faCircle" class="w-2.5 h-2.5 mt-1.5 shrink-0" :class="activeEjemplo?.id === ej.id ? 'text-green-500' : 'text-gray-300'" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-heading truncate">{{ ej.nombre }}</div>
                <div class="text-xs text-muted">{{ ej.subtitulo }} · {{ ej.detalle }}</div>
              </div>
              <FontAwesomeIcon v-if="activeEjemplo?.id === ej.id" :icon="faCheck" class="w-4 h-4 text-brand-600 mt-1" />
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <button
      @click="emit('new-example')"
      type="button"
      class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
    >
      <FontAwesomeIcon :icon="faPlus" class="w-3 h-3" />
      Nuevo ejemplo
    </button>
  </div>
</template>

<style scoped>
.drop-enter-active,
.drop-leave-active {
  transition: all 0.1s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
