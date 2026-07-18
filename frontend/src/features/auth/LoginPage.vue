<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faRightToBracket, faCircleExclamation } from '@/lib/icons';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';
import { rolUsuarioLabels } from '@/lib/icons';

const session = useSessionStore();
const ui = useUiStore();
const router = useRouter();

const usuario = ref('superuser');
const password = ref('Super#2026');
const showPassword = ref(false);
const error = ref('');

async function handleSubmit() {
  if (!usuario.value.trim() || !password.value) return;
  const nueva = await session.login(usuario.value, password.value);
  if (!nueva) {
    error.value = 'Usuario o contraseña incorrectos';
    password.value = '';
    return;
  }
  ui.toast(`Bienvenido, ${nueva.nombre} — ${rolUsuarioLabels[nueva.rol]}`);
  router.replace({ name: 'home' });
}
</script>

<template>
  <div class="min-h-screen flex bg-surface">
    <div class="hidden lg:flex flex-col justify-between w-[45%] bg-sidebar text-white p-12">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center font-bold">P</div>
        <div>
          <div class="font-bold leading-tight">Proyecta Fácil</div>
          <div class="text-xs text-white/60 leading-tight">Editor de plantillas</div>
        </div>
      </div>

      <div>
        <h1 class="text-3xl font-bold leading-snug mb-4">
          Plantillas digitales para la inversión pública
        </h1>
        <p class="text-white/70 text-sm leading-relaxed max-w-md">
          Convierte fichas técnicas oficiales de Invierte.pe en plantillas estructuradas y carga
          ejemplos resueltos que alimentan a la IA asistente.
        </p>
      </div>

      <p class="text-[11px] text-white/40">
        Directiva N.º 001-2019-EF/63.01 — Sistema Nacional de Programación Multianual y Gestión de
        Inversiones
      </p>
    </div>

    <div class="flex-1 flex items-center justify-center p-6">
      <form @submit.prevent="handleSubmit" class="w-full max-w-sm bg-surface-card rounded-2xl shadow-card p-8">
        <div class="lg:hidden w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white mb-4">
          P
        </div>
        <h2 class="text-xl font-bold text-heading mb-1">Iniciar sesión</h2>
        <p class="text-sm text-muted mb-6">Ingresa tus credenciales. Tu rol se detecta automáticamente.</p>

        <label class="block text-sm font-medium text-heading mb-1.5">Usuario</label>
        <div class="relative mb-4">
          <FontAwesomeIcon :icon="faUser" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="usuario"
            @input="error = ''"
            type="text"
            placeholder="nombre de usuario"
            autofocus
            class="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        <label class="block text-sm font-medium text-heading mb-1.5">Contraseña</label>
        <div class="relative mb-4">
          <FontAwesomeIcon :icon="faLock" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="password"
            @input="error = ''"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="w-full pl-10 pr-11 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-75"
            :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <FontAwesomeIcon :icon="showPassword ? faEyeSlash : faEye" class="w-3.5 h-3.5" />
          </button>
        </div>

        <p v-if="error" class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          <FontAwesomeIcon :icon="faCircleExclamation" class="w-3.5 h-3.5" />
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="!usuario.trim() || !password"
          class="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon :icon="faRightToBracket" class="w-3.5 h-3.5" />
          Iniciar sesión
        </button>

        <p class="text-[11px] text-muted text-center mt-6">
          Acceso para superusuarios, administradores y clientes autorizados.
        </p>
      </form>
    </div>
  </div>
</template>
