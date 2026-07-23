<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLock } from '@/lib/icons';
import type { VersionTab } from '@/types';

defineProps<{
  activeTab: VersionTab;
  disableProyecto?: boolean;
  /** true = variante para cabeceras oscuras (fondo transparente en vez de blanco) — ver EditorTopBar.vue */
  dark?: boolean;
}>();
const emit = defineEmits<{ change: [VersionTab] }>();

const tabs: { key: VersionTab; label: string }[] = [
  { key: 'estructura', label: 'Estructura' },
  { key: 'ejemplos', label: 'Ejemplos' },
  { key: 'proyecto', label: 'Proyecto' },
];
</script>

<template>
  <div class="flex rounded-lg border overflow-hidden" :class="dark ? 'border-white/15' : 'border-gray-200'">
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
            ? dark ? 'text-white/30 cursor-not-allowed bg-transparent' : 'text-gray-300 cursor-not-allowed bg-white'
            : dark ? 'text-white/70 hover:bg-white/10 hover:text-white bg-transparent' : 'text-gray-600 hover:bg-gray-50 bg-white'
      "
    >
      {{ tab.label }}
      <FontAwesomeIcon v-if="tab.key === 'proyecto' && disableProyecto" :icon="faLock" class="w-3 h-3" />
    </button>
  </div>
</template>
