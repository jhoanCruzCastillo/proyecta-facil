<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faUserTie, faComments, faVideo, faPaperPlane, faTriangleExclamation } from '@/lib/icons';
import { useDocentesQuery } from '@/composables/useDocentes';
import { useCrearSolicitudAsesoria, useMisSolicitudesQuery } from '@/composables/useAsesoria';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useEstadoEntrenamiento } from '@/composables/useEstadoEntrenamiento';
import { useSessionStore } from '@/stores/session';
import { cuentaEfectivaDe } from '@/lib/permisos';
import { addOns } from '@/data/planes';
import ComprarAddOnModal from '@/features/settings/ComprarAddOnModal.vue';
import type { Docente, TipoAsesoria } from '@/types';

const props = defineProps<{ isOpen: boolean; ejemploId?: string }>();
const emit = defineEmits<{ close: []; creada: [] }>();

const DIAS_CORTO = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const ADDON_CONSULTA = addOns.find((a) => a.id === 'consultoria-1a1') ?? null;

const session = useSessionStore();
const { data: docentes, isLoading } = useDocentesQuery();
const { data: usuariosData } = useUsuariosQuery();
const { limiteConsultas } = useEstadoEntrenamiento();
const crearSolicitud = useCrearSolicitudAsesoria();

const clienteId = computed(() => session.sesion?.usuarioId ?? '');
const { data: misSolicitudes } = useMisSolicitudesQuery(clienteId, 'cliente');
const consultasUsadas = computed(() => (misSolicitudes.value ?? []).length);
const limiteAlcanzado = computed(() => consultasUsadas.value >= limiteConsultas.value);
const cuentaId = computed(() => (session.sesion ? cuentaEfectivaDe(usuariosData.value ?? [], session.sesion) : ''));
const showComprarAddon = ref(false);

const docenteId = ref<string | null>(null);
const tipo = ref<TipoAsesoria>('chat');
const mensaje = ref('');
const enviando = ref(false);

function resumenHorario(d: Docente): string {
  if (d.horario.length === 0) return 'Sin horario configurado';
  return d.horario
    .slice()
    .sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio))
    .map((h) => `${DIAS_CORTO[h.diaSemana]} ${h.horaInicio}-${h.horaFin}`)
    .join(' · ');
}

function reset() {
  docenteId.value = null;
  tipo.value = 'chat';
  mensaje.value = '';
}

function handleClose() {
  reset();
  emit('close');
}

async function enviar() {
  if (!docenteId.value || !session.sesion || limiteAlcanzado.value) return;
  enviando.value = true;
  await crearSolicitud.mutateAsync({
    clienteId: session.sesion.usuarioId,
    docenteId: docenteId.value,
    tipo: tipo.value,
    mensajeInicial: mensaje.value.trim() || undefined,
    ejemploId: props.ejemploId,
  });
  enviando.value = false;
  reset();
  emit('creada');
}

const docenteSeleccionado = computed(() => (docentes.value ?? []).find((d) => d.id === docenteId.value));
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="handleClose">
      <Transition name="pop" appear>
        <div v-if="isOpen" class="bg-white rounded-2xl shadow-modal w-full max-w-md max-h-[85vh] overflow-y-auto" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faUserTie" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Solicitar asesoría</h2>
                <p class="text-sm text-muted">Un docente te ayuda a resolver tus dudas</p>
              </div>
            </div>
            <button @click="handleClose" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 space-y-4">
            <div v-if="limiteAlcanzado" class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <FontAwesomeIcon :icon="faTriangleExclamation" class="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div class="flex-1">
                <p>Alcanzaste el límite de {{ limiteConsultas }} consulta{{ limiteConsultas === 1 ? '' : 's' }} de tu plan.</p>
                <button
                  v-if="ADDON_CONSULTA"
                  @click="showComprarAddon = true"
                  type="button"
                  class="mt-1 font-semibold underline hover:text-amber-900"
                >
                  Comprar una consulta adicional
                </button>
              </div>
            </div>

            <p v-else class="text-[11px] text-muted -mb-1">
              Te quedan {{ limiteConsultas - consultasUsadas }} de {{ limiteConsultas }} consulta{{ limiteConsultas === 1 ? '' : 's' }} de tu plan.
            </p>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">Elige un docente</label>
              <p v-if="isLoading" class="text-sm text-muted">Cargando…</p>
              <p v-else-if="(docentes ?? []).length === 0" class="text-sm text-muted">No hay docentes disponibles por ahora.</p>
              <div v-else class="space-y-2 max-h-48 overflow-y-auto">
                <button
                  v-for="d in docentes"
                  :key="d.id"
                  @click="docenteId = d.id"
                  type="button"
                  class="w-full text-left p-3 rounded-xl border transition-colors"
                  :class="docenteId === d.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'"
                >
                  <p class="font-semibold text-heading text-sm">{{ d.nombre }}</p>
                  <p class="text-xs text-muted mt-0.5">{{ resumenHorario(d) }}</p>
                </button>
              </div>
            </div>

            <div v-if="docenteSeleccionado">
              <label class="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">Tipo de asesoría</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="tipo = 'chat'"
                  type="button"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors"
                  :class="tipo === 'chat' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                >
                  <FontAwesomeIcon :icon="faComments" class="w-3.5 h-3.5" />
                  Chat
                </button>
                <button
                  @click="tipo = 'video'"
                  type="button"
                  class="flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors"
                  :class="tipo === 'video' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'"
                >
                  <FontAwesomeIcon :icon="faVideo" class="w-3.5 h-3.5" />
                  Videollamada
                </button>
              </div>

              <label class="block text-xs font-semibold uppercase tracking-widest text-muted mt-4 mb-2">Mensaje (opcional)</label>
              <textarea
                v-model="mensaje"
                rows="3"
                placeholder="Cuéntale al docente en qué necesitas ayuda..."
                class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
              />
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button @click="handleClose" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                Cancelar
              </button>
              <button
                v-if="docenteSeleccionado"
                @click="enviar"
                :disabled="enviando || limiteAlcanzado"
                class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon :icon="faPaperPlane" class="w-3.5 h-3.5" />
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <ComprarAddOnModal :is-open="showComprarAddon" :usuario-id="cuentaId" :addon="ADDON_CONSULTA" @close="showComprarAddon = false" />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: all 0.12s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(10px);
}
</style>
