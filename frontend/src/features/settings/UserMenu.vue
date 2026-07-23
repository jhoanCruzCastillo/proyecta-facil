<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faGear, faHeadset, faCircleInfo, faRightFromBracket } from '@/lib/icons';
import { useSessionStore } from '@/stores/session';
import { rolUsuarioLabels } from '@/lib/icons';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useFacturacionQuery } from '@/composables/useFacturacion';
import { cuentaEfectivaDe } from '@/lib/permisos';
import { planes } from '@/data/planes';
import SimpleInfoModal from '@/components/SimpleInfoModal.vue';
import SettingsModal from './SettingsModal.vue';
import type { RolUsuario } from '@/types';

const rolColor: Record<RolUsuario, string> = {
  superusuario: 'text-amber-300',
  administrador: 'text-brand-400',
  docente: 'text-violet-300',
  cliente: 'text-sky-300',
};

function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

const session = useSessionStore();
const router = useRouter();
const menuAbierto = ref(false);
const showAjustes = ref(false);
const showContacto = ref(false);
const showInfo = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const { data: usuariosData } = useUsuariosQuery();
const cuentaId = computed(() => {
  if (session.sesion?.rol !== 'cliente') return '';
  return cuentaEfectivaDe(usuariosData.value ?? [], session.sesion);
});
const { data: facturacionData } = useFacturacionQuery(cuentaId);
const plan = computed(() => planes.find((p) => p.id === facturacionData.value?.planId));

function handleClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    menuAbierto.value = false;
  }
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));

function handleLogout() {
  session.logout();
  router.replace({ name: 'login' });
}
</script>

<template>
  <div v-if="session.sesion" ref="rootEl" class="relative px-4 py-4 border-t border-white/10">
    <Transition name="pop">
      <div
        v-if="menuAbierto"
        class="absolute left-3 right-3 bottom-full mb-2 bg-sidebar rounded-xl shadow-modal border border-white/10 overflow-hidden z-50"
      >
        <button
          @click="menuAbierto = false; showAjustes = true"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
        >
          <FontAwesomeIcon :icon="faGear" class="w-4 text-center" />
          Ajustes
        </button>
        <button
          @click="menuAbierto = false; showContacto = true"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
        >
          <FontAwesomeIcon :icon="faHeadset" class="w-4 text-center" />
          Contacto
        </button>
        <button
          @click="menuAbierto = false; showInfo = true"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
        >
          <FontAwesomeIcon :icon="faCircleInfo" class="w-4 text-center" />
          Más información
        </button>
        <div class="border-t border-white/10" />
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
        >
          <FontAwesomeIcon :icon="faRightFromBracket" class="w-4 text-center" />
          Cerrar sesión
        </button>
      </div>
    </Transition>

    <button
      @click="menuAbierto = !menuAbierto"
      class="w-full flex items-center gap-3 text-left rounded-lg hover:bg-white/5 transition-colors duration-75 -mx-1 px-1 py-1"
    >
      <div class="w-8 h-8 rounded-full bg-sidebar-active flex items-center justify-center text-xs font-bold shrink-0">
        {{ iniciales(session.sesion.nombre) }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate text-white">{{ session.sesion.nombre }}</div>
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="text-[11px] shrink-0" :class="rolColor[session.sesion.rol]">{{ rolUsuarioLabels[session.sesion.rol] }}</span>
          <span
            v-if="session.sesion.rol === 'cliente' && plan"
            class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 truncate"
            :title="`Plan Nivel ${plan.numeroNivel} — ${plan.nombre}`"
          >
            Nivel {{ plan.numeroNivel }}
          </span>
        </div>
      </div>
    </button>

    <Teleport to="body">
      <SettingsModal :is-open="showAjustes" @close="showAjustes = false" />

      <SimpleInfoModal :is-open="showContacto" @close="showContacto = false" :icon="faHeadset" title="Contacto">
        <p>¿Tienes dudas o encontraste un problema en el editor de plantillas?</p>
        <p>Comunícate con el equipo técnico de Proyecta Fácil a través de tu canal interno habitual.</p>
      </SimpleInfoModal>

      <SimpleInfoModal :is-open="showInfo" @close="showInfo = false" :icon="faCircleInfo" title="Más información">
        <p class="font-medium text-heading">Proyecta Fácil — Editor de plantillas</p>
        <p>
          Panel de administración para convertir fichas técnicas oficiales de inversión pública
          (Invierte.pe) en plantillas digitales, y cargar ejemplos resueltos que alimentan a la IA
          asistente del formulador.
        </p>
      </SimpleInfoModal>
    </Teleport>
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
