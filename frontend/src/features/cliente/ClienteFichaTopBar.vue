<script setup lang="ts">
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faArrowLeft, faSave, faDownload, faFileExport, faEye, faCircleCheck, faTriangleExclamation, faClockRotateLeft } from '@/lib/icons';
import type { Ejemplo, Plantilla } from '@/types';
import type { ProgresoFicha } from '@/lib/valorValidation';

defineProps<{
  plantilla: Plantilla;
  ejemplo: Ejemplo;
  /** Cantidad de campos obligatorios sin llenar o con formato inválido */
  erroresCount?: number;
  progreso?: ProgresoFicha;
  /** true = plan de entrenamiento vencido — se ocultan las acciones de edición (Guardar/Insertar) */
  soloLectura?: boolean;
  /** true = muestra el botón "Historial" (solo Nivel 2) */
  showHistorial?: boolean;
}>();

const emit = defineEmits<{ historial: []; save: []; download: []; insert: []; preview: [] }>();

const router = useRouter();
</script>

<template>
  <div class="shrink-0 border-b border-gray-100 bg-white px-6 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/')"
          type="button"
          title="Volver a Mis fichas"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon :icon="faArrowLeft" class="w-4 h-4" />
        </button>
        <span class="inline-flex items-center justify-center w-auto min-w-10 px-2 h-8 rounded-md border border-brand-200 text-brand-700 text-sm font-bold bg-brand-50">
          {{ plantilla.codigo }}
        </span>
        <div class="max-w-xs">
          <h1 class="text-lg font-bold text-heading truncate">{{ ejemplo.nombre }}</h1>
          <p class="text-xs text-muted truncate">{{ plantilla.nombre }}</p>
        </div>
        <div v-if="progreso && progreso.total > 0" class="w-28 shrink-0" :title="`${progreso.llenos} de ${progreso.total} campos llenados`">
          <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full bg-brand-500 rounded-full" :style="{ width: `${progreso.porcentaje}%` }" />
          </div>
          <p class="text-[10px] text-muted mt-0.5">{{ progreso.porcentaje }}% llenado</p>
        </div>
        <span v-if="(erroresCount ?? 0) > 0" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
          <FontAwesomeIcon :icon="faTriangleExclamation" class="w-3 h-3" />
          {{ erroresCount }} pendiente{{ (erroresCount ?? 0) > 1 ? 's' : '' }}
        </span>
        <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">
          <FontAwesomeIcon :icon="faCircleCheck" class="w-3 h-3" />
          Todo listo
        </span>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <button
          v-if="showHistorial"
          @click="emit('historial')"
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faClockRotateLeft" class="w-3.5 h-3.5" />
          Historial
        </button>
        <button
          @click="emit('download')"
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faDownload" class="w-3.5 h-3.5" />
          Descargar
        </button>
        <button
          v-if="!soloLectura"
          @click="emit('insert')"
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faFileExport" class="w-3.5 h-3.5" />
          Insertar
        </button>
        <button
          @click="emit('preview')"
          type="button"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon :icon="faEye" class="w-3.5 h-3.5" />
          Vista previa
        </button>
        <button
          v-if="!soloLectura"
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
