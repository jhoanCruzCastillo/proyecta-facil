<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faSave, faArrowLeft, faFileCode, faFileExport } from '@/lib/icons';
import VersionTabs from '@/components/VersionTabs.vue';
import { useSessionStore } from '@/stores/session';
import type { VersionTab, Plantilla } from '@/types';

const props = defineProps<{
  plantilla: Plantilla;
  sectorId: string;
  plantillaId: string;
  activeTab: VersionTab;
}>();

const emit = defineEmits<{ 'change-tab': [VersionTab]; save: []; 'view-json': []; 'preview-excel': []; 'insert-excel': [] }>();

const session = useSessionStore();
const esSuperusuario = computed(() => session.sesion?.rol === 'superusuario');
const showInsert = computed(() => props.activeTab === 'ejemplos');
</script>

<template>
  <div class="shrink-0 border-b border-gray-100 bg-white px-6 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <RouterLink
          :to="`/sectores/${sectorId}`"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title="Volver"
        >
          <FontAwesomeIcon :icon="faArrowLeft" class="w-4 h-4" />
        </RouterLink>
        <span class="inline-flex items-center justify-center w-auto min-w-10 px-2 h-8 rounded-md border border-brand-200 text-brand-700 text-sm font-bold bg-brand-50">
          {{ plantilla.codigo }}
        </span>
        <h1 class="text-lg font-bold text-heading truncate max-w-xs">{{ plantilla.nombre }}</h1>
        <span class="text-xs text-muted">{{ plantilla.cantidadSecciones }} secciones</span>
      </div>
      <div class="flex items-center gap-3">
        <VersionTabs :active-tab="activeTab" disable-proyecto @change="emit('change-tab', $event)" />
        <button
          v-if="esSuperusuario"
          @click="emit('view-json')"
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faFileCode" class="w-3.5 h-3.5" />
          Ver JSON
        </button>
        <button
          v-if="showInsert"
          @click="emit('insert-excel')"
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faFileExport" class="w-3.5 h-3.5" />
          Insertar
        </button>
        <button
          v-else
          @click="emit('preview-excel')"
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faEye" class="w-3.5 h-3.5" />
          Vista previa
        </button>
        <button
          @click="emit('save')"
          type="button"
          class="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faSave" class="w-3.5 h-3.5" />
          Guardar
        </button>
      </div>
    </div>
  </div>
</template>
