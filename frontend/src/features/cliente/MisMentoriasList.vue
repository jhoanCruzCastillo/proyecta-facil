<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCalendarDays, faUserTie, faVideo, faDoorOpen, faCirclePlay, faComments } from '@/lib/icons';
import { puedeVerPreguntasMentoria } from '@/lib/planAcceso';
import GrabacionMentoriaModal from './GrabacionMentoriaModal.vue';
import PreguntasMentoriaModal from './PreguntasMentoriaModal.vue';
import type { SesionMentoria } from '@/types';

const props = defineProps<{
  mentorias: SesionMentoria[];
  cuentaId: string;
  usuarioId: string;
  numeroNivel: number;
}>();

// Prototipo sin integración real de video — el botón "Entrar a la sesión" solo se habilita
// dentro de esta ventana alrededor del inicio programado (el enlace en sí siempre se muestra,
// como en una invitación real). Pasada la ventana, se ofrece la grabación en su lugar.
const VENTANA_ANTES_MIN = 15;
const VENTANA_DESPUES_MIN = 120;

function puedeEntrar(fechaISO: string): boolean {
  const inicio = new Date(fechaISO).getTime();
  const ahora = Date.now();
  return ahora >= inicio - VENTANA_ANTES_MIN * 60_000 && ahora <= inicio + VENTANA_DESPUES_MIN * 60_000;
}
function yaPaso(fechaISO: string): boolean {
  return Date.now() > new Date(fechaISO).getTime() + VENTANA_DESPUES_MIN * 60_000;
}
function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}
function nombrePlataforma(link: string): string {
  if (link.includes('zoom.us')) return 'Zoom';
  if (link.includes('meet.google.com')) return 'Google Meet';
  return 'Videollamada';
}

const grabacionAbierta = ref<SesionMentoria | null>(null);
const preguntasAbiertas = ref<SesionMentoria | null>(null);
const muestraPreguntas = computed(() => puedeVerPreguntasMentoria(props.numeroNivel));

const mias = computed(() =>
  [...props.mentorias].filter((m) => m.inscritos.includes(props.cuentaId)).sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime()),
);

const preguntasSesion = computed(() => props.mentorias.find((m) => m.id === preguntasAbiertas.value?.id) ?? preguntasAbiertas.value);
</script>

<template>
  <div class="bg-surface-card rounded-xl shadow-card overflow-hidden divide-y divide-gray-50">
    <div v-for="m in mias" :key="m.id" class="flex items-center gap-4 px-5 py-4">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-heading truncate">{{ m.tema }}</p>
        <p class="text-xs text-muted flex items-center gap-3 mt-0.5">
          <span class="flex items-center gap-1">
            <FontAwesomeIcon :icon="faUserTie" class="w-2.5 h-2.5" />
            {{ m.mentor }}
          </span>
          <span class="flex items-center gap-1">
            <FontAwesomeIcon :icon="faCalendarDays" class="w-2.5 h-2.5" />
            {{ formatearFecha(m.fechaISO) }}
          </span>
        </p>
        <p class="text-xs mt-1.5 flex items-center gap-1.5">
          <FontAwesomeIcon :icon="faVideo" class="w-3 h-3 text-gray-400 shrink-0" />
          <span class="text-gray-500">{{ nombrePlataforma(m.linkReunion) }}:</span>
          <a :href="m.linkReunion" target="_blank" rel="noopener noreferrer" class="text-brand-600 hover:underline truncate font-mono">
            {{ m.linkReunion }}
          </a>
        </p>
      </div>

      <button
        v-if="muestraPreguntas"
        @click="preguntasAbiertas = m"
        type="button"
        class="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75 flex items-center gap-1.5 shrink-0"
      >
        <FontAwesomeIcon :icon="faComments" class="w-3.5 h-3.5" />
        Preguntas{{ m.preguntas.length > 0 ? ` (${m.preguntas.length})` : '' }}
      </button>

      <template v-if="yaPaso(m.fechaISO)">
        <button
          v-if="m.grabacionUrl"
          @click="grabacionAbierta = m"
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-75 flex items-center gap-2 shrink-0 bg-brand-600 text-white hover:bg-brand-700"
        >
          <FontAwesomeIcon :icon="faCirclePlay" class="w-3.5 h-3.5" />
          Ver grabación
        </button>
        <span v-else class="px-4 py-2 rounded-lg text-sm font-medium shrink-0 bg-gray-100 text-gray-400">
          Grabación no disponible
        </span>
      </template>
      <a
        v-else
        :href="puedeEntrar(m.fechaISO) ? m.linkReunion : undefined"
        target="_blank"
        rel="noopener noreferrer"
        :title="!puedeEntrar(m.fechaISO) ? 'Disponible desde 15 minutos antes de que empiece' : undefined"
        :aria-disabled="!puedeEntrar(m.fechaISO)"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-75 flex items-center gap-2 shrink-0"
        :class="puedeEntrar(m.fechaISO) ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'"
      >
        <FontAwesomeIcon :icon="faDoorOpen" class="w-3.5 h-3.5" />
        Entrar a la sesión
      </a>
    </div>
    <p v-if="mias.length === 0" class="px-5 py-8 text-center text-sm text-muted">
      Todavía no te has unido a ninguna mentoría.
    </p>

    <GrabacionMentoriaModal
      :is-open="!!grabacionAbierta"
      :tema="grabacionAbierta?.tema ?? ''"
      @close="grabacionAbierta = null"
    />

    <PreguntasMentoriaModal
      v-if="preguntasSesion"
      :is-open="!!preguntasAbiertas"
      :sesion="preguntasSesion"
      :usuario-id="usuarioId"
      @close="preguntasAbiertas = null"
    />
  </div>
</template>
