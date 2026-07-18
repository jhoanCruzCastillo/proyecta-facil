<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLightbulb, faTable, faImage, faAlignLeft } from '@/lib/icons';
import ExampleTableEditor from './ExampleTableEditor.vue';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { Campo, ConfigTabla } from '@/types';

const props = defineProps<{
  campo: Campo;
  isSelected?: boolean;
  clickable?: boolean;
  showExampleValue?: boolean;
  exampleValue?: string;
  /** true = el valor de ejemplo es editable (tab Ejemplos) */
  editableExample?: boolean;
  /** true = el valor por defecto es editable (tab Estructura) */
  editableDefault?: boolean;
}>();

const emit = defineEmits<{
  click: [];
  'update-example-value': [value: string];
  'update-default-value': [value: string];
}>();

const blockIcon: Partial<Record<Campo['tipo'], IconDefinition>> = {
  texto_largo: faAlignLeft,
  tabla: faTable,
  imagen: faImage,
};
const blockLabel: Partial<Record<Campo['tipo'], string>> = {
  texto_largo: 'Desarrollo en texto',
  tabla: 'Tabla',
  imagen: 'Imagen / esquema',
};

const icon = computed(() => blockIcon[props.campo.tipo] ?? faAlignLeft);
const label = computed(() => blockLabel[props.campo.tipo] ?? props.campo.tipo);
const isTable = computed(() => props.campo.tipo === 'tabla' || props.campo.tipo === 'tabla_jerarquica');
const displayValue = computed(() =>
  props.editableExample ? (props.exampleValue ?? '') : (props.exampleValue ?? props.campo.valorEjemplo ?? ''),
);

function handleClick() {
  if (props.clickable) emit('click');
}

function handleValueChange(v: string) {
  if (props.editableExample) emit('update-example-value', v);
  else if (props.editableDefault) emit('update-default-value', v);
}
</script>

<template>
  <div
    @click="handleClick"
    class="rounded-xl border-2 transition-all mb-4"
    :class="
      isSelected
        ? 'border-violet-400 shadow-sm cursor-pointer'
        : clickable
          ? 'border-gray-100 hover:border-violet-200 cursor-pointer bg-white'
          : 'border-gray-100 bg-white'
    "
  >
    <div class="flex items-center gap-3 px-4 py-3 rounded-t-xl" :class="isSelected ? 'bg-violet-50' : 'bg-gray-50'">
      <span class="text-sm font-bold font-mono" :class="isSelected ? 'text-violet-700' : 'text-gray-400'">
        {{ campo.identificador }}
      </span>
      <span class="text-sm font-semibold flex-1" :class="isSelected ? 'text-violet-800' : 'text-heading'">
        {{ campo.etiqueta }}
      </span>
      <span
        class="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
        :class="isSelected ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'"
      >
        <FontAwesomeIcon :icon="icon" class="w-2.5 h-2.5" />
        {{ label }}
      </span>
    </div>

    <div v-if="campo.descripcion" class="mx-4 mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
      <FontAwesomeIcon :icon="faLightbulb" class="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
      <p class="text-xs text-amber-800 leading-relaxed">{{ campo.descripcion }}</p>
    </div>

    <div class="p-4">
      <div v-if="showExampleValue || editableDefault" class="rounded-lg border" :class="showExampleValue ? 'border-violet-200 bg-violet-50/30' : 'border-gray-200 bg-gray-50'">
        <div class="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider" :class="showExampleValue ? 'text-violet-600' : 'text-gray-400'">
          {{ showExampleValue ? 'Desarrollo de ejemplo' : 'Contenido por defecto' }}
        </div>
        <div v-if="isTable && campo.configTabla" class="px-3 pb-3">
          <ExampleTableEditor
            :config="(campo.configTabla as ConfigTabla)"
            :model-value="displayValue"
            @update:model-value="handleValueChange"
          />
        </div>
        <textarea
          v-else
          :value="displayValue"
          @input="handleValueChange(($event.target as HTMLTextAreaElement).value)"
          @click.stop
          rows="4"
          :placeholder="`Desarrollar &quot;${campo.etiqueta}&quot;...`"
          class="w-full px-3 pb-3 text-sm text-heading bg-transparent resize-none focus:outline-none leading-relaxed"
        />
      </div>
      <div v-else class="h-12 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
        <span class="text-xs text-muted italic">Área de desarrollo — se llena en Ejemplos</span>
      </div>
    </div>
  </div>
</template>
