<script setup lang="ts">
import { ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch, faPlus, faCheck, faCircle, faInfoCircle, faTrash, faEye, faDownload, faBoxArchive, faCloudArrowUp } from '@/lib/icons';
import type { Ejemplo } from '@/types';

const props = defineProps<{
  ejemplos: Ejemplo[];
  activeEjemplo: Ejemplo | null;
}>();

const emit = defineEmits<{
  select: [ejemplo: Ejemplo];
  'new-example': [];
  preview: [ejemplo: Ejemplo];
  download: [ejemplo: Ejemplo];
  delete: [ejemplo: Ejemplo];
  'toggle-estado': [ejemplo: Ejemplo];
}>();

const search = ref('');
const filtered = computed(() =>
  props.ejemplos.filter(
    (ej) => ej.nombre.toLowerCase().includes(search.value.toLowerCase()) || ej.subtitulo.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="shrink-0 px-4 pt-4 pb-3 flex items-center justify-between gap-2">
      <span class="text-xs font-bold uppercase tracking-widest text-brand-600">
        Ejemplos · {{ ejemplos.length }}
      </span>
      <button
        @click="emit('new-example')"
        type="button"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors duration-75"
      >
        <FontAwesomeIcon :icon="faPlus" class="w-3 h-3" />
        Nuevo
      </button>
    </div>

    <div class="shrink-0 px-4 pb-3">
      <div class="relative">
        <FontAwesomeIcon :icon="faSearch" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar ejemplo..."
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-2 pb-2">
      <div
        v-for="ej in filtered"
        :key="ej.id"
        @click="emit('select', ej)"
        class="w-full flex items-start gap-2.5 px-3 py-2.5 mb-1 rounded-lg text-left cursor-pointer transition-colors duration-75"
        :class="activeEjemplo?.id === ej.id ? 'bg-brand-50 border border-brand-200' : 'border border-transparent hover:bg-gray-50'"
      >
        <FontAwesomeIcon :icon="faCircle" class="w-2 h-2 mt-1.5 shrink-0" :class="activeEjemplo?.id === ej.id ? 'text-green-500' : 'text-gray-300'" />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-heading truncate">{{ ej.nombre }}</div>
          <div class="text-xs text-muted truncate">{{ ej.subtitulo }} · {{ ej.detalle }}</div>
        </div>
        <div class="flex items-center gap-0.5 shrink-0">
          <FontAwesomeIcon v-if="activeEjemplo?.id === ej.id" :icon="faCheck" class="w-3.5 h-3.5 text-brand-600 mr-1" />
          <button
            @click.stop="emit('toggle-estado', ej)"
            type="button"
            :title="ej.estado === 'publicado' ? 'Volver a borrador' : 'Publicar ejemplo'"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors duration-75 mr-1"
            :class="ej.estado === 'publicado' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          >
            <FontAwesomeIcon :icon="ej.estado === 'publicado' ? faCloudArrowUp : faBoxArchive" class="w-2.5 h-2.5" />
            {{ ej.estado === 'publicado' ? 'Publicado' : 'Borrador' }}
          </button>
          <button
            @click.stop="emit('preview', ej)"
            type="button"
            class="flex w-7 h-7 rounded-md items-center justify-center text-gray-400 hover:bg-brand-100 hover:text-brand-600 transition-colors duration-75"
            title="Previsualizar"
          >
            <FontAwesomeIcon :icon="faEye" class="w-3.5 h-3.5" />
          </button>
          <button
            @click.stop="emit('download', ej)"
            type="button"
            class="flex w-7 h-7 rounded-md items-center justify-center text-gray-400 hover:bg-brand-100 hover:text-brand-600 transition-colors duration-75"
            title="Descargar Excel"
          >
            <FontAwesomeIcon :icon="faDownload" class="w-3.5 h-3.5" />
          </button>
          <button
            @click.stop="emit('delete', ej)"
            type="button"
            class="flex w-7 h-7 rounded-md items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors duration-75"
            title="Eliminar"
          >
            <FontAwesomeIcon :icon="faTrash" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p v-if="filtered.length === 0" class="px-3 py-6 text-center text-sm text-muted">No hay ejemplos que coincidan.</p>
    </div>

    <div class="shrink-0 border-t border-gray-100 px-4 py-3 flex items-start gap-2 text-[11px] text-muted">
      <FontAwesomeIcon :icon="faInfoCircle" class="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
      <span>
        Estos ejemplos alimentan el contexto de la IA.
        <strong class="text-heading">No reentrenan el modelo.</strong>
      </span>
    </div>
  </div>
</template>
