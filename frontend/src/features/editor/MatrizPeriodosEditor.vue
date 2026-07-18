<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faXmark, faGear, faTrash, faBolt } from '@/lib/icons';
import { generateId } from '@/api/mock/_shared';
import TableColumnHeaderCell from './TableColumnHeaderCell.vue';
import TableDinamicaHeaderCell from './TableDinamicaHeaderCell.vue';
import TableAddColumnButton from './TableAddColumnButton.vue';
import ColumnaCapturaModal from './ColumnaCapturaModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import type { ColumnaTabla, CabeceraGrupo } from '@/types';

// Editor de columnas para subtipo "matriz_por_periodos" (columnas dinámicas). Interacción reducida
// a propósito: eliminar + marcar dinámica por columna, nombres editables inline (sin modal), y la
// columna marcada como dinámica se expande en un encabezado de 2 filas (padre + una columna
// dinámica generada por celda), igual que una celda combinada en Excel. No se llaman "períodos":
// pueden representar años, tareas, alternativas, etc. Las columnas (incluida la dinámica como
// unidad) se reordenan arrastrando el ícono de mano del encabezado padre. Opcionalmente, columnas
// existentes (o la dinámica completa) pueden agruparse bajo un título común (cabecera).
const DINAMICA_SENTINEL = 'columnas_dinamicas';

interface Unit { key: string; col: ColumnaTabla; index: number; isDinamica: boolean; span: number }

const config = defineModel<import('@/types').ConfigTabla>('config', { required: true });

const cols = computed(() => config.value.columnas);
const columnasDinamicas = computed(() => config.value.periodos ?? []);
const dinamicaId = computed(() => config.value.columnaDinamicaId);
const cabeceras = computed(() => config.value.cabeceras ?? []);
const hasCabeceras = computed(() => cabeceras.value.length > 0);
const totalRows = computed(() => (hasCabeceras.value ? 1 : 0) + 1 + (dinamicaId.value ? 1 : 0));

const dragIndex = ref<number | null>(null);
const configuringColId = ref<string | null>(null);
const soloGrupoMode = ref(false);
const groupToDelete = ref<CabeceraGrupo | null>(null);
const configuringCol = computed(() => cols.value.find((c) => c.id === configuringColId.value) ?? null);

function updateColumn(colId: string, updates: Partial<ColumnaTabla>) {
  config.value = { ...config.value, columnas: cols.value.map((c) => (c.id === colId ? { ...c, ...updates } : c)) };
}

function keyOfCol(col: ColumnaTabla) { return col.id === dinamicaId.value ? DINAMICA_SENTINEL : col.id; }

function removeColumn(colId: string) {
  const key = colId === dinamicaId.value ? DINAMICA_SENTINEL : colId;
  const nextCabeceras = cabeceras.value.map((g) => ({ ...g, hijoIds: g.hijoIds.filter((h) => h !== key) })).filter((g) => g.hijoIds.length > 1);
  config.value = {
    ...config.value,
    columnas: cols.value.filter((c) => c.id !== colId),
    columnaDinamicaId: colId === dinamicaId.value ? undefined : dinamicaId.value,
    cabeceras: nextCabeceras.length ? nextCabeceras : undefined,
  };
}

function toggleDinamica(colId: string) {
  const yaEsDinamica = dinamicaId.value === colId;
  config.value = {
    ...config.value,
    columnaDinamicaId: yaEsDinamica ? undefined : colId,
    periodos: yaEsDinamica ? config.value.periodos : (config.value.periodos?.length ? config.value.periodos : ['', '']),
  };
}

function renameColumnaDinamica(i: number, value: string) {
  const next = [...columnasDinamicas.value];
  next[i] = value;
  config.value = { ...config.value, periodos: next };
}
function insertColumnaDinamicaAfter(i: number) {
  const next = [...columnasDinamicas.value];
  next.splice(i + 1, 0, '');
  config.value = { ...config.value, periodos: next };
}
function removeColumnaDinamica(i: number) {
  if (columnasDinamicas.value.length <= 1) return;
  config.value = { ...config.value, periodos: columnasDinamicas.value.filter((_, idx) => idx !== i) };
}

