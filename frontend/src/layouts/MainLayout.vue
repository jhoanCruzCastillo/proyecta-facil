<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBars } from '@/lib/icons';
import { useUiStore } from '@/stores/ui';
import Sidebar from '@/components/Sidebar.vue';

const ui = useUiStore();
</script>

<template>
  <div class="min-h-screen bg-page bg-[url('/bg-cont.webp')] bg-cover bg-top bg-no-repeat bg-fixed">
    <Sidebar :hidden="ui.sidebarHidden" @hide="ui.hideSidebar" />

    <Transition name="pop">
      <button
        v-if="ui.sidebarHidden"
        @click="ui.showSidebar"
        class="fixed top-4 left-4 z-50 w-9 h-9 rounded-lg bg-sidebar text-white/90 hover:text-white hover:bg-sidebar-hover shadow-card flex items-center justify-center transition-colors duration-75"
        title="Mostrar menú"
      >
        <FontAwesomeIcon :icon="faBars" class="w-4 h-4" />
      </button>
    </Transition>

    <main
      class="min-h-screen transition-[margin-left] duration-150 ease-out"
      :class="ui.sidebarHidden ? 'ml-0' : 'ml-56'"
    >
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: all 0.12s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
