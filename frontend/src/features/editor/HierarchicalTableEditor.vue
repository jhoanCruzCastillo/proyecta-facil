<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faTrash } from '@/lib/icons';
import { createNodeChain, parseTree, getPeriodos, agrupadorProfundidad, type TreeNode } from '@/lib/tableRowHelpers';
import type { ConfigTabla, CabeceraGrupo, ColumnaTabla } from '@/types';

// El componente de mayor riesgo de fidelidad de toda la migración (ver plan): edición de un árbol
// jerárquico con selección de celda por clic, edición inline, navegación por flechas y expansión de
// filas por rowspan calculado dinámicamente — igual interacción documentada en el CLAUDE.md del
// prototipo. Clic = selecciona Y entra en edición. Enter confirma sin deseleccionar. Flechas
// navegan (↑↓ hermanos, ←→ padre/hijo) solo fuera de modo edición. Escape sale de edición o
// deselecciona.
const props = defineProps<{
  config: ConfigTabla;
  modelValue: string;
  /** true = permite agregar/renombrar columnas dinámicas (solo tab Estructura) */
  puedeEditarPeriodos?: boolean;
}>();

const emit = defineEmits<{ 'update:modelValue': [string]; 'update:config': [ConfigTabla] }>();

function cloneTree(roots: TreeNode[]): TreeNode[] {
  return JSON.parse(JSON.stringify(roots));
}
function getNode(roots: TreeNode[], path: number[]): TreeNode | null {
  let current: TreeNode | undefined = roots[path[0]];
  for (let i = 1; i < path.length && current; i++) current = current.children[path[i]];
  return current ?? null;
}
function samePath(a: number[] | null, b: number[]): boolean {
  return !!a && JSON.stringify(a) === JSON.stringify(b);
}

// --- Flat rows builder (calcula rowspan dinámico por selección) ---

type FlatCell =
  | { type: 'data'; value: string | string[]; path: number[]; rowSpan: number }
  | { type: 'group-title'; value: string | string[]; path: number[]; colSpan: number }
  | { type: 'add'; parentPath: number[] }
  | { type: 'empty' };

interface FlatRow { cells: (FlatCell | null)[]; isGroupStart?: boolean }

function getNodeSpan(node: TreeNode, colIdx: number, numCols: number, selectedPath: number[] | null, path: number[], agrupadorDepth: number): number {
  const isLeaf = node.children.length === 0 || colIdx >= numCols - 1;
  const esNivelAgrupador = !isLeaf && colIdx === agrupadorDepth;
  const childrenSpan = isLeaf ? 0 : node.children.reduce((s, c, ci) => s + getNodeSpan(c, colIdx + 1, numCols, selectedPath, [...path, ci], agrupadorDepth), 0);
  const baseSpan = isLeaf ? 1 : esNivelAgrupador ? 1 + childrenSpan : childrenSpan;
  const sel = samePath(selectedPath, path);
  return baseSpan + (sel && colIdx < numCols - 1 ? 1 : 0);
}

