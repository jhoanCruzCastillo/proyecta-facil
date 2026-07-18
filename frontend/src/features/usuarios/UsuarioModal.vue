<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, faUserGear, rolUsuarioLabels } from '@/lib/icons';
import { rolesGestionablesPor } from '@/lib/permisos';
import { useTiposUsuarioQuery } from '@/composables/useTiposUsuario';
import { useCrearUsuario, useActualizarUsuario } from '@/composables/useUsuarios';
import { usePushActividad } from '@/composables/useActividad';
import { generateId } from '@/api/mock/_shared';
import { useUiStore } from '@/stores/ui';
import type { RolUsuario, Usuario } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  actorRol: RolUsuario;
  usuario?: Usuario | null;
  usuarios: Usuario[];
}>();

const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const { data: tiposUsuarioData } = useTiposUsuarioQuery();
const tiposUsuario = computed(() => tiposUsuarioData.value ?? []);
const crearUsuario = useCrearUsuario();
const actualizarUsuario = useActualizarUsuario();
const pushActividad = usePushActividad();

const rolesDisponibles = computed(() => rolesGestionablesPor(props.actorRol));
// Superusuario no es un tipo de usuario asignable desde este selector — es el rol raíz del
// sistema, no una simple etiqueta como Administrador/Cliente. Se protege aquí para que nadie
// pueda promoverse a sí mismo ni a otros, ni degradar por accidente al único superusuario.
const rolesSeleccionables = computed(() => rolesDisponibles.value.filter((r) => r !== 'superusuario'));
const esEdicion = computed(() => !!props.usuario);
const esSuperusuarioProtegido = computed(() => props.usuario?.rol === 'superusuario');

const nombre = ref('');
const login = ref('');
const password = ref('');
const rol = ref<RolUsuario>('cliente');
const tipoUsuarioId = ref('');
const error = ref('');

const tiposParaRol = computed(() => tiposUsuario.value.filter((t) => t.nivelBase === rol.value));

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    nombre.value = props.usuario?.nombre ?? '';
    login.value = props.usuario?.usuario ?? '';
    password.value = '';
    rol.value = props.usuario?.rol ?? rolesSeleccionables.value[rolesSeleccionables.value.length - 1] ?? 'cliente';
    tipoUsuarioId.value = props.usuario?.tipoUsuarioId ?? '';
    error.value = '';
  },
);

function handleCambiarRol(r: RolUsuario) {
  rol.value = r;
  // La etiqueta personalizada solo tiene sentido si pertenece al nivel de rol elegido.
  if (!tiposUsuario.value.some((t) => t.id === tipoUsuarioId.value && t.nivelBase === r)) tipoUsuarioId.value = '';
}

async function handleSubmit() {
  if (!nombre.value.trim() || !login.value.trim()) return;
  if (!esEdicion.value && !password.value.trim()) {
    error.value = 'La contraseña es obligatoria para un usuario nuevo.';
    return;
  }
  const loginNormalizado = login.value.trim().toLowerCase();
  const duplicado = props.usuarios.some(
    (u) => u.usuario.toLowerCase() === loginNormalizado && u.id !== props.usuario?.id,
  );
  if (duplicado) {
    error.value = 'Ya existe un usuario con ese nombre de acceso.';
    return;
  }

  const etiqueta = esSuperusuarioProtegido.value ? props.usuario?.tipoUsuarioId : (tipoUsuarioId.value || undefined);

  if (esEdicion.value && props.usuario) {
    await actualizarUsuario.mutateAsync({
      id: props.usuario.id,
      data: {
        nombre: nombre.value.trim(),
        usuario: login.value.trim(),
        rol: rol.value,
        tipoUsuarioId: etiqueta,
        ...(password.value.trim() ? { password: password.value.trim() } : {}),
      },
    });
    await pushActividad.mutateAsync({ mensaje: `Se actualizó el usuario "${nombre.value.trim()}"`, color: 'blue' });
    ui.toast(`Usuario "${nombre.value.trim()}" actualizado`);
  } else {
    await crearUsuario.mutateAsync({
      id: generateId(),
      nombre: nombre.value.trim(),
      usuario: login.value.trim(),
      password: password.value.trim(),
      rol: rol.value,
      tipoUsuarioId: etiqueta,
    });
    const etiquetaNombre = tiposUsuario.value.find((t) => t.id === etiqueta)?.nombre ?? rolUsuarioLabels[rol.value];
    await pushActividad.mutateAsync({ mensaje: `Se creó el usuario "${nombre.value.trim()}" (${etiquetaNombre})`, color: 'green' });
    ui.toast(`Usuario "${nombre.value.trim()}" creado (${etiquetaNombre})`);
  }
  emit('close');
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faUserGear" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">{{ esEdicion ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
                <p class="text-sm text-muted">{{ esEdicion ? 'Actualiza los datos de acceso y rol' : 'Crea un nuevo acceso al panel' }}</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
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
                placeholder="Ej. María Quispe"
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
                placeholder="Ej. mquispe"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Contraseña
                <span v-if="esEdicion" class="text-muted font-normal">(dejar en blanco para no cambiarla)</span>
                <span v-else class="text-red-500">*</span>
              </label>
              <input
                v-model="password"
                type="password"
                :placeholder="esEdicion ? '••••••••' : 'Contraseña nueva'"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div v-if="esSuperusuarioProtegido">
              <label class="block text-sm font-medium text-heading mb-1.5">Rol</label>
              <div class="px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
                Superusuario — este rol no se puede reasignar desde aquí.
              </div>
            </div>
            <template v-else-if="rolesSeleccionables.length > 1">
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Rol</label>
                <div class="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    v-for="r in rolesSeleccionables"
                    :key="r"
                    @click="handleCambiarRol(r)"
                    type="button"
                    class="flex-1 px-3 py-2.5 text-sm font-medium transition-colors duration-75"
                    :class="rol === r ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'"
                  >
                    {{ rolUsuarioLabels[r] }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">
                  Etiqueta <span class="text-muted font-normal">(opcional)</span>
                </label>
                <select
                  v-model="tipoUsuarioId"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white"
                >
                  <option value="">{{ rolUsuarioLabels[rol] }} (genérico)</option>
                  <option v-for="t in tiposParaRol" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                </select>
              </div>
            </template>

            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <p class="text-xs text-muted"><span class="text-red-500">*</span> Campos obligatorios</p>
              <div class="flex gap-3">
                <button @click="emit('close')" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                  Cancelar
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="!nombre.trim() || !login.trim()"
                  class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                >
                  <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                  {{ esEdicion ? 'Guardar cambios' : 'Crear usuario' }}
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
