<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faCheck, faFileCirclePlus, faTriangleExclamation, instrumentoLabels } from '@/lib/icons';
import { useSectoresQuery } from '@/composables/useSectores';
import { usePlantillasQuery } from '@/composables/usePlantillas';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useEjemplosQuery, useCrearEjemplo } from '@/composables/useEjemplos';
import { useCatalogoExcelQuery } from '@/composables/useArchivosExcel';
import { useSetExcelEjemplo } from '@/composables/useExcelEjemplos';
import { usePushActividad } from '@/composables/useActividad';
import { useEstadoEntrenamiento } from '@/composables/useEstadoEntrenamiento';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';
import { generateId } from '@/api/mock/_shared';
import { cuentaEfectivaDe } from '@/lib/permisos';
import FichaOficialSelector from './FichaOficialSelector.vue';
import type { TipoInstrumento } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  /** Si se abre desde el catálogo "Fichas oficiales" con una plantilla ya elegida, se salta la selección de sector/tipo/ficha */
  presetPlantillaId?: string;
}>();

const emit = defineEmits<{ close: [] }>();

const tipos: TipoInstrumento[] = ['formato', 'perfil', 'ficha_tecnica', 'ioarr'];

const session = useSessionStore();
const ui = useUiStore();
const router = useRouter();
const { data: sectoresData } = useSectoresQuery();
const { data: plantillasData } = usePlantillasQuery();
const { data: usuariosData } = useUsuariosQuery();
const { data: ejemplosData } = useEjemplosQuery();
const crearEjemplo = useCrearEjemplo();
const setExcelEjemplo = useSetExcelEjemplo();
const pushActividad = usePushActividad();
const { esNivel0, vencido, limiteFichas } = useEstadoEntrenamiento();

const sectores = computed(() => sectoresData.value ?? []);
const plantillas = computed(() => plantillasData.value ?? []);

const cuentaId = computed(() => (session.sesion ? cuentaEfectivaDe(usuariosData.value ?? [], session.sesion) : ''));
const misFichasCount = computed(() => (ejemplosData.value ?? []).filter((e) => e.propietarioId === cuentaId.value).length);
const limiteAlcanzado = computed(() => misFichasCount.value >= limiteFichas.value);
const bloqueado = computed(() => vencido.value || limiteAlcanzado.value);

const sectorId = ref('');
const tipo = ref<TipoInstrumento>('ficha_tecnica');
const selectedPlantillaId = ref('');
const codigo = ref('');
const nombre = ref('');
const descripcion = ref('');

const { data: catalogoData } = useCatalogoExcelQuery(selectedPlantillaId);

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      sectorId.value = '';
      tipo.value = 'ficha_tecnica';
      selectedPlantillaId.value = '';
      codigo.value = '';
      nombre.value = '';
      descripcion.value = '';
      return;
    }
    if (props.presetPlantillaId) {
      const preset = plantillas.value.find((p) => p.id === props.presetPlantillaId);
      if (preset) {
        sectorId.value = preset.sectorId;
        tipo.value = preset.instrumento;
        selectedPlantillaId.value = preset.id;
      }
    }
  },
);

// Al cambiar sector o tipo, la selección de ficha oficial ya no aplica — salvo que la selección
// actual siga siendo válida para el nuevo sector/tipo (caso del preset aplicado más arriba).
watch([sectorId, tipo], () => {
  const prevPlantilla = plantillas.value.find((p) => p.id === selectedPlantillaId.value);
  if (!(prevPlantilla && prevPlantilla.sectorId === sectorId.value && prevPlantilla.instrumento === tipo.value)) {
    selectedPlantillaId.value = '';
  }
});

const plantillasCoincidentes = computed(() =>
  plantillas.value.filter((p) => p.sectorId === sectorId.value && p.instrumento === tipo.value && (!esNivel0.value || p.disponibleNivel0)),
);

