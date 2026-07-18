<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, faShieldHalved, faArrowRotateLeft, faCircleCheck, rolUsuarioLabels } from '@/lib/icons';
import { catalogoPermisos, permisosDe, permisosDefaultPorRol } from '@/lib/permisosCatalogo';
import { useActualizarUsuario } from '@/composables/useUsuarios';
import { useUiStore } from '@/stores/ui';
import type { Usuario, PermisoId } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  usuario: Usuario | null;
  numeroNivel: number;
}>();

const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const actualizarUsuario = useActualizarUsuario();
const seleccionados = ref<Set<PermisoId>>(new Set());

watch(
  [() => props.isOpen, () => props.usuario],
  ([open, usuario]) => {
    if (open && usuario) seleccionados.value = new Set(permisosDe(usuario, props.numeroNivel));
  },
);

function toggle(id: PermisoId) {
  const next = new Set(seleccionados.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  seleccionados.value = next;
}

function handleRestablecer() {
  if (!props.usuario) return;
  seleccionados.value = new Set(permisosDefaultPorRol(props.usuario.rol, props.numeroNivel));
}

async function handleGuardar() {
  if (!props.usuario) return;
  await actualizarUsuario.mutateAsync({ id: props.usuario.id, data: { permisos: Array.from(seleccionados.value) } });
  ui.toast(`Permisos de "${props.usuario.nombre}" actualizados`);
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen && usuario" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faShieldHalved" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Permisos de {{ usuario.nombre }}</h2>
                <p class="text-sm text-muted">
                  Rol: {{ rolUsuarioLabels[usuario.rol] }} — el rol es solo una etiqueta, esto es lo que realmente controla el acceso
                </p>
              </div>
            </div>
            <button @click="emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div v-if="usuario.rol === 'superusuario'" class="px-6 pb-6">
            <div class="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <FontAwesomeIcon :icon="faCircleCheck" class="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p class="text-sm text-amber-800">
                Los superusuarios siempre tienen acceso a todos los permisos del sistema — no se pueden restringir.
              </p>
            </div>
          </div>
          <template v-else>
            <div class="px-6 overflow-y-auto flex-1 space-y-5 pb-4">
              <div v-for="categoria in catalogoPermisos" :key="categoria.id">
                <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{{ categoria.nombre }}</p>
                <div class="space-y-1">
                  <label
                    v-for="permiso in categoria.permisos"
                    :key="permiso.id"
                    class="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-75"
                  >
                    <input
                      type="checkbox"
                      :checked="seleccionados.has(permiso.id)"
                      @change="toggle(permiso.id)"
                      class="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/30 shrink-0"
                    />
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-heading">{{ permiso.etiqueta }}</p>
                      <p class="text-xs text-muted">{{ permiso.descripcion }}</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                @click="handleRestablecer"
                type="button"
                class="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-75 flex items-center gap-1.5"
              >
                <FontAwesomeIcon :icon="faArrowRotateLeft" class="w-3 h-3" />
                Restablecer a los de su rol
              </button>
              <div class="flex gap-3">
                <button @click="emit('close')" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                  Cancelar
                </button>
                <button
                  @click="handleGuardar"
                  type="button"
                  class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
                >
                  <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                  Guardar permisos
                </button>
              </div>
            </div>
          </template>
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
