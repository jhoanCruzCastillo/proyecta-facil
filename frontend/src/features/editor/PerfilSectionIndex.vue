<script setup lang="ts">
import { reactive, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronDown, faChevronRight } from '@/lib/icons';
import type { Seccion } from '@/types';

const props = defineProps<{
  secciones: Seccion[];
  activeSectionIndex: number;
  activeItemId: string | null;
}>();

const emit = defineEmits<{
  'section-click': [idx: number];
  'item-click': [sectionIdx: number, campoId: string];
}>();

const expanded = reactive<Record<number, boolean>>({ [props.activeSectionIndex]: true });
watch(
  () => props.activeSectionIndex,
  (idx) => { expanded[idx] = true; },
);
</script>

<template>
  <div class="flex flex-col h-full">
    <h3 class="text-[10px] font-bold uppercase tracking-widest text-muted mb-3 px-2 shrink-0">
      Estructura · {{ secciones.length }} secciones
    </h3>
    <nav class="flex-1 overflow-y-auto space-y-0.5 pr-1">
      <div v-for="(sec, idx) in secciones" :key="sec.id">
        <div class="flex items-center rounded-lg group" :class="activeSectionIndex === idx ? 'bg-violet-50' : 'hover:bg-gray-50'">
          <button
            @click="emit('section-click', idx); expanded[idx] = true"
            type="button"
            class="flex-1 flex items-center gap-2 px-2.5 py-2 text-left transition-colors duration-75"
            :class="activeSectionIndex === idx ? 'text-violet-700' : 'text-gray-600 hover:text-gray-900'"
          >
            <span
              class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 font-mono"
              :class="activeSectionIndex === idx ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'"
            >
              {{ sec.numero === '0' ? 'RE' : sec.numero }}
            </span>
            <span class="text-xs font-semibold leading-tight truncate" :class="activeSectionIndex === idx ? 'text-violet-700' : 'text-gray-700'">
              {{ sec.nombre }}
            </span>
          </button>
          <button
            @click.stop="expanded[idx] = !expanded[idx]"
            type="button"
            class="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 transition-colors mr-1 shrink-0"
          >
            <FontAwesomeIcon :icon="expanded[idx] ? faChevronDown : faChevronRight" class="w-2.5 h-2.5" />
          </button>
        </div>

        <div v-if="expanded[idx]" class="ml-3.5 mt-0.5 mb-1.5 pl-2.5 border-l-2 border-gray-100 space-y-0.5">
          <div v-for="sub in sec.subsecciones" :key="sub.id">
            <div v-if="sub.codigo !== sec.numero" class="px-1.5 pt-2 pb-0.5">
              <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400">{{ sub.codigo }} · {{ sub.nombre }}</span>
            </div>
            <button
              v-for="campo in sub.campos"
              :key="campo.id"
              @click="emit('item-click', idx, campo.id)"
              type="button"
              class="w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left transition-colors duration-75"
              :class="activeItemId === campo.id ? 'bg-violet-100 text-violet-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'"
            >
              <span class="text-[9px] font-mono font-bold shrink-0 mt-0.5 min-w-[2rem]" :class="activeItemId === campo.id ? 'text-violet-500' : 'text-gray-400'">
                {{ campo.identificador }}
              </span>
              <span class="text-[11px] leading-tight line-clamp-2 flex-1">{{ campo.etiqueta }}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
