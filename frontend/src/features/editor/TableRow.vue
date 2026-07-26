<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@/lib/icons';
import type { ColumnaTabla } from '@/types';
import type { FilaDinamica } from '@/lib/tableRowHelpers';

// Fila compartida entre DynamicEditor (sin agrupador) y GroupedRowsEditor (con agrupador).
// La columna dinámica se expande en una celda por período, alineada con TableHeaderRow.
const props = defineProps<{
  cols: ColumnaTabla[];
  row: FilaDinamica;
  rowIndex: number;
  periodos: string[];
  columnaDinamicaId?: string;
}>();

const emit = defineEmits<{
  'cell-change': [colId: string, value: string];
  'periodo-change': [colId: string, periodoIdx: number, value: string];
  delete: [];
}>();

function periodoValues(colId: string): string[] {
  return Array.isArray(props.row[colId]) ? (props.row[colId] as string[]) : [];
}
</script>

<template>
  <tr class="border-b border-brand-50 last:border-0 group">
    <template v-for="col in cols" :key="col.id">
      <td v-if="col.tipo === 'auto_numerico'" class="px-1 py-0.5">
        <span class="text-muted px-1">{{ rowIndex + 1 }}</span>
      </td>
      <template v-else-if="col.id === columnaDinamicaId && periodos.length > 0">
        <td v-for="(p, pi) in periodos" :key="`${col.id}-${pi}`" class="px-1 py-0.5 bg-amber-50/30">
          <input
            :value="periodoValues(col.id)[pi] || ''"
            @input="emit('periodo-change', col.id, pi, ($event.target as HTMLInputElement).value)"
            @click.stop
            type="text"
            :title="p"
            placeholder="—"
            class="w-16 px-1 py-1 rounded border border-transparent hover:border-amber-200 focus:border-amber-400 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-amber-500/30 bg-transparent"
          />
        </td>
      </template>
      <td v-else-if="col.opciones && col.opciones.length > 0" class="px-1 py-0.5 align-top">
        <select
          :value="(row[col.id] as string) || ''"
          @change="emit('cell-change', col.id, ($event.target as HTMLSelectElement).value)"
          @click.stop
          class="block w-full px-1.5 py-1 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-brand-500/30 bg-transparent"
        >
          <option value="">—</option>
          <option v-for="opt in col.opciones" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </td>
      <td v-else class="px-1 py-0.5 align-top">
        <!-- textarea con field-sizing: crece con el contenido hasta 15 líneas y luego scrollea -->
        <textarea
          :value="(row[col.id] as string) || ''"
          @input="emit('cell-change', col.id, ($event.target as HTMLTextAreaElement).value)"
          @click.stop
          rows="1"
          placeholder="—"
          class="block w-full px-1.5 py-1 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-brand-500/30 bg-transparent resize-none overflow-y-auto max-h-[15lh] [field-sizing:content]"
        />
      </td>
    </template>
    <td class="px-1 py-0.5">
      <button @click.stop="emit('delete')" type="button" class="w-5 h-5 rounded flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
        <FontAwesomeIcon :icon="faTrash" class="w-2.5 h-2.5" />
      </button>
    </td>
  </tr>
</template>
