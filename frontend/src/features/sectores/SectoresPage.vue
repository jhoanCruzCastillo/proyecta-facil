<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus } from '@/lib/icons';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import SectorCard from './SectorCard.vue';
import NuevoSectorModal from './NuevoSectorModal.vue';
import { useSectoresQuery } from '@/composables/useSectores';

const { data: sectores, isLoading } = useSectoresQuery();
const modalOpen = ref(false);
</script>

<template>
  <div class="p-8">
    <Breadcrumbs :items="[{ label: 'Sectores' }]" />

    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-heading mb-2">Sectores</h1>
        <p class="text-muted">
          Cada sector agrupa las plantillas del ámbito del Estado correspondiente.
        </p>
      </div>
      <button
        @click="modalOpen = true"
        class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shrink-0"
      >
        <FontAwesomeIcon :icon="faPlus" class="w-3.5 h-3.5" />
        Nuevo sector
      </button>
    </div>

    <p v-if="isLoading" class="text-sm text-muted">Cargando sectores…</p>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <SectorCard v-for="sector in sectores" :key="sector.id" :sector="sector" />
    </div>

    <NuevoSectorModal :is-open="modalOpen" @close="modalOpen = false" />
  </div>
</template>
