<script setup lang="ts">
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faUser, faCircleUser, faCreditCard } from '@/lib/icons';
import GeneralTab from './GeneralTab.vue';
import CuentaTab from './CuentaTab.vue';
import FacturacionTab from './FacturacionTab.vue';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: [] }>();

type Tab = 'general' | 'cuenta' | 'facturacion';

const tabs: { id: Tab; label: string; icon: IconDefinition }[] = [
  { id: 'general', label: 'General', icon: faUser },
  { id: 'cuenta', label: 'Cuenta', icon: faCircleUser },
  { id: 'facturacion', label: 'Facturación', icon: faCreditCard },
];

const tab = ref<Tab>('general');
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="relative bg-white rounded-2xl shadow-modal w-full max-w-3xl h-[600px] max-h-[85vh] flex overflow-hidden" @click.stop>
          <button
            @click="emit('close')"
            type="button"
            class="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100 z-10"
          >
            <FontAwesomeIcon :icon="faXmark" />
          </button>

          <div class="w-52 shrink-0 bg-gray-50 border-r border-gray-100 p-4">
            <h2 class="text-sm font-bold text-heading px-2 mb-4">Ajustes</h2>
            <nav class="space-y-1">
              <button
                v-for="t in tabs"
                :key="t.id"
                @click="tab = t.id"
                type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-75"
                :class="tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'"
              >
                <FontAwesomeIcon :icon="t.icon" class="w-3.5 text-center" />
                {{ t.label }}
              </button>
            </nav>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <GeneralTab v-if="tab === 'general'" />
            <CuentaTab v-else-if="tab === 'cuenta'" @close="emit('close')" />
            <FacturacionTab v-else-if="tab === 'facturacion'" />
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
