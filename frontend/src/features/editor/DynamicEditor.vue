<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus } from '@/lib/icons';
import TableHeaderRow from './TableHeaderRow.vue';
import TableRow from './TableRow.vue';
import { parseDynamicRows, newEmptyRow, getPeriodos, type FilaDinamica } from '@/lib/tableRowHelpers';
import type { ConfigTabla } from '@/types';

const props = defineProps<{
  config: ConfigTabla;
  modelValue: string;
  /** true = permite agregar/renombrar columnas dinámicas (solo tab Estructura) */
  puedeEditarPeriodos?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [string]; 'update:config': [ConfigTabla] }>();

const rows = ref<FilaDinamica[]>(parseDynamicRows(props.modelValue, props.config));
watch(() => props.modelValue, (v) => { rows.value = parseDynamicRows(v, props.config); });

function persist(next: FilaDinamica[]) {
  rows.value = next;
  emit('update:modelValue', JSON.stringify(next));
}

function updateCell(ri: number, colId: string, val: string) {
  persist(rows.value.map((r, i) => (i === ri ? { ...r, [colId]: val } : r)));
}
function updatePeriodo(ri: number, colId: string, pi: number, val: string) {
  persist(rows.value.map((r, i) => {
    if (i !== ri) return r;
    const arr = Array.isArray(r[colId]) ? [...(r[colId] as string[])] : [];
    arr[pi] = val;
    return { ...r, [colId]: arr };
  }));
}
function addRow() { persist([...rows.value, newEmptyRow(props.config)]); }
function removeRow(ri: number) { if (rows.value.length > 1) persist(rows.value.filter((_, i) => i !== ri)); }

function addPeriodo() {
  emit('update:config', { ...props.config, periodos: [...(props.config.periodos ?? []), ''] });
}
function renamePeriodo(pi: number, value: string) {
  const periodos = [...(props.config.periodos ?? [])];
  periodos[pi] = value;
  emit('update:config', { ...props.config, periodos });
}
</script>

<template>
  <div class="mt-2">
    <div class="overflow-x-auto rounded-lg border border-brand-200">
      <table class="w-full text-xs">
        <thead>
          <TableHeaderRow
            :cols="config.columnas"
            :periodos="getPeriodos(config)"
            :columna-dinamica-id="config.columnaDinamicaId"
            :cabeceras="config.cabeceras"
            :editable-periodos="puedeEditarPeriodos"
            :show-add-periodo="puedeEditarPeriodos"
            @rename-periodo="renamePeriodo"
            @add-periodo="addPeriodo"
          />
        </thead>
        <tbody>
          <TableRow
            v-for="(row, ri) in rows"
            :key="ri"
            :cols="config.columnas"
            :row="row"
            :row-index="ri"
            :periodos="getPeriodos(config)"
            :columna-dinamica-id="config.columnaDinamicaId"
            @cell-change="(colId, val) => updateCell(ri, colId, val)"
            @periodo-change="(colId, pi, val) => updatePeriodo(ri, colId, pi, val)"
            @delete="removeRow(ri)"
          />
        </tbody>
      </table>
    </div>
    <button
      @click.stop="addRow"
      type="button"
      class="mt-1.5 w-full py-1.5 rounded-lg border border-dashed border-brand-200 text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1"
    >
      <FontAwesomeIcon :icon="faPlus" class="w-2.5 h-2.5" /> Agregar fila
    </button>
  </div>
</template>
