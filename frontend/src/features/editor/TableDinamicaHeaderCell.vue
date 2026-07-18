<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { columnTypeIcons, columnTypeLabels, columnTypePrimitivos, faGripVertical, faBolt, faGear, faTrash } from '@/lib/icons';
import { columnaFaltaCaptura } from '@/lib/campoValidation';
import type { ColumnaTabla, TipoColumna } from '@/types';

// Celda de encabezado de la columna marcada como dinámica (matriz_por_periodos) — mismo patrón que
// TableColumnHeaderCell pero con estilo ámbar y colspan fijo por cantidad de columnas dinámicas
// generadas, usada por MatrizPeriodosEditor.
const props = defineProps<{
  col: ColumnaTabla;
  rowSpan: number;
  colSpan: number;
}>();

const emit = defineEmits<{
  dragstart: [];
  drop: [];
  'update-nombre': [value: string];
  'update-tipo': [value: TipoColumna];
  configure: [];
  remove: [];
  'toggle-dinamica': [];
}>();
</script>

<template>
  <th
    :colspan="colSpan"
    :rowspan="rowSpan"
    @dragover.prevent
    @drop="emit('drop')"
    class="p-0 border border-amber-300 bg-amber-100 align-top"
  >
    <div class="flex items-center gap-1 px-2 py-1.5 border-b border-amber-300">
      <span draggable="true" @dragstart="emit('dragstart')" title="Arrastrar para reordenar" class="cursor-grab active:cursor-grabbing shrink-0">
        <FontAwesomeIcon :icon="faGripVertical" class="w-2.5 h-2.5 text-amber-400 hover:text-amber-600" />
      </span>
      <FontAwesomeIcon :icon="columnTypeIcons[col.tipo]" class="w-2.5 h-2.5 text-amber-500 shrink-0" />
      <input
        :value="col.nombre"
        @input="emit('update-nombre', ($event.target as HTMLInputElement).value)"
        type="text"
        class="flex-1 min-w-0 px-1.5 py-0.5 rounded border border-amber-200 bg-white text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
      />
      <button @click="emit('toggle-dinamica')" type="button" title="Quitar dinámica" class="w-4 h-4 rounded flex items-center justify-center text-amber-500 hover:text-amber-700 shrink-0">
        <FontAwesomeIcon :icon="faBolt" class="w-2.5 h-2.5" />
      </button>
      <select
        :value="col.tipo"
        @change="emit('update-tipo', ($event.target as HTMLSelectElement).value as TipoColumna)"
        class="w-28 shrink-0 text-[9px] text-amber-700 bg-white border border-amber-200 rounded pl-1.5 pr-4 py-0.5 focus:outline-none"
      >
        <option v-for="t in columnTypePrimitivos" :key="t" :value="t">{{ columnTypeLabels[t] }}</option>
      </select>
      <button
        @click="emit('configure')"
        type="button"
        :title="columnaFaltaCaptura(props.col) ? 'Falta posición en Excel — configúrala aquí' : 'Configurar columna'"
        class="w-4 h-4 rounded flex items-center justify-center shrink-0"
        :class="columnaFaltaCaptura(props.col) ? 'text-red-500 hover:text-red-700' : 'text-amber-500 hover:text-amber-700'"
      >
        <FontAwesomeIcon :icon="faGear" class="w-2.5 h-2.5" />
      </button>
      <button @click="emit('remove')" type="button" title="Eliminar columna" class="w-4 h-4 rounded flex items-center justify-center text-gray-400 hover:text-red-500 shrink-0">
        <FontAwesomeIcon :icon="faTrash" class="w-2.5 h-2.5" />
      </button>
    </div>
  </th>
</template>
