<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCalendarDays, faUserTie, faUsers, faCheck } from '@/lib/icons';
import { useInscribirseAMentoria } from '@/composables/useMentorias';
import { usePushActividad } from '@/composables/useActividad';
import { useUiStore } from '@/stores/ui';
import type { SesionMentoria } from '@/types';

const props = defineProps<{
  mentorias: SesionMentoria[];
  cuentaId: string;
}>();

const ui = useUiStore();
const inscribirse = useInscribirseAMentoria();
const pushActividad = usePushActividad();

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

const proximas = computed(() =>
  [...props.mentorias]
    .filter((m) => new Date(m.fechaISO).getTime() > Date.now())
    .sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime()),
);

async function handleUnirme(m: SesionMentoria) {
  await inscribirse.mutateAsync({ sesionId: m.id, cuentaId: props.cuentaId });
  await pushActividad.mutateAsync({ mensaje: `Te uniste a la mentoría "${m.tema}"`, color: 'blue' });
  ui.toast(`Te uniste a "${m.tema}"`);
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="m in proximas" :key="m.id" class="bg-surface-card rounded-xl shadow-card p-5 flex flex-col">
      <p class="text-sm font-semibold text-heading mb-3 flex-1">{{ m.tema }}</p>
      <div class="space-y-1.5 text-xs text-muted mb-4">
        <div class="flex items-center gap-2">
          <FontAwesomeIcon :icon="faUserTie" class="w-3 h-3 shrink-0" />
          {{ m.mentor }}
        </div>
        <div class="flex items-center gap-2">
          <FontAwesomeIcon :icon="faCalendarDays" class="w-3 h-3 shrink-0" />
          {{ formatearFecha(m.fechaISO) }}
        </div>
        <div class="flex items-center gap-2">
          <FontAwesomeIcon :icon="faUsers" class="w-3 h-3 shrink-0" />
          {{ m.cuposTotales - m.inscritos.length <= 0 ? 'Sin cupos disponibles' : `${m.cuposTotales - m.inscritos.length} cupos disponibles` }}
        </div>
      </div>
      <button
        @click="handleUnirme(m)"
        :disabled="m.inscritos.includes(cuentaId) || m.cuposTotales - m.inscritos.length <= 0"
        type="button"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-75 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        :class="m.inscritos.includes(cuentaId) ? 'bg-brand-50 text-brand-700 disabled:opacity-100' : 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40'"
      >
        <FontAwesomeIcon v-if="m.inscritos.includes(cuentaId)" :icon="faCheck" class="w-3.5 h-3.5" />
        {{ m.inscritos.includes(cuentaId) ? 'Inscrito' : m.cuposTotales - m.inscritos.length <= 0 ? 'Sin cupos' : 'Unirme' }}
      </button>
    </div>
    <p v-if="proximas.length === 0" class="text-sm text-muted col-span-full text-center py-8">
      No hay próximas sesiones programadas.
    </p>
  </div>
</template>
