<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faAlignLeft, faTable, faImage } from '@/lib/icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { Campo } from '@/types';

const props = defineProps<{
  campo: Campo;
  /** true = tab Estructura (edición habilitada) */
  editable?: boolean;
}>();

const emit = defineEmits<{ update: [campoId: string, updates: Partial<Campo>] }>();

type TipoBloque = 'texto_largo' | 'tabla' | 'imagen';

const tiposBloque: { value: TipoBloque; label: string; icon: IconDefinition }[] = [
  { value: 'texto_largo', label: 'Texto largo', icon: faAlignLeft },
  { value: 'tabla', label: 'Tabla', icon: faTable },
  { value: 'imagen', label: 'Imagen', icon: faImage },
];

function update(updates: Partial<Campo>) {
  if (props.editable) emit('update', props.campo.id, updates);
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-muted">Propiedades del bloque</h3>
      <span class="text-xs font-bold px-2 py-1 rounded bg-violet-100 text-violet-700 font-mono">{{ campo.identificador }}</span>
    </div>

    <div class="pb-4 border-b border-gray-100">
      <div class="font-semibold text-heading text-sm">{{ campo.etiqueta }}</div>
      <div class="text-xs text-muted mt-0.5">Apartado del Perfil</div>
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Numeral</label>
      <input
        :value="campo.identificador"
        @input="update({ identificador: ($event.target as HTMLInputElement).value })"
        type="text"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
      />
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Título del apartado</label>
      <input
        :value="campo.etiqueta"
        @input="update({ etiqueta: ($event.target as HTMLInputElement).value })"
        type="text"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
      />
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Tipo de contenido</label>
      <div class="flex gap-2">
        <button
          v-for="t in tiposBloque"
          :key="t.value"
          @click="update({ tipo: t.value })"
          type="button"
          class="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border-2 text-[11px] font-medium transition-colors duration-75"
          :class="campo.tipo === t.value ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:border-violet-200'"
        >
          <FontAwesomeIcon :icon="t.icon" class="w-4 h-4" />
          {{ t.label }}
        </button>
      </div>
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">
        Pauta / contenido mínimo
        <span class="text-muted font-normal ml-1">(guía del Anexo 07)</span>
      </label>
      <textarea
        :value="campo.descripcion || ''"
        @input="update({ descripcion: ($event.target as HTMLTextAreaElement).value })"
        rows="5"
        placeholder="Describe qué debe contener este apartado según el Anexo 07..."
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
      />
    </div>
  </div>
</template>
