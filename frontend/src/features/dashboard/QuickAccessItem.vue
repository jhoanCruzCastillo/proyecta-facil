<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowRight } from '@/lib/icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

defineProps<{
  icon: IconDefinition;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  to: string;
}>();
</script>

<template>
  <RouterLink :to="to" class="flex items-center gap-4 p-4 bg-surface rounded-xl hover:shadow-md transition-shadow group">
    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :style="{ backgroundColor: iconBg, color: iconColor }">
      <FontAwesomeIcon :icon="icon" class="w-4 h-4" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-heading text-sm">{{ title }}</div>
      <div class="text-xs text-muted truncate">{{ description }}</div>
    </div>
    <FontAwesomeIcon :icon="faArrowRight" class="w-4 text-gray-300 group-hover:text-brand-600 transition-colors" />
  </RouterLink>
</template>
