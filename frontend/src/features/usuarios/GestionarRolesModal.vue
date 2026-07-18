<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, faPen, faTrash, faTags } from '@/lib/icons';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useTiposUsuarioQuery, useCrearTipoUsuario, useActualizarTipoUsuario, useEliminarTipoUsuario } from '@/composables/useTiposUsuario';
import { generateId } from '@/api/mock/_shared';
import { useUiStore } from '@/stores/ui';
import type { TipoUsuario } from '@/types';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: [] }>();

const ui = useUiStore();
const { data: tiposUsuarioData } = useTiposUsuarioQuery();
const tiposUsuario = computed(() => tiposUsuarioData.value ?? []);
const crearTipo = useCrearTipoUsuario();
const actualizarTipo = useActualizarTipoUsuario();
const eliminarTipo = useEliminarTipoUsuario();

const nivelLabel: Record<TipoUsuario['nivelBase'], string> = { administrador: 'Administrador', cliente: 'Cliente' };
const nivelBadge: Record<TipoUsuario['nivelBase'], string> = {
  administrador: 'bg-brand-50 text-brand-700 border border-brand-200',
  cliente: 'bg-sky-50 text-sky-700 border border-sky-200',
};

const editId = ref<string | null>(null);
const nombre = ref('');
const nivelBase = ref<TipoUsuario['nivelBase']>('cliente');
const eliminarTarget = ref<TipoUsuario | null>(null);

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      editId.value = null;
      nombre.value = '';
      nivelBase.value = 'cliente';
    }
  },
);

function iniciarEdicion(t: TipoUsuario) {
  editId.value = t.id;
  nombre.value = t.nombre;
  nivelBase.value = t.nivelBase;
}

function cancelarEdicion() {
  editId.value = null;
  nombre.value = '';
  nivelBase.value = 'cliente';
}

async function handleGuardar() {
  if (!nombre.value.trim()) return;
  if (editId.value) {
    await actualizarTipo.mutateAsync({ id: editId.value, data: { nombre: nombre.value.trim(), nivelBase: nivelBase.value } });
    ui.toast(`Rol "${nombre.value.trim()}" actualizado`);
  } else {
    await crearTipo.mutateAsync({ id: generateId(), nombre: nombre.value.trim(), nivelBase: nivelBase.value });
    ui.toast(`Rol "${nombre.value.trim()}" creado`);
  }
  cancelarEdicion();
}

async function handleEliminar() {
  if (!eliminarTarget.value) return;
  await eliminarTipo.mutateAsync(eliminarTarget.value.id);
  ui.toast(`Rol "${eliminarTarget.value.nombre}" eliminado`);
  eliminarTarget.value = null;
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[85vh] overflow-y-auto" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon :icon="faTags" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Gestionar roles</h2>
                <p class="text-sm text-muted">Etiquetas personalizadas — cada una hereda el nivel de permisos de Administrador o Cliente</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 space-y-4">
            <div class="p-4 rounded-lg border border-gray-200 space-y-3">
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Nombre del rol</label>
                <input
                  v-model="nombre"
                  type="text"
                  placeholder="Ej. Soporte Técnico, Docente..."
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Nivel de permisos</label>
                <div class="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    v-for="n in (['administrador', 'cliente'] as const)"
                    :key="n"
                    @click="nivelBase = n"
                    type="button"
                    class="flex-1 px-3 py-2.5 text-sm font-medium transition-colors duration-75"
                    :class="nivelBase === n ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'"
                  >
                    {{ nivelLabel[n] }}
                  </button>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button
                  v-if="editId"
                  @click="cancelarEdicion"
                  type="button"
                  class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                >
                  Cancelar
                </button>
                <button
                  @click="handleGuardar"
                  :disabled="!nombre.trim()"
                  type="button"
                  class="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                >
                  <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                  {{ editId ? 'Guardar cambios' : 'Agregar rol' }}
                </button>
              </div>
            </div>

            <div class="rounded-lg border border-gray-200 divide-y divide-gray-100">
              <p v-if="tiposUsuario.length === 0" class="px-4 py-6 text-center text-sm text-muted">
                Todavía no creaste roles personalizados.
              </p>
              <div v-for="t in tiposUsuario" :key="t.id" class="flex items-center justify-between px-4 py-2.5">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-sm font-medium text-heading truncate">{{ t.nombre }}</span>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" :class="nivelBadge[t.nivelBase]">
                    {{ nivelLabel[t.nivelBase] }}
                  </span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    @click="iniciarEdicion(t)"
                    type="button"
                    class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    title="Editar"
                  >
                    <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
                  </button>
                  <button
                    @click="eliminarTarget = t"
                    type="button"
                    class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <FontAwesomeIcon :icon="faTrash" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <ConfirmModal
        :is-open="!!eliminarTarget"
        title="Eliminar rol"
        :message="`¿Seguro que deseas eliminar el rol &quot;${eliminarTarget?.nombre}&quot;? Los usuarios que lo tenían volverán a mostrar el nombre genérico (${eliminarTarget ? nivelLabel[eliminarTarget.nivelBase] : ''}).`"
        @confirm="handleEliminar"
        @close="eliminarTarget = null"
      />
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
