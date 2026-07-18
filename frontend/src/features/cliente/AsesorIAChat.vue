<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRobot, faXmark, faPaperPlane } from '@/lib/icons';
import { renderMarkdown } from '@/lib/markdown';
import { buscarEnGlosario, buscarEnAyudas } from '@/lib/glosarioIA';
import type { Plantilla } from '@/types';

const props = defineProps<{
  plantilla: Plantilla;
  seccionActivaId: string | null;
  permitido: boolean;
}>();

interface Mensaje {
  id: string;
  autor: 'asesor' | 'usuario';
  texto: string;
  fuente?: string;
}

let contadorMsg = 0;
const idMensaje = () => `msg-${++contadorMsg}`;

const abierto = ref(false);
const mensajes = ref<Mensaje[]>([]);
const escribiendo = ref(false);
const input = ref('');
const scrollRef = ref<HTMLElement | null>(null);

const seccionActiva = computed(() => props.plantilla.secciones.find((s) => s.id === props.seccionActivaId));

watch([mensajes, escribiendo], () => {
  nextTick(() => {
    scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' });
  });
}, { deep: true });

function agregarMensaje(autor: Mensaje['autor'], texto: string, fuente?: string) {
  mensajes.value.push({ id: idMensaje(), autor, texto, fuente });
}

function responderConRetraso(texto: string, fuente?: string) {
  escribiendo.value = true;
  setTimeout(() => {
    escribiendo.value = false;
    agregarMensaje('asesor', texto, fuente);
  }, 600);
}

function handleAbrir() {
  abierto.value = true;
  if (mensajes.value.length === 0) {
    const nombreSeccion = seccionActiva.value ? `${seccionActiva.value.numero} — ${seccionActiva.value.nombre}` : 'tu ficha';
    agregarMensaje('asesor', `Hola, soy tu asesor de llenado. Veo que estás en la sección **${nombreSeccion}**. Elige una subsección de abajo o escríbeme tu duda.`);
  }
}

function preguntarPorSubseccion(subId: string) {
  const sub = seccionActiva.value?.subsecciones.find((s) => s.id === subId);
  if (!sub) return;
  agregarMensaje('usuario', `¿Cómo lleno "${sub.codigo} — ${sub.nombre}"?`);
  responderConRetraso(
    sub.ayuda?.trim() || 'Todavía no hay ayuda cargada para esta subsección. Revisa el ejemplo de referencia arriba, o consúltalo con tu asesor humano en las mentorías grupales.',
    sub.ayuda?.trim() ? `Ayuda de ${sub.codigo} — ${sub.nombre}` : undefined,
  );
}

function enviarPregunta() {
  const pregunta = input.value.trim();
  if (!pregunta) return;
  agregarMensaje('usuario', pregunta);
  input.value = '';
  const respuesta = buscarEnGlosario(pregunta) ?? buscarEnAyudas(pregunta, props.plantilla.secciones);
  responderConRetraso(
    respuesta?.texto ?? 'No tengo una respuesta puntual para eso todavía. Revisa la ayuda de la subsección con el botón "?", o consúltalo con tu asesor humano.',
    respuesta?.fuente,
  );
}

function handleEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') enviarPregunta();
}
</script>

<template>
  <button
    v-if="!permitido"
    title="Asesor de IA 24/7 — disponible desde Nivel 1, actualiza tu plan"
    type="button"
    class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gray-300 text-white flex items-center justify-center shadow-lg cursor-not-allowed z-40"
  >
    <FontAwesomeIcon :icon="faRobot" class="w-5 h-5" />
  </button>

  <template v-else>
    <button
      v-if="!abierto"
      @click="handleAbrir"
      title="Asesor de IA 24/7"
      type="button"
      class="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors z-40"
    >
      <FontAwesomeIcon :icon="faRobot" class="w-5 h-5" />
      <span class="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
    </button>

    <div v-else class="fixed bottom-6 right-6 w-96 h-[520px] bg-white rounded-2xl shadow-modal border border-gray-200 flex flex-col z-40 overflow-hidden">
      <div class="shrink-0 px-4 py-3 bg-violet-600 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <FontAwesomeIcon :icon="faRobot" class="w-4 h-4" />
          <div>
            <p class="text-sm font-bold leading-tight">Asesor de IA</p>
            <p class="text-[10px] text-violet-100 leading-tight">Disponible 24/7</p>
          </div>
        </div>
        <button @click="abierto = false" type="button" class="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors duration-75">
          <FontAwesomeIcon :icon="faXmark" class="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref="scrollRef" class="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
        <div v-for="m in mensajes" :key="m.id" class="flex" :class="m.autor === 'usuario' ? 'justify-end' : 'justify-start'">
          <div
            class="max-w-[85%] rounded-xl px-3 py-2 text-xs"
            :class="m.autor === 'usuario' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700'"
          >
            <div v-if="m.autor === 'asesor'" v-html="renderMarkdown(m.texto)" />
            <template v-else>{{ m.texto }}</template>
            <p v-if="m.fuente" class="mt-1 text-[10px] text-violet-500 font-medium">📎 {{ m.fuente }}</p>
          </div>
        </div>
        <div v-if="escribiendo" class="flex justify-start">
          <div class="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-400 italic">Escribiendo…</div>
        </div>
        <div v-if="!escribiendo && seccionActiva && mensajes.length <= 1" class="flex flex-wrap gap-1.5 pt-1">
          <button
            v-for="sub in seccionActiva.subsecciones"
            :key="sub.id"
            @click="preguntarPorSubseccion(sub.id)"
            type="button"
            class="px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-medium hover:bg-violet-100 transition-colors duration-75"
          >
            {{ sub.codigo }} {{ sub.nombre }}
          </button>
        </div>
      </div>

      <div class="shrink-0 border-t border-gray-100 p-2 flex items-center gap-2">
        <input
          v-model="input"
          @keydown="handleEnter"
          type="text"
          placeholder="Escribe tu duda..."
          class="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button @click="enviarPregunta" type="button" class="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors duration-75 shrink-0">
          <FontAwesomeIcon :icon="faPaperPlane" class="w-3 h-3" />
        </button>
      </div>
    </div>
  </template>
</template>
