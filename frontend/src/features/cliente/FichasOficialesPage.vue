<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faFileCirclePlus, faMagnifyingGlass, faFilter, faPlus, faGraduationCap, faBriefcase, faList, instrumentoIcons, instrumentoLabels } from '@/lib/icons';
import PageShell from '@/components/PageShell.vue';
import { usePlantillasQuery } from '@/composables/usePlantillas';
import { useSectoresQuery } from '@/composables/useSectores';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useEjemplosQuery } from '@/composables/useEjemplos';
import { useEstadoEntrenamiento } from '@/composables/useEstadoEntrenamiento';
import { useSessionStore } from '@/stores/session';
import { cuentaEfectivaDe } from '@/lib/permisos';
import { addOns } from '@/data/planes';
import NuevaFichaClienteModal from './NuevaFichaClienteModal.vue';
import ComprarAddOnModal from '@/features/settings/ComprarAddOnModal.vue';
import type { Plantilla } from '@/types';

type Tab = 'todas' | 'practica' | 'proyecto';

const session = useSessionStore();
const { data: plantillasData } = usePlantillasQuery();
const { data: sectoresData } = useSectoresQuery();
const { data: usuariosData } = useUsuariosQuery();
const { data: ejemplosData } = useEjemplosQuery();
const { esNivel0, vencido, diasRestantes, limiteFichas } = useEstadoEntrenamiento();

const plantillas = computed(() => plantillasData.value ?? []);
const sectores = computed(() => sectoresData.value ?? []);

const tab = ref<Tab>('proyecto');
const busqueda = ref('');
const presetPlantillaId = ref<string | null>(null);
const showComprarAddon = ref(false);

const cuentaId = computed(() => (session.sesion ? cuentaEfectivaDe(usuariosData.value ?? [], session.sesion) : ''));
const misFichasCount = computed(() => (ejemplosData.value ?? []).filter((e) => e.propietarioId === cuentaId.value).length);
const limiteAlcanzado = computed(() => misFichasCount.value >= limiteFichas.value);

function coincide(p: Plantilla): boolean {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return true;
  return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
}

const filtradas = computed(() =>
  plantillas.value.filter(
    (p) => (tab.value === 'todas' || (tab.value === 'practica' ? !!p.disponibleNivel0 : !p.disponibleNivel0)) && coincide(p),
  ),
);

const grupos = computed(() =>
  sectores.value
    .map((s) => ({ sector: s, fichas: filtradas.value.filter((p) => p.sectorId === s.id) }))
    .filter((g) => g.fichas.length > 0),
);

// En el tab de proyecto, un cliente Nivel 0 puede mirar el catálogo (para saber qué se
// desbloquea) pero no crear fichas ahí todavía — solo tiene acceso a sus ejercicios de práctica.
function puedeCrear(p: Plantilla): boolean {
  return !vencido.value && !limiteAlcanzado.value && (!esNivel0.value || !!p.disponibleNivel0);
}
function motivoBloqueo(p: Plantilla): string | undefined {
  if (vencido.value) return 'Tu plan de entrenamiento venció';
  if (esNivel0.value && !p.disponibleNivel0) return 'Disponible desde Nivel 1 — actualiza tu plan';
  if (limiteAlcanzado.value) return `Alcanzaste el límite de ${limiteFichas.value} ${esNivel0.value ? 'ejercicios' : 'plantillas simultáneas'} de tu plan`;
  return undefined;
}
</script>

