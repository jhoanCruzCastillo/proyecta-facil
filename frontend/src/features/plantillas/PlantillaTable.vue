<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faPen, faFileExcel } from '@/lib/icons';
import { instrumentoLabels, tipologiaIoarrLabels } from '@/lib/icons';
import InstrumentoTabs from './InstrumentoTabs.vue';
import FichasTecnicasAgrupadas from './FichasTecnicasAgrupadas.vue';
import PracticaToggle from './PracticaToggle.vue';
import EstadoPlantillaToggle from './EstadoPlantillaToggle.vue';
import ExcelCatalogModal from './ExcelCatalogModal.vue';
import type { Plantilla, Sector, TipoInstrumento, TipologiaIoarr } from '@/types';

const props = defineProps<{
  plantillas: Plantilla[];
  /** Solo en el sector "Formatos Generales": lista completa de plantillas/sectores del sistema,
   * para mostrar TODAS las fichas técnicas (agrupadas por sector) en vez de solo las de este sector. */
  todasFichasTecnicas?: { plantillas: Plantilla[]; sectores: Sector[] };
}>();

const badgeClasses: Record<TipoInstrumento, string> = {
  formato: 'bg-sky-50 text-sky-700 border border-sky-200',
  ioarr: 'bg-amber-50 text-amber-700 border border-amber-200',
  ficha_tecnica: 'bg-blue-50 text-blue-700 border border-blue-200',
  perfil: 'bg-violet-50 text-violet-700 border border-violet-200',
};

const tabOrder: TipoInstrumento[] = ['formato', 'ioarr', 'ficha_tecnica', 'perfil'];
type FiltroTipologia = 'todas' | TipologiaIoarr;

const activeTab = ref<TipoInstrumento>(
  tabOrder.find((t) => props.plantillas.some((p) => p.instrumento === t)) ?? 'formato',
);
const tipologia = ref<FiltroTipologia>('todas');

// `plantillas` llega de una query asíncrona (mock con latencia simulada) — en el primer render
// puede estar vacía, así que el auto-select de arriba no alcanza a elegir el tab correcto. Se
// reintenta una sola vez apenas llegan datos, sin pisar una selección manual del usuario.
let autoSeleccionado = false;
watch(
  () => props.plantillas,
  (lista) => {
    if (autoSeleccionado || lista.length === 0) return;
    const encontrado = tabOrder.find((t) => lista.some((p) => p.instrumento === t));
    if (encontrado) activeTab.value = encontrado;
    autoSeleccionado = true;
  },
  { immediate: true },
);

const counts = computed(
  () => Object.fromEntries(tabOrder.map((t) => [t, props.plantillas.filter((p) => p.instrumento === t).length])) as Record<TipoInstrumento, number>,
);

function handleTabChange(tab: TipoInstrumento) {
  activeTab.value = tab;
  tipologia.value = 'todas';
}

const filtered = computed(() =>
  props.plantillas.filter(
    (p) =>
      p.instrumento === activeTab.value &&
      (activeTab.value !== 'ioarr' || tipologia.value === 'todas' || (p.tipologiasIoarr ?? []).includes(tipologia.value as TipologiaIoarr)),
  ),
);

const vistaAgrupada = computed(() => activeTab.value === 'ficha_tecnica' && props.todasFichasTecnicas);

const excelPlantillaId = ref<string | null>(null);
const excelPlantilla = computed(() => props.plantillas.find((p) => p.id === excelPlantillaId.value) ?? null);
</script>

<template>
  <div>
    <InstrumentoTabs :active-tab="activeTab" :counts="counts" @change="handleTabChange" />

    <div v-if="activeTab === 'ioarr'" class="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
      <button
        v-for="t in (['todas', ...Object.keys(tipologiaIoarrLabels)] as FiltroTipologia[])"
        :key="t"
        @click="tipologia = t"
        type="button"
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75"
        :class="tipologia === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
      >
        {{ t === 'todas' ? 'Todas' : tipologiaIoarrLabels[t as TipologiaIoarr] }}
      </button>
    </div>

    <FichasTecnicasAgrupadas
      v-if="vistaAgrupada && todasFichasTecnicas"
      :plantillas="todasFichasTecnicas.plantillas"
      :sectores="todasFichasTecnicas.sectores"
    />
    <table v-else class="w-full">
      <thead>
        <tr class="border-b border-gray-100">
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Código</th>
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Nombre</th>
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Secciones</th>
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Ejemplos</th>
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Práctica</th>
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Actualizado</th>
          <th class="text-center text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in filtered" :key="p.id" class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center flex-wrap gap-1.5">
              <span class="inline-flex items-center justify-center w-auto min-w-10 px-2 h-8 rounded-md border border-brand-200 text-brand-700 text-sm font-bold bg-brand-50">
                {{ p.codigo }}
              </span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="badgeClasses[p.instrumento ?? 'ficha_tecnica']">
                {{ instrumentoLabels[p.instrumento ?? 'ficha_tecnica'] }}
              </span>
              <span
                v-for="t in p.tipologiasIoarr ?? []"
                :key="t"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
              >
                {{ tipologiaIoarrLabels[t] }}
              </span>
            </div>
          </td>
          <td class="px-4 py-4">
            <div class="font-semibold text-heading text-sm">{{ p.nombre }}</div>
            <div class="text-xs text-muted">{{ p.descripcion }}</div>
          </td>
          <td class="px-4 py-4 text-sm text-gray-600">{{ p.cantidadSecciones }} secciones</td>
          <td class="px-4 py-4">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
              {{ p.cantidadEjemplos }} ejemplos
            </span>
          </td>
          <td class="px-4 py-4">
            <PracticaToggle :plantilla="p" />
          </td>
          <td class="px-4 py-4 text-sm text-gray-500">{{ p.fechaActualizacion }}</td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-center gap-2">
              <EstadoPlantillaToggle :plantilla="p" />
              <RouterLink
                :to="`/sectores/${p.sectorId}/plantilla/${p.id}`"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <FontAwesomeIcon :icon="faEye" class="w-3 h-3" />
                Ver
              </RouterLink>
              <RouterLink
                :to="`/sectores/${p.sectorId}/plantilla/${p.id}/${p.instrumento === 'perfil' ? 'perfil' : 'editar'}`"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-sidebar hover:bg-heading transition-colors"
              >
                <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
                Editar
              </RouterLink>
              <button
                @click="excelPlantillaId = p.id"
                type="button"
                class="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Gestionar Excel"
              >
                <FontAwesomeIcon :icon="faFileExcel" class="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="filtered.length === 0">
          <td colspan="7" class="px-6 py-8 text-center text-sm text-muted">
            No hay plantillas en esta categoría.
          </td>
        </tr>
      </tbody>
    </table>

    <ExcelCatalogModal
      v-if="excelPlantilla"
      is-open
      :plantilla="excelPlantilla"
      @close="excelPlantillaId = null"
    />
  </div>
</template>
