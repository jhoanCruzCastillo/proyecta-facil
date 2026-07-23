<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserTie, faXmark, faPaperPlane, faVideo, faArrowUpRightFromSquare, faCircleCheck } from '@/lib/icons';
import { useMensajesQuery, useEnviarMensaje, useFinalizarSolicitud } from '@/composables/useAsesoria';
import type { SolicitudAsesoria } from '@/types';

// Panel de chat compartido entre cliente y docente para una solicitud de asesoría ya aceptada —
// mismo patrón visual/interacción que AsesorIAChat.vue (panel flotante, lista de mensajes,
// auto-scroll, input+Enter), pero con mensajes reales por polling (useMensajesQuery,
// refetchInterval de 3s — no hay WebSockets en el proyecto) en vez de respuestas simuladas.
const props = defineProps<{
  solicitud: SolicitudAsesoria;
  usuarioActualId: string;
  otraParteNombre: string;
}>();

const emit = defineEmits<{ close: []; finalizada: [] }>();

const solicitudId = computed(() => props.solicitud.id);
const { data: mensajes } = useMensajesQuery(solicitudId);
const enviarMensaje = useEnviarMensaje();
const finalizarSolicitud = useFinalizarSolicitud();

const input = ref('');
const scrollRef = ref<HTMLElement | null>(null);
const finalizando = ref(false);

watch(mensajes, () => {
  nextTick(() => scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' }));
}, { deep: true });

function enviar() {
  const texto = input.value.trim();
  if (!texto) return;
  input.value = '';
  enviarMensaje.mutate({ solicitudId: solicitudId.value, autorId: props.usuarioActualId, texto });
}

function handleEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') enviar();
}

async function handleFinalizar() {
  finalizando.value = true;
  await finalizarSolicitud.mutateAsync(solicitudId.value);
  finalizando.value = false;
  emit('finalizada');
}
</script>

<template>
  <div class="fixed bottom-6 left-64 w-96 h-[520px] bg-white rounded-2xl shadow-modal border border-gray-200 flex flex-col z-40 overflow-hidden">
    <div class="shrink-0 px-4 py-3 bg-brand-600 text-white flex items-center justify-between">
      <div class="flex items-center gap-2 min-w-0">
        <FontAwesomeIcon :icon="faUserTie" class="w-4 h-4 shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-bold leading-tight truncate">{{ otraParteNombre }}</p>
          <p class="text-[10px] text-brand-100 leading-tight">{{ solicitud.tipo === 'video' ? 'Asesoría por videollamada' : 'Asesoría por chat' }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          @click="handleFinalizar"
          :disabled="finalizando"
          type="button"
          title="Finalizar asesoría"
          class="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors duration-75 disabled:opacity-50"
        >
          <FontAwesomeIcon :icon="faCircleCheck" class="w-3.5 h-3.5" />
        </button>
        <button @click="emit('close')" type="button" class="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors duration-75">
          <FontAwesomeIcon :icon="faXmark" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <a
      v-if="solicitud.tipo === 'video'"
      :href="solicitud.linkReunion || undefined"
      target="_blank"
      rel="noopener noreferrer"
      class="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors"
      :class="solicitud.linkReunion ? 'bg-violet-50 text-violet-700 hover:bg-violet-100 cursor-pointer' : 'bg-gray-50 text-gray-400 pointer-events-none'"
    >
      <FontAwesomeIcon :icon="faVideo" class="w-3 h-3" />
      {{ solicitud.linkReunion ? 'Unirse a la videollamada' : 'Esperando el link de la videollamada…' }}
      <FontAwesomeIcon v-if="solicitud.linkReunion" :icon="faArrowUpRightFromSquare" class="w-2.5 h-2.5" />
    </a>

    <div ref="scrollRef" class="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
      <p v-if="solicitud.mensajeInicial" class="text-[11px] text-gray-400 italic text-center px-4">"{{ solicitud.mensajeInicial }}"</p>
      <div
        v-for="m in mensajes ?? []"
        :key="m.id"
        class="flex"
        :class="m.autorId === usuarioActualId ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-xl px-3 py-2 text-xs"
          :class="m.autorId === usuarioActualId ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700'"
        >
          {{ m.texto }}
        </div>
      </div>
      <p v-if="(mensajes ?? []).length === 0" class="text-xs text-gray-400 text-center pt-4">Todavía no hay mensajes — escribe el primero.</p>
    </div>

    <div class="shrink-0 border-t border-gray-100 p-2 flex items-center gap-2">
      <input
        v-model="input"
        @keydown="handleEnter"
        type="text"
        placeholder="Escribe un mensaje..."
        class="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-300"
      />
      <button @click="enviar" type="button" class="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors duration-75 shrink-0">
        <FontAwesomeIcon :icon="faPaperPlane" class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>
