<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCalendarWeek, faCalendarPlus, faPlus, faXmark, faSave, faTrash } from '@/lib/icons';
import PageShell from '@/components/PageShell.vue';
import { useSessionStore } from '@/stores/session';
import { useDocentesQuery, useActualizarHorarioDocente } from '@/composables/useDocentes';
import { useUiStore } from '@/stores/ui';
import type { BloqueHorario } from '@/api/contracts/docentes';

// Horario semanal de referencia (no es un calendario de citas con fechas puntuales) — el cliente
// lo ve al elegir a quién solicitarle asesoría, para saber cuándo suele estar disponible este
// docente. Por eso la grilla muestra días de la semana genéricos en vez de navegación entre
// semanas de un calendario real: el mismo bloque se repite todas las semanas.
const DIAS: { valor: number; nombre: string }[] = [
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' },
  { valor: 7, nombre: 'Domingo' },
];

const HORA_PX = 52;

const session = useSessionStore();
const ui = useUiStore();
const docenteId = computed(() => session.sesion?.usuarioId ?? '');

const { data: docentes, isLoading } = useDocentesQuery();
const actualizarHorario = useActualizarHorarioDocente();

const bloques = ref<BloqueHorario[]>([]);
const cargado = ref(false);

watch(docentes, (lista) => {
  if (cargado.value || !lista) return;
  const propio = lista.find((d) => d.id === docenteId.value);
  bloques.value = propio ? propio.horario.map((h) => ({ diaSemana: h.diaSemana, horaInicio: h.horaInicio, horaFin: h.horaFin })) : [];
  cargado.value = true;
}, { immediate: true });

function horaADecimal(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h + m / 60;
}

// La grilla siempre cubre al menos 08:00–20:00 y se expande si algún bloque cae fuera de ese rango.
const horaMin = computed(() => Math.floor(Math.min(8, ...bloques.value.map((b) => horaADecimal(b.horaInicio)))));
const horaMax = computed(() => Math.ceil(Math.max(20, ...bloques.value.map((b) => horaADecimal(b.horaFin)))));
const horas = computed(() => Array.from({ length: horaMax.value - horaMin.value }, (_, i) => horaMin.value + i));
const alturaTotal = computed(() => (horaMax.value - horaMin.value) * HORA_PX);

function bloquesDelDia(dia: number): BloqueHorario[] {
  return bloques.value.filter((b) => b.diaSemana === dia);
}

function alturaBloque(b: BloqueHorario): number {
  return Math.max(22, (horaADecimal(b.horaFin) - horaADecimal(b.horaInicio)) * HORA_PX);
}

function estiloBloque(b: BloqueHorario) {
  const top = (horaADecimal(b.horaInicio) - horaMin.value) * HORA_PX;
  return { top: `${top}px`, height: `${alturaBloque(b)}px` };
}

type Categoria = 'manana' | 'tarde' | 'noche';
function categoria(b: BloqueHorario): Categoria {
  const h = horaADecimal(b.horaInicio);
  if (h < 12) return 'manana';
  if (h < 18) return 'tarde';
  return 'noche';
}
const categoriaClases: Record<Categoria, string> = {
  manana: 'bg-accent-emerald',
  tarde: 'bg-accent-blue',
  noche: 'bg-accent-purple',
};

const editando = ref<BloqueHorario | null>(null);
const popoverStyle = ref<Record<string, string>>({});
const popoverRef = ref<HTMLElement | null>(null);

function posicionarPopover(e: MouseEvent) {
  const ancho = 260;
  const alto = 250;
  const x = Math.min(Math.max(16, e.clientX), window.innerWidth - ancho - 16);
  const y = Math.min(Math.max(16, e.clientY), window.innerHeight - alto - 16);
  popoverStyle.value = { left: `${x}px`, top: `${y}px` };
}

function abrirEditorNuevo(e: MouseEvent, dia: number) {
  const nuevo: BloqueHorario = { diaSemana: dia, horaInicio: '09:00', horaFin: '13:00' };
  bloques.value.push(nuevo);
  posicionarPopover(e);
  editando.value = nuevo;
}

function abrirEditorExistente(e: MouseEvent, b: BloqueHorario) {
  posicionarPopover(e);
  editando.value = b;
}

function eliminarEditando() {
  if (!editando.value) return;
  const idx = bloques.value.indexOf(editando.value);
  if (idx !== -1) bloques.value.splice(idx, 1);
  editando.value = null;
}

function handleClickFuera(e: MouseEvent) {
  if (!popoverRef.value || popoverRef.value.contains(e.target as Node)) return;
  editando.value = null;
}
onMounted(() => document.addEventListener('mousedown', handleClickFuera));
onUnmounted(() => document.removeEventListener('mousedown', handleClickFuera));

async function guardar() {
  await actualizarHorario.mutateAsync({ docenteId: docenteId.value, horario: bloques.value });
  ui.toast('Horario actualizado');
}
</script>

