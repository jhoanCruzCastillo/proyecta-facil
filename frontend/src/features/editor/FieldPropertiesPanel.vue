<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLeaf } from '@/lib/icons';
import { fieldTypeIcons, fieldTypeLabels, faTriangleExclamation } from '@/lib/icons';
import { campoFaltaCaptura } from '@/lib/campoValidation';
import { parseCoords } from '@/lib/coords';
import TableColumnsEditor from './TableColumnsEditor.vue';
import CampoCoordenadasInput from '@/components/CampoCoordenadasInput.vue';
import type { Campo, TipoCampo, CapturaCampo, ConfigTabla } from '@/types';

const props = defineProps<{
  campo: Campo;
  autoFocusEtiqueta?: boolean;
  ejemplosCount: number;
}>();

const emit = defineEmits<{ update: [campoId: string, updates: Partial<Campo>] }>();

const allowedFieldTypes: TipoCampo[] = ['texto_corto', 'texto_largo', 'numero', 'decimal', 'fecha', 'booleano', 'mapa_coordenadas', 'tabla'];
const allFieldTypes = allowedFieldTypes.map((k) => [k, fieldTypeLabels[k]] as [TipoCampo, string]);

const defaultTableConfig: ConfigTabla = { subtipo: 'filas_dinamicas', columnas: [], filasIniciales: 3 };

const icon = computed(() => fieldTypeIcons[props.campo.tipo]);
const typeLabel = computed(() => fieldTypeLabels[props.campo.tipo]);
const isTable = computed(() => props.campo.tipo === 'tabla' || props.campo.tipo === 'tabla_jerarquica');
const faltaCaptura = computed(() => campoFaltaCaptura(props.campo));
const coords = computed(() => parseCoords(props.campo.valorEjemplo));

const etiquetaInput = ref<HTMLInputElement | null>(null);

function focusEtiqueta() {
  if (props.autoFocusEtiqueta) {
    etiquetaInput.value?.focus();
    etiquetaInput.value?.select();
  }
}
onMounted(focusEtiqueta);
watch(() => props.campo.id, () => nextTick(focusEtiqueta));

function update(updates: Partial<Campo>) {
  emit('update', props.campo.id, updates);
}

function updateCaptura(patch: Partial<CapturaCampo>) {
  update({
    captura: {
      columna: props.campo.captura?.columna ?? '',
      fila: props.campo.captura?.fila ?? 0,
      abarcaColumnas: props.campo.captura?.abarcaColumnas,
      abarcaFilas: props.campo.captura?.abarcaFilas,
      ...patch,
    },
  });
}

function handleTypeChange(e: Event) {
  const newType = (e.target as HTMLSelectElement).value as TipoCampo;
  const updates: Partial<Campo> = { tipo: newType };
  if ((newType === 'tabla' || newType === 'tabla_jerarquica') && !props.campo.configTabla) {
    updates.configTabla = { ...defaultTableConfig, subtipo: newType === 'tabla_jerarquica' ? 'jerarquica' : 'filas_dinamicas' };
  }
  update(updates);
}

