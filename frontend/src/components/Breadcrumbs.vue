<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronRight } from '@/lib/icons';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

withDefaults(defineProps<{ items: BreadcrumbItem[]; className?: string }>(), {
  className: 'mb-6',
});
</script>

<template>
  <nav class="flex items-center gap-2 text-sm" :class="className">
    <span v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
      <FontAwesomeIcon v-if="i > 0" :icon="faChevronRight" class="w-2.5 h-2.5 text-gray-400" />
      <RouterLink v-if="item.to" :to="item.to" class="text-brand-600 hover:text-brand-700 font-medium">
        {{ item.label }}
      </RouterLink>
      <span v-else class="text-gray-500">{{ item.label }}</span>
    </span>
  </nav>
</template>
