<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHouse, faLayerGroup, faAngleLeft, faUserGear, faFileCirclePlus, faChalkboardUser, faLock, faCalendarWeek } from '@/lib/icons';
import UserMenu from '@/features/settings/UserMenu.vue';
import NotificacionesBell from '@/features/asesoria/NotificacionesBell.vue';
import { useSessionStore } from '@/stores/session';
import { puedeAccederGestionUsuarios } from '@/lib/permisos';
import { puedeAccederMentorias } from '@/lib/planAcceso';
import { useEstadoEntrenamiento } from '@/composables/useEstadoEntrenamiento';
import logo from '@/assets/logo.png';

const session = useSessionStore();
const { numeroNivel } = useEstadoEntrenamiento();
const esCliente = computed(() => session.sesion?.rol === 'cliente');
const esDocente = computed(() => session.sesion?.rol === 'docente');
const mentoriasBloqueadas = computed(() => esCliente.value && !puedeAccederMentorias(numeroNivel.value));

const navItems = computed(() => {
  let items: { to: string; label: string; icon: typeof faHouse }[];
  if (esCliente.value) {
    items = [
      { to: '/', label: 'Mis fichas', icon: faHouse },
      { to: '/fichas-oficiales', label: 'Fichas oficiales', icon: faFileCirclePlus },
      { to: '/mentorias', label: 'Mentorías', icon: faChalkboardUser },
    ];
  } else if (esDocente.value) {
    items = [
      { to: '/', label: 'Solicitudes', icon: faHouse },
      { to: '/docente/horario', label: 'Mi horario', icon: faCalendarWeek },
    ];
  } else {
    items = [
      { to: '/', label: 'Inicio', icon: faHouse },
      { to: '/sectores', label: 'Sectores', icon: faLayerGroup },
    ];
  }
  if (session.sesion && puedeAccederGestionUsuarios(session.sesion.rol)) {
    items.push({ to: '/usuarios', label: 'Usuarios y permisos', icon: faUserGear });
  }
  return items;
});

defineProps<{ hidden?: boolean }>();
const emit = defineEmits<{ hide: [] }>();
</script>

<template>
  <aside
    class="fixed left-0 top-0 bottom-0 w-56 bg-sidebar text-white flex flex-col z-40 transition-transform duration-150 ease-out"
    :class="hidden ? '-translate-x-full' : 'translate-x-0'"
  >
    <div class="px-5 py-5 flex items-center gap-3 border-b border-white/10">
      <img :src="logo" alt="" class="w-9 h-9 object-contain shrink-0" />
      <div class="flex-1 min-w-0">
        <div class="font-bold text-sm leading-tight">
          <span class="text-white">Proyecta</span><span class="text-brand-400">Fácil</span>
        </div>
        <div class="text-[11px] text-white/50 leading-tight">Editor de plantillas</div>
      </div>
      <button
        @click="emit('hide')"
        class="w-7 h-7 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-sidebar-hover transition-colors duration-75 shrink-0"
        title="Ocultar menú"
      >
        <FontAwesomeIcon :icon="faAngleLeft" class="w-3.5 h-3.5" />
      </button>
    </div>

    <nav class="flex-1 px-3 pt-6">
      <p class="text-[10px] font-semibold uppercase tracking-widest text-white/40 px-3 mb-3">
        Navegación
      </p>
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.to">
          <RouterLink
            :to="item.to"
            custom
            v-slot="{ href, navigate, isExactActive }"
          >
            <a
              :href="href"
              @click="navigate"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="isExactActive ? 'bg-sidebar-active text-white shadow-card' : 'text-white/65 hover:bg-sidebar-hover hover:text-white'"
            >
              <FontAwesomeIcon :icon="item.icon" class="w-4 text-center" />
              <span class="flex-1">{{ item.label }}</span>
              <FontAwesomeIcon
                v-if="item.to === '/mentorias' && mentoriasBloqueadas"
                :icon="faLock"
                class="w-3 h-3 text-white/40"
                title="Disponible desde Nivel 1 — actualiza tu plan"
              />
            </a>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <NotificacionesBell v-if="session.sesion" />
    <UserMenu />
  </aside>
</template>
