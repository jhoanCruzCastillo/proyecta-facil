<script setup lang="ts">
import { useActividadQuery } from '@/composables/useActividad';

const dotColors: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-400',
  red: 'bg-red-500',
};

const { data: actividadData } = useActividadQuery();
</script>

<template>
  <div>
    <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Actividad reciente</h3>
    <div class="space-y-4">
      <div v-for="item in actividadData ?? []" :key="item.id" class="flex items-start gap-3">
        <div class="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" :class="dotColors[item.color]" />
        <div>
          <div class="text-sm text-heading leading-snug">{{ item.mensaje }}</div>
          <div class="text-xs text-muted mt-0.5">{{ item.fecha }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