<template>
  <PageShell :icon="faCalendarWeek" title="Mi horario" description="Gestiona los bloques semanales en los que sueles estar disponible para dar asesoría.">
    <template #actions>
      <button
        @click="guardar"
        :disabled="actualizarHorario.isPending.value"
        type="button"
        class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faSave" class="w-3.5 h-3.5" />
        Guardar horario
      </button>
    </template>

    <p v-if="isLoading" class="text-sm text-muted">Cargando…</p>

    <div v-else class="rounded-2xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <div class="min-w-[760px]">
          <div class="flex border-b border-gray-100">
            <div class="w-14 shrink-0" />
            <div v-for="dia in DIAS" :key="dia.valor" class="flex-1 min-w-0 px-2 py-3 text-center border-l border-gray-100">
              <div class="flex items-center justify-center gap-1.5">
                <span class="text-xs font-semibold text-heading">{{ dia.nombre }}</span>
                <button
                  @click="abrirEditorNuevo($event, dia.valor)"
                  type="button"
                  class="w-4 h-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors duration-75"
                  title="Agregar bloque"
                >
                  <FontAwesomeIcon :icon="faPlus" class="w-2 h-2" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex">
            <div class="w-14 shrink-0 relative" :style="{ height: `${alturaTotal}px` }">
              <span
                v-for="h in horas"
                :key="h"
                class="absolute left-0 right-0 -translate-y-1/2 text-[10px] text-gray-400 text-right pr-2"
                :style="{ top: `${(h - horaMin) * HORA_PX}px` }"
              >
                {{ String(h).padStart(2, '0') }}:00
              </span>
            </div>

            <div
              v-for="dia in DIAS"
              :key="dia.valor"
              class="flex-1 min-w-0 relative border-l border-gray-100"
              :style="{ height: `${alturaTotal}px` }"
            >
              <div v-for="h in horas" :key="h" class="border-t border-gray-100" :style="{ height: `${HORA_PX}px` }" />

              <div v-if="bloquesDelDia(dia.valor).length === 0" class="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-2 text-center">
                <FontAwesomeIcon :icon="faCalendarPlus" class="w-4 h-4 text-gray-200" />
                <p class="text-[11px] text-gray-300">No hay bloques</p>
                <button @click="abrirEditorNuevo($event, dia.valor)" type="button" class="text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors">
                  Agrega uno
                </button>
              </div>

              <button
                v-for="(b, i) in bloquesDelDia(dia.valor)"
                :key="i"
                @click="abrirEditorExistente($event, b)"
                type="button"
                class="absolute left-1 right-1 rounded-lg px-2 py-1.5 text-left text-white shadow-sm hover:brightness-110 transition-[filter]"
                :class="categoriaClases[categoria(b)]"
                :style="estiloBloque(b)"
              >
                <p class="text-[10px] font-semibold leading-tight">{{ b.horaInicio }}–{{ b.horaFin }}</p>
                <p v-if="alturaBloque(b) >= 36" class="text-[10px] text-white/80 leading-tight">Disponible</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
        <div class="flex flex-wrap items-center gap-4 text-[11px] text-muted">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-accent-emerald" /> Mañana</span>
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-accent-blue" /> Tarde</span>
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-accent-purple" /> Noche</span>
          <span class="hidden sm:inline text-gray-300">· Haz clic en cualquier bloque para editarlo o eliminarlo.</span>
        </div>
        <button
          @click="abrirEditorNuevo($event, 1)"
          type="button"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-medium transition-colors"
        >
          <FontAwesomeIcon :icon="faPlus" class="w-3 h-3" />
          Agregar bloque
        </button>
      </div>
    </div>
  </PageShell>

  <div
    v-if="editando"
    ref="popoverRef"
    class="fixed z-50 w-64 rounded-xl bg-white border border-gray-200 shadow-modal p-4"
    :style="popoverStyle"
  >
    <div class="flex items-center justify-between mb-3">
      <p class="text-[11px] font-semibold text-muted uppercase tracking-wide">Editar bloque</p>
      <button @click="editando = null" type="button" class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-75">
        <FontAwesomeIcon :icon="faXmark" class="w-3 h-3" />
      </button>
    </div>

    <label class="block text-[11px] text-muted mb-1">Día</label>
    <select
      v-model.number="editando.diaSemana"
      class="w-full mb-3 px-2 py-1.5 rounded-lg border border-gray-200 text-heading text-xs focus:outline-none focus:ring-2 focus:ring-brand-300"
    >
      <option v-for="dia in DIAS" :key="dia.valor" :value="dia.valor">{{ dia.nombre }}</option>
    </select>

    <div class="flex items-center gap-2 mb-4">
      <div class="flex-1 min-w-0">
        <label class="block text-[11px] text-muted mb-1">Desde</label>
        <input
          v-model="editando.horaInicio"
          type="time"
          class="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-heading text-xs focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <div class="flex-1 min-w-0">
        <label class="block text-[11px] text-muted mb-1">Hasta</label>
        <input
          v-model="editando.horaFin"
          type="time"
          class="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-heading text-xs focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
    </div>

    <button
      @click="eliminarEditando"
      type="button"
      class="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
    >
      <FontAwesomeIcon :icon="faTrash" class="w-3 h-3" />
      Eliminar bloque
    </button>
  </div>
</template>
