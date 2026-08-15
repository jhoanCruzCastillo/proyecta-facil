<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHouse, faPlus, faTrash, faInbox, faGraduationCap, faHeadset, faUserGroup, instrumentoIcons, instrumentoLabels } from '@/lib/icons';
import PageShell from '@/components/PageShell.vue';
import { useEjemplosQuery, useEliminarEjemplo, useActualizarEjemplo } from '@/composables/useEjemplos';
import { usePlantillasQuery } from '@/composables/usePlantillas';
import { useSectoresQuery } from '@/composables/useSectores';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useHistorialCambiosQuery } from '@/composables/useHistorialCambios';
import { usePushActividad } from '@/composables/useActividad';
import { useEstadoEntrenamiento } from '@/composables/useEstadoEntrenamiento';
import { useMisSolicitudesQuery } from '@/composables/useAsesoria';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';
import { cuentaEfectivaDe, puedeVerFicha } from '@/lib/permisos';
import { puedeVerHistorial } from '@/lib/planAcceso';
import { validarValoresPlantilla, calcularProgresoValores } from '@/lib/valorValidation';
import { tiempoRelativo } from '@/lib/tiempoRelativo';
import ConfirmModal from '@/components/ConfirmModal.vue';
import NuevaFichaClienteModal from './NuevaFichaClienteModal.vue';
import type { Ejemplo } from '@/types';

const estadoBadge: Record<string, string> = {
  'En progreso': 'bg-amber-50 text-amber-700 border border-amber-200',
  Completo: 'bg-brand-50 text-brand-700 border border-brand-200',
};

const showModal = ref(false);
const eliminarFicha = ref<Ejemplo | null>(null);

const session = useSessionStore();
const ui = useUiStore();
const router = useRouter();
const { data: ejemplosData } = useEjemplosQuery();
const { data: plantillasData } = usePlantillasQuery();
const { data: usuariosData } = useUsuariosQuery();
const { data: sectoresData } = useSectoresQuery();
const { data: historialData } = useHistorialCambiosQuery();
const eliminarEjemplo = useEliminarEjemplo();
const actualizarEjemplo = useActualizarEjemplo();
const pushActividad = usePushActividad();
const { esNivel0, vencido, diasRestantes, limiteFichas, limiteConsultas, numeroNivel } = useEstadoEntrenamiento();
const clienteId = computed(() => session.sesion?.usuarioId ?? '');
const { data: misSolicitudes } = useMisSolicitudesQuery(clienteId, 'cliente');
const consultasUsadas = computed(() => (misSolicitudes.value ?? []).length);
const consultasAgotadas = computed(() => consultasUsadas.value >= limiteConsultas.value);

const plantillas = computed(() => plantillasData.value ?? []);
const sectores = computed(() => sectoresData.value ?? []);
const usuarios = computed(() => usuariosData.value ?? []);
const historialCambios = computed(() => historialData.value ?? []);
const muestraHistorial = computed(() => puedeVerHistorial(numeroNivel.value));

const cuentaId = computed(() => (session.sesion ? cuentaEfectivaDe(usuarios.value, session.sesion) : null));
const esTitular = computed(() => !!session.sesion && session.sesion.usuarioId === cuentaId.value);
const hayColaboradoresActivos = computed(() => usuarios.value.some((u) => u.cuentaClienteId === cuentaId.value && u.estado !== 'inactivo'));

const misFichas = computed(() => {
  if (!cuentaId.value || !session.sesion) return [];
  return (ejemplosData.value ?? [])
    .filter((e) => e.propietarioId === cuentaId.value)
    .filter((e) => puedeVerFicha(e, session.sesion!.usuarioId, esTitular.value))
    .map((ejemplo) => {
      const plantilla = plantillas.value.find((p) => p.id === ejemplo.plantillaId);
      const sector = plantilla ? sectores.value.find((s) => s.id === plantilla.sectorId) : undefined;
      const completo = plantilla ? Object.keys(validarValoresPlantilla(plantilla, ejemplo.valores)).length === 0 : false;
      const progreso = plantilla ? calcularProgresoValores(plantilla, ejemplo.valores) : null;
      return { ejemplo, plantilla, sector, completo, progreso };
    })
    .filter((f) => !!f.plantilla);
});

async function handleToggleCompartida(ejemplo: Ejemplo) {
  const nuevoValor = !ejemplo.compartida;
  await actualizarEjemplo.mutateAsync({ id: ejemplo.id, data: { compartida: nuevoValor } });
  ui.toast(nuevoValor ? `"${ejemplo.nombre}" ahora es visible para tu equipo` : `"${ejemplo.nombre}" dejó de compartirse`);
}

const limiteAlcanzado = computed(() => misFichas.value.length >= limiteFichas.value);
const nuevaFichaBloqueada = computed(() => vencido.value || limiteAlcanzado.value);

async function handleEliminar() {
  if (!eliminarFicha.value) return;
  await eliminarEjemplo.mutateAsync(eliminarFicha.value.id);
  await pushActividad.mutateAsync({ mensaje: `Se eliminó la ficha "${eliminarFicha.value.nombre}"`, color: 'red' });
  ui.toast(`Ficha "${eliminarFicha.value.nombre}" eliminada`);
  eliminarFicha.value = null;
}

function ultimoCambioDe(ejemploId: string) {
  return historialCambios.value.find((c) => c.ejemploId === ejemploId);
}
</script>

