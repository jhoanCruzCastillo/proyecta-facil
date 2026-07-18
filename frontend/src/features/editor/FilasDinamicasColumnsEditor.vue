<script setup lang="ts">
import { computed, ref } from 'vue';
import { generateId } from '@/api/mock/_shared';
import TableColumnHeaderCell from './TableColumnHeaderCell.vue';
import TableAddColumnButton from './TableAddColumnButton.vue';
import ColumnaCapturaModal from './ColumnaCapturaModal.vue';
import type { ColumnaTabla, CabeceraGrupo } from '@/types';

// Editor de columnas para subtipo "filas_dinamicas" — misma interfaz que MatrizPeriodosEditor
// (arrastrar para reordenar, nombre editable inline, engranaje para posición en Excel + agrupación
// bajo cabecera, eliminar), pero sin columna dinámica: aquí lo dinámico son las filas (se
// agregan/quitan desde ExampleTableEditor), no las columnas.
const config = defineModel<import('@/types').ConfigTabla>('config', { required: true });

const cols = computed(() => config.value.columnas);
const cabeceras = computed(() => config.value.cabeceras ?? []);
const hasCabeceras = computed(() => cabeceras.value.length > 0);
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
  config.value = { ...config.value, columnas: cols.value.filter((c) => c.id !== colId), cabeceras: nextCabeceras.length ? nextCabeceras : undefined };
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
              />
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
                  />
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
              />
              <TableAddColumnButton :row-span="1" @add="addColumn" />
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in [1, 2, 3]" :key="row" class="border-b border-gray-100 last:border-0">
            <td v-for="col in cols" :key="col.id" class="px-2 py-1.5 text-muted whitespace-nowrap">
              {{ col.tipo === 'auto_numerico' ? row : '—' }}
            </td>
            <td class="px-1 py-1.5" />
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-[10px] text-muted mt-1.5">
      Arrastra el ícono de mano para reordenar columnas. Clic en el engranaje para posición en Excel o agrupar bajo un título.
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
