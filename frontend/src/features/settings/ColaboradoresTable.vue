<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLock, faLockOpen, faPen, faTrash, faUserPlus } from '@/lib/icons';
import type { Plan, Usuario } from '@/types';

const props = defineProps<{
  colaboradores: Usuario[];
  plan: Plan;
  asientosComprados: number;
  asientosTotales: number;
}>();

const emit = defineEmits<{ toggleEstado: [usuario: Usuario]; editar: [usuario: Usuario]; eliminar: [usuario: Usuario]; agregar: [] }>();

const asientosLibres = () => props.asientosTotales - props.colaboradores.length;
const tituloAsientos = 'Compra más asientos de "Usuario adicional" para agregar otro colaborador';
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-1">
      <h3 class="text-sm font-semibold text-heading">Colaboradores</h3>
      <span class="text-xs text-muted">{{ colaboradores.length }} de {{ asientosTotales }} asientos usados</span>
    </div>
    <p class="text-xs text-muted mb-3">
      Personas que acceden con tu cuenta. Tu plan {{ plan.nombre }} incluye {{ plan.limiteUsuariosBase }}
      <template v-if="asientosComprados > 0"> + {{ asientosComprados }} de "Usuario adicional" comprados</template>.
    </p>
    <div class="rounded-lg border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left font-medium text-muted px-4 py-2">Nombre</th>
            <th class="text-left font-medium text-muted px-4 py-2">Usuario</th>
            <th class="text-left font-medium text-muted px-4 py-2">Estado</th>
            <th class="text-center font-medium text-muted px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in colaboradores" :key="c.id" class="border-b border-gray-100 last:border-0">
            <td class="px-4 py-2.5 font-medium text-heading">{{ c.nombre }}</td>
            <td class="px-4 py-2.5 text-gray-600 font-mono">{{ c.usuario }}</td>
            <td class="px-4 py-2.5">
              <button
                @click="emit('toggleEstado', c)"
                type="button"
                class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full transition-colors duration-75"
                :class="c.estado === 'inactivo' ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100'"
              >
                <FontAwesomeIcon :icon="c.estado === 'inactivo' ? faLock : faLockOpen" class="w-2.5 h-2.5" />
                {{ c.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
              </button>
            </td>
            <td class="px-4 py-2.5">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="emit('editar', c)"
                  type="button"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
                </button>
                <button
                  @click="emit('eliminar', c)"
                  type="button"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <FontAwesomeIcon :icon="faTrash" class="w-3 h-3" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="colaboradores.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-sm text-muted">Todavía no agregaste colaboradores.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      @click="emit('agregar')"
      :disabled="asientosLibres() <= 0"
      :title="asientosLibres() <= 0 ? tituloAsientos : undefined"
      type="button"
      class="mt-3 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
    >
      <FontAwesomeIcon :icon="faUserPlus" class="w-3.5 h-3.5" />
      Agregar colaborador
    </button>
  </div>
</template>
