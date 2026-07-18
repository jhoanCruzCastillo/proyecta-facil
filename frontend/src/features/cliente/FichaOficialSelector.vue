<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch, faFilter, faCircleCheck } from '@/lib/icons';
import type { Plantilla } from '@/types';

const props = defineProps<{
  plantillasCoincidentes: Plantilla[];
  selectedPlantillaId: string;
}>();

const emit = defineEmits<{ select: [plantillaId: string] }>();

const search = ref('');

const filtradas = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return props.plantillasCoincidentes;
  return props.plantillasCoincidentes.filter(
    (p) => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q),
  );
});
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-heading mb-1.5">
      Ficha oficial <span class="text-red-500">*</span>
    </label>
    <div class="flex gap-2 mb-2">
      <div class="relative flex-1">
        <FontAwesomeIcon :icon="faSearch" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar ficha por nombre o código..."
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>
      <button
        type="button"
        title="Filtros (próximamente)"
        class="w-9 h-9 shrink-0 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors duration-75"
      >
        <FontAwesomeIcon :icon="faFilter" class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="max-h-44 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
      <div
        v-for="p in filtradas"
        :key="p.id"
        @click="emit('select', p.id)"
        class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-75"
        :class="selectedPlantillaId === p.id ? 'bg-brand-50' : 'hover:bg-gray-50'"
      >
        <span class="inline-flex items-center justify-center px-2 h-6 rounded-md border border-brand-200 text-brand-700 text-xs font-bold bg-brand-50 shrink-0">
          {{ p.codigo }}
        </span>
        <span class="text-sm text-heading truncate flex-1">{{ p.nombre }}</span>
        <FontAwesomeIcon v-if="selectedPlantillaId === p.id" :icon="faCircleCheck" class="w-4 h-4 text-brand-600 shrink-0" />
      </div>
      <p v-if="filtradas.length === 0" class="px-3 py-4 text-center text-sm text-muted">
        No hay fichas de este tipo registradas en este sector.
      </p>
    </div>
  </div>
</template>
