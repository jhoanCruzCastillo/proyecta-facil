<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { useActualizarPlantilla } from '@/composables/usePlantillas';
import { useEjemplosByPlantillaQuery } from '@/composables/useEjemplos';
import { useUiStore } from '@/stores/ui';
import type { Plantilla } from '@/types';

const props = defineProps<{ plantilla: Plantilla }>();

const actualizarPlantilla = useActualizarPlantilla();
const ui = useUiStore();
const activo = computed(() => !!props.plantilla.disponibleNivel0);

const { data: ejemplosData } = useEjemplosByPlantillaQuery(computed(() => props.plantilla.id));
const tieneSolucionario = computed(() => (ejemplosData.value ?? []).some((e) => !e.propietarioId));

function toggle() {
  const nuevoValor = !activo.value;
  actualizarPlantilla.mutate({ id: props.plantilla.id, data: { disponibleNivel0: nuevoValor } });
  if (nuevoValor && !tieneSolucionario.value) {
    ui.toast('Marcada para Nivel 0 — todavía no tiene un Ejemplo de referencia (solucionario) cargado en la pestaña Ejemplos', 'error');
  } else {
    ui.toast(nuevoValor ? 'Agregada al catálogo de práctica del Nivel 0' : 'Quitada del catálogo de práctica del Nivel 0');
  }
}
</script>

<template>
  <button
    @click="toggle"
    :title="activo ? 'Quitar de los ejercicios del plan Pedagógico (Nivel 0)' : 'Marcar como ejercicio de práctica del plan Pedagógico (Nivel 0)'"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors duration-75 shrink-0"
    :class="activo ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'"
  >
    <FontAwesomeIcon :icon="faGraduationCap" class="w-2.5 h-2.5" />
    Nivel 0
  </button>
</template>
