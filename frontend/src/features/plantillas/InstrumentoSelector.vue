<script lang="ts">
import type { TipoInstrumento } from '@/types';

export const instrumentoAccent: Record<TipoInstrumento, { border: string; icon: string; text: string; iconBg: string; btn: string }> = {
  formato:       { border: 'border-sky-500 bg-sky-50',       icon: 'text-sky-600',    text: 'text-sky-700',    iconBg: 'bg-sky-100 text-sky-600',       btn: 'bg-sky-600 hover:bg-sky-700' },
  ioarr:         { border: 'border-amber-500 bg-amber-50',   icon: 'text-amber-600',  text: 'text-amber-700',  iconBg: 'bg-amber-100 text-amber-600',   btn: 'bg-amber-600 hover:bg-amber-700' },
  ficha_tecnica: { border: 'border-brand-500 bg-brand-50',   icon: 'text-brand-600',  text: 'text-brand-700',  iconBg: 'bg-brand-100 text-brand-600',   btn: 'bg-brand-600 hover:bg-brand-700' },
  perfil:        { border: 'border-violet-500 bg-violet-50', icon: 'text-violet-600', text: 'text-violet-700', iconBg: 'bg-violet-100 text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700' },
};
</script>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { instrumentoIcons, instrumentoLabels, tipologiaIoarrLabels } from '@/lib/icons';
import type { TipologiaIoarr } from '@/types';

const props = defineProps<{
  instrumento: TipoInstrumento;
  tipologias: TipologiaIoarr[];
}>();

const emit = defineEmits<{
  'update:instrumento': [TipoInstrumento];
  'update:tipologias': [TipologiaIoarr[]];
}>();

const descripciones: Record<TipoInstrumento, string> = {
  formato: 'Formatos de registro del ciclo de inversión (5A, 5B, 7A)',
  ioarr: 'Inversiones de optimización, ampliación marginal, reposición y rehabilitación (7C, 7D, 7E)',
  ficha_tecnica: 'Formulario estructurado con campos, tablas y coordenadas de celda (6A, 6B)',
  perfil: 'Estudio de preinversión con contenidos mínimos desarrollados en texto (Anexo 07)',
};

const tipos: TipoInstrumento[] = ['formato', 'ioarr', 'ficha_tecnica', 'perfil'];

function toggleTipologia(t: TipologiaIoarr) {
  emit('update:tipologias', props.tipologias.includes(t) ? props.tipologias.filter((x) => x !== t) : [...props.tipologias, t]);
}
</script>

<template>
  <div class="space-y-3">
    <div>
      <label class="block text-sm font-medium text-heading mb-2">
        Tipo de instrumento <span class="text-red-500">*</span>
      </label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="tipo in tipos"
          :key="tipo"
          @click="emit('update:instrumento', tipo)"
          type="button"
          class="p-3 rounded-xl border-2 text-left transition-colors duration-75"
          :class="instrumento === tipo ? instrumentoAccent[tipo].border : 'border-gray-200 hover:border-gray-300 bg-white'"
        >
          <div class="flex items-center gap-2 mb-1">
            <FontAwesomeIcon
              :icon="instrumentoIcons[tipo]"
              class="w-4 h-4"
              :class="instrumento === tipo ? instrumentoAccent[tipo].icon : 'text-gray-400'"
            />
            <span class="text-sm font-semibold" :class="instrumento === tipo ? instrumentoAccent[tipo].text : 'text-heading'">
              {{ instrumentoLabels[tipo] }}
            </span>
          </div>
          <p class="text-[11px] text-muted leading-tight">{{ descripciones[tipo] }}</p>
        </button>
      </div>
    </div>

    <div v-if="instrumento === 'ioarr'">
      <label class="block text-sm font-medium text-heading mb-2">
        Tipologías que cubre este documento <span class="text-muted font-normal">(puede ser más de una)</span>
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in (Object.keys(tipologiaIoarrLabels) as TipologiaIoarr[])"
          :key="t"
          @click="toggleTipologia(t)"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75"
          :class="tipologias.includes(t) ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
        >
          {{ tipologiaIoarrLabels[t] }}
        </button>
      </div>
    </div>
  </div>
</template>
