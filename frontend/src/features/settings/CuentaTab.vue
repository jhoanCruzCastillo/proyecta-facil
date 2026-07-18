<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faDesktop } from '@/lib/icons';
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/session';

const emit = defineEmits<{ close: [] }>();

const session = useSessionStore();
const router = useRouter();

function detectarDispositivo(): string {
  const ua = navigator.userAgent;
  let navegador = 'Navegador';
  if (ua.includes('Edg/')) navegador = 'Edge';
  else if (ua.includes('Chrome/')) navegador = 'Chrome';
  else if (ua.includes('Firefox/')) navegador = 'Firefox';
  else if (ua.includes('Safari/')) navegador = 'Safari';

  let so = 'este equipo';
  if (ua.includes('Windows')) so = 'Windows';
  else if (ua.includes('Mac OS')) so = 'macOS';
  else if (ua.includes('Android')) so = 'Android';
  else if (ua.includes('Linux')) so = 'Linux';
  else if (ua.includes('iPhone') || ua.includes('iPad')) so = 'iOS';

  return `${navegador} · ${so}`;
}

function handleLogout() {
  emit('close');
  session.logout();
  router.replace({ name: 'login' });
}
</script>

<template>
  <div v-if="session.sesion" class="space-y-6">
    <div class="flex items-center justify-between py-3 border-b border-gray-100">
      <div>
        <p class="text-sm font-medium text-heading">Cerrar sesión</p>
        <p class="text-xs text-muted">Se cerrará tu sesión en este navegador</p>
      </div>
      <button
        @click="handleLogout"
        type="button"
        class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
      >
        Cerrar sesión
      </button>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-heading mb-1">Sesiones activas</h3>
      <p class="text-xs text-muted mb-3">Dispositivos donde tienes una sesión iniciada.</p>
      <div class="rounded-lg border border-gray-200 divide-y divide-gray-100">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon :icon="faDesktop" class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-heading">{{ detectarDispositivo() }}</p>
            <p class="text-xs text-muted">
              Iniciada el {{ session.sesion.iniciadaEn ? new Date(session.sesion.iniciadaEn).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : 'Desconocido' }}
            </p>
          </div>
          <span class="text-[10px] font-semibold px-2 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
            Actual
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