function buildFlatRows(roots: TreeNode[], numCols: number, selectedPath: number[] | null, agrupadorDepth: number): FlatRow[] {
  const rows: FlatRow[] = [];

  function walkNode(node: TreeNode, colIdx: number, path: number[]) {
    const isLeaf = node.children.length === 0 || colIdx >= numCols - 1;
    const sel = samePath(selectedPath, path);
    const addRowNeeded = sel && colIdx < numCols - 1;

    // Nivel de agrupador: en vez de fusionar su celda a la izquierda de la primera fila hija, esta
    // celda ocupa su propia fila de título de ancho completo (igual patrón que GroupedRowsEditor).
    if (!isLeaf && colIdx === agrupadorDepth) {
      const titleRow: FlatRow = { cells: Array(numCols).fill(null) };
      titleRow.cells[colIdx] = { type: 'group-title', value: node.value, path, colSpan: numCols - colIdx };
      rows.push(titleRow);
      node.children.forEach((child, ci) => walkNode(child, colIdx + 1, [...path, ci]));
      if (addRowNeeded) {
        const addRow: FlatRow = { cells: Array(numCols).fill(null) };
        addRow.cells[colIdx + 1] = { type: 'add', parentPath: path };
        for (let i = colIdx + 2; i < numCols; i++) addRow.cells[i] = { type: 'empty' };
        rows.push(addRow);
      }
      return;
    }

    const baseSpan = isLeaf ? 1 : node.children.reduce((s, c, ci) => s + getNodeSpan(c, colIdx + 1, numCols, selectedPath, [...path, ci], agrupadorDepth), 0);
    const totalSpan = baseSpan + (addRowNeeded ? 1 : 0);

    if (isLeaf) {
      const row: FlatRow = { cells: Array(numCols).fill(null) };
      row.cells[colIdx] = { type: 'data', value: node.value, path, rowSpan: totalSpan };
      for (let i = colIdx + 1; i < numCols; i++) row.cells[i] = { type: 'empty' };
      rows.push(row);
    } else {
      const startRow = rows.length;
      node.children.forEach((child, ci) => walkNode(child, colIdx + 1, [...path, ci]));
      if (rows[startRow]) rows[startRow].cells[colIdx] = { type: 'data', value: node.value, path, rowSpan: totalSpan };
      for (let r = startRow + 1; r < startRow + baseSpan; r++) { if (rows[r]) rows[r].cells[colIdx] = null; }
    }

    if (addRowNeeded) {
      const addRow: FlatRow = { cells: Array(numCols).fill(null) };
      addRow.cells[colIdx + 1] = { type: 'add', parentPath: path };
      for (let i = colIdx + 2; i < numCols; i++) addRow.cells[i] = { type: 'empty' };
      rows.push(addRow);
    }
  }

  roots.forEach((root, ri) => {
    const startIdx = rows.length;
    walkNode(root, 0, [ri]);
    if (rows[startIdx]) rows[startIdx].isGroupStart = ri > 0;
  });
  return rows;
}

// --- Estado ---

const columns = computed(() => props.config.columnas);
const numCols = computed(() => columns.value.length);
const dinamicaId = computed(() => props.config.columnaDinamicaId);
const periodos = computed(() => getPeriodos(props.config));
const agrupadorDepth = computed(() => (props.config.agrupador ? agrupadorProfundidad(columns.value) : -1));

const roots = ref<TreeNode[]>(parseTree(props.modelValue, columns.value, props.config));
watch(() => props.modelValue, (v) => { roots.value = parseTree(v, columns.value, props.config); });

const selectedPath = ref<number[] | null>(null);
const isEditing = ref(false);
const focusPath = ref<string | null>(null);
const tableRef = ref<HTMLDivElement | null>(null);
const inputRefs = new Map<string, HTMLInputElement | HTMLTextAreaElement>();

function setInputRef(pathStr: string, el: Element | { $el: Element } | null) {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) inputRefs.set(pathStr, el);
}

function persist(next: TreeNode[]) {
  roots.value = next;
  emit('update:modelValue', JSON.stringify(next));
}

function updateNodeValue(path: number[], val: string) {
  const next = cloneTree(roots.value);
  const node = getNode(next, path);
  if (node) node.value = val;
  persist(next);
}
function updateNodePeriodo(path: number[], periodoIdx: number, val: string) {
  const next = cloneTree(roots.value);
  const node = getNode(next, path);
  if (!node) return;
  const arr = Array.isArray(node.value) ? [...node.value] : [];
  arr[periodoIdx] = val;
  node.value = arr;
  persist(next);
}

function addRoot() {
  const newIdx = roots.value.length;
  persist([...roots.value, createNodeChain(columns.value, props.config)]);
  selectedPath.value = [newIdx];
  isEditing.value = true;
  focusPath.value = JSON.stringify([newIdx]);
}
function addChildAt(path: number[]) {
  const next = cloneTree(roots.value);
  const parent = getNode(next, path);
  if (!parent) return;
  const newChildIdx = parent.children.length;
  parent.children.push(createNodeChain(columns.value, props.config, path.length));
  persist(next);
  const newPath = [...path, newChildIdx];
  selectedPath.value = newPath;
  isEditing.value = true;
  focusPath.value = JSON.stringify(newPath);
}
function removeNode(path: number[]) {
  const next = cloneTree(roots.value);
  if (path.length === 1) {
    if (next.length <= 1) return;
    next.splice(path[0], 1);
  } else {
    const parent = getNode(next, path.slice(0, -1));
    if (parent) parent.children.splice(path[path.length - 1], 1);
  }
  persist(next);
  if (samePath(selectedPath.value, path)) { selectedPath.value = null; isEditing.value = false; }
}

