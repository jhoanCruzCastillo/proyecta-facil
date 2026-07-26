<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus, faPen, faTrash, faShieldHalved, faTags, faUserGear, rolUsuarioLabels } from '@/lib/icons';
import { rolesGestionablesPor } from '@/lib/permisos';
import { useSessionStore } from '@/stores/session';
import { useUsuariosQuery, useEliminarUsuario } from '@/composables/useUsuarios';
import { useTiposUsuarioQuery } from '@/composables/useTiposUsuario';
import { usePushActividad } from '@/composables/useActividad';
import { useFacturacionQuery } from '@/composables/useFacturacion';
import { numeroNivelDe } from '@/lib/planAcceso';
import { useUiStore } from '@/stores/ui';
import ConfirmModal from '@/components/ConfirmModal.vue';
import PageShell from '@/components/PageShell.vue';
import UsuarioModal from './UsuarioModal.vue';
import GestionarRolesModal from './GestionarRolesModal.vue';
import PermisosUsuarioModal from './PermisosUsuarioModal.vue';
import type { Usuario, RolUsuario } from '@/types';

const session = useSessionStore();
const ui = useUiStore();
const { data: usuariosData } = useUsuariosQuery();
const { data: tiposUsuarioData } = useTiposUsuarioQuery();
const eliminarUsuario = useEliminarUsuario();
const pushActividad = usePushActividad();

const usuarios = computed(() => usuariosData.value ?? []);
const tiposUsuario = computed(() => tiposUsuarioData.value ?? []);

const rolBadge: Record<RolUsuario, string> = {
  superusuario: 'bg-amber-50 text-amber-700 border border-amber-200',
  administrador: 'bg-brand-50 text-brand-700 border border-brand-200',
  docente: 'bg-violet-50 text-violet-700 border border-violet-200',
  cliente: 'bg-sky-50 text-sky-700 border border-sky-200',
};

const actorRol = computed(() => session.sesion?.rol ?? 'cliente');
const rolesVisibles = computed(() => rolesGestionablesPor(actorRol.value));
const lista = computed(() => usuarios.value.filter((u) => rolesVisibles.value.includes(u.rol)));

const showModal = ref(false);
const showRolesModal = ref(false);
const editTarget = ref<Usuario | null>(null);
const deleteTarget = ref<Usuario | null>(null);
const permisosTarget = ref<Usuario | null>(null);

// El nivel de plan del cliente (para calcular sus permisos IA/mentorías por defecto) vive bajo la
// facturación de la cuenta titular — un colaborador comparte el nivel de su titular.
const cuentaIdPermisos = computed(() => {
  const u = permisosTarget.value;
  return u && u.rol === 'cliente' ? (u.cuentaClienteId ?? u.id) : '';
});
const { data: facturacionPermisos } = useFacturacionQuery(cuentaIdPermisos);
const numeroNivelPermisos = computed(() => (cuentaIdPermisos.value ? numeroNivelDe(facturacionPermisos.value?.planId ?? 'nivel-1') : 0));

function handleNuevo() {
  editTarget.value = null;
  showModal.value = true;
}
function handleEditar(u: Usuario) {
  editTarget.value = u;
  showModal.value = true;
}
async function handleDelete() {
  if (!deleteTarget.value) return;
  await eliminarUsuario.mutateAsync(deleteTarget.value.id);
  await pushActividad.mutateAsync({ mensaje: `Se eliminó el usuario "${deleteTarget.value.nombre}"`, color: 'red' });
  ui.toast(`Usuario "${deleteTarget.value.nombre}" eliminado`);
  deleteTarget.value = null;
}
</script>

<template>
  <PageShell
    :icon="faUserGear"
    title="Usuarios y permisos"
    :description="actorRol === 'superusuario' ? 'Gestiona superusuarios, administradores, clientes y sus permisos' : 'Gestiona los clientes del sistema y sus permisos'"
    content-class="overflow-auto"
  >
    <template #actions>
      <button
        @click="showRolesModal = true"
        type="button"
        class="px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faTags" class="w-3.5 h-3.5" />
        Gestionar roles
      </button>
      <button
        @click="handleNuevo"
        type="button"
        class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faPlus" class="w-3.5 h-3.5" />
        Nuevo usuario
      </button>
    </template>

    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-100">
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Nombre</th>
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Usuario</th>
          <th class="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Rol</th>
          <th class="text-center text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in lista" :key="u.id" class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
          <td class="px-6 py-4 font-semibold text-heading text-sm">{{ u.nombre }}</td>
          <td class="px-4 py-4 text-sm text-gray-600 font-mono">{{ u.usuario }}</td>
          <td class="px-4 py-4">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="rolBadge[u.rol]">
              {{ tiposUsuario.find((t) => t.id === u.tipoUsuarioId)?.nombre ?? rolUsuarioLabels[u.rol] }}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-center gap-2">
              <button
                @click="permisosTarget = u"
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                <FontAwesomeIcon :icon="faShieldHalved" class="w-3 h-3" />
                Permisos
              </button>
              <button
                @click="handleEditar(u)"
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-sidebar hover:bg-heading transition-colors"
              >
                <FontAwesomeIcon :icon="faPen" class="w-3 h-3" />
                Editar
              </button>
              <button
                @click="deleteTarget = u"
                :disabled="u.id === session.sesion?.usuarioId"
                :title="u.id === session.sesion?.usuarioId ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'"
                type="button"
                class="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
              >
                <FontAwesomeIcon :icon="faTrash" class="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="lista.length === 0">
          <td colspan="4" class="px-6 py-8 text-center text-sm text-muted">No hay usuarios para mostrar.</td>
        </tr>
      </tbody>
    </table>

    <UsuarioModal :is-open="showModal" :actor-rol="actorRol" :usuario="editTarget" :usuarios="usuarios" @close="showModal = false" />

    <GestionarRolesModal :is-open="showRolesModal" @close="showRolesModal = false" />

    <PermisosUsuarioModal
      :is-open="!!permisosTarget"
      :usuario="permisosTarget"
      :numero-nivel="numeroNivelPermisos"
      @close="permisosTarget = null"
    />

    <ConfirmModal
      :is-open="!!deleteTarget"
      title="Eliminar usuario"
      :message="`¿Seguro que deseas eliminar a &quot;${deleteTarget?.nombre}&quot;? Esta acción no se puede deshacer.`"
      @confirm="handleDelete"
      @close="deleteTarget = null"
    />
  </PageShell>
</template>