function addColumn(name: string) {
  if (!name.trim()) return;
  const newCol: ColumnaTabla = { id: generateId(), nombre: name.trim(), tipo: 'texto_corto', requerido: false };
  config.value = { ...config.value, columnas: [...cols.value, newCol] };
}

function dropColumnAt(targetIndex: number) {
  if (dragIndex.value === null || dragIndex.value === targetIndex) { dragIndex.value = null; return; }
  const next = [...cols.value];
  const [moved] = next.splice(dragIndex.value, 1);
  next.splice(targetIndex, 0, moved);
  config.value = { ...config.value, columnas: next };
  dragIndex.value = null;
}

function grupoForKey(key: string): CabeceraGrupo | null {
  return cabeceras.value.find((g) => g.hijoIds.includes(key)) ?? null;
}

function reorderForGrupo(hijoIds: string[]): ColumnaTabla[] {
  const isMember = (col: ColumnaTabla) => hijoIds.includes(keyOfCol(col));
  const members = cols.value.filter(isMember);
  if (members.length < 2) return cols.value;
  const firstMemberIndex = cols.value.findIndex(isMember);
  const insertAt = cols.value.slice(0, firstMemberIndex).filter((c) => !isMember(c)).length;
  const rest = cols.value.filter((c) => !isMember(c));
  const next = [...rest];
  next.splice(insertAt, 0, ...members);
  return next;
}

function setGrupoFor(key: string, grupo: { titulo: string; hijoIds: string[] } | null) {
  const others = cabeceras.value.filter((g) => !g.hijoIds.includes(key));
  const next = grupo ? [...others, grupo] : others;
  const nextColumnas = grupo ? reorderForGrupo(grupo.hijoIds) : cols.value;
  config.value = { ...config.value, columnas: nextColumnas, cabeceras: next.length ? next : undefined };
}

function colForKey(key: string): ColumnaTabla | undefined {
  return key === DINAMICA_SENTINEL ? cols.value.find((c) => c.id === dinamicaId.value) : cols.value.find((c) => c.id === key);
}

function openGrupoEditor(grupo: CabeceraGrupo) {
  const col = colForKey(grupo.hijoIds[0]);
  if (!col) return;
  configuringColId.value = col.id;
  soloGrupoMode.value = true;
}
function closeConfigurador() {
  configuringColId.value = null;
  soloGrupoMode.value = false;
}
function deleteGrupo(grupo: CabeceraGrupo) {
  const next = cabeceras.value.filter((g) => g !== grupo);
  config.value = { ...config.value, cabeceras: next.length ? next : undefined };
  groupToDelete.value = null;
}

const units = computed<Unit[]>(() => cols.value.map((col, index) => {
  const isDinamica = col.id === dinamicaId.value;
  return { key: isDinamica ? DINAMICA_SENTINEL : col.id, col, index, isDinamica, span: isDinamica ? Math.max(columnasDinamicas.value.length, 1) : 1 };
}));

interface Run { grupo: CabeceraGrupo | null; units: Unit[] }
const runs = computed(() => {
  const list: Run[] = [];
  for (const u of units.value) {
    const g = grupoForKey(u.key);
    const last = list[list.length - 1];
    if (last && g && last.grupo === g) last.units.push(u);
    else list.push({ grupo: g, units: [u] });
  }
  return list;
});

function rowNombresSpan(u: Unit) { return u.isDinamica ? 1 : (dinamicaId.value ? 2 : 1); }