interface NavCell { path: number[]; colIndex: number }
function navGrid(): NavCell[] {
  const cells: NavCell[] = [];
  function walk(node: TreeNode, colIdx: number, path: number[]) {
    cells.push({ path, colIndex: colIdx });
    node.children.forEach((child, ci) => walk(child, colIdx + 1, [...path, ci]));
  }
  roots.value.forEach((root, ri) => walk(root, 0, [ri]));
  return cells;
}

function navigate(direction: 'up' | 'down' | 'left' | 'right') {
  if (!selectedPath.value) return;
  const grid = navGrid();
  const currentIdx = grid.findIndex((c) => samePath(selectedPath.value, c.path));
  if (currentIdx === -1) return;
  const current = grid[currentIdx];
  let target: NavCell | undefined;

  if (direction === 'up' || direction === 'down') {
    const parentPath = selectedPath.value.slice(0, -1);
    const siblings = grid.filter((c) => c.colIndex === current.colIndex && JSON.stringify(c.path.slice(0, -1)) === JSON.stringify(parentPath));
    const sibIdx = siblings.findIndex((c) => samePath(selectedPath.value, c.path));
    if (direction === 'up' && sibIdx > 0) target = siblings[sibIdx - 1];
    if (direction === 'down' && sibIdx < siblings.length - 1) target = siblings[sibIdx + 1];
  } else if (direction === 'left') {
    if (selectedPath.value.length > 1) target = { path: selectedPath.value.slice(0, -1), colIndex: current.colIndex - 1 };
  } else if (direction === 'right') {
    const node = getNode(roots.value, selectedPath.value);
    if (node && node.children.length > 0) target = { path: [...selectedPath.value, 0], colIndex: current.colIndex + 1 };
  }

  if (target) { selectedPath.value = target.path; isEditing.value = false; }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!selectedPath.value) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    if (isEditing.value) {
      isEditing.value = false;
      const input = inputRefs.get(JSON.stringify(selectedPath.value));
      input?.blur();
      tableRef.value?.focus();
    } else {
      isEditing.value = true;
      focusPath.value = JSON.stringify(selectedPath.value);
    }
    return;
  }

  if (!isEditing.value) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const dir = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
      navigate(dir);
    }
    if (e.key === 'Escape') {
      selectedPath.value = null;
      isEditing.value = false;
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    isEditing.value = false;
    const input = inputRefs.get(JSON.stringify(selectedPath.value));
    input?.blur();
    tableRef.value?.focus();
  }
}

watch(focusPath, async (fp) => {
  if (!fp) return;
  await nextTick();
  const input = inputRefs.get(fp);
  if (input) { input.focus(); focusPath.value = null; }
});

function isPathSelected(path: number[]) { return samePath(selectedPath.value, path); }
function isPathAncestor(path: number[]) {
  if (!selectedPath.value || path.length >= selectedPath.value.length) return false;
  return path.every((v, i) => selectedPath.value![i] === v);
}

const flatRows = computed(() => buildFlatRows(roots.value, numCols.value, selectedPath.value, agrupadorDepth.value));

const grupos = computed(() => props.config.cabeceras ?? []);
const hasCabeceras = computed(() => grupos.value.length > 0);
function grupoForId(id: string): CabeceraGrupo | undefined { return grupos.value.find((g) => g.hijoIds.includes(id)); }

interface Run { grupo?: CabeceraGrupo; cols: ColumnaTabla[] }
const runs = computed(() => {
  const list: Run[] = [];
  for (const col of columns.value) {
    const g = grupoForId(col.id);
    const last = list[list.length - 1];
    if (last && g && last.grupo === g) last.cols.push(col);
    else list.push({ grupo: g, cols: [col] });
  }
  return list;
});

