<script setup lang="ts">
import { computed } from 'vue';
import { faHouse, faLayerGroup, faFileAlt, faPencil } from '@/lib/icons';
import PageShell from '@/components/PageShell.vue';
import StatCard from '@/components/StatCard.vue';
import QuickAccessItem from './QuickAccessItem.vue';
import ActivityFeed from './ActivityFeed.vue';
import { useMetricas } from '@/composables/useMetricas';
import { useSessionStore } from '@/stores/session';

const metricas = useMetricas();
const session = useSessionStore();
const primerNombre = computed(() => session.sesion?.nombre.split(' ')[0] ?? '');
</script>

<template>
  <PageShell
    :icon="faHouse"
    :title="`Bienvenido/a, ${primerNombre}`"
    description="Administra los sectores, plantillas y ejemplos que alimentan el asistente de formulación."
  >
    <template #stats>
      <StatCard :icon="faLayerGroup" :value="metricas.totalSectores" label="Sectores activos" color="#0d9488" />
      <StatCard :icon="faFileAlt" :value="metricas.totalPlantillas" label="Plantillas creadas" color="#2563eb" />
      <StatCard :icon="faPencil" :value="metricas.totalEjemplos" label="Ejemplos cargados" color="#d97706" />
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div class="lg:col-span-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Accesos directos</h3>
        <div class="space-y-3">
          <QuickAccessItem
            :icon="faLayerGroup"
            icon-color="#0d9488"
            icon-bg="#ccfbf1"
            title="Sectores"
            description="6 sectores · agrupan las plantillas por ámbito del Estado"
            to="/sectores"
          />
          <QuickAccessItem
            :icon="faFileAlt"
            icon-color="#2563eb"
            icon-bg="#dbeafe"
            title="Plantillas"
            description="Fichas técnicas 6A, 6B y formatos sectoriales"
            to="/sectores"
          />
          <QuickAccessItem
            :icon="faPencil"
            icon-color="#d97706"
            icon-bg="#fef3c7"
            title="Ejemplos cargados"
            description="Casos resueltos que alimentan el contexto de la IA"
            to="/sectores"
          />
        </div>
      </div>
      <div class="lg:col-span-2">
        <ActivityFeed />
      </div>
    </div>
  </PageShell>
</template>
