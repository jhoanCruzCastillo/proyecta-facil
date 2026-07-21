<script setup lang="ts">
import HierarchicalTableEditor from './HierarchicalTableEditor.vue';
import GroupedRowsEditor from './GroupedRowsEditor.vue';
import DynamicEditor from './DynamicEditor.vue';
import { esJerarquica } from '@/lib/tableRowHelpers';
import type { ConfigTabla } from '@/types';

// Despacha al editor correcto según subtipo/agrupador. Agregar/renombrar columnas dinámicas
// (columnas_dinamicas) se soporta desde los tres editores vía puedeEditarPeriodos; el resto de la
// configuración de columnas (tipo, captura, etc.) se edita solo desde TableColumnsEditor en el
// panel de propiedades.
defineProps<{
  config: ConfigTabla;
  modelValue: string;
  /** true = permite agregar/renombrar columnas dinámicas (solo tab Estructura) */
  puedeEditarPeriodos?: boolean;
}>();

defineEmits<{ 'update:modelValue': [string]; 'update:config': [ConfigTabla] }>();
</script>

<template>
  <HierarchicalTableEditor
    v-if="esJerarquica(config.subtipo)"
    :config="config"
    :model-value="modelValue"
    :puede-editar-periodos="puedeEditarPeriodos"
    @update:model-value="$emit('update:modelValue', $event)"
    @update:config="$emit('update:config', $event)"
  />
  <GroupedRowsEditor
    v-else-if="config.agrupador"
    :config="config"
    :model-value="modelValue"
    :puede-editar-periodos="puedeEditarPeriodos"
    @update:model-value="$emit('update:modelValue', $event)"
    @update:config="$emit('update:config', $event)"
  />
  <DynamicEditor
    v-else
    :config="config"
    :model-value="modelValue"
    :puede-editar-periodos="puedeEditarPeriodos"
    @update:model-value="$emit('update:modelValue', $event)"
    @update:config="$emit('update:config', $event)"
  />
</template>
