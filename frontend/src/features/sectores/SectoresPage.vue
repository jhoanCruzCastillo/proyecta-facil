<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faSearch, faLayerGroup, faFileAlt, faFolderOpen, faClockRotateLeft } from '@/lib/icons';
import PageShell from '@/components/PageShell.vue';
import StatCard from '@/components/StatCard.vue';
import SectorCard from './SectorCard.vue';
import NuevoSectorModal from './NuevoSectorModal.vue';
import { useSectoresQuery } from '@/composables/useSectores';
import { useActividadQuery } from '@/composables/useActividad';
import { useMetricas } from '@/composables/useMetricas';
import { tiempoRelativo } from '@/lib/tiempoRelativo';

const { data: sectores, isLoading } = useSectoresQuery();
const { data: actividad } = useActividadQuery();
const metricas = useMetricas();
const modalOpen = ref(false);
const busqueda = ref('');

const sectoresFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  const lista = sectores.value ?? [];
  if (!q) return lista;
  return lista.filter((s) => s.nombre.toLowerCase().includes(q));
});

const ultimaActualizacion = computed(() => {
  const ultima = actividad.value?.[0];
  return ultima ? tiempoRelativo(ultima.fecha) : '—';
});

// Ocultos a pedido — se dejan calculados por si se reactivan más adelante.
const mostrarStats = false;
</script>

<template>
  <PageShell
    :icon="faLayerGroup"
    title="Sectores"
    description="Cada sector agrupa las plantillas del ámbito del Estado correspondiente."
  >
    <template #actions>
      <div class="relative">
        <FontAwesomeIcon :icon="faSearch" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar sector..."
          class="w-56 pl-10 pr-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400/60"
        />
      </div>
      <button
        @click="modalOpen = true"
        class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shrink-0"
      >
        <FontAwesomeIcon :icon="faPlus" class="w-3.5 h-3.5" />
        Nuevo sector
      </button>
    </template>

    <template v-if="mostrarStats" #stats>
      <StatCard :icon="faLayerGroup" :value="metricas.totalSectores" label="Sectores activos" color="#0d9488" />
      <StatCard :icon="faFileAlt" :value="metricas.totalPlantillas" label="Plantillas en total" color="#2563eb" />
      <StatCard :icon="faFolderOpen" :value="metricas.totalEjemplos" label="Ejemplos cargados" color="#059669" />
      <StatCard :icon="faClockRotateLeft" :value="ultimaActualizacion" label="Última actualización" color="#7c3aed" />
    </template>

    <p v-if="isLoading" class="text-sm text-muted">Cargando sectores…</p>
    <template v-else>
      <p v-if="sectoresFiltrados.length === 0" class="text-sm text-muted">No se encontraron sectores para "{{ busqueda }}".</p>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <SectorCard v-for="sector in sectoresFiltrados" :key="sector.id" :sector="sector" />
      </div>
    </template>

    <NuevoSectorModal :is-open="modalOpen" @close="modalOpen = false" />
  </PageShell>
</template>
