<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { sectorIcons } from '@/lib/icons';
import type { Sector } from '@/types';

const props = defineProps<{ sector: Sector }>();
const icon = sectorIcons[props.sector.icono];
</script>

<template>
  <div class="bg-surface-card rounded-xl p-6 shadow-card flex flex-col">
    <div class="flex items-start justify-between mb-4">
      <div
        class="w-11 h-11 rounded-xl flex items-center justify-center"
        :style="{ backgroundColor: sector.colorAccent + '18', color: sector.colorAccent }"
      >
        <FontAwesomeIcon v-if="icon" :icon="icon" class="w-5 h-5" />
      </div>
      <span class="text-xs text-muted border border-gray-200 rounded-full px-3 py-1">
        {{ sector.cantidadPlantillas }} plantillas
      </span>
    </div>
    <h3 class="font-bold text-heading text-base mb-1">{{ sector.nombre }}</h3>
    <p class="text-xs text-muted mb-1">{{ sector.cantidadEjemplos }} ejemplos cargados</p>
    <p v-if="sector.descripcion" class="text-xs text-muted/90 mb-5 line-clamp-2">{{ sector.descripcion }}</p>
    <div v-else class="mb-5" />
    <RouterLink
      :to="`/sectores/${sector.id}`"
      class="mt-auto block text-center py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
    >
      Ver plantillas →
    </RouterLink>
  </div>
</template>
