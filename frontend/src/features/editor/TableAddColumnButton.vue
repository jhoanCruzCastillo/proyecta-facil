<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus } from '@/lib/icons';

defineProps<{ rowSpan: number }>();
const emit = defineEmits<{ add: [name: string] }>();

const newColName = ref('');
const isAdding = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

function commit() {
  if (newColName.value.trim()) emit('add', newColName.value);
  newColName.value = '';
  isAdding.value = false;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && newColName.value.trim()) commit();
  if (e.key === 'Escape') { isAdding.value = false; newColName.value = ''; }
}

async function startAdding() {
  isAdding.value = true;
  await nextTick();
  inputRef.value?.focus();
}
</script>

<template>
  <th :rowspan="rowSpan" class="px-1 py-2 border border-gray-200 w-10 align-top">
    <input
      v-if="isAdding"
      ref="inputRef"
      v-model="newColName"
      @keydown="handleKeyDown"
      @blur="commit"
      type="text"
      placeholder="Nombre..."
      class="w-20 px-1.5 py-0.5 rounded border border-brand-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
    />
    <button
      v-else
      @click="startAdding"
      type="button"
      class="w-7 h-7 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-brand-300 hover:text-brand-500 transition-colors"
      title="Agregar columna"
    >
      <FontAwesomeIcon :icon="faPlus" class="w-3 h-3" />
    </button>
  </th>
</template>
