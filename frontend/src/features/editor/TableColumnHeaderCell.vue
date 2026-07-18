<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { columnTypeIcons, columnTypeLabels, columnTypePrimitivos, faGripVertical, faGear, faTrash } from '@/lib/icons';
import { columnaFaltaCaptura } from '@/lib/campoValidation';
import type { ColumnaTabla, TipoColumna } from '@/types';

// Celda de encabezado de columna compartida por FilasDinamicasColumnsEditor, JerarquicaColumnsEditor
// y MatrizPeriodosEditor (celdas no-dinámicas) — arrastrar para reordenar, nombre editable inline,
// selector de tipo, engranaje de posición en Excel/agrupación, eliminar. El slot "extra" permite a
// cada editor insertar sus propios botones (nivel padre/hijo, marcar como dinámica) entre el nombre
// y el engranaje, en el mismo lugar que ocupaban en el original.
defineProps<{
  col: ColumnaTabla;
  rowSpan: number;
}>();

const emit = defineEmits<{
  dragstart: [];
  drop: [];
  'update-nombre': [value: string];
  'update-tipo': [value: TipoColumna];
  configure: [];
  remove: [];
}>();
</script>

<template>
  <th
    :rowspan="rowSpan"
    @dragover.prevent
    @drop="emit('drop')"
    class="align-top px-2 py-1.5 text-left font-medium text-heading border border-gray-200 bg-white whitespace-nowrap"
  >
    <div class="flex items-center gap-1">
      <span draggable="true" @dragstart="emit('dragstart')" title="Arrastrar para reordenar" class="cursor-grab active:cursor-grabbing shrink-0">
        <FontAwesomeIcon :icon="faGripVertical" class="w-2.5 h-2.5 text-gray-300 hover:text-gray-500" />
      </span>
      <FontAwesomeIcon :icon="columnTypeIcons[col.tipo]" class="w-2.5 h-2.5 text-gray-400 shrink-0" />
      <input
        :value="col.nombre"
        @input="emit('update-nombre', ($event.target as HTMLInputElement).value)"
        type="text"
        class="w-20 shrink-0 px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-400"
      />
      <slot name="extra" />
      <button
        @click="emit('configure')"
        type="button"
        :title="columnaFaltaCaptura(col) ? 'Falta posición en Excel — configúrala aquí' : 'Configurar columna'"
        class="w-4 h-4 rounded flex items-center justify-center shrink-0"
        :class="columnaFaltaCaptura(col) ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-brand-500'"
      >
        <FontAwesomeIcon :icon="faGear" class="w-2.5 h-2.5" />
      </button>
      <button @click="emit('remove')" type="button" title="Eliminar columna" class="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-red-500 shrink-0">
        <FontAwesomeIcon :icon="faTrash" class="w-2.5 h-2.5" />
      </button>
    </div>
    <select
      :value="col.tipo"
      @change="emit('update-tipo', ($event.target as HTMLSelectElement).value as TipoColumna)"
      class="mt-1 text-[9px] text-muted bg-transparent focus:outline-none"
    >
      <option v-for="t in columnTypePrimitivos" :key="t" :value="t">{{ columnTypeLabels[t] }}</option>
    </select>
  </th>
</template>
