<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { subtipoTablaLabels, faTriangleExclamation, faGear } from '@/lib/icons';
import { columnaFaltaCaptura } from '@/lib/campoValidation';
import FilasDinamicasColumnsEditor from './FilasDinamicasColumnsEditor.vue';
import MatrizPeriodosEditor from './MatrizPeriodosEditor.vue';
import JerarquicaColumnsEditor from './JerarquicaColumnsEditor.vue';
import AgrupadorConfigModal from './AgrupadorConfigModal.vue';
import { esJerarquica } from '@/lib/tableRowHelpers';
import type { ConfigTabla, SubtipoTabla } from '@/types';

const props = defineProps<{ config: ConfigTabla }>();
const emit = defineEmits<{ update: [ConfigTabla] }>();

const subtipos = Object.entries(subtipoTablaLabels) as [SubtipoTabla, string][];
const showAgrupadorConfig = ref(false);
const columnasSinPosicion = computed(() => props.config.columnas.filter(columnaFaltaCaptura).length);

// Proxy pasado como v-model:config a los 3 editores de columnas — cada uno solo necesita leer y
// reasignar `config.value`, sin tener que reenviar el evento `update` manualmente.
const config = computed({
  get: () => props.config,
  set: (v: ConfigTabla) => emit('update', v),
});

function updateCaptura(patch: Partial<NonNullable<ConfigTabla['captura']>>) {
  emit('update', { ...props.config, captura: { ...props.config.captura, ...patch } });
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Subtipo de tabla</label>
      <select
        :value="config.subtipo"
        @change="emit('update', { ...config, subtipo: ($event.target as HTMLSelectElement).value as SubtipoTabla })"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white"
      >
        <option v-for="[key, label] in subtipos" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div>
        <label class="block text-xs font-medium text-heading mb-1">Columna inicial</label>
        <input
          :value="config.captura?.columnaInicial ?? ''"
          @input="updateCaptura({ columnaInicial: ($event.target as HTMLInputElement).value })"
          type="text"
          placeholder="Ej. B"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-heading mb-1">Fila inicial (Excel)</label>
        <input
          :value="config.captura?.filaInicial ?? ''"
          @input="updateCaptura({ filaInicial: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined })"
          type="number"
          placeholder="Ej. 18"
          min="1"
          class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          :class="config.captura?.filaInicial ? 'border-gray-200' : 'border-amber-300'"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-heading mb-1">Filas base</label>
        <input
          :value="config.captura?.filasBase ?? ''"
          @input="updateCaptura({ filasBase: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined })"
          type="number"
          placeholder="Ej. 3"
          min="0"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
    </div>

    <div class="flex items-center justify-between">
      <label class="text-xs font-medium text-heading">Agrupar filas bajo encabezados</label>
      <div class="flex items-center gap-2">
        <button
          v-if="config.agrupador && !esJerarquica(config.subtipo)"
          @click="showAgrupadorConfig = true"
          type="button"
          title="Configurar fila de título de grupo"
          class="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-gray-50 transition-colors"
        >
          <FontAwesomeIcon :icon="faGear" class="w-3 h-3" />
        </button>
        <button
          @click="emit('update', { ...config, agrupador: !config.agrupador })"
          type="button"
          class="relative w-10 h-6 rounded-full transition-colors duration-100"
          :class="config.agrupador ? 'bg-brand-500' : 'bg-gray-300'"
        >
          <span class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-100" :class="config.agrupador ? 'left-4.5' : 'left-0.5'" />
        </button>
      </div>
    </div>

    <div v-if="config.subtipo === 'filas_dinamicas'" class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-heading mb-1">Filas iniciales</label>
        <input
          :value="config.filasIniciales ?? 3"
          @input="emit('update', { ...config, filasIniciales: Number(($event.target as HTMLInputElement).value) })"
          type="number"
          min="1"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-heading mb-1">Máx. filas</label>
        <input
          :value="config.maxFilas ?? ''"
          @input="emit('update', { ...config, maxFilas: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined })"
          type="number"
          placeholder="Sin límite"
          min="1"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
    </div>

    <MatrizPeriodosEditor v-if="config.subtipo === 'matriz_por_periodos'" v-model:config="config" />
    <JerarquicaColumnsEditor v-else-if="esJerarquica(config.subtipo)" v-model:config="config" />
    <FilasDinamicasColumnsEditor v-else v-model:config="config" />

    <p v-if="columnasSinPosicion > 0" class="flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
      <FontAwesomeIcon :icon="faTriangleExclamation" class="w-2.5 h-2.5 shrink-0" />
      {{ columnasSinPosicion }} columna{{ columnasSinPosicion === 1 ? '' : 's' }} sin posición en Excel — configúra{{ columnasSinPosicion === 1 ? 'la' : 'las' }} desde el engranaje de cada columna.
    </p>

    <AgrupadorConfigModal
      :is-open="showAgrupadorConfig"
      :abarca-columnas="config.agrupadorAbarcaColumnas ?? config.columnas.length"
      :total-columnas="config.columnas.length"
      @close="showAgrupadorConfig = false"
      @change="(v) => emit('update', { ...config, agrupadorAbarcaColumnas: v })"
    />
  </div>
</template>