function selectCell(path: number[]) {
  selectedPath.value = path;
  isEditing.value = true;
  focusPath.value = JSON.stringify(path);
}

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
    <div ref="tableRef" tabindex="0" @keydown="handleKeyDown" class="overflow-x-auto rounded-lg border border-gray-300 outline-none">
      <table class="w-full text-xs" style="border-collapse: collapse">
        <thead>
          <tr v-if="hasCabeceras" class="bg-indigo-50">
            <template v-for="(run, ri) in runs" :key="ri">
              <th
                v-if="run.grupo"
                :colspan="run.cols.reduce((s, c) => s + (c.id === dinamicaId ? Math.max(periodos.length, 1) : 1), 0)"
                class="px-2 py-1.5 text-center font-semibold text-indigo-700 border-2 border-indigo-400 bg-indigo-100 whitespace-nowrap text-[11px]"
              >
                {{ run.grupo.titulo || 'Sin título' }}
              </th>
              <template v-for="col in (run.grupo ? [] : run.cols)" :key="col.id">
                <th
                  v-if="col.id === dinamicaId && periodos.length > 0"
                  :colspan="periodos.length"
                  class="px-3 py-2 text-left font-semibold text-heading border-b border-gray-200 whitespace-nowrap text-[11px] uppercase tracking-wider align-top"
                  :class="col.id === columns[numCols - 1].id ? '' : 'border-r border-gray-300'"
                >
                  {{ col.nombre }}
                </th>
                <th
                  v-else
                  rowspan="2"
                  class="px-3 py-2 text-left font-semibold text-heading border-b-2 border-gray-300 whitespace-nowrap text-[11px] uppercase tracking-wider align-top"
                  :class="col.id === columns[numCols - 1].id ? '' : 'border-r border-gray-300'"
                >
                  {{ col.nombre }}
                </th>
              </template>
            </template>
            <th rowspan="2" class="w-6 border-b-2 border-gray-300" />
          </tr>
          <tr class="bg-gray-100">
            <template v-if="hasCabeceras">
              <template v-for="run in runs" :key="run.grupo?.titulo ?? run.cols[0].id">
                <template v-for="col in (run.grupo ? run.cols : [])" :key="col.id">
                  <template v-if="col.id === dinamicaId && periodos.length > 0">
                    <th
                      v-for="(p, pi) in periodos"
                      :key="`${col.id}-${pi}`"
                      class="px-1.5 py-1.5 text-left font-medium text-heading border-b border-amber-300 bg-amber-50 whitespace-nowrap text-[11px]"
                    >
                      <div class="flex items-center gap-1">
                        <input
                          v-if="puedeEditarPeriodos"
                          :value="p"
                          @input="renamePeriodo(pi, ($event.target as HTMLInputElement).value)"
                          @click.stop
                          type="text"
                          placeholder="Nombre..."
                          class="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
                        />
                        <span v-else class="underline decoration-amber-400">{{ p }}</span>
                        <button
                          v-if="pi === periodos.length - 1 && puedeEditarPeriodos"
                          @click.stop="addPeriodo"
                          type="button"
                          title="Agregar columna dinámica"
                          class="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
                        >
                          <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" />
                        </button>
                      </div>
                    </th>
                  </template>
                  <th
                    v-else
                    class="px-3 py-2 text-left font-semibold text-heading border-b-2 border-gray-300 whitespace-nowrap text-[11px] uppercase tracking-wider align-top"
                    :class="col.id === columns[numCols - 1].id ? '' : 'border-r border-gray-300'"
                  >
                    {{ col.nombre }}
                  </th>
                </template>
              </template>
            </template>
            <template v-else>
              <template v-for="(col, ci) in columns" :key="col.id">
                <template v-if="col.id === dinamicaId && periodos.length > 0">
                  <th
                    v-for="(p, pi) in periodos"
                    :key="`${col.id}-${pi}`"
                    class="px-1.5 py-1.5 text-left font-medium text-heading border-b border-amber-300 bg-amber-50 whitespace-nowrap text-[11px]"
                    :class="ci === numCols - 1 && pi === periodos.length - 1 ? '' : 'border-r border-gray-300'"
                  >
                    <div class="flex items-center gap-1">
                      <input
                        v-if="puedeEditarPeriodos"
                        :value="p"
                        @input="renamePeriodo(pi, ($event.target as HTMLInputElement).value)"
                        @click.stop
                        type="text"
                        placeholder="Nombre..."
                        class="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
                      />
                      <span v-else class="underline decoration-amber-400">{{ p }}</span>
                      <button
                        v-if="pi === periodos.length - 1 && puedeEditarPeriodos"
                        @click.stop="addPeriodo"
                        type="button"
                        title="Agregar columna dinámica"
                        class="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
                      >
                        <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" />
                      </button>
                    </div>
                  </th>
                </template>
                <th
                  v-else
                  class="px-3 py-2 text-left font-semibold text-heading border-b-2 border-gray-300 whitespace-nowrap text-[11px] uppercase tracking-wider align-top"
                  :class="ci === numCols - 1 ? '' : 'border-r border-gray-300'"
                >
                  {{ col.nombre }}
                </th>
              </template>
            </template>
            <th v-if="!hasCabeceras" class="w-6 border-b-2 border-gray-300" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in flatRows" :key="ri" :class="row.isGroupStart ? 'border-t-2 border-gray-400' : 'border-t border-gray-200'">
            <template v-for="(cell, ci) in row.cells" :key="ci">
              <td v-if="cell === null" style="display: none" />

              <template v-else-if="columns[ci]?.id === dinamicaId && periodos.length > 0">
                <template v-if="cell.type === 'data'">
                  <td
                    v-for="(p, pi) in periodos"
                    :key="`${ci}-${pi}`"
                    :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
                    class="px-1 py-1 align-top group/cell"
                    :class="[
                      pi === periodos.length - 1 ? '' : 'border-r border-gray-200',
                      isPathSelected(cell.path) ? 'bg-brand-100' : isPathAncestor(cell.path) ? 'bg-brand-50/50' : 'bg-amber-50/20',
                    ]"
                  >
                    <div class="flex items-center gap-0.5">
                      <input
                        :value="(Array.isArray(cell.value) ? cell.value[pi] : '') || ''"
                        :title="p"
                        :placeholder="p || '—'"
                        type="text"
                        @input="updateNodePeriodo(cell.path, pi, ($event.target as HTMLInputElement).value)"
                        @click.stop="selectCell(cell.path)"
                        class="flex-1 min-w-0 px-1 py-1 rounded border border-transparent hover:border-amber-200 focus:border-amber-400 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-amber-500/30 bg-transparent"
                      />
                      <button
                        v-if="pi === periodos.length - 1"
                        @click.stop="removeNode(cell.path)"
                        type="button"
                        title="Eliminar fila"
                        class="w-4 h-4 rounded flex items-center justify-center text-gray-300 opacity-0 group-hover/cell:opacity-100 hover:text-red-500 transition-opacity shrink-0"
                      >
                        <FontAwesomeIcon :icon="faTrash" class="w-2 h-2" />
                      </button>
                    </div>
                  </td>
                </template>
                <td v-else :colspan="periodos.length" class="px-1.5 py-1" :class="cell.type === 'empty' ? 'bg-gray-50/50' : ''">
                  <button
                    v-if="cell.type === 'add'"
                    @click.stop="addChildAt(cell.parentPath)"
                    type="button"
                    class="w-full py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <FontAwesomeIcon :icon="faPlus" class="w-2.5 h-2.5" /> {{ columns[ci]?.nombre }}
                  </button>
                </td>
              </template>

              <td
                v-else-if="cell.type === 'group-title'"
                :colspan="cell.colSpan"
                class="px-2 py-1.5 bg-brand-50/60 border-t-2 border-brand-200"
                @click.stop="selectCell(cell.path)"
              >
                <div class="flex items-center gap-2 group/cell">
                  <textarea
                    :ref="(el) => setInputRef(JSON.stringify(cell.path), el as Element)"
                    :value="typeof cell.value === 'string' ? cell.value : ''"
                    rows="1"
                    :readonly="!(isPathSelected(cell.path) && isEditing)"
                    tabindex="-1"
                    placeholder="Nombre del grupo..."
                    @input="updateNodeValue(cell.path, ($event.target as HTMLTextAreaElement).value)"
                    @click.stop="() => { if (!(isPathSelected(cell.path) && isEditing)) selectCell(cell.path); }"
                    class="flex-1 min-w-0 px-1.5 py-1 rounded border text-xs font-semibold uppercase tracking-wide text-heading focus:outline-none resize-none overflow-y-auto max-h-[15lh] [field-sizing:content] bg-transparent"
                    :class="isPathSelected(cell.path) && isEditing ? 'border-brand-400 bg-white ring-1 ring-brand-500/30' : 'border-transparent cursor-pointer'"
                  />
                  <button
                    @click.stop="removeNode(cell.path)"
                    type="button"
                    class="w-4 h-4 rounded flex items-center justify-center text-gray-400 opacity-0 group-hover/cell:opacity-100 hover:text-red-500 transition-opacity shrink-0"
                  >
                    <FontAwesomeIcon :icon="faTrash" class="w-2.5 h-2.5" />
                  </button>
                </div>
              </td>
              <td v-else-if="cell.type === 'add'" class="px-1.5 py-1" :class="ci < numCols - 1 ? 'border-r border-gray-300' : ''">
                <button
                  @click.stop="addChildAt(cell.parentPath)"
                  type="button"
                  class="w-full py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <FontAwesomeIcon :icon="faPlus" class="w-2.5 h-2.5" /> {{ columns[ci]?.nombre }}
                </button>
              </td>
              <td v-else-if="cell.type === 'empty'" class="px-1.5 py-1 bg-gray-50/50" :class="ci < numCols - 1 ? 'border-r border-gray-300' : ''" />
              <td
                v-else
                :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
                class="px-1.5 py-1 align-top cursor-pointer transition-colors duration-75"
                :class="[
                  ci < numCols - 1 ? 'border-r border-gray-300' : '',
                  isPathSelected(cell.path)
                    ? 'bg-brand-100 ring-2 ring-inset ring-brand-500'
                    : isPathAncestor(cell.path)
                      ? 'bg-brand-50/50'
                      : ci === 0
                        ? 'bg-amber-50/40 hover:bg-amber-50'
                        : 'hover:bg-gray-50',
                ]"
                @click.stop="selectCell(cell.path)"
              >
                <div class="flex items-start gap-0.5 group/cell">
                  <!-- textarea con field-sizing: crece con el contenido hasta 15 líneas y luego
                       scrollea. Enter sigue confirmando la edición (handleKeyDown lo intercepta
                       con preventDefault antes de que inserte un salto de línea). -->
                  <textarea
                    :ref="(el) => setInputRef(JSON.stringify(cell.path), el as Element)"
                    :value="typeof cell.value === 'string' ? cell.value : ''"
                    rows="1"
                    :readonly="!(isPathSelected(cell.path) && isEditing)"
                    tabindex="-1"
                    :placeholder="`${columns[ci]?.nombre}...`"
                    @input="updateNodeValue(cell.path, ($event.target as HTMLTextAreaElement).value)"
                    @click.stop="() => { if (!(isPathSelected(cell.path) && isEditing)) selectCell(cell.path); }"
                    class="flex-1 px-1.5 py-1 rounded border text-xs text-heading focus:outline-none min-w-0 resize-none overflow-y-auto max-h-[15lh] [field-sizing:content]"
                    :class="isPathSelected(cell.path) && isEditing ? 'border-brand-400 bg-white ring-1 ring-brand-500/30' : 'border-transparent bg-transparent cursor-pointer'"
                  />
                  <button
                    @click.stop="removeNode(cell.path)"
                    type="button"
                    class="w-4 h-4 rounded flex items-center justify-center text-gray-300 opacity-0 group-hover/cell:opacity-100 hover:text-red-500 transition-opacity shrink-0 mt-1"
                  >
                    <FontAwesomeIcon :icon="faTrash" class="w-2 h-2" />
                  </button>
                </div>
              </td>
            </template>
            <td class="w-6" />
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex items-center gap-2 mt-1.5">
      <button
        @click.stop="addRoot"
        type="button"
        class="py-1.5 px-4 rounded-lg border border-dashed border-gray-300 text-[10px] font-medium text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-1"
      >
        <FontAwesomeIcon :icon="faPlus" class="w-2.5 h-2.5" /> Item
      </button>
      <span class="text-[9px] text-muted">Enter: editar · Flechas: navegar · Esc: salir</span>
    </div>
  </div>
</template>
