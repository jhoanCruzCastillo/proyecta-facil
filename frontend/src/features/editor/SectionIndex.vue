<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faGear, faPlus, faCircleCheck, faFileImport } from '@/lib/icons';
import type { Seccion } from '@/types';

defineProps<{
  secciones: Seccion[];
  activeSeccionId: string | null;
  showAddButton?: boolean;
  /** true = muestra el engranaje para asignar la hoja de Excel de cada sección */
  showEditHoja?: boolean;
  /** Cantidad de campos pendientes/inválidos por sección — si se pasa, se muestra un indicador de avance (solo modo cliente) */
  erroresPorSeccion?: Record<string, number>;
  /** true = muestra el botón sutil para importar/reemplazar toda la estructura desde JSON (solo tab Estructura) */
  showImportEstructura?: boolean;
}>();

const emit = defineEmits<{ select: [seccionId: string]; 'add-section': []; 'edit-hoja': [seccionId: string]; 'import-estructura': [] }>();
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between mb-3 px-2">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-muted">
        Secciones · {{ secciones.length }}
      </h3>
      <button
        v-if="showImportEstructura"
        @click="emit('import-estructura')"
        type="button"
        title="Importar estructura desde JSON (reemplaza todo)"
        class="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-brand-600 hover:bg-brand-50 transition-colors shrink-0"
      >
        <FontAwesomeIcon :icon="faFileImport" class="w-3 h-3" />
      </button>
    </div>
    <nav class="flex-1 overflow-y-auto space-y-0.5">
      <div
        v-for="seccion in secciones"
        :key="seccion.id"
        @click="emit('select', seccion.id)"
        class="w-full flex items-center gap-3 pl-3 pr-1.5 py-2.5 rounded-lg text-left transition-all text-sm cursor-pointer"
        :class="activeSeccionId === seccion.id ? 'bg-brand-50 text-brand-700 font-semibold border-l-3 border-brand-600' : 'text-gray-600 hover:bg-gray-50'"
      >
        <span
          class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
          :class="activeSeccionId === seccion.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500'"
        >
          {{ seccion.numero }}
        </span>
        <span class="truncate leading-tight flex-1">{{ seccion.nombre }}</span>
        <template v-if="erroresPorSeccion">
          <span
            v-if="erroresPorSeccion[seccion.id] > 0"
            :title="`${erroresPorSeccion[seccion.id]} campo(s) pendiente(s)`"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0"
          >
            {{ erroresPorSeccion[seccion.id] }}
          </span>
          <FontAwesomeIcon v-else :icon="faCircleCheck" class="w-3.5 h-3.5 text-brand-500 shrink-0" title="Sección completa" />
        </template>
        <button
          v-if="showEditHoja"
          @click.stop="emit('edit-hoja', seccion.id)"
          type="button"
          title="Asignar hoja de Excel"
          class="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-brand-500 hover:bg-white transition-colors shrink-0"
        >
          <FontAwesomeIcon :icon="faGear" class="w-3 h-3" />
        </button>
      </div>
    </nav>
    <button
      v-if="showAddButton"
      @click="emit('add-section')"
      type="button"
      class="mt-3 w-full py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <FontAwesomeIcon :icon="faPlus" class="w-3 h-3" />
      Agregar sección
    </button>
  </div>
</template>
