<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faComments, faPaperPlane, faCircleQuestion } from '@/lib/icons';
import { useEnviarPreguntaMentoria } from '@/composables/useMentorias';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useUiStore } from '@/stores/ui';
import { tiempoRelativo } from '@/lib/tiempoRelativo';
import type { SesionMentoria } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  sesion: SesionMentoria;
  usuarioId: string;
}>();

const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const { data: usuariosData } = useUsuariosQuery();
const enviarPregunta = useEnviarPreguntaMentoria();
const pregunta = ref('');

const ordenadas = computed(() => [...props.sesion.preguntas].sort((a, b) => new Date(b.fechaPregunta).getTime() - new Date(a.fechaPregunta).getTime()));

function autorDe(usuarioId: string): string {
  return (usuariosData.value ?? []).find((u) => u.id === usuarioId)?.nombre ?? 'Usuario eliminado';
}

async function handleEnviar() {
  if (!pregunta.value.trim()) return;
  await enviarPregunta.mutateAsync({ sesionId: props.sesion.id, usuarioId: props.usuarioId, pregunta: pregunta.value.trim() });
  ui.toast('Tu pregunta quedó registrada — el mentor la responderá aquí mismo');
  pregunta.value = '';
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" @click.stop>
          <div class="flex items-center justify-between p-6 pb-4 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faComments" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Preguntas y respuestas</h2>
                <p class="text-sm text-muted truncate max-w-xs">{{ sesion.tema }}</p>
              </div>
            </div>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-4 overflow-y-auto flex-1">
            <p v-if="ordenadas.length === 0" class="text-sm text-muted text-center py-8">Todavía no hay preguntas en esta sesión.</p>
            <div v-else class="space-y-4">
              <div v-for="p in ordenadas" :key="p.id" class="rounded-lg border border-gray-100 p-3">
                <div class="flex items-start gap-2">
                  <FontAwesomeIcon :icon="faCircleQuestion" class="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-heading">{{ p.pregunta }}</p>
                    <p class="text-[11px] text-muted mt-0.5">{{ autorDe(p.usuarioId) }} · {{ tiempoRelativo(p.fechaPregunta) }}</p>
                  </div>
                </div>
                <div v-if="p.respuesta" class="mt-2 ml-5.5 pl-3 border-l-2 border-brand-200">
                  <p class="text-sm text-gray-700">{{ p.respuesta }}</p>
                  <p class="text-[11px] text-muted mt-0.5">{{ sesion.mentor }} · {{ p.fechaRespuesta ? tiempoRelativo(p.fechaRespuesta) : '' }}</p>
                </div>
                <p v-else class="mt-2 ml-5.5 pl-3 border-l-2 border-gray-200 text-xs text-muted italic">
                  Pendiente de respuesta del mentor
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 pt-4 border-t border-gray-100 shrink-0">
            <div class="flex gap-2">
              <input
                v-model="pregunta"
                @keydown.enter="handleEnviar"
                type="text"
                placeholder="Escribe tu pregunta para el mentor..."
                class="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <button
                @click="handleEnviar"
                :disabled="!pregunta.trim()"
                type="button"
                class="px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2 shrink-0"
              >
                <FontAwesomeIcon :icon="faPaperPlane" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: all 0.12s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(10px);
}
</style>
