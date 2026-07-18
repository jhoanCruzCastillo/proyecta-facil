<script setup lang="ts">
import HierarchicalTableEditor from './HierarchicalTableEditor.vue';
import GroupedRowsEditor from './GroupedRowsEditor.vue';
import DynamicEditor from './DynamicEditor.vue';
import type { ConfigTabla } from '@/types';

// Despacha al editor correcto según subtipo/agrupador — el editor de configuración de columnas
// desde el tab Estructura llega a este mismo componente en una unidad futura (por ahora solo se
// invoca de solo-lectura de cabeceras desde el tab Ejemplos).
defineProps<{
  config: ConfigTabla;
  modelValue: string;
}>();

defineEmits<{ 'update:modelValue': [string] }>();
</script>

<template>
  <HierarchicalTableEditor
    v-if="config.subtipo === 'jerarquica'"
    :config="config"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />
  <GroupedRowsEditor
    v-else-if="config.agrupador"
    :config="config"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />
  <DynamicEditor
    v-else
    :config="config"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
