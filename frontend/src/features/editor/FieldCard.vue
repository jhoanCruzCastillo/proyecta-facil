<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fieldTypeIcons, fieldTypeLabels, subtipoTablaLabels, columnTypeLabels, faTriangleExclamation, faEllipsisVertical, faTrash, faLightbulb, faWandMagicSparkles, faSpinner } from '@/lib/icons';
import { campoFaltaCaptura } from '@/lib/campoValidation';
import { mejorarTexto } from '@/lib/mejoraTexto';
import ExampleTableEditor from './ExampleTableEditor.vue';
import CampoCoordenadasInput from '@/components/CampoCoordenadasInput.vue';
import type { Campo, ConfigTabla } from '@/types';

const props = defineProps<{
  campo: Campo;
  isSelected?: boolean;
  showExampleValue?: boolean;
  exampleValue?: string;
  /** true = muestra el editor de "valor por defecto" (solo tab Estructura) */
  editableDefault?: boolean;
  /** true = el valor de ejemplo es editable (tab Ejemplos) */
  editableExample?: boolean;
  clickable?: boolean;
  deletable?: boolean;
  showMenuButton?: boolean;
  highlightWarning?: boolean;
  /** Mensaje de validación del valor de ejemplo/cliente (solo modo cliente) */
  error?: string;
  /** Valor de un ejemplo de referencia autorado por el admin para este campo (solo modo cliente) */
  referenciaValor?: string;
  /** true = el plan del cliente incluye la ayuda de IA para mejorar títulos/textos (Nivel 1+); undefined = no mostrar el botón (modo admin) */
  permiteMejoraIA?: boolean;
}>();

const emit = defineEmits<{
  click: [];
  delete: [];
  'update-default-value': [value: string];
  'update-example-value': [value: string];
  'update-config-tabla': [config: ConfigTabla];
}>();

const icon = computed(() => fieldTypeIcons[props.campo.tipo]);
const typeLabel = computed(() => fieldTypeLabels[props.campo.tipo]);
const displayValue = computed(() => props.exampleValue ?? props.campo.valorEjemplo);
const isTableField = computed(() => props.campo.tipo === 'tabla' || props.campo.tipo === 'tabla_jerarquica');
const isCoordField = computed(() => props.campo.tipo === 'mapa_coordenadas');
const faltaCaptura = computed(() => campoFaltaCaptura(props.campo));
const esCampoTexto = computed(() => props.campo.tipo === 'texto_corto' || props.campo.tipo === 'texto_largo');
const esTextoLargo = computed(() => props.campo.tipo === 'texto_largo');

const sugerenciaIA = ref<string | null>(null);
const cargandoIA = ref(false);

function pedirMejoraIA() {
  cargandoIA.value = true;
  sugerenciaIA.value = null;
  setTimeout(() => {
    sugerenciaIA.value = mejorarTexto(displayValue.value || '');
    cargandoIA.value = false;
  }, 500);
}

function usarSugerencia() {
  if (sugerenciaIA.value === null) return;
  emit('update-example-value', sugerenciaIA.value);
  sugerenciaIA.value = null;
}

function handleClick() {
  if (props.clickable) emit('click');
}
</script>

