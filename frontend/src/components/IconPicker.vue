<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { sectorIcons, sectorIconList } from '@/lib/icons';

defineProps<{ value: string }>();
const emit = defineEmits<{ 'update:value': [string] }>();
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-heading mb-2">
      Ícono <span class="text-red-500">*</span>
    </label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="iconKey in sectorIconList"
        :key="iconKey"
        @click="emit('update:value', iconKey)"
        type="button"
        class="w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-100"
        :class="value === iconKey ? 'bg-brand-600 text-white ring-2 ring-brand-600 ring-offset-2' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
      >
        <FontAwesomeIcon v-if="sectorIcons[iconKey]" :icon="sectorIcons[iconKey]" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
