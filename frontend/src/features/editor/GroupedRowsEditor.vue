<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faTrash } from '@/lib/icons';
import TableHeaderRow from './TableHeaderRow.vue';
import TableRow from './TableRow.vue';
import { parseGroupedRows, newEmptyRow, getPeriodos, type GrupoFilas } from '@/lib/tableRowHelpers';
import type { ConfigTabla, ColumnaTabla } from '@/types';

// Filas planas agrupadas bajo un encabezado de grupo (config.agrupador === true). Una sola tabla:
// el encabezado de columnas una vez arriba, y cada grupo como una fila de título fusionada (abarca
// config.agrupadorAbarcaColumnas columnas, contando desde la primera) seguida de sus filas de datos.
const props = defineProps<{
  config: ConfigTabla;
  modelValue: string;
  /** true = permite agregar/renombrar columnas dinámicas (solo tab Estructura) */
  puedeEditarPeriodos?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [string]; 'update:config': [ConfigTabla] }>();

const grupos = ref<GrupoFilas[]>(parseGroupedRows(props.modelValue, props.config));
watch(() => props.modelValue, (v) => { grupos.value = parseGroupedRows(v, props.config); });

function persist(next: GrupoFilas[]) {
  grupos.value = next;
  emit('update:modelValue', JSON.stringify(next));
}

function updateGrupoNombre(gi: number, nombre: string) {
  persist(grupos.value.map((g, i) => (i === gi ? { ...g, grupo: nombre } : g)));
}
function updateValorGrupo(gi: number, colId: string, val: string) {
  persist(grupos.value.map((g, i) => (i !== gi ? g : { ...g, valoresGrupo: { ...(g.valoresGrupo ?? {}), [colId]: val } })));
}
function updateValorGrupoPeriodo(gi: number, colId: string, pi: number, val: string) {
  persist(grupos.value.map((g, i) => {
    if (i !== gi) return g;
    const actual = g.valoresGrupo?.[colId];
    const arr = Array.isArray(actual) ? [...actual] : [];
    arr[pi] = val;
    return { ...g, valoresGrupo: { ...(g.valoresGrupo ?? {}), [colId]: arr } };
  }));
}
function updateCell(gi: number, ri: number, colId: string, val: string) {
  persist(grupos.value.map((g, i) => (i !== gi ? g : { ...g, filas: g.filas.map((r, j) => (j === ri ? { ...r, [colId]: val } : r)) })));
}
function updatePeriodo(gi: number, ri: number, colId: string, pi: number, val: string) {
  persist(grupos.value.map((g, i) => {
    if (i !== gi) return g;
    return {
      ...g,
      filas: g.filas.map((r, j) => {
        if (j !== ri) return r;
        const arr = Array.isArray(r[colId]) ? [...(r[colId] as string[])] : [];
        arr[pi] = val;
        return { ...r, [colId]: arr };
      }),
    };
  }));
}
function addRow(gi: number) { persist(grupos.value.map((g, i) => (i === gi ? { ...g, filas: [...g.filas, newEmptyRow(props.config)] } : g))); }
function removeRow(gi: number, ri: number) {
  persist(grupos.value.map((g, i) => (i !== gi ? g : { ...g, filas: g.filas.length > 1 ? g.filas.filter((_, j) => j !== ri) : g.filas })));
}
function addGrupo() { persist([...grupos.value, { grupo: `Grupo ${grupos.value.length + 1}`, filas: [newEmptyRow(props.config)] }]); }
function removeGrupo(gi: number) { if (grupos.value.length > 1) persist(grupos.value.filter((_, i) => i !== gi)); }

function addPeriodo() {
  emit('update:config', { ...props.config, periodos: [...(props.config.periodos ?? []), ''] });
}
function renamePeriodo(pi: number, value: string) {
  const periodos = [...(props.config.periodos ?? [])];
  periodos[pi] = value;
  emit('update:config', { ...props.config, periodos });
}

const periodos = computed(() => getPeriodos(props.config));
// Total de columnas realmente renderizadas en el encabezado (la dinámica se expande por período),
// para calcular cuántas quedan sueltas a la derecha de la fila de grupo.
const totalCols = computed(() => props.config.columnas.reduce((sum, c) => sum + (c.id === props.config.columnaDinamicaId && periodos.value.length > 0 ? periodos.value.length : 1), 0));
const abarca = computed(() => Math.min(props.config.agrupadorAbarcaColumnas ?? totalCols.value, totalCols.value));

