<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLock } from '@/lib/icons';
import type { VersionTab } from '@/types';

defineProps<{
  activeTab: VersionTab;
  disableProyecto?: boolean;
}>();
const emit = defineEmits<{ change: [VersionTab] }>();

const tabs: { key: VersionTab; label: string }[] = [
  { key: 'estructura', label: 'Estructura' },
  { key: 'ejemplos', label: 'Ejemplos' },
  { key: 'proyecto', label: 'Proyecto' },
];
</script>

<template>
  <div class="flex rounded-lg border border-gray-200 overflow-hidden">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="!(tab.key === 'proyecto' && disableProyecto) && emit('change', tab.key)"
      :disabled="tab.key === 'proyecto' && disableProyecto"
      type="button"
      class="px-5 py-2 text-sm font-medium transition-colors flex items-center gap-1.5"
      :class="
        activeTab === tab.key
          ? 'bg-brand-600 text-white'
          : tab.key === 'proyecto' && disableProyecto
            ? 'text-gray-300 cursor-not-allowed bg-white'
            : 'text-gray-600 hover:bg-gray-50 bg-white'
      "
    >
      {{ tab.label }}
      <FontAwesomeIcon v-if="tab.key === 'proyecto' && disableProyecto" :icon="faLock" class="w-3 h-3" />
    </button>
  </div>
</template>
