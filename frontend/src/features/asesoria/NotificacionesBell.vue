<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBell } from '@/lib/icons';
import { useSessionStore } from '@/stores/session';
import { useNotificacionesQuery, useMarcarNotificacionLeida } from '@/composables/useNotificaciones';
import { tiempoRelativo } from '@/lib/tiempoRelativo';
import type { NotificacionUsuario } from '@/types';

// Campanita visible en todo el admin (montada en Sidebar) — hoy solo la llena el flujo de
// asesoría (ver AsesoriaController::notificar en el backend), pero el inbox es genérico por si se
// reutiliza para otra cosa más adelante.
const session = useSessionStore();
const router = useRouter();
const usuarioId = computed(() => session.sesion?.usuarioId ?? '');

const { data: notificaciones } = useNotificacionesQuery(usuarioId);
const marcarLeida = useMarcarNotificacionLeida();

const abierto = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const noLeidas = computed(() => (notificaciones.value ?? []).filter((n) => !n.leidaEn).length);

function handleClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) abierto.value = false;
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));

function abrir(n: NotificacionUsuario) {
  if (!n.leidaEn) marcarLeida.mutate(n.id);
  abierto.value = false;
  router.push({ name: 'home' });
}
</script>

<template>
  <div ref="rootEl" class="relative px-4">
    <button
      @click="abierto = !abierto"
      type="button"
      class="w-full flex items-center gap-3 px-1 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:bg-sidebar-hover hover:text-white transition-colors relative"
    >
      <FontAwesomeIcon :icon="faBell" class="w-4 text-center" />
      <span class="flex-1 text-left">Notificaciones</span>
      <span v-if="noLeidas > 0" class="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
        {{ noLeidas > 9 ? '9+' : noLeidas }}
      </span>
    </button>

    <Transition name="pop">
      <div
        v-if="abierto"
        class="absolute left-3 right-3 bottom-full mb-2 bg-sidebar rounded-xl shadow-modal border border-white/10 overflow-hidden z-50 max-h-80 overflow-y-auto"
      >
        <p v-if="(notificaciones ?? []).length === 0" class="px-4 py-4 text-xs text-white/50 text-center">Sin notificaciones</p>
        <button
          v-for="n in notificaciones"
          :key="n.id"
          @click="abrir(n)"
          type="button"
          class="w-full flex items-start gap-2 px-4 py-2.5 text-left text-xs text-white/85 hover:bg-white/10 transition-colors duration-75 border-b border-white/5 last:border-0"
        >
          <span class="w-1.5 h-1.5 rounded-full mt-1 shrink-0" :class="n.leidaEn ? 'bg-transparent' : 'bg-brand-400'" />
          <span class="flex-1 min-w-0">
            <span class="block leading-snug">{{ n.mensaje }}</span>
            <span class="block text-[10px] text-white/40 mt-0.5">{{ tiempoRelativo(n.creadoEn) }}</span>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: all 0.1s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