async function handleSubmit() {
  if (!selectedPlantillaId.value || !nombre.value.trim() || !session.sesion || bloqueado.value) return;
  const plantilla = plantillas.value.find((p) => p.id === selectedPlantillaId.value);
  if (!plantilla) return;

  const catalogo = catalogoData.value;
  const archivoAsignado = catalogo?.archivos.find((a) => a.id === catalogo.asignadoId);
  if (!archivoAsignado) {
    ui.toast('Esta ficha aún no tiene un Excel asignado por el administrador', 'error');
    return;
  }

  const nuevoId = generateId();
  await crearEjemplo.mutateAsync({
    id: nuevoId,
    nombre: nombre.value.trim(),
    subtitulo: codigo.value.trim(),
    detalle: descripcion.value.trim(),
    plantillaId: plantilla.id,
    activo: false,
    valores: {},
    propietarioId: cuentaEfectivaDe(usuariosData.value ?? [], session.sesion),
    creadoPorUsuarioId: session.sesion.usuarioId,
  });
  await setExcelEjemplo.mutateAsync({
    ejemploId: nuevoId,
    archivo: {
      id: generateId(),
      nombre: archivoAsignado.nombre,
      dataUrl: archivoAsignado.dataUrl,
      fechaSubida: new Date().toLocaleDateString('es-PE'),
    },
  });
  await pushActividad.mutateAsync({ mensaje: `Se creó la ficha "${nombre.value.trim()}"`, color: 'green' });
  ui.toast(`Ficha "${nombre.value.trim()}" creada`);
  emit('close');
  router.push(`/mis-fichas/${nuevoId}`);
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click="emit('close')">
      <Transition name="pop" appear>
        <div class="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-start justify-between p-6 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <FontAwesomeIcon :icon="faFileCirclePlus" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Nueva ficha</h2>
                <p class="text-sm text-muted">Crea y llena tu propia ficha técnica</p>
              </div>
            </div>
            <button @click="emit('close')" type="button" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 space-y-4">
            <div v-if="bloqueado" class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <FontAwesomeIcon :icon="faTriangleExclamation" class="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span v-if="vencido">Tu plan de entrenamiento venció — ya no puedes crear nuevos ejercicios.</span>
              <span v-else-if="esNivel0">
                Alcanzaste el límite de {{ limiteFichas }} ejercicios simultáneos de tu plan Pedagógico. Elimina uno desde "Mis fichas" para crear otro.
              </span>
              <span v-else>
                Alcanzaste el límite de {{ limiteFichas }} plantillas simultáneas de tu plan. Elimina una desde "Mis fichas" o compra "Plantilla adicional" en Facturación.
              </span>
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Sector <span class="text-red-500">*</span>
              </label>
              <select
                v-model="sectorId"
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white"
              >
                <option value="">Selecciona un sector...</option>
                <option v-for="s in sectores" :key="s.id" :value="s.id">{{ s.nombre }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">Tipo de ficha</label>
              <div class="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  v-for="t in tipos"
                  :key="t"
                  @click="tipo = t"
                  type="button"
                  class="flex-1 px-2 py-2.5 text-xs font-medium transition-colors duration-75"
                  :class="tipo === t ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'"
                >
                  {{ instrumentoLabels[t] }}
                </button>
              </div>
            </div>

            <FichaOficialSelector
              v-if="sectorId"
              :plantillas-coincidentes="plantillasCoincidentes"
              :selected-plantilla-id="selectedPlantillaId"
              @select="selectedPlantillaId = $event"
            />

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Código</label>
                <input
                  v-model="codigo"
                  type="text"
                  placeholder="Ej. FT-001"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-heading mb-1.5">
                  Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="nombre"
                  type="text"
                  placeholder="Ej. Posta de Salud Villa Hermosa"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Descripción <span class="text-muted font-normal">(opcional)</span>
              </label>
              <textarea
                v-model="descripcion"
                rows="2"
                placeholder="Breve descripción de tu proyecto..."
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <p class="text-xs text-muted"><span class="text-red-500">*</span> Campos obligatorios</p>
              <div class="flex gap-3">
                <button @click="emit('close')" type="button" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                  Cancelar
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="!selectedPlantillaId || !nombre.trim() || bloqueado"
                  type="button"
                  class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                >
                  <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                  Crear y empezar a llenar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
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
