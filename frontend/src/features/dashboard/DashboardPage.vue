<script setup lang="ts">
import { computed } from 'vue';
import { faLayerGroup, faFileAlt, faPencil } from '@/lib/icons';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import MetricCard from './MetricCard.vue';
import QuickAccessItem from './QuickAccessItem.vue';
import ActivityFeed from './ActivityFeed.vue';
import { useMetricas } from '@/composables/useMetricas';
import { useSessionStore } from '@/stores/session';

const metricas = useMetricas();
const session = useSessionStore();
const primerNombre = computed(() => session.sesion?.nombre.split(' ')[0] ?? '');
</script>

<template>
  <div class="p-8">
    <Breadcrumbs :items="[{ label: 'Inicio' }]" />

    <div>
      <h1 class="text-3xl font-bold text-heading mb-2">Bienvenido/a, {{ primerNombre }}</h1>
      <p class="text-muted mb-8">
        Administra los sectores, plantillas y ejemplos que alimentan el asistente de formulación.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <MetricCard :icon="faLayerGroup" :value="metricas.totalSectores" label="Sectores activos" color="#0d9488" bg-color="#ccfbf1" />
      <MetricCard :icon="faFileAlt" :value="metricas.totalPlantillas" label="Plantillas creadas" color="#2563eb" bg-color="#dbeafe" />
      <MetricCard :icon="faPencil" :value="metricas.totalEjemplos" label="Ejemplos cargados" color="#d97706" bg-color="#fef3c7" />
    </div>

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
  </div>
</template>
