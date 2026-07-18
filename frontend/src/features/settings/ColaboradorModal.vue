<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck } from '@/lib/icons';
import { useCrearUsuario, useActualizarUsuario } from '@/composables/useUsuarios';
import { usePushActividad } from '@/composables/useActividad';
import { generateId } from '@/api/mock/_shared';
import { useUiStore } from '@/stores/ui';
import type { Usuario, EstadoUsuario } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  cuentaClienteId: string;
  colaborador?: Usuario | null;
  usuarios: Usuario[];
}>();

const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const crearUsuario = useCrearUsuario();
const actualizarUsuario = useActualizarUsuario();
const pushActividad = usePushActividad();

const nombre = ref('');
const login = ref('');
const password = ref('');
const estado = ref<EstadoUsuario>('activo');
const error = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    nombre.value = props.colaborador?.nombre ?? '';
    login.value = props.colaborador?.usuario ?? '';
    password.value = '';
    estado.value = props.colaborador?.estado ?? 'activo';
    error.value = '';
  },
);

async function handleSubmit() {
  if (!nombre.value.trim() || !login.value.trim()) return;
  const esEdicion = !!props.colaborador;
  if (!esEdicion && !password.value.trim()) {
    error.value = 'La contraseña es obligatoria para un colaborador nuevo.';
    return;
  }
  const loginNormalizado = login.value.trim().toLowerCase();
  const duplicado = props.usuarios.some(
    (u) => u.usuario.toLowerCase() === loginNormalizado && u.id !== props.colaborador?.id,
  );
  if (duplicado) {
    error.value = 'Ya existe un usuario con ese nombre de acceso.';
    return;
  }

  if (esEdicion && props.colaborador) {
    await actualizarUsuario.mutateAsync({
      id: props.colaborador.id,
      data: {
        nombre: nombre.value.trim(),
        usuario: login.value.trim(),
        estado: estado.value,
        ...(password.value.trim() ? { password: password.value.trim() } : {}),
      },
    });
    await pushActividad.mutateAsync({ mensaje: `Se actualizó el colaborador "${nombre.value.trim()}"`, color: 'blue' });
    ui.toast(`Colaborador "${nombre.value.trim()}" actualizado`);
  } else {
    await crearUsuario.mutateAsync({
      id: generateId(),
      nombre: nombre.value.trim(),
      usuario: login.value.trim(),
      password: password.value.trim(),
      rol: 'cliente',
      estado: estado.value,
      cuentaClienteId: props.cuentaClienteId,
    });
    await pushActividad.mutateAsync({ mensaje: `Se agregó al colaborador "${nombre.value.trim()}"`, color: 'green' });
    ui.toast(`Colaborador "${nombre.value.trim()}" agregado`);
  }
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div>
              <h2 class="text-lg font-bold text-heading">{{ colaborador ? 'Editar colaborador' : 'Nuevo colaborador' }}</h2>
              <p class="text-sm text-muted">
                {{ colaborador ? 'Actualiza sus datos de acceso y estado' : 'Ocupa uno de los asientos de tu plan' }}
              </p>
            </div>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Nombre completo <span class="text-red-500">*</span>
              </label>
              <input
                v-model="nombre"
                type="text"
                placeholder="Ej. Ana Torres"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Usuario de acceso <span class="text-red-500">*</span>
              </label>
              <input
                v-model="login"
                type="text"
                placeholder="Ej. atorres"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Contraseña
                <span v-if="colaborador" class="text-muted font-normal">(dejar en blanco para no cambiarla)</span>
                <span v-else class="text-red-500">*</span>
              </label>
              <input
                v-model="password"
                type="password"
                :placeholder="colaborador ? '••••••••' : 'Contraseña nueva'"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">Estado</label>
              <div class="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  v-for="e in (['activo', 'inactivo'] as EstadoUsuario[])"
                  :key="e"
                  @click="estado = e"
                  type="button"
                  class="flex-1 px-3 py-2.5 text-sm font-medium capitalize transition-colors duration-75"
                  :class="estado === e ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'"
                >
                  {{ e }}
                </button>
              </div>
              <p class="text-xs text-muted mt-1">Un colaborador inactivo no puede iniciar sesión.</p>
            </div>

            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <p class="text-xs text-muted"><span class="text-red-500">*</span> Campos obligatorios</p>
              <div class="flex gap-3">
                <button @click="emit('close')" type="button" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                  Cancelar
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="!nombre.trim() || !login.trim()"
                  type="button"
                  class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                >
                  <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                  {{ colaborador ? 'Guardar cambios' : 'Agregar colaborador' }}
                </button>
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
