<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronLeft, faChevronRight, faSave, faPlus, faTrash } from '@/lib/icons';
import ResizeHandle from '@/components/ResizeHandle.vue';
import VersionTabs from '@/components/VersionTabs.vue';
import NuevoEjemploModal from './NuevoEjemploModal.vue';
import ExampleSelector from './ExampleSelector.vue';
import PerfilBlockCard from './PerfilBlockCard.vue';
import PerfilPropertiesPanel from './PerfilPropertiesPanel.vue';
import PerfilSectionIndex from './PerfilSectionIndex.vue';
import { usePerfilEditor } from '@/composables/usePerfilEditor';

const route = useRoute();
const sectorId = computed(() => route.params.sectorId as string);
const plantillaId = computed(() => route.params.plantillaId as string);

const {
  editData, sector, activeTab, activeSectionIndex, selectedCampoId, selectedCampo,
  ejemplos, activeEjemplo, editedValores, showNuevoEjemplo,
  leftWidth, rightWidth, secciones, safeIdx, seccionActiva, isFirst, isLast, showExamples,
  activeItemId, containerRef,
  handleLeftResize, handleRightResize, handleItemClick,
  updateBloque, addBloque, deleteBloque, handleExampleValueChange, handleCreateExample, handleSave,
} = usePerfilEditor(plantillaId, sectorId);

watch(safeIdx, () => {
  containerRef.value?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
});

function deleteSelected() {
  if (!selectedCampo.value) return;
  const sub = seccionActiva.value?.subsecciones.find((s) => s.campos.some((c) => c.id === selectedCampo.value!.id));
  if (sub) deleteBloque(selectedCampo.value.id, sub.id);
}
</script>

