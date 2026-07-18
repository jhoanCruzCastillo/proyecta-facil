<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBolt, faXmark, faPlus } from '@/lib/icons';
import { generateId } from '@/api/mock/_shared';
import TableColumnHeaderCell from './TableColumnHeaderCell.vue';
import TableAddColumnButton from './TableAddColumnButton.vue';
import ColumnaCapturaModal from './ColumnaCapturaModal.vue';
import type { ColumnaTabla, CabeceraGrupo } from '@/types';

// Editor de columnas para subtipo "jerarquica" — misma interfaz que FilasDinamicasColumnsEditor,
// más un botón para alternar el nivel jerárquico (padre/hijo) de cada columna y, opcionalmente,
// marcar una columna como dinámica (un valor por período, igual mecanismo que matriz_por_periodos).
// La interacción de agregar items hijos de la jerarquía (horizontal) vive en ExampleTableEditor.
const config = defineModel<import('@/types').ConfigTabla>('config', { required: true });

const cols = computed(() => config.value.columnas);
const cabeceras = computed(() => config.value.cabeceras ?? []);
const hasCabeceras = computed(() => cabeceras.value.length > 0);
const dinamicaId = computed(() => config.value.columnaDinamicaId);
const periodos = computed(() => config.value.periodos ?? []);
const dragIndex = ref<number | null>(null);
const configuringColId = ref<string | null>(null);
const configuringCol = computed(() => cols.value.find((c) => c.id === configuringColId.value) ?? null);

function updateColumn(colId: string, updates: Partial<ColumnaTabla>) {
  config.value = { ...config.value, columnas: cols.value.map((c) => (c.id === colId ? { ...c, ...updates } : c)) };
}

function removeColumn(colId: string) {
  const nextCabeceras = cabeceras.value
    .map((g) => ({ ...g, hijoIds: g.hijoIds.filter((h) => h !== colId) }))
    .filter((g) => g.hijoIds.length > 1);
  config.value = {
    ...config.value,
    columnas: cols.value.filter((c) => c.id !== colId),
    columnaDinamicaId: colId === dinamicaId.value ? undefined : dinamicaId.value,
    cabeceras: nextCabeceras.length ? nextCabeceras : undefined,
  };
}

function toggleNivel(colId: string) {
  const col = cols.value.find((c) => c.id === colId);
  if (col) updateColumn(colId, { nivel: col.nivel === 'padre' ? 'hijo' : 'padre' });
}

function toggleDinamica(colId: string) {
  const yaEsDinamica = dinamicaId.value === colId;
  config.value = {
    ...config.value,
    columnaDinamicaId: yaEsDinamica ? undefined : colId,
    periodos: yaEsDinamica ? config.value.periodos : (config.value.periodos?.length ? config.value.periodos : ['', '']),
  };
}

function renamePeriodo(i: number, val: string) {
  const next = [...periodos.value];
  next[i] = val;
  config.value = { ...config.value, periodos: next };
}
function insertPeriodoAfter(i: number) {
  const next = [...periodos.value];
  next.splice(i + 1, 0, '');
  config.value = { ...config.value, periodos: next };
}
function removePeriodo(i: number) {
  if (periodos.value.length <= 1) return;
  config.value = { ...config.value, periodos: periodos.value.filter((_, idx) => idx !== i) };
}