// Columnas reales (sin expandir por período) que quedan a la derecha de `abarca` — ahí se rendiza
// la fila de título del grupo como si fuera una fila de datos más, para grupos "resumen" que no
// tienen filas hijas propias (ej. "Nivel de cobertura...": título fusionado + un valor por año).
function columnasResto(cols: ColumnaTabla[], abarcaN: number, dinamicaId: string | undefined, numPeriodos: number): ColumnaTabla[] {
  let acc = 0;
  let i = 0;
  for (; i < cols.length; i++) {
    if (acc >= abarcaN) break;
    acc += cols[i].id === dinamicaId && numPeriodos > 0 ? numPeriodos : 1;
  }
  return cols.slice(i);
}
const restColumnas = computed(() => columnasResto(props.config.columnas, abarca.value, props.config.columnaDinamicaId, periodos.value.length));
</script>

<template>
  <div class="mt-2">
    <div class="overflow-x-auto rounded-lg border border-brand-200">
      <table class="w-full text-xs">
        <thead>
          <TableHeaderRow
            :cols="config.columnas"
            :periodos="periodos"
            :columna-dinamica-id="config.columnaDinamicaId"
            :cabeceras="config.cabeceras"
            :editable-periodos="puedeEditarPeriodos"
            :show-add-periodo="puedeEditarPeriodos"
            @rename-periodo="renamePeriodo"
            @add-periodo="addPeriodo"
          />
        </thead>
        <tbody>
          <template v-for="(grupo, gi) in grupos" :key="gi">
            <tr class="bg-brand-50/60 border-t-2 border-brand-200">
              <td :colspan="abarca" class="px-2 py-1.5">
                <div class="flex items-center gap-2">
                  <input
                    :value="grupo.grupo"
                    @input="updateGrupoNombre(gi, ($event.target as HTMLInputElement).value)"
                    @click.stop
                    type="text"
                    placeholder="Nombre del grupo…"
                    class="flex-1 min-w-0 px-1.5 py-0.5 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs font-semibold uppercase tracking-wide text-heading focus:outline-none bg-transparent"
                  />
                  <button v-if="grupos.length > 1" @click.stop="removeGrupo(gi)" type="button" class="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors shrink-0">
                    <FontAwesomeIcon :icon="faTrash" class="w-2.5 h-2.5" />
                  </button>
                </div>
              </td>
              <template v-for="col in restColumnas" :key="col.id">
                <template v-if="col.id === config.columnaDinamicaId && periodos.length > 0">
                  <td v-for="(p, pi) in periodos" :key="`${col.id}-${pi}`" class="px-1 py-0.5 bg-brand-50/60">
                    <input
                      :value="(Array.isArray(grupo.valoresGrupo?.[col.id]) ? (grupo.valoresGrupo?.[col.id] as string[])[pi] : '') || ''"
                      @input="updateValorGrupoPeriodo(gi, col.id, pi, ($event.target as HTMLInputElement).value)"
                      @click.stop
                      type="text"
                      :title="p"
                      placeholder="—"
                      class="w-16 px-1 py-1 rounded border border-transparent hover:border-amber-200 focus:border-amber-400 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-amber-500/30 bg-transparent"
                    />
                  </td>
                </template>
                <td v-else class="px-1 py-0.5 bg-brand-50/60 align-top">
                  <textarea
                    :value="(grupo.valoresGrupo?.[col.id] as string) || ''"
                    @input="updateValorGrupo(gi, col.id, ($event.target as HTMLTextAreaElement).value)"
                    @click.stop
                    rows="1"
                    placeholder="—"
                    class="block w-full px-1.5 py-1 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-brand-500/30 bg-transparent resize-none overflow-y-auto max-h-[15lh] [field-sizing:content]"
                  />
                </td>
              </template>
              <td class="bg-brand-50/60" />
            </tr>
            <TableRow
              v-for="(row, ri) in grupo.filas"
              :key="ri"
              :cols="config.columnas"
              :row="row"
              :row-index="ri"
              :periodos="periodos"
              :columna-dinamica-id="config.columnaDinamicaId"
              @cell-change="(colId, val) => updateCell(gi, ri, colId, val)"
              @periodo-change="(colId, pi, val) => updatePeriodo(gi, ri, colId, pi, val)"
              @delete="removeRow(gi, ri)"
            />
            <tr>
              <td :colspan="totalCols + 1" class="px-1 py-1">
                <button @click.stop="addRow(gi)" type="button" class="w-full py-1 text-[10px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
                  <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" /> Agregar fila
                </button>
              </td>
            </tr>
          </template>
          <tr>
            <td :colspan="totalCols + 1" class="px-1 py-1.5 border-t border-brand-100">
              <button @click.stop="addGrupo" type="button" class="w-full py-1.5 rounded-lg border border-dashed border-brand-200 text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
                <FontAwesomeIcon :icon="faPlus" class="w-2.5 h-2.5" /> Agregar grupo
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
