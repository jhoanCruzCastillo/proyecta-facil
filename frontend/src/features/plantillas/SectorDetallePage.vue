<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faFileImport } from '@/lib/icons';
import { sectorIcons } from '@/lib/icons';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import PageShell from '@/components/PageShell.vue';
import PlantillaTable from './PlantillaTable.vue';
import NuevaPlantillaModal from './NuevaPlantillaModal.vue';
import ImportarJsonModal from './ImportarJsonModal.vue';
import { useSectorQuery, useSectoresQuery } from '@/composables/useSectores';
import { usePlantillasBySectorQuery, usePlantillasQuery } from '@/composables/usePlantillas';
import { useCrearPlantilla } from '@/composables/useSectorPlantillaActions';
import { usePushActividad } from '@/composables/useActividad';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';
import type { Seccion, TipoInstrumento, TipologiaIoarr } from '@/types';

const route = useRoute();
const sectorId = computed(() => route.params.sectorId as string);

const { data: sector } = useSectorQuery(sectorId);
const { data: plantillas } = usePlantillasBySectorQuery(sectorId);
const { data: todasPlantillas } = usePlantillasQuery();
const { data: todosSectores } = useSectoresQuery();

const session = useSessionStore();
const ui = useUiStore();
const crearPlantilla = useCrearPlantilla();
const pushActividad = usePushActividad();

const esSuperusuario = computed(() => session.sesion?.rol === 'superusuario');
const showModal = ref(false);
const showImportModal = ref(false);

const icon = computed(() => (sector.value ? sectorIcons[sector.value.icono] : undefined));

const todasFichasTecnicas = computed(() =>
  sector.value?.tipoSector === 'General'
    ? { plantillas: todasPlantillas.value ?? [], sectores: todosSectores.value ?? [] }
    : undefined,
);

async function handleCreate(
  codigo: string,
  nombre: string,
  descripcion: string,
  instrumento: TipoInstrumento,
  tipologiasIoarr: TipologiaIoarr[] | undefined,
) {
  await crearPlantilla.mutateAsync({
    codigo,
    nombre,
    descripcion,
    sectorId: sectorId.value,
    instrumento,
    tipologiasIoarr,
    cantidadSecciones: 0,
    cantidadEjemplos: 0,
    fechaActualizacion: new Date().toLocaleDateString('es-PE'),
    secciones: [],
  });
  await pushActividad.mutateAsync({ mensaje: `Se creó la plantilla ${codigo} — ${nombre}`, color: 'green' });
  ui.toast(`Plantilla "${codigo}" creada`);
}

async function handleImport(data: {
  codigo: string;
  nombre: string;
  instrumento: TipoInstrumento;
  tipologiasIoarr: TipologiaIoarr[] | undefined;
  secciones: Seccion[];
}) {
  await crearPlantilla.mutateAsync({
    codigo: data.codigo,
    nombre: data.nombre,
    descripcion: '',
    sectorId: sectorId.value,
    instrumento: data.instrumento,
    tipologiasIoarr: data.tipologiasIoarr,
    cantidadSecciones: data.secciones.length,
    cantidadEjemplos: 0,
    fechaActualizacion: new Date().toLocaleDateString('es-PE'),
    secciones: data.secciones,
  });
  await pushActividad.mutateAsync({ mensaje: `Se importó la plantilla ${data.codigo} — ${data.nombre} desde JSON`, color: 'green' });
  ui.toast(`Plantilla "${data.codigo}" importada`);
}
</script>

<template>
  <div v-if="!sector" class="p-8 text-white/60">Sector no encontrado</div>
  <PageShell
    v-else
    :icon="icon"
    :icon-color="sector.colorAccent"
    :title="sector.nombre"
    :description="sector.descripcion || `Gestiona las plantillas del sector ${sector.nombre}`"
    content-class="overflow-auto"
  >
    <template #breadcrumb>
      <Breadcrumbs dark class-name="" :items="[{ label: 'Sectores', to: '/sectores' }, { label: sector.nombre }]" />
    </template>

    <template #actions>
      <button
        v-if="esSuperusuario"
        @click="showImportModal = true"
        class="px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faFileImport" class="w-3.5 h-3.5" />
        Importar JSON
      </button>
      <button
        @click="showModal = true"
        class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faPlus" class="w-3.5 h-3.5" />
        Nueva plantilla
      </button>
    </template>

    <PlantillaTable :plantillas="plantillas ?? []" :todas-fichas-tecnicas="todasFichasTecnicas" />

    <NuevaPlantillaModal :is-open="showModal" @close="showModal = false" @create="handleCreate" />
    <ImportarJsonModal :is-open="showImportModal" @close="showImportModal = false" @import="handleImport" />
  </PageShell>
</template>