<template>
  <div v-if="!editData || !sector" class="p-8 text-muted">Plantilla no encontrada</div>
  <div v-else class="flex flex-col h-screen">
    <div class="shrink-0 border-b border-gray-100 bg-white px-6 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <RouterLink :to="`/sectores/${sectorId}`" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <FontAwesomeIcon :icon="faChevronLeft" class="w-4 h-4" />
          </RouterLink>
          <span class="inline-flex items-center justify-center px-2 h-8 rounded-md border border-violet-200 text-violet-700 text-sm font-bold bg-violet-50">
            {{ editData.codigo }}
          </span>
          <h1 class="text-base font-bold text-heading truncate max-w-xs">{{ editData.nombre }}</h1>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">Perfil</span>
        </div>
        <div class="flex items-center gap-3">
          <VersionTabs :active-tab="activeTab" disable-proyecto @change="activeTab = $event" />
          <ExampleSelector
            v-if="showExamples"
            :ejemplos="ejemplos"
            :active-ejemplo="activeEjemplo"
            @select="activeEjemplo = $event"
            @new-example="showNuevoEjemplo = true"
          />
          <button @click="handleSave" type="button" class="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2">
            <FontAwesomeIcon :icon="faSave" class="w-3.5 h-3.5" />
            Guardar
          </button>
        </div>
      </div>
      <div v-if="showExamples" class="mt-2 text-xs text-muted flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
        Estos ejemplos alimentan el contexto de la IA. <strong class="text-heading">No reentrenan el modelo.</strong>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="shrink-0 bg-white px-3 py-4 overflow-hidden flex flex-col" :style="{ width: `${leftWidth}px` }">
        <PerfilSectionIndex
          :secciones="secciones"
          :active-section-index="safeIdx"
          :active-item-id="activeItemId"
          @section-click="activeSectionIndex = $event"
          @item-click="handleItemClick"
        />
      </div>

      <ResizeHandle @resize="handleLeftResize" />

      <div class="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div ref="containerRef" class="flex-1 overflow-y-auto p-6">
          <div v-if="seccionActiva" :key="seccionActiva.id + activeTab">
            <div class="mb-6">
              <p class="text-xs font-semibold text-violet-500 mb-0.5 uppercase tracking-widest">
                {{ seccionActiva.numero === '0' ? 'Resumen Ejecutivo' : `Sección ${seccionActiva.numero}` }}
              </p>
              <h2 class="text-xl font-bold text-heading">{{ seccionActiva.nombre }}</h2>
            </div>

            <div v-for="sub in seccionActiva.subsecciones" :key="sub.id" class="mb-6">
              <div v-if="sub.codigo !== seccionActiva.numero" class="flex items-center gap-2 mb-4 pt-1">
                <span class="text-xs font-bold text-violet-400 font-mono">{{ sub.codigo }}</span>
                <span class="text-xs font-semibold uppercase tracking-wide text-heading">{{ sub.nombre }}</span>
                <div class="flex-1 h-px bg-violet-100 ml-1" />
              </div>

              <div v-for="campo in sub.campos" :key="campo.id" :data-section-id="campo.id" class="mb-3">
                <PerfilBlockCard
                  :campo="campo"
                  :is-selected="selectedCampoId === campo.id"
                  clickable
                  :show-example-value="showExamples"
                  :example-value="showExamples ? editedValores[campo.identificador] : undefined"
                  :editable-example="showExamples"
                  :editable-default="activeTab === 'estructura'"
                  @click="selectedCampoId = campo.id === selectedCampoId ? null : campo.id"
                  @update-example-value="handleExampleValueChange(campo.identificador, $event)"
                  @update-default-value="updateBloque(campo.id, { valorEjemplo: $event })"
                />
              </div>

              <button
                v-if="activeTab === 'estructura'"
                @click="addBloque(sub.id, sub.codigo, sub.campos.length)"
                type="button"
                class="w-full py-2 mt-1 rounded-lg border-2 border-dashed border-gray-200 text-xs font-medium text-gray-400 hover:border-violet-300 hover:text-violet-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon :icon="faPlus" class="w-3 h-3" />
                Agregar apartado
              </button>
            </div>
          </div>
        </div>

        <div class="shrink-0 border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
          <button @click="activeSectionIndex = Math.max(0, safeIdx - 1)" :disabled="isFirst" class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <FontAwesomeIcon :icon="faChevronLeft" class="w-3.5 h-3.5" />
            Anterior
          </button>
          <div class="text-center">
            <p class="text-[10px] font-bold uppercase tracking-widest text-violet-500">
              {{ seccionActiva?.numero === '0' ? 'Resumen ejecutivo' : `Sección ${seccionActiva?.numero}` }}
            </p>
            <p class="text-xs font-semibold text-heading leading-tight">{{ seccionActiva?.nombre }}</p>
            <p class="text-[10px] text-muted mt-0.5">{{ safeIdx + 1 }} / {{ secciones.length }}</p>
          </div>
          <button @click="activeSectionIndex = Math.min(secciones.length - 1, safeIdx + 1)" :disabled="isLast" class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Siguiente
            <FontAwesomeIcon :icon="faChevronRight" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ResizeHandle @resize="handleRightResize" />

      <div class="shrink-0 bg-white p-5 overflow-y-auto" :style="{ width: `${rightWidth}px` }">
        <template v-if="selectedCampo">
          <PerfilPropertiesPanel :campo="selectedCampo" :editable="activeTab === 'estructura'" @update="updateBloque" />
          <button
            v-if="activeTab === 'estructura'"
            @click="deleteSelected"
            type="button"
            class="mt-5 w-full py-2 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <FontAwesomeIcon :icon="faTrash" class="w-3 h-3" />
            Eliminar apartado
          </button>
        </template>
        <div v-else class="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
          <div class="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
            <span class="text-violet-300 text-lg font-bold">§</span>
          </div>
          <p class="text-sm text-muted leading-snug">Haz clic en un apartado para ver sus propiedades</p>
        </div>
      </div>
    </div>

    <NuevoEjemploModal :is-open="showNuevoEjemplo" @close="showNuevoEjemplo = false" @create="handleCreateExample" />
  </div>
</template>