<template>
  <PageShell :icon="faFileCirclePlus" title="Fichas oficiales" description="Elige una ficha oficial para crear y empezar a llenar tu propio caso">
    <div>
      <div class="flex gap-2">
        <button
          @click="tab = 'todas'"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75"
          :class="tab === 'todas' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
        >
          <FontAwesomeIcon :icon="faList" class="w-3 h-3" />
          Todas
        </button>
        <button
          @click="tab = 'proyecto'"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75"
          :class="tab === 'proyecto' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
        >
          <FontAwesomeIcon :icon="faBriefcase" class="w-3 h-3" />
          Fichas para tu proyecto
        </button>
        <button
          @click="tab = 'practica'"
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75"
          :class="tab === 'practica' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
        >
          <FontAwesomeIcon :icon="faGraduationCap" class="w-3 h-3" />
          Ejercicios de práctica
        </button>
      </div>

      <div
        class="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
        :class="vencido ? 'bg-red-50 border-red-200 text-red-700' : limiteAlcanzado ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'"
      >
        <FontAwesomeIcon :icon="faGraduationCap" class="w-3.5 h-3.5 shrink-0" />
        <template v-if="esNivel0">
          <template v-if="vencido">Tu plan de entrenamiento venció — ya no puedes crear nuevos ejercicios.</template>
          <template v-else>
            Plan Pedagógico · {{ diasRestantes }} día{{ diasRestantes === 1 ? '' : 's' }} restantes — las fichas de "Fichas para tu proyecto" se desbloquean desde Nivel 1.
          </template>
        </template>
        <span v-else>
          {{ misFichasCount }}/{{ limiteFichas }} plantillas simultáneas
          <template v-if="limiteAlcanzado">
            —
            <button @click="showComprarAddon = true" type="button" class="font-semibold underline hover:text-amber-900">
              compra "Plantilla adicional" para sumar más
            </button>
          </template>
        </span>
      </div>

      <div class="flex gap-2 mt-4 max-w-md">
        <div class="relative flex-1">
          <FontAwesomeIcon :icon="faMagnifyingGlass" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
            class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <button
          type="button"
          title="Filtros (próximamente)"
          class="w-10 h-10 shrink-0 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors duration-75"
        >
          <FontAwesomeIcon :icon="faFilter" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="{ sector, fichas } in grupos" :key="sector.id">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-muted mb-2 pb-1 border-b border-gray-100">
          {{ sector.nombre }} <span class="text-gray-300 normal-case font-normal">· {{ fichas.length }}</span>
        </p>
        <div class="bg-surface-card rounded-lg border border-gray-100 divide-y divide-gray-50">
          <div v-for="p in fichas" :key="p.id" class="flex items-center gap-3 px-4 py-3">
            <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon :icon="instrumentoIcons[p.instrumento]" class="w-3.5 h-3.5" />
            </div>
            <span class="inline-flex items-center justify-center w-auto min-w-9 px-2 h-7 rounded-md border border-brand-200 text-brand-700 text-xs font-bold bg-brand-50 shrink-0">
              {{ p.codigo }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-heading truncate">{{ p.nombre }}</p>
              <p class="text-xs text-muted truncate">{{ instrumentoLabels[p.instrumento] }} · {{ p.descripcion }}</p>
            </div>
            <button
              @click="presetPlantillaId = p.id"
              :disabled="!puedeCrear(p)"
              :title="motivoBloqueo(p)"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <FontAwesomeIcon :icon="faPlus" class="w-2.5 h-2.5" />
              Crear ficha
            </button>
          </div>
        </div>
      </div>
      <p v-if="grupos.length === 0" class="text-center text-sm text-muted py-12">
        {{ tab === 'practica' ? 'Todavía no hay ejercicios de práctica disponibles.' : 'No se encontraron fichas oficiales.' }}
      </p>
    </div>

    <NuevaFichaClienteModal
      :is-open="!!presetPlantillaId"
      :preset-plantilla-id="presetPlantillaId ?? undefined"
      @close="presetPlantillaId = null"
    />

    <ComprarAddOnModal
      :is-open="showComprarAddon"
      :usuario-id="cuentaId"
      :addon="addOns.find((a) => a.id === 'plantilla-adicional') ?? null"
      @close="showComprarAddon = false"
    />
  </PageShell>
</template>