const configuringGrupo = computed(() => {
  if (!configuringCol.value) return null;
  const key = configuringCol.value.id === dinamicaId.value ? DINAMICA_SENTINEL : configuringCol.value.id;
  return grupoForKey(key);
});
const configuringKey = computed(() => (configuringCol.value ? (configuringCol.value.id === dinamicaId.value ? DINAMICA_SENTINEL : configuringCol.value.id) : ''));
const siblingOptions = computed(() => {
  if (!configuringCol.value) return [];
  return units.value
    .filter((u) => u.key !== configuringKey.value)
    .filter((u) => { const ug = grupoForKey(u.key); return !ug || ug === configuringGrupo.value; })
    .map((u) => ({ id: u.key, nombre: u.isDinamica ? `${u.col.nombre} (columnas dinámicas)` : u.col.nombre }));
});
</script>

<template>
  <div>
    <label class="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
      Columnas ({{ cols.length }})
    </label>
    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="w-full text-xs">
        <thead>
          <tr v-if="hasCabeceras" class="bg-indigo-50">
            <template v-for="run in runs" :key="run.grupo?.titulo ?? run.units[0].key">
              <th
                v-if="run.grupo"
                :colspan="run.units.reduce((s, u) => s + u.span, 0)"
                class="p-0 border-2 border-indigo-400 bg-indigo-100"
              >
                <div class="flex items-center justify-center gap-1 px-2 py-1.5">
                  <span class="flex-1 text-center font-semibold text-indigo-700 text-[11px] truncate">{{ run.grupo.titulo || 'Sin título' }}</span>
                  <button @click="openGrupoEditor(run.grupo)" type="button" title="Editar grupo" class="w-4 h-4 rounded flex items-center justify-center text-indigo-500 hover:text-indigo-700 shrink-0">
                    <FontAwesomeIcon :icon="faGear" class="w-2.5 h-2.5" />
                  </button>
                  <button @click="groupToDelete = run.grupo" type="button" title="Eliminar grupo" class="w-4 h-4 rounded flex items-center justify-center text-indigo-400 hover:text-red-500 shrink-0">
                    <FontAwesomeIcon :icon="faTrash" class="w-2.5 h-2.5" />
                  </button>
                </div>
              </th>
              <template v-else v-for="u in run.units" :key="u.key">
                <TableDinamicaHeaderCell
                  v-if="u.isDinamica"
                  :col="u.col"
                  :row-span="2"
                  :col-span="Math.max(columnasDinamicas.length, 1)"
                  @dragstart="dragIndex = u.index"
                  @drop="dropColumnAt(u.index)"
                  @update-nombre="updateColumn(u.col.id, { nombre: $event })"
                  @update-tipo="updateColumn(u.col.id, { tipo: $event })"
                  @configure="configuringColId = u.col.id; soloGrupoMode = false"
                  @remove="removeColumn(u.col.id)"
                  @toggle-dinamica="toggleDinamica(u.col.id)"
                />
                <TableColumnHeaderCell
                  v-else
                  :col="u.col"
                  :row-span="totalRows"
                  @dragstart="dragIndex = u.index"
                  @drop="dropColumnAt(u.index)"
                  @update-nombre="updateColumn(u.col.id, { nombre: $event })"
                  @update-tipo="updateColumn(u.col.id, { tipo: $event })"
                  @configure="configuringColId = u.col.id; soloGrupoMode = false"
                  @remove="removeColumn(u.col.id)"
                >
                  <template #extra>
                    <button @click="toggleDinamica(u.col.id)" type="button" title="Marcar como dinámica" class="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-amber-500 shrink-0">
                      <FontAwesomeIcon :icon="faBolt" class="w-2.5 h-2.5" />
                    </button>
                  </template>
                </TableColumnHeaderCell>
              </template>
            </template>
            <TableAddColumnButton :row-span="totalRows" @add="addColumn" />
          </tr>
          <tr class="bg-gray-50">
            <template v-for="u in (hasCabeceras ? runs.flatMap((r) => (r.grupo ? r.units : [])) : units)" :key="u.key">
              <TableDinamicaHeaderCell
                v-if="u.isDinamica"
                :col="u.col"
                :row-span="rowNombresSpan(u)"
                :col-span="Math.max(columnasDinamicas.length, 1)"
                @dragstart="dragIndex = u.index"
                @drop="dropColumnAt(u.index)"
                @update-nombre="updateColumn(u.col.id, { nombre: $event })"
                @update-tipo="updateColumn(u.col.id, { tipo: $event })"
                @configure="configuringColId = u.col.id; soloGrupoMode = false"
                @remove="removeColumn(u.col.id)"
                @toggle-dinamica="toggleDinamica(u.col.id)"
              />
              <TableColumnHeaderCell
                v-else
                :col="u.col"
                :row-span="rowNombresSpan(u)"
                @dragstart="dragIndex = u.index"
                @drop="dropColumnAt(u.index)"
                @update-nombre="updateColumn(u.col.id, { nombre: $event })"
                @update-tipo="updateColumn(u.col.id, { tipo: $event })"
                @configure="configuringColId = u.col.id; soloGrupoMode = false"
                @remove="removeColumn(u.col.id)"
              >
                <template #extra>
                  <button @click="toggleDinamica(u.col.id)" type="button" title="Marcar como dinámica" class="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-amber-500 shrink-0">
                    <FontAwesomeIcon :icon="faBolt" class="w-2.5 h-2.5" />
                  </button>
                </template>
              </TableColumnHeaderCell>
            </template>
            <TableAddColumnButton v-if="!hasCabeceras" :row-span="totalRows" @add="addColumn" />
          </tr>
          <tr v-if="dinamicaId" class="bg-amber-50">
            <th v-for="(nombre, i) in columnasDinamicas" :key="i" class="px-2 py-1.5 text-left font-normal text-heading border border-amber-200 whitespace-nowrap">
              <div class="flex items-center gap-1">
                <input
                  :value="nombre"
                  @input="renameColumnaDinamica(i, ($event.target as HTMLInputElement).value)"
                  type="text"
                  placeholder="Nombre..."
                  class="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
                />
                <button
                  v-if="columnasDinamicas.length > 1"
                  @click="removeColumnaDinamica(i)"
                  type="button"
                  title="Eliminar columna dinámica"
                  class="w-4 h-4 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0"
                >
                  <FontAwesomeIcon :icon="faXmark" class="w-2 h-2" />
                </button>
                <button
                  @click="insertColumnaDinamicaAfter(i)"
                  type="button"
                  title="Insertar columna dinámica a la derecha"
                  class="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
                >
                  <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in [1, 2, 3]" :key="row" class="border-b border-gray-100 last:border-0">
            <template v-for="col in cols" :key="col.id">
              <template v-if="col.id === dinamicaId">
                <td v-for="(_, i) in columnasDinamicas" :key="i" class="px-2 py-1.5 text-muted whitespace-nowrap bg-amber-50/20">—</td>
              </template>
              <td v-else class="px-2 py-1.5 text-muted whitespace-nowrap">{{ col.tipo === 'auto_numerico' ? row : '—' }}</td>
            </template>
            <td class="px-1 py-1.5" />
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-[10px] text-muted mt-1.5">
      Arrastra el ícono de mano para reordenar columnas. Usa los botones junto a cada columna dinámica para insertarla a la derecha o eliminarla.
    </p>

    <ColumnaCapturaModal
      :is-open="!!configuringCol"
      :columna="configuringCol"
      :es-dinamica="configuringCol?.id === dinamicaId"
      :columna-id="configuringKey"
      :grupo="configuringGrupo ?? undefined"
      :sibling-options="siblingOptions"
      :solo-grupo="soloGrupoMode"
      @close="closeConfigurador"
      @update-columna="(updates) => configuringCol && updateColumn(configuringCol.id, updates)"
      @update-grupo="(grupo) => setGrupoFor(configuringKey, grupo)"
    />

    <ConfirmModal
      :is-open="!!groupToDelete"
      title="Eliminar grupo de cabecera"
      message="Se eliminará el título que agrupa estas columnas, pero las columnas seguirán existiendo en la tabla."
      confirm-label="Eliminar grupo"
      @confirm="groupToDelete && deleteGrupo(groupToDelete)"
      @close="groupToDelete = null"
    />
  </div>
</template>
