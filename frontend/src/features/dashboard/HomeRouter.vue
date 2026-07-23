<script setup lang="ts">
import { useSessionStore } from '@/stores/session';
import DashboardPage from './DashboardPage.vue';
import MisFichasPage from '@/features/cliente/MisFichasPage.vue';
import DocenteHomePage from '@/features/docente/DocenteHomePage.vue';

const session = useSessionStore();
</script>

<template>
  <MisFichasPage v-if="session.sesion?.rol === 'cliente'" />
  <DocenteHomePage v-else-if="session.sesion?.rol === 'docente'" />
  <DashboardPage v-else />
</template>
