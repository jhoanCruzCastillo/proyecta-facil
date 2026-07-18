<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck } from '@/lib/icons';
import { useSessionStore } from '@/stores/session';
import { useUsuariosQuery, useActualizarUsuario } from '@/composables/useUsuarios';
import { useUiStore } from '@/stores/ui';
import type { TemaPreferencia } from '@/types';

const temaOpciones: { id: TemaPreferencia; label: string }[] = [
  { id: 'claro', label: 'Claro' },
  { id: 'oscuro', label: 'Oscuro' },
  { id: 'sistema', label: 'Sistema' },
];

function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

const session = useSessionStore();
const ui = useUiStore();
const { data: usuariosData } = useUsuariosQuery();
const actualizarUsuario = useActualizarUsuario();
const usuario = computed(() => usuariosData.value?.find((u) => u.id === session.sesion?.usuarioId) ?? null);

const nombre = ref('');
const apodo = ref('');
const tema = ref<TemaPreferencia>('sistema');

watch(
  usuario,
  (u) => {
    nombre.value = u?.nombre ?? '';
    apodo.value = u?.apodo ?? '';
    tema.value = u?.tema ?? 'sistema';
  },
  { immediate: true },
);

async function handleGuardar() {
  if (!nombre.value.trim() || !usuario.value) return;
  await actualizarUsuario.mutateAsync({ id: usuario.value.id, data: { nombre: nombre.value.trim(), apodo: apodo.value.trim() || undefined, tema: tema.value } });
  session.actualizarNombreSesion(nombre.value.trim());
  ui.toast('Preferencias guardadas');
}
</script>

<template>
  <div v-if="session.sesion && usuario" class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-heading mb-2">Avatar</label>
      <div class="w-16 h-16 rounded-full bg-sidebar text-white flex items-center justify-center text-lg font-bold">
        {{ iniciales(nombre || usuario.nombre) }}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-heading mb-1.5">Nombre completo</label>
      <input
        v-model="nombre"
        type="text"
        class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-heading mb-1.5">¿Cómo quieres que te llame?</label>
      <input
        v-model="apodo"
        type="text"
        :placeholder="nombre.split(' ')[0] || 'Ej. Carlos'"
        class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-heading mb-1.5">Preferencia de tema</label>
      <div class="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
        <button
          v-for="op in temaOpciones"
          :key="op.id"
          @click="tema = op.id"
          type="button"
          class="px-4 py-2 text-sm font-medium transition-colors duration-75"
          :class="tema === op.id ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'"
        >
          {{ op.label }}
        </button>
      </div>
    </div>

    <div class="pt-4 border-t border-gray-100 flex justify-end">
      <button
        @click="handleGuardar"
        :disabled="!nombre.trim()"
        type="button"
        class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
        Guardar cambios
      </button>
    </div>
  </div>
</template>
