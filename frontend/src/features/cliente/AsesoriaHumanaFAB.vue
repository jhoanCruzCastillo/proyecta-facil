<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserTie, faClock } from '@/lib/icons';
import SolicitarAsesoriaModal from './SolicitarAsesoriaModal.vue';
import AsesoriaChatPanel from '@/features/asesoria/AsesoriaChatPanel.vue';
import { useSessionStore } from '@/stores/session';
import { useMisSolicitudesQuery } from '@/composables/useAsesoria';

// Botón flotante para pedirle ayuda a un docente humano (asesoría 1:1) — sibling de AsesorIAChat,
// en la esquina opuesta para no superponerse. Bifurca según el estado de la solicitud más
// reciente: sin solicitud → abre SolicitarAsesoriaModal; pendiente → indicador de espera; aceptada
// → abre el chat compartido (AsesoriaChatPanel).
const props = defineProps<{ ejemploId?: string }>();

const session = useSessionStore();
const clienteId = computed(() => session.sesion?.usuarioId ?? '');
const { data: solicitudes } = useMisSolicitudesQuery(clienteId, 'cliente');

const activasOPendientes = computed(() =>
  (solicitudes.value ?? []).filter((s) => s.estado === 'aceptada' || s.estado === 'pendiente'),
);
const solicitudActiva = computed(() => activasOPendientes.value.find((s) => s.estado === 'aceptada') ?? null);
const solicitudPendiente = computed(() => (!solicitudActiva.value ? activasOPendientes.value.find((s) => s.estado === 'pendiente') ?? null : null));

const showModal = ref(false);
const chatAbierto = ref(false);

function handleClick() {
  if (solicitudActiva.value) {
    chatAbierto.value = true;
  } else if (!solicitudPendiente.value) {
    showModal.value = true;
  }
}
</script>

<template>
  <button
    v-if="!chatAbierto"
    @click="handleClick"
    :title="solicitudPendiente ? 'Esperando que un docente acepte tu solicitud' : 'Solicitar asesoría a un docente'"
    type="button"
    class="fixed bottom-6 left-64 w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg transition-colors z-40"
    :class="solicitudPendiente ? 'bg-amber-500 cursor-default' : 'bg-brand-600 hover:bg-brand-700'"
  >
    <FontAwesomeIcon :icon="solicitudPendiente ? faClock : faUserTie" class="w-5 h-5" />
    <span v-if="solicitudActiva" class="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
  </button>

  <AsesoriaChatPanel
    v-if="chatAbierto && solicitudActiva"
    :solicitud="solicitudActiva"
    :usuario-actual-id="clienteId"
    :otra-parte-nombre="solicitudActiva.docenteNombre ?? 'Docente'"
    @close="chatAbierto = false"
    @finalizada="chatAbierto = false"
  />

  <SolicitarAsesoriaModal :is-open="showModal" :ejemplo-id="props.ejemploId" @close="showModal = false" @creada="showModal = false" />
</template>
