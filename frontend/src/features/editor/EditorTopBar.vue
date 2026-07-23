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
  <div class="relative shrink-0 border-b border-white/10 bg-sidebar bg-[url('/bg-cont.webp')] bg-cover bg-center bg-no-repeat px-6 py-3 overflow-hidden">
    <div class="absolute inset-0 bg-black/55 pointer-events-none" />
    <div class="relative flex items-center justify-between">
      <div class="flex items-center gap-3">
        <RouterLink
          :to="`/sectores/${sectorId}`"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          title="Volver"
        >
          <FontAwesomeIcon :icon="faArrowLeft" class="w-4 h-4" />
        </RouterLink>
        <span class="inline-flex items-center justify-center w-auto min-w-10 px-2 h-8 rounded-md border border-brand-400/40 text-brand-300 text-sm font-bold bg-brand-500/15">
          {{ plantilla.codigo }}
        </span>
        <h1 class="text-lg font-bold text-white truncate max-w-xs">{{ plantilla.nombre }}</h1>
        <span class="text-xs text-white/50">{{ plantilla.cantidadSecciones }} secciones</span>
      </div>
      <div class="flex items-center gap-3">
        <VersionTabs :active-tab="activeTab" disable-proyecto dark @change="emit('change-tab', $event)" />
        <button
          v-if="esSuperusuario"
          @click="emit('view-json')"
          type="button"
          class="px-4 py-2 rounded-lg border border-white/15 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faFileCode" class="w-3.5 h-3.5" />
          Ver JSON
        </button>
        <button
          v-if="showInsert"
          @click="emit('insert-excel')"
          type="button"
          class="px-4 py-2 rounded-lg border border-white/15 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faFileExport" class="w-3.5 h-3.5" />
          Insertar
        </button>
        <button
          v-else
          @click="emit('preview-excel')"
          type="button"
          class="px-4 py-2 rounded-lg border border-white/15 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
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
