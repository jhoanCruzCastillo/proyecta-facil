<script lang="ts">
export const ACCENT_COLORS = [
  '#0d9488',
  '#2563eb',
  '#059669',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#7c3aed',
];
</script>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck } from '@/lib/icons';

defineProps<{ value: string }>();
const emit = defineEmits<{ 'update:value': [string] }>();
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-heading mb-2">
      Color de acento <span class="text-red-500">*</span>
    </label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="color in ACCENT_COLORS"
        :key="color"
        @click="emit('update:value', color)"
        type="button"
        class="w-10 h-10 rounded-full flex items-center justify-center"
        :class="value === color ? 'scale-110' : 'hover:brightness-110'"
        :style="{ backgroundColor: color }"
      >
        <FontAwesomeIcon v-if="value === color" :icon="faCheck" class="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
</template>
