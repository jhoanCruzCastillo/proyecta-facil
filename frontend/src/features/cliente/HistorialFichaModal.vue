<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faClockRotateLeft } from '@/lib/icons';
import { useHistorialFichaQuery } from '@/composables/useHistorialCambios';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { tiempoRelativo } from '@/lib/tiempoRelativo';

const props = defineProps<{
  isOpen: boolean;
  ejemploId: string;
}>();

const emit = defineEmits<{ close: [] }>();

const { data: cambiosData } = useHistorialFichaQuery(() => props.ejemploId);
const { data: usuariosData } = useUsuariosQuery();

const ordenados = computed(() => [...(cambiosData.value ?? [])].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));

function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function nombreDe(usuarioId: string): string {
  return (usuariosData.value ?? []).find((u) => u.id === usuarioId)?.nombre ?? 'Usuario eliminado';
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" @click.stop>
          <div class="flex items-center justify-between p-6 pb-4 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faClockRotateLeft" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Historial de cambios</h2>
                <p class="text-sm text-muted">Quién editó esta ficha y qué cambió</p>
              </div>
            </div>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 overflow-y-auto">
            <p v-if="ordenados.length === 0" class="text-sm text-muted text-center py-8">Todavía no hay cambios guardados.</p>
            <div v-else class="space-y-4">
              <div v-for="cambio in ordenados" :key="cambio.id" class="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {{ iniciales(nombreDe(cambio.usuarioId)) }}
                  </div>
                  <span class="text-sm font-medium text-heading">{{ nombreDe(cambio.usuarioId) }}</span>
                  <span class="text-xs text-muted">· {{ tiempoRelativo(cambio.fecha) }}</span>
                </div>
                <ul class="space-y-1 pl-9">
                  <li v-for="(c, i) in cambio.campos" :key="i" class="text-xs text-gray-600 leading-relaxed">
                    <span class="font-medium text-heading">{{ c.etiqueta }}</span>:
                    <span class="line-through text-gray-400">{{ c.valorAnterior || '(vacío)' }}</span>
                    →
                    <span class="text-brand-700 font-medium">{{ c.valorNuevo || '(vacío)' }}</span>
                  </li>
                </ul>
              </div>
            </div>
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