<template>
  <PageShell :icon="faHouse" title="Mis fichas" description="Las fichas técnicas que has creado y llenado">
    <template #actions>
      <button
        @click="showModal = true"
        :disabled="nuevaFichaBloqueada"
        :title="vencido ? 'Tu plan de entrenamiento venció' : limiteAlcanzado ? `Alcanzaste el límite de ${limiteFichas} ${esNivel0 ? 'ejercicios' : 'plantillas simultáneas'} de tu plan` : undefined"
        type="button"
        class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faPlus" class="w-3.5 h-3.5" />
        Nueva ficha
      </button>
    </template>

    <div
      class="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs mb-6"
      :class="vencido ? 'bg-red-50 border-red-200 text-red-700' : limiteAlcanzado ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'"
    >
      <FontAwesomeIcon :icon="faGraduationCap" class="w-3.5 h-3.5 shrink-0" />
      <template v-if="esNivel0">
        <template v-if="vencido">Tu plan de entrenamiento venció — tus ejercicios quedaron en modo solo lectura.</template>
        <template v-else>
          Modo entrenamiento — Plan Pedagógico · {{ misFichas.length }}/{{ limiteFichas }} ejercicios · {{ diasRestantes }} día{{ diasRestantes === 1 ? '' : 's' }} restantes
        </template>
      </template>
      <template v-else>
        {{ misFichas.length }}/{{ limiteFichas }} plantillas simultáneas{{ limiteAlcanzado ? ' — compra "Plantilla adicional" en Facturación para sumar más' : '' }}
      </template>
    </div>

    <div
      class="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs mb-6"
      :class="consultasAgotadas ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-violet-50 border-violet-200 text-violet-700'"
    >
      <FontAwesomeIcon :icon="faHeadset" class="w-3.5 h-3.5 shrink-0" />
      {{ consultasUsadas }}/{{ limiteConsultas }} consulta{{ limiteConsultas === 1 ? '' : 's' }} con docente{{ consultasAgotadas ? ' — compra "Consultoría 1 a 1" en Facturación para sumar más' : ' disponibles' }}
    </div>

    <div class="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
      <div v-if="misFichas.length === 0" class="flex flex-col items-center justify-center py-16 text-center px-6">
        <div class="w-12 h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mb-3">
          <FontAwesomeIcon :icon="faInbox" class="w-5 h-5" />
        </div>
        <p class="text-sm font-medium text-heading">Todavía no tienes fichas</p>
        <p class="text-xs text-muted mt-1">Crea tu primera ficha para empezar a llenarla</p>
      </div>
      <div
        v-for="{ ejemplo, plantilla, sector, completo, progreso } in misFichas"
        :key="ejemplo.id"
        @click="router.push(`/mis-fichas/${ejemplo.id}`)"
        class="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors group"
      >
        <div class="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
          <FontAwesomeIcon :icon="instrumentoIcons[plantilla!.instrumento]" class="w-4 h-4" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold text-heading truncate">{{ ejemplo.nombre }}</p>
            <span v-if="plantilla!.disponibleNivel0" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium shrink-0">
              <FontAwesomeIcon :icon="faGraduationCap" class="w-2.5 h-2.5" />
              Práctica
            </span>
            <span v-if="ejemplo.compartida" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-medium shrink-0">
              <FontAwesomeIcon :icon="faUserGroup" class="w-2.5 h-2.5" />
              Compartida
            </span>
          </div>
          <p class="text-xs text-muted">{{ sector?.nombre ?? '—' }} · {{ instrumentoLabels[plantilla!.instrumento] }}</p>
          <p v-if="muestraHistorial && ultimoCambioDe(ejemplo.id)" class="text-[11px] text-gray-400 mt-0.5">
            Última edición: {{ usuarios.find((u) => u.id === ultimoCambioDe(ejemplo.id)!.usuarioId)?.nombre ?? 'Usuario eliminado' }} · {{ tiempoRelativo(ultimoCambioDe(ejemplo.id)!.fecha) }}
          </p>
        </div>
        <div v-if="progreso && progreso.total > 0" class="w-32 shrink-0">
          <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full bg-brand-500 rounded-full" :style="{ width: `${progreso.porcentaje}%` }" />
          </div>
          <p class="text-[11px] text-muted mt-1 text-right">{{ progreso.llenos }}/{{ progreso.total }} campos</p>
        </div>
        <span class="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" :class="estadoBadge[completo ? 'Completo' : 'En progreso']">
          {{ completo ? 'Completo' : 'En progreso' }}
        </span>
        <button
          v-if="esTitular && hayColaboradoresActivos"
          @click.stop="handleToggleCompartida(ejemplo)"
          :title="ejemplo.compartida ? 'Dejar de compartir con tu equipo' : 'Compartir con tu equipo'"
          type="button"
          class="w-8 h-8 rounded-md flex items-center justify-center transition-colors shrink-0"
          :class="ejemplo.compartida ? 'text-violet-600 hover:bg-violet-50' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'"
        >
          <FontAwesomeIcon :icon="faUserGroup" class="w-3.5 h-3.5" />
        </button>
        <button
          @click.stop="eliminarFicha = ejemplo"
          title="Eliminar ficha"
          type="button"
          class="w-8 h-8 rounded-md flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
        >
          <FontAwesomeIcon :icon="faTrash" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <NuevaFichaClienteModal :is-open="showModal" @close="showModal = false" />

    <ConfirmModal
      :is-open="!!eliminarFicha"
      title="Eliminar ficha"
      :message="`¿Seguro que deseas eliminar &quot;${eliminarFicha?.nombre}&quot;? Se perderá todo lo que hayas llenado. Esta acción no se puede deshacer.`"
      @confirm="handleEliminar"
      @close="eliminarFicha = null"
    />
  </PageShell>
</template>
