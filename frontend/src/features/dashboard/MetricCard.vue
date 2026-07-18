<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

defineProps<{
  icon: IconDefinition;
  value: number;
  label: string;
  color: string;
  bgColor: string;
}>();
</script>

<template>
  <div class="bg-surface-card rounded-xl p-6 shadow-card relative overflow-hidden">
    <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-4" :style="{ backgroundColor: bgColor, color }">
      <FontAwesomeIcon :icon="icon" class="w-4 h-4" />
    </div>
    <div class="text-3xl font-bold text-heading">{{ value }}</div>
    <div class="text-sm text-muted mt-1">{{ label }}</div>
    <div class="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10" :style="{ backgroundColor: color }" />
  </div>
</template>
