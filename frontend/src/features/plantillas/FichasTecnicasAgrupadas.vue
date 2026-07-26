<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faPen, faMagnifyingGlass, faStar } from '@/lib/icons';
import PracticaToggle from './PracticaToggle.vue';
import EstadoPlantillaToggle from './EstadoPlantillaToggle.vue';
import type { Plantilla, Sector } from '@/types';

const props = defineProps<{ plantillas: Plantilla[]; sectores: Sector[] }>();

const busqueda = ref('');

const fichas = computed(() => props.plantillas.filter((p) => p.instrumento === 'ficha_tecnica'));
const mef = computed(() => fichas.value.find((p) => p.codigo === '6A') ?? null);
const resto = computed(() => fichas.value.filter((p) => p.id !== mef.value?.id));

function coincide(p: Plantilla): boolean {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return true;
  return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
}

const mefVisible = computed(() => (mef.value && coincide(mef.value) ? mef.value : null));
const restoFiltrado = computed(() => resto.value.filter(coincide));

const grupos = computed(() =>
  props.sectores
    .map((s) => ({ sector: s, fichas: restoFiltrado.value.filter((p) => p.sectorId === s.id) }))
    .filter((g) => g.fichas.length > 0),
);
</script>

<template>
  <div class="p-4 space-y-6">
    <div class="relative">
      <FontAwesomeIcon :icon="faMagnifyingGlass" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar ficha técnica por nombre, código o descripción..."
        class="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>

    <div v-if="mefVisible">
      <p class="text-[11px] font-semibold uppercase tracking-widest text-brand-600 mb-2 flex items-center gap-1.5">
        <FontAwesomeIcon :icon="faStar" class="w-2.5 h-2.5" />
        Ficha técnica del MEF
      </p>
      <div class="rounded-lg border-2 border-brand-200 bg-brand-50/40 overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-4 py-2.5">
          <div class="flex items-center gap-3 min-w-0">
            <span class="inline-flex items-center justify-center w-auto min-w-9 px-2 h-7 rounded-md border border-brand-200 text-brand-700 text-xs font-bold bg-brand-50 shrink-0">
              {{ mefVisible.codigo }}
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-heading truncate">{{ mefVisible.nombre }}</p>
              <p class="text-xs text-muted truncate">{{ mefVisible.descripcion }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <PracticaToggle :plantilla="mefVisible" />
            <EstadoPlantillaToggle :plantilla="mefVisible" />
            <RouterLink
              :to="`/sectores/${mefVisible.sectorId}/plantilla/${mefVisible.id}`"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <FontAwesomeIcon :icon="faEye" class="w-3 h-3" />
              Ver
            </RouterLink>
            <RouterLink
              :to="`/sectores/${mefVisible.sectorId}/plantilla/${mefVisible.id}/editar`"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-sidebar hover:bg-heading transition-colors"
            >
              <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
              Editar
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-5">
      <div v-for="{ sector, fichas: fichasSector } in grupos" :key="sector.id">
        <p class="text-[11px] font-semibold uppercase tracking-widest text-muted mb-2 pb-1 border-b border-gray-100">
          {{ sector.nombre }} <span class="text-gray-300 normal-case font-normal">· {{ fichasSector.length }}</span>
        </p>
        <div class="rounded-lg border border-gray-100">
          <div
            v-for="p in fichasSector"
            :key="p.id"
            class="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="inline-flex items-center justify-center w-auto min-w-9 px-2 h-7 rounded-md border border-brand-200 text-brand-700 text-xs font-bold bg-brand-50 shrink-0">
                {{ p.codigo }}
              </span>
              <div class="min-w-0">
                <p class="text-sm font-medium text-heading truncate">{{ p.nombre }}</p>
                <p class="text-xs text-muted truncate">{{ p.descripcion }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <PracticaToggle :plantilla="p" />
              <EstadoPlantillaToggle :plantilla="p" />
              <RouterLink
                :to="`/sectores/${p.sectorId}/plantilla/${p.id}`"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <FontAwesomeIcon :icon="faEye" class="w-3 h-3" />
                Ver
              </RouterLink>
              <RouterLink
                :to="`/sectores/${p.sectorId}/plantilla/${p.id}/editar`"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-sidebar hover:bg-heading transition-colors"
              >
                <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
                Editar
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
      <p v-if="grupos.length === 0 && !mefVisible" class="text-center text-sm text-muted py-8">
        No se encontraron fichas técnicas.
      </p>
    </div>
  </div>
</template>
