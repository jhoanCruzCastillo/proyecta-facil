<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPen, faEye, faArrowLeft, faChevronLeft, faChevronRight } from '@/lib/icons';
import VersionTabs from '@/components/VersionTabs.vue';
import ResizeHandle from '@/components/ResizeHandle.vue';
import SectionIndex from './SectionIndex.vue';
import SectionContent from './SectionContent.vue';
import { usePlantillaQuery } from '@/composables/usePlantillas';
import { useSectorQuery } from '@/composables/useSectores';
import type { VersionTab } from '@/types';

const route = useRoute();
const sectorId = computed(() => route.params.sectorId as string);
const plantillaId = computed(() => route.params.plantillaId as string);

const { data: plantilla } = usePlantillaQuery(plantillaId);
const { data: sector } = useSectorQuery(sectorId);

const activeTab = ref<VersionTab>('estructura');
const activeSectionIndex = ref(0);
const leftWidth = ref(280);

function handleLeftResize(delta: number) {
  leftWidth.value = Math.max(180, leftWidth.value + delta);
}

const secciones = computed(() => plantilla.value?.secciones ?? []);
const safeIdx = computed(() => Math.min(activeSectionIndex.value, secciones.value.length - 1));
const seccionActiva = computed(() => secciones.value[safeIdx.value]);
const isFirst = computed(() => safeIdx.value === 0);
const isLast = computed(() => safeIdx.value === secciones.value.length - 1);
const showExamples = computed(() => activeTab.value === 'ejemplos');

function handleSectionSelect(seccionId: string) {
  const idx = secciones.value.findIndex((s) => s.id === seccionId);
  if (idx !== -1) activeSectionIndex.value = idx;
}
</script>

<template>
  <div v-if="!plantilla || !sector" class="p-8 text-muted">Plantilla no encontrada</div>
  <div v-else class="flex flex-col h-screen">
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
          <span class="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <FontAwesomeIcon :icon="faEye" class="w-2.5 h-2.5" />
            Solo lectura
          </span>
        </div>
        <div class="flex items-center gap-3">
          <VersionTabs :active-tab="activeTab" disable-proyecto @change="activeTab = $event" />
          <RouterLink
            :to="`/sectores/${sectorId}/plantilla/${plantillaId}/editar`"
            class="px-4 py-2 rounded-lg bg-sidebar text-white text-sm font-medium hover:bg-heading transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
            Editar
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="shrink-0 bg-white p-4 overflow-y-auto" :style="{ width: `${leftWidth}px` }">
        <SectionIndex :secciones="secciones" :active-seccion-id="seccionActiva?.id ?? null" @select="handleSectionSelect" />
      </div>

      <ResizeHandle @resize="handleLeftResize" />

      <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto bg-white p-8">
          <SectionContent v-if="seccionActiva" :key="seccionActiva.id + activeTab" :seccion="seccionActiva" :show-example-values="showExamples" />
        </div>

        <div class="shrink-0 border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
          <button
            @click="activeSectionIndex = Math.max(0, activeSectionIndex - 1)"
            :disabled="isFirst"
            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FontAwesomeIcon :icon="faChevronLeft" class="w-3.5 h-3.5" />
            Anterior
          </button>
          <span class="text-sm text-muted">
            Sección <span class="font-semibold text-heading">{{ safeIdx + 1 }}</span> de {{ secciones.length }}
          </span>
          <button
            @click="activeSectionIndex = Math.min(secciones.length - 1, activeSectionIndex + 1)"
            :disabled="isLast"
            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <FontAwesomeIcon :icon="faChevronRight" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
