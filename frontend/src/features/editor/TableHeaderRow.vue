<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus } from '@/lib/icons';
import type { ColumnaTabla, CabeceraGrupo } from '@/types';

// Encabezado compartido entre DynamicEditor y GroupedRowsEditor (valores de ejemplo). La columna
// dinámica se expande en una celda de encabezado por período. Si hay cabeceras (agrupación bajo un
// título común), se agrega una fila superior con colspan por grupo, igual que en el editor de
// columnas. Los props editable* (editablePeriodos/showAddPeriodo/editableGrupos) están definidos
// para uso futuro desde el tab Estructura pero ningún caller los pasa hoy — mismo estado que el
// prototipo React original, que tampoco los cablea.
const props = defineProps<{
  cols: ColumnaTabla[];
  periodos: string[];
  columnaDinamicaId?: string;
  cabeceras?: CabeceraGrupo[];
  editablePeriodos?: boolean;
  showAddPeriodo?: boolean;
  editableGrupos?: boolean;
}>();

const emit = defineEmits<{
  'rename-periodo': [index: number, value: string];
  'add-periodo': [];
  'rename-grupo': [grupo: CabeceraGrupo, titulo: string];
}>();

function grupoForKey(key: string): CabeceraGrupo | undefined {
  return (props.cabeceras ?? []).find((g) => g.hijoIds.includes(key));
}

interface Run { grupo?: CabeceraGrupo; cols: ColumnaTabla[] }
function buildRuns(): Run[] {
  const runs: Run[] = [];
  for (const col of props.cols) {
    const g = grupoForKey(col.id);
    const last = runs[runs.length - 1];
    if (last && g && last.grupo === g) last.cols.push(col);
    else runs.push({ grupo: g, cols: [col] });
  }
  return runs;
}

function runSpan(run: Run): number {
  return run.cols.reduce((s, c) => s + (c.id === props.columnaDinamicaId ? Math.max(props.periodos.length, 1) : 1), 0);
}
</script>

<template>
  <template v-if="!cabeceras || cabeceras.length === 0">
    <tr class="bg-brand-50/40">
      <template v-for="col in cols" :key="col.id">
        <template v-if="col.id === columnaDinamicaId && periodos.length > 0">
          <th
            v-for="(p, pi) in periodos"
            :key="`${col.id}-${pi}`"
            class="px-1.5 py-1.5 text-left font-medium text-heading border-b border-amber-300 bg-amber-50 whitespace-nowrap text-[11px]"
          >
            <div class="flex items-center gap-1">
              <input
                v-if="editablePeriodos"
                :value="p"
                @input="emit('rename-periodo', pi, ($event.target as HTMLInputElement).value)"
                @click.stop
                type="text"
                placeholder="Nombre..."
                class="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
              />
              <span v-else class="underline decoration-amber-400">{{ p }}</span>
              <button
                v-if="pi === periodos.length - 1 && showAddPeriodo"
                @click.stop="emit('add-periodo')"
                type="button"
                title="Agregar columna dinámica"
                class="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
              >
                <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" />
              </button>
            </div>
          </th>
        </template>
        <th v-else class="px-2 py-1.5 text-left font-medium text-heading border-b border-brand-100 whitespace-nowrap text-[11px]">
          {{ col.nombre }}
        </th>
      </template>
      <th class="w-8 border-b border-brand-100" />
    </tr>
  </template>
  <template v-else>
    <tr class="bg-indigo-50">
      <template v-for="(run, ri) in buildRuns()" :key="ri">
        <th
          v-if="run.grupo"
          :colspan="runSpan(run)"
          class="px-2 py-1.5 text-center font-semibold text-indigo-700 border-2 border-indigo-400 bg-indigo-100 whitespace-nowrap text-[11px]"
        >
          <input
            v-if="editableGrupos"
            :value="run.grupo.titulo"
            @input="emit('rename-grupo', run.grupo, ($event.target as HTMLInputElement).value)"
            @click.stop
            type="text"
            placeholder="Sin título"
            class="w-full text-center bg-transparent border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none text-[11px] font-semibold text-indigo-700"
          />
          <template v-else>{{ run.grupo.titulo || 'Sin título' }}</template>
        </th>
        <th v-else :colspan="runSpan(run)" class="border-2 border-brand-100 bg-brand-50/40" />
      </template>
      <th class="w-8 border-b border-indigo-100" />
    </tr>
    <tr class="bg-brand-50/40">
      <template v-for="col in cols" :key="col.id">
        <template v-if="col.id === columnaDinamicaId && periodos.length > 0">
          <th
            v-for="(p, pi) in periodos"
            :key="`${col.id}-${pi}`"
            class="px-1.5 py-1.5 text-left font-medium text-heading border-b border-amber-300 bg-amber-50 whitespace-nowrap text-[11px]"
          >
            <div class="flex items-center gap-1">
              <input
                v-if="editablePeriodos"
                :value="p"
                @input="emit('rename-periodo', pi, ($event.target as HTMLInputElement).value)"
                @click.stop
                type="text"
                placeholder="Nombre..."
                class="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
              />
              <span v-else class="underline decoration-amber-400">{{ p }}</span>
              <button
                v-if="pi === periodos.length - 1 && showAddPeriodo"
                @click.stop="emit('add-periodo')"
                type="button"
                title="Agregar columna dinámica"
                class="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
              >
                <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" />
              </button>
            </div>
          </th>
        </template>
        <th v-else class="px-2 py-1.5 text-left font-medium text-heading border-b border-brand-100 whitespace-nowrap text-[11px]">
          {{ col.nombre }}
        </th>
      </template>
      <th class="w-8 border-b border-brand-100" />
    </tr>
  </template>
</template>
