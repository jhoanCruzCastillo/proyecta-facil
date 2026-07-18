<script setup lang="ts">
import { useSessionStore } from '@/stores/session';
import DashboardPage from './DashboardPage.vue';
import MisFichasPage from '@/features/cliente/MisFichasPage.vue';

const session = useSessionStore();
</script>

<template>
  <MisFichasPage v-if="session.sesion?.rol === 'cliente'" />
  <DashboardPage v-else />
</template>
