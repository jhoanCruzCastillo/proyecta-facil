<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBoxArchive, faCloudArrowUp } from '@/lib/icons';
import { useActualizarPlantilla } from '@/composables/usePlantillas';
import { useUiStore } from '@/stores/ui';
import type { Plantilla } from '@/types';

const props = defineProps<{ plantilla: Plantilla }>();

const actualizarPlantilla = useActualizarPlantilla();
const ui = useUiStore();
const publicado = computed(() => props.plantilla.estado === 'publicado');

function toggle() {
  const nuevoEstado = publicado.value ? 'archivado' : 'publicado';
  actualizarPlantilla.mutate({ id: props.plantilla.id, data: { estado: nuevoEstado } });
  ui.toast(nuevoEstado === 'publicado' ? `Plantilla "${props.plantilla.codigo}" publicada` : `Plantilla "${props.plantilla.codigo}" movida a borrador`);
}
</script>

<template>
  <button
    @click="toggle"
    :title="publicado ? 'Volver a borrador' : 'Publicar plantilla'"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors duration-75 shrink-0"
    :class="publicado ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
  >
    <FontAwesomeIcon :icon="publicado ? faCloudArrowUp : faBoxArchive" class="w-2.5 h-2.5" />
    {{ publicado ? 'Publicado' : 'Borrador' }}
  </button>
</template>
