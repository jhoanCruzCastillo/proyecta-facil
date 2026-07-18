<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { instrumentoIcons } from '@/lib/icons';
import type { TipoInstrumento } from '@/types';

defineProps<{
  activeTab: TipoInstrumento;
  counts: Record<TipoInstrumento, number>;
}>();

const emit = defineEmits<{ change: [TipoInstrumento] }>();

const tabs: { key: TipoInstrumento; label: string }[] = [
  { key: 'formato', label: 'Formatos' },
  { key: 'ioarr', label: 'IOARR' },
  { key: 'ficha_tecnica', label: 'Fichas Técnicas' },
  { key: 'perfil', label: 'Perfiles' },
];
</script>

<template>
  <div class="flex items-end gap-1 px-3 pt-2.5 bg-gray-100 border-b border-gray-200">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="emit('change', tab.key)"
      type="button"
      class="relative -mb-px flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-lg border border-b-0 transition-colors duration-75"
      :class="activeTab === tab.key ? 'bg-surface-card border-gray-200 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/70'"
    >
      <FontAwesomeIcon :icon="instrumentoIcons[tab.key]" class="w-3.5 h-3.5" :class="activeTab === tab.key ? 'text-brand-600' : 'text-gray-400'" />
      {{ tab.label }}
      <span
        class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center"
        :class="activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'"
      >
        {{ counts[tab.key] }}
      </span>
      <span v-if="activeTab === tab.key" class="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600" />
    </button>
  </div>
</template>