function addColumn(name: string) {
  if (!name.trim()) return;
  const newCol: ColumnaTabla = { id: generateId(), nombre: name.trim(), tipo: 'texto_corto', requerido: false, nivel: 'hijo' };
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
  const isMember = (col: ColumnaTabla) => hijoIds.includes(col.id);
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

interface Run { grupo: CabeceraGrupo | null; cols: ColumnaTabla[] }
const runs = computed(() => {
  const list: Run[] = [];
  for (const col of cols.value) {
    const g = grupoForKey(col.id);
    const last = list[list.length - 1];
    if (last && g && last.grupo === g) last.cols.push(col);
    else list.push({ grupo: g, cols: [col] });
  }
  return list;
});

const configuringGrupo = computed(() => (configuringCol.value ? grupoForKey(configuringCol.value.id) : null));
const siblingOptions = computed(() => {
  if (!configuringCol.value) return [];
  return cols.value
    .filter((c) => c.id !== configuringCol.value!.id)
    .filter((c) => { const ug = grupoForKey(c.id); return !ug || ug === configuringGrupo.value; })
    .map((c) => ({ id: c.id, nombre: c.nombre }));
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
            <template v-for="run in runs" :key="run.grupo?.titulo ?? run.cols[0].id">
              <th
                v-if="run.grupo"
                :colspan="run.cols.length"
                class="px-2 py-1.5 text-center font-semibold text-indigo-700 border-2 border-indigo-400 bg-indigo-100 whitespace-nowrap text-[11px]"
              >
                {{ run.grupo.titulo || 'Sin título' }}
              </th>
              <TableColumnHeaderCell
                v-else
                v-for="col in run.cols"
                :key="col.id"
                :col="col"
                :row-span="2"
                @dragstart="dragIndex = cols.indexOf(col)"
                @drop="dropColumnAt(cols.indexOf(col))"
                @update-nombre="updateColumn(col.id, { nombre: $event })"
                @update-tipo="updateColumn(col.id, { tipo: $event })"
                @configure="configuringColId = col.id"
                @remove="removeColumn(col.id)"
              >
                <template #extra>
                  <button
                    @click="toggleNivel(col.id)"
                    type="button"
                    :title="col.nivel === 'padre' ? 'Nivel: Padre (clic para cambiar a Hijo)' : 'Nivel: Hijo (clic para cambiar a Padre)'"
                    class="text-[9px] font-semibold shrink-0 px-1 py-0.5 rounded transition-colors"
                    :class="col.nivel === 'padre' ? 'text-amber-600 hover:bg-amber-50' : 'text-blue-600 hover:bg-blue-50'"
                  >
                    {{ col.nivel === 'padre' ? '↕ Padre' : '↔ Hijo' }}
                  </button>
                  <button
                    @click="toggleDinamica(col.id)"
                    type="button"
                    :title="col.id === dinamicaId ? 'Quitar columna dinámica (un valor por período)' : 'Marcar como columna dinámica (un valor por período)'"
                    class="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    :class="col.id === dinamicaId ? 'text-amber-600' : 'text-gray-300 hover:text-amber-500'"
                  >
                    <FontAwesomeIcon :icon="faBolt" class="w-2.5 h-2.5" />
                  </button>
                </template>
              </TableColumnHeaderCell>
            </template>
            <TableAddColumnButton :row-span="2" @add="addColumn" />
          </tr>
          <tr class="bg-gray-50">
            <template v-if="hasCabeceras">
              <template v-for="run in runs" :key="run.grupo?.titulo ?? run.cols[0].id">
                <template v-if="run.grupo">
                  <TableColumnHeaderCell
                    v-for="col in run.cols"
                    :key="col.id"
                    :col="col"
                    :row-span="1"
                    @dragstart="dragIndex = cols.indexOf(col)"
                    @drop="dropColumnAt(cols.indexOf(col))"
                    @update-nombre="updateColumn(col.id, { nombre: $event })"
                    @update-tipo="updateColumn(col.id, { tipo: $event })"
                    @configure="configuringColId = col.id"
                    @remove="removeColumn(col.id)"
                  >
                    <template #extra>
                      <button
                        @click="toggleNivel(col.id)"
                        type="button"
                        :title="col.nivel === 'padre' ? 'Nivel: Padre (clic para cambiar a Hijo)' : 'Nivel: Hijo (clic para cambiar a Padre)'"
                        class="text-[9px] font-semibold shrink-0 px-1 py-0.5 rounded transition-colors"
                        :class="col.nivel === 'padre' ? 'text-amber-600 hover:bg-amber-50' : 'text-blue-600 hover:bg-blue-50'"
                      >
                        {{ col.nivel === 'padre' ? '↕ Padre' : '↔ Hijo' }}
                      </button>
                      <button
                        @click="toggleDinamica(col.id)"
                        type="button"
                        :title="col.id === dinamicaId ? 'Quitar columna dinámica' : 'Marcar como columna dinámica'"
                        class="w-4 h-4 rounded flex items-center justify-center shrink-0"
                        :class="col.id === dinamicaId ? 'text-amber-600' : 'text-gray-300 hover:text-amber-500'"
                      >
                        <FontAwesomeIcon :icon="faBolt" class="w-2.5 h-2.5" />
                      </button>
                    </template>
                  </TableColumnHeaderCell>
                </template>
              </template>
            </template>
            <template v-else>
              <TableColumnHeaderCell
                v-for="col in cols"
                :key="col.id"
                :col="col"
                :row-span="1"
                @dragstart="dragIndex = cols.indexOf(col)"
                @drop="dropColumnAt(cols.indexOf(col))"
                @update-nombre="updateColumn(col.id, { nombre: $event })"
                @update-tipo="updateColumn(col.id, { tipo: $event })"
                @configure="configuringColId = col.id"
                @remove="removeColumn(col.id)"
              >
                <template #extra>
                  <button
                    @click="toggleNivel(col.id)"
                    type="button"
                    :title="col.nivel === 'padre' ? 'Nivel: Padre (clic para cambiar a Hijo)' : 'Nivel: Hijo (clic para cambiar a Padre)'"
                    class="text-[9px] font-semibold shrink-0 px-1 py-0.5 rounded transition-colors"
                    :class="col.nivel === 'padre' ? 'text-amber-600 hover:bg-amber-50' : 'text-blue-600 hover:bg-blue-50'"
                  >
                    {{ col.nivel === 'padre' ? '↕ Padre' : '↔ Hijo' }}
                  </button>
                  <button
                    @click="toggleDinamica(col.id)"
                    type="button"
                    :title="col.id === dinamicaId ? 'Quitar columna dinámica' : 'Marcar como columna dinámica'"
                    class="w-4 h-4 rounded flex items-center justify-center shrink-0"
                    :class="col.id === dinamicaId ? 'text-amber-600' : 'text-gray-300 hover:text-amber-500'"
                  >
                    <FontAwesomeIcon :icon="faBolt" class="w-2.5 h-2.5" />
                  </button>
                </template>
              </TableColumnHeaderCell>
              <TableAddColumnButton :row-span="1" @add="addColumn" />
            </template>
          </tr>
          <tr v-if="dinamicaId" class="bg-amber-50">
            <th :colspan="cols.length + 1" class="px-2 py-1.5 border border-amber-200">
              <div class="flex items-center gap-1 flex-wrap">
                <span class="text-[9px] font-semibold text-amber-700 uppercase tracking-wide shrink-0">Períodos:</span>
                <div v-for="(nombre, i) in periodos" :key="i" class="flex items-center gap-1">
                  <input
                    :value="nombre"
                    @input="renamePeriodo(i, ($event.target as HTMLInputElement).value)"
                    type="text"
                    placeholder="Nombre..."
                    class="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
                  />
                  <button
                    v-if="periodos.length > 1"
                    @click="removePeriodo(i)"
                    type="button"
                    title="Eliminar período"
                    class="w-4 h-4 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0"
                  >
                    <FontAwesomeIcon :icon="faXmark" class="w-2 h-2" />
                  </button>
                  <button
                    @click="insertPeriodoAfter(i)"
                    type="button"
                    title="Insertar período a la derecha"
                    class="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
                  >
                    <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" />
                  </button>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in [1, 2]" :key="group">
            <tr v-for="child in [1, 2]" :key="`${group}-${child}`" class="border-b border-gray-100">
              <template v-for="col in cols" :key="col.id">
                <td
                  v-if="!(col.nivel === 'padre' && child > 1)"
                  class="px-2 py-1 text-muted whitespace-nowrap text-[10px]"
                  :class="col.nivel === 'padre' ? 'bg-amber-50/50 align-top font-medium text-gray-500 border-r border-gray-200' : ''"
                  :rowspan="col.nivel === 'padre' ? 2 : undefined"
                >
                  {{ col.nivel === 'padre' ? `Grupo ${group}` : `${group}.${child}` }}
                </td>
              </template>
              <td class="px-1 py-1" />
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <p class="text-[10px] text-muted mt-1.5">
      Arrastra el ícono de mano para reordenar columnas. Clic en "Padre/Hijo" para cambiar el nivel jerárquico.
    </p>

    <ColumnaCapturaModal
      :is-open="!!configuringCol"
      :columna="configuringCol"
      :columna-id="configuringCol?.id ?? ''"
      :grupo="configuringGrupo ?? undefined"
      :sibling-options="siblingOptions"
      @close="configuringColId = null"
      @update-columna="(updates) => configuringCol && updateColumn(configuringCol.id, updates)"
      @update-grupo="(grupo) => configuringCol && setGrupoFor(configuringCol.id, grupo)"
    />
  </div>
</template>