function updateCoords(lat: number, lng: number) {
  update({ valorEjemplo: JSON.stringify({ lat, lng }) });
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="text-xs font-semibold uppercase tracking-widest text-muted">Propiedades del campo</h3>
      <span class="text-xs font-bold px-2 py-1 rounded bg-brand-100 text-brand-700">{{ campo.identificador }}</span>
    </div>

    <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
      <div class="w-10 h-10 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center">
        <FontAwesomeIcon :icon="icon" class="w-5 h-5" />
      </div>
      <div>
        <div class="font-semibold text-heading text-sm">{{ campo.etiqueta }}</div>
        <div class="text-xs text-muted">{{ typeLabel }}</div>
      </div>
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Identificador</label>
      <input
        :value="campo.identificador"
        @input="update({ identificador: ($event.target as HTMLInputElement).value })"
        type="text"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Etiqueta</label>
      <input
        ref="etiquetaInput"
        :value="campo.etiqueta"
        @input="update({ etiqueta: ($event.target as HTMLInputElement).value })"
        type="text"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Tipo de campo</label>
      <div class="relative">
        <select
          :value="campo.tipo"
          @change="handleTypeChange"
          class="w-full px-3 py-2 pl-9 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white"
        >
          <option v-for="[key, label] in allFieldTypes" :key="key" :value="key">{{ label }}</option>
        </select>
        <FontAwesomeIcon :icon="icon" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Comportamiento</label>
      <div class="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          @click="update({ editable: true })"
          type="button"
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75"
          :class="campo.editable ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400'"
        >
          Editable
        </button>
        <button
          @click="update({ editable: false, valorEjemplo: !isTable && !campo.valorEjemplo ? '=' : campo.valorEjemplo })"
          type="button"
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75"
          :class="!campo.editable ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400'"
        >
          Calculado
        </button>
      </div>
    </div>

    <div v-if="campo.editable && !isTable">
      <label class="block text-xs font-medium text-heading mb-1.5">Obligatorio para el cliente</label>
      <div class="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          @click="update({ requerido: false })"
          type="button"
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75"
          :class="!campo.requerido ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400'"
        >
          No
        </button>
        <button
          @click="update({ requerido: true })"
          type="button"
          class="flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75"
          :class="campo.requerido ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400'"
        >
          Sí
        </button>
      </div>
    </div>

    <div>
      <label class="block text-xs font-medium text-heading mb-1.5">Descripción / ayuda</label>
      <textarea
        :value="campo.descripcion || ''"
        @input="update({ descripcion: ($event.target as HTMLTextAreaElement).value })"
        rows="2"
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>

    <div v-if="campo.tipo === 'catalogo_simple' || campo.tipo === 'catalogo_encadenado'">
      <label class="block text-xs font-medium text-heading mb-1.5">Fuente de catálogo</label>
      <input
        :value="campo.fuenteCatalogo || ''"
        @input="update({ fuenteCatalogo: ($event.target as HTMLInputElement).value })"
        type="text"
        placeholder="Ej. UBIGEO, Niveles de gobierno..."
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
      />
    </div>

    <div v-if="!isTable" class="pt-3 border-t border-gray-100">
      <div class="flex items-center gap-2 mb-2">
        <label class="text-xs font-semibold uppercase tracking-widest text-muted">Ubicación en Excel</label>
        <span
          v-if="faltaCaptura"
          title="Sin columna/fila no se puede insertar el valor de este campo en el Excel"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold"
        >
          <FontAwesomeIcon :icon="faTriangleExclamation" class="w-2.5 h-2.5" />
          Obligatorio
        </span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-medium text-muted mb-1">Columna</label>
          <input
            :value="campo.captura?.columna || ''"
            @input="updateCaptura({ columna: ($event.target as HTMLInputElement).value })"
            type="text"
            placeholder="Ej. R"
            class="w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            :class="campo.captura?.columna ? 'border-gray-200' : 'border-amber-300'"
          />
        </div>
        <div>
          <label class="block text-[10px] font-medium text-muted mb-1">Fila</label>
          <input
            :value="campo.captura?.fila ?? ''"
            @input="updateCaptura({ fila: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : 0 })"
            type="number"
            placeholder="Ej. 9"
            min="1"
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            :class="campo.captura?.fila ? 'border-gray-200' : 'border-amber-300'"
          />
        </div>
        <div>
          <label class="block text-[10px] font-medium text-muted mb-1">Abarca columnas</label>
          <input
            :value="campo.captura?.abarcaColumnas ?? ''"
            @input="updateCaptura({ abarcaColumnas: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined })"
            type="number"
            placeholder="1"
            min="1"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <div>
          <label class="block text-[10px] font-medium text-muted mb-1">Abarca filas</label>
          <input
            :value="campo.captura?.abarcaFilas ?? ''"
            @input="updateCaptura({ abarcaFilas: ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined })"
            type="number"
            placeholder="1"
            min="1"
            class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      </div>
    </div>

    <div v-if="isTable" class="pt-3 border-t border-gray-100">
      <TableColumnsEditor
        :config="campo.configTabla || defaultTableConfig"
        @update="(configTabla) => update({ configTabla })"
      />
    </div>

    <div v-if="campo.tipo === 'mapa_coordenadas'" class="pt-3 border-t border-gray-100 space-y-2">
      <label class="block text-xs font-medium text-heading">Ubicación por defecto</label>
      <CampoCoordenadasInput :value="campo.valorEjemplo || ''" @change="update({ valorEjemplo: $event })" />
      <div v-if="coords" class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[10px] font-medium text-muted mb-1">Latitud</label>
          <input
            :value="coords?.lat ?? ''"
            @input="updateCoords(Number(($event.target as HTMLInputElement).value), coords?.lng ?? 0)"
            type="number"
            step="0.000001"
            class="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <div>
          <label class="block text-[10px] font-medium text-muted mb-1">Longitud</label>
          <input
            :value="coords?.lng ?? ''"
            @input="updateCoords(coords?.lat ?? 0, Number(($event.target as HTMLInputElement).value))"
            type="number"
            step="0.000001"
            class="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      </div>
    </div>

    <div class="bg-brand-50 rounded-xl p-4 flex items-start gap-3">
      <div class="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
        <FontAwesomeIcon :icon="faLeaf" class="w-4 h-4" />
      </div>
      <div>
        <div class="font-semibold text-heading text-sm">{{ ejemplosCount }} ejemplos asociados</div>
        <div class="text-xs text-muted">Valores de referencia para la IA</div>
      </div>
    </div>
  </div>
</template>
