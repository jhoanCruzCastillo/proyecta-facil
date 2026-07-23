<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

// Tarjeta "glass" para la fila de métricas dentro del panel de cabecera semitransparente
// (PageShell) — no confundir con MetricCard, que vive sobre fondo claro dentro del contenedor
// blanco de contenido.
defineProps<{
  icon: IconDefinition;
  value: string | number;
  label: string;
  color: string;
}>();
</script>

<template>
  <div class="rounded-xl bg-white/[0.04] border border-white/10 p-4 flex items-center gap-3.5">
    <div class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" :style="{ backgroundColor: color + '26', color }">
      <FontAwesomeIcon :icon="icon" class="w-4.5 h-4.5" />
    </div>
    <div class="min-w-0">
      <div class="text-2xl font-bold text-white leading-tight truncate">{{ value }}</div>
      <div class="text-xs text-white/55 truncate">{{ label }}</div>
    </div>
  </div>
</template>