<template>
  <div
    @click="handleClick"
    class="rounded-xl border-2 p-4 transition-all"
    :class="[
      faltaCaptura && highlightWarning
        ? 'border-red-400 bg-red-50/40 shadow-sm animate-pulse'
        : isSelected
          ? 'border-brand-500 bg-brand-50/30 shadow-sm'
          : 'border-gray-100 bg-white',
      clickable ? 'cursor-pointer' : '',
    ]"
  >
    <div class="flex items-start gap-3">
      <div
        class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        :class="isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-50 text-gray-400'"
      >
        <FontAwesomeIcon :icon="icon" class="w-4 h-4" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-1.5 py-0.5 rounded" :class="isSelected ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'">
            {{ campo.identificador }}
          </span>
          <span class="font-semibold text-heading text-sm">{{ campo.etiqueta }}</span>
          <span v-if="campo.requerido" class="text-red-500 text-sm" title="Obligatorio">*</span>
          <FontAwesomeIcon
            v-if="!campo.editable"
            :icon="fieldTypeIcons.calculado"
            class="w-3 h-3 text-gray-400"
            title="Campo calculado (solo lectura)"
          />
          <span
            v-if="faltaCaptura"
            title="Falta registrar su posición en el Excel (columna/fila) — no se insertará al Excel hasta configurarla"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold shrink-0"
          >
            <FontAwesomeIcon :icon="faTriangleExclamation" class="w-2.5 h-2.5" />
            Sin posición Excel
          </span>
        </div>
        <div class="text-xs text-muted mt-1 flex items-center gap-2">
          <span>{{ typeLabel }}</span>
          <span v-if="campo.fuenteCatalogo" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[11px]">
            {{ campo.fuenteCatalogo }}
          </span>
        </div>
        <div v-if="campo.tipo === 'catalogo_encadenado' && campo.cadena" class="flex flex-wrap items-center gap-1 mt-2">
          <span v-for="(step, i) in campo.cadena" :key="i" class="flex items-center gap-1">
            <span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{{ step }}</span>
            <span v-if="i < campo.cadena.length - 1" class="text-gray-300 text-xs">→</span>
          </span>
        </div>
        <div v-if="isTableField && campo.configTabla && campo.configTabla.columnas.length > 0" class="mt-2">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {{ subtipoTablaLabels[campo.configTabla.subtipo] }}
            </span>
            <span class="text-[10px] text-muted">· {{ campo.configTabla.columnas.length }} columnas</span>
          </div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="col in campo.configTabla.columnas"
              :key="col.id"
              class="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600"
              :title="columnTypeLabels[col.tipo]"
            >
              {{ col.nombre }}
            </span>
          </div>
        </div>

        <div v-if="editableDefault" class="mt-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200" @click.stop>
          <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500">Valor por defecto</span>
          <div v-if="isCoordField" class="mt-1.5">
            <CampoCoordenadasInput :value="campo.valorEjemplo || ''" @change="emit('update-default-value', $event)" />
          </div>
          <ExampleTableEditor
            v-else-if="isTableField && campo.configTabla"
            :config="(campo.configTabla as ConfigTabla)"
            :model-value="campo.valorEjemplo || ''"
            :puede-editar-periodos="true"
            @update:model-value="emit('update-default-value', $event)"
            @update:config="emit('update-config-tabla', $event)"
          />
          <textarea
            v-else-if="esTextoLargo"
            :value="campo.valorEjemplo || ''"
            @input="emit('update-default-value', ($event.target as HTMLTextAreaElement).value)"
            rows="1"
            placeholder="Valor inicial por defecto..."
            class="block w-full mt-1 px-2 py-1.5 rounded border border-gray-200 bg-white text-sm text-heading focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none overflow-y-auto max-h-[15lh] [field-sizing:content]"
          />
          <input
            v-else
            :value="campo.valorEjemplo || ''"
            @input="emit('update-default-value', ($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="!campo.editable ? '=1.01.1+1.02.3' : 'Valor inicial por defecto...'"
            class="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 bg-white text-sm text-heading focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
          />
        </div>

        <div v-if="showExampleValue" class="mt-2 p-2.5 rounded-lg bg-brand-100/70 border border-brand-200" @click.stop>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-brand-600">Valor de ejemplo</span>
            <button
              v-if="editableExample && esCampoTexto && permiteMejoraIA !== undefined"
              @click.stop="pedirMejoraIA"
              :disabled="!permiteMejoraIA || cargandoIA || !(displayValue || '').trim()"
              type="button"
              :title="!permiteMejoraIA ? 'Disponible desde Nivel 1 — actualiza tu plan' : undefined"
              class="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 hover:text-violet-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon :icon="cargandoIA ? faSpinner : faWandMagicSparkles" class="w-2.5 h-2.5" :class="cargandoIA ? 'animate-spin' : ''" />
              Mejorar con IA
            </button>
          </div>
          <div v-if="!editableExample" class="text-sm text-heading mt-0.5">
            {{ displayValue || '' }}
            <span v-if="!displayValue" class="text-muted italic">Sin valor</span>
          </div>
          <div v-else-if="isCoordField" class="mt-1.5">
            <CampoCoordenadasInput :value="displayValue || ''" :editable="editableExample" @change="emit('update-example-value', $event)" />
          </div>
          <ExampleTableEditor
            v-else-if="isTableField && campo.configTabla"
            :config="(campo.configTabla as ConfigTabla)"
            :model-value="displayValue || ''"
            @update:model-value="emit('update-example-value', $event)"
          />
          <template v-else>
            <textarea
              v-if="esTextoLargo"
              :value="displayValue || ''"
              @input="emit('update-example-value', ($event.target as HTMLTextAreaElement).value)"
              rows="1"
              placeholder="Escribe el valor de ejemplo..."
              class="block w-full mt-1 px-2 py-1.5 rounded border bg-white text-sm text-heading focus:outline-none focus:ring-2 resize-none overflow-y-auto max-h-[15lh] [field-sizing:content]"
              :class="error ? 'border-red-400 focus:ring-red-300 focus:border-red-400' : 'border-brand-200 focus:ring-brand-500/30 focus:border-brand-500'"
            />
            <input
              v-else
              :value="displayValue || ''"
              @input="emit('update-example-value', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Escribe el valor de ejemplo..."
              class="w-full mt-1 px-2 py-1.5 rounded border bg-white text-sm text-heading focus:outline-none focus:ring-2"
              :class="error ? 'border-red-400 focus:ring-red-300 focus:border-red-400' : 'border-brand-200 focus:ring-brand-500/30 focus:border-brand-500'"
            />
            <p v-if="error" class="mt-1 text-[11px] text-red-600 flex items-center gap-1">
              <FontAwesomeIcon :icon="faTriangleExclamation" class="w-2.5 h-2.5 shrink-0" />
              {{ error }}
            </p>
          </template>
          <div v-if="referenciaValor && referenciaValor.trim() && !isTableField && !isCoordField" class="mt-2 flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
            <FontAwesomeIcon :icon="faLightbulb" class="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-wider text-blue-500">Ejemplo de referencia</p>
              <p class="text-xs text-blue-900 mt-0.5 break-words whitespace-pre-wrap">{{ referenciaValor }}</p>
            </div>
            <button
              v-if="editableExample"
              @click.stop="emit('update-example-value', referenciaValor)"
              type="button"
              class="text-[11px] font-medium text-blue-600 hover:text-blue-800 shrink-0"
            >
              Usar
            </button>
          </div>
          <div v-if="sugerenciaIA !== null && esCampoTexto && editableExample" class="mt-2 flex items-start gap-2 p-2 rounded-lg bg-violet-50 border border-violet-100">
            <FontAwesomeIcon :icon="faWandMagicSparkles" class="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-wider text-violet-500">Sugerencia de IA</p>
              <p v-if="sugerenciaIA === (displayValue || '').trim()" class="text-xs text-violet-700 mt-0.5 italic">
                Tu redacción ya está clara — no encontramos mejoras.
              </p>
              <p v-else class="text-xs text-violet-900 mt-0.5 break-words whitespace-pre-wrap">{{ sugerenciaIA }}</p>
            </div>
            <button
              v-if="sugerenciaIA !== (displayValue || '').trim()"
              @click.stop="usarSugerencia"
              type="button"
              class="text-[11px] font-medium text-violet-600 hover:text-violet-800 shrink-0"
            >
              Usar
            </button>
          </div>
        </div>
      </div>
      <div v-if="showMenuButton || deletable" class="flex flex-col gap-1 shrink-0">
        <button v-if="showMenuButton" type="button" class="text-gray-300 hover:text-gray-500 transition-colors p-1">
          <FontAwesomeIcon :icon="faEllipsisVertical" class="w-3.5 h-3.5" />
        </button>
        <button
          v-if="deletable"
          @click.stop="emit('delete')"
          type="button"
          class="text-gray-300 hover:text-red-500 transition-colors p-1"
          title="Eliminar campo"
        >
          <FontAwesomeIcon :icon="faTrash" class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>
