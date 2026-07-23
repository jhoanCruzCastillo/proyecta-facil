<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCartShopping, faComments, faUsers, faFileLines } from '@/lib/icons';
import { addOns } from '@/data/planes';
import type { AddOn, Plan } from '@/types';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

const addonIcons: Record<string, IconDefinition> = {
  'consultoria-1a1': faComments,
  'usuario-adicional': faUsers,
  'plantilla-adicional': faFileLines,
};

const props = defineProps<{
  plan: Plan;
  addons: Record<string, number>;
}>();

const emit = defineEmits<{ comprar: [addon: AddOn]; quitar: [addon: AddOn] }>();

function disponible(a: AddOn): boolean {
  return !a.nivelesDisponibles || a.nivelesDisponibles.includes(props.plan.numeroNivel);
}
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-heading mb-1">Add-ons</h3>
    <p class="text-xs text-muted mb-3">
      Servicios extra que se pagan por separado del plan — según tu nivel, puedes sumar usuarios
      colaboradores o plantillas simultáneas adicionales a los que ya incluye.
    </p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div
        v-for="a in addOns"
        :key="a.id"
        class="flex flex-col rounded-lg border border-gray-200 p-4"
        :class="!disponible(a) ? 'opacity-60' : ''"
      >
        <div class="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
          <FontAwesomeIcon :icon="addonIcons[a.id]" class="w-4 h-4" />
        </div>
        <p class="text-sm font-semibold text-heading">{{ a.nombre }}</p>
        <p class="text-xs text-muted mt-1 flex-1">{{ a.descripcion }}</p>
        <p class="text-lg font-bold text-heading mt-3">
          ${{ a.precio }} <span class="text-xs font-normal text-muted">{{ a.recurrente ? '/mes c/u' : 'c/u' }}</span>
        </p>
        <div v-if="(addons[a.id] ?? 0) > 0" class="flex items-center justify-between mt-2">
          <span class="text-xs text-brand-600 font-medium">
            {{ addons[a.id] }} contratado{{ (addons[a.id] ?? 0) > 1 ? 's' : '' }}
          </span>
          <button @click="emit('quitar', a)" type="button" class="text-xs text-red-500 hover:text-red-600 transition-colors duration-75">
            Quitar 1
          </button>
        </div>
        <button
          v-if="disponible(a)"
          @click="emit('comprar', a)"
          type="button"
          class="mt-3 px-4 py-2 rounded-md bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center justify-center gap-1.5"
        >
          <FontAwesomeIcon :icon="faCartShopping" class="w-3 h-3" />
          Comprar
        </button>
        <p v-else class="mt-3 text-[11px] text-center text-muted">
          Disponible desde Nivel {{ Math.min(...(a.nivelesDisponibles ?? [0])) }}
        </p>
      </div>
    </div>
  </div>
</template>
