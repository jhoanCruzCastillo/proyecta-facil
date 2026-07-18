<script setup lang="ts">
import { ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark, faLayerGroup, faCheck } from '@/lib/icons';
import { sectorIconList } from '@/lib/icons';
import { useCrearSector } from '@/composables/useSectores';
import { usePushActividad } from '@/composables/useActividad';
import { useUiStore } from '@/stores/ui';
import { ACCENT_COLORS } from '@/components/ColorPicker.vue';
import IconPicker from '@/components/IconPicker.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import type { TipoSector } from '@/types';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: [] }>();

const crearSector = useCrearSector();
const pushActividad = usePushActividad();
const ui = useUiStore();

const nombre = ref('');
const codigo = ref('');
const codigoManual = ref(false);
const icono = ref<string>(sectorIconList[0]);
const color = ref(ACCENT_COLORS[0]);
const descripcion = ref('');
const tipoSector = ref<TipoSector>('Sectorial');
const activo = ref(true);

function reset() {
  nombre.value = '';
  codigo.value = '';
  codigoManual.value = false;
  icono.value = sectorIconList[0];
  color.value = ACCENT_COLORS[0];
  descripcion.value = '';
  tipoSector.value = 'Sectorial';
  activo.value = true;
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) reset();
  },
);

watch(nombre, (val) => {
  if (codigoManual.value || !val) return;
  const words = val.trim().split(/\s+/);
  codigo.value = words.map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 3);
});

function handleCodigoInput(e: Event) {
  codigoManual.value = true;
  codigo.value = (e.target as HTMLInputElement).value.toUpperCase().slice(0, 5);
}

async function handleSubmit() {
  if (!nombre.value.trim()) return;
  await crearSector.mutateAsync({
    nombre: nombre.value.trim(),
    codigo: codigo.value || nombre.value.trim().slice(0, 3).toUpperCase(),
    icono: icono.value,
    colorAccent: color.value,
    descripcion: descripcion.value.trim() || undefined,
    tipoSector: tipoSector.value,
    activo: activo.value,
    cantidadPlantillas: 0,
    cantidadEjemplos: 0,
  });
  await pushActividad.mutateAsync({ mensaje: `Se creó el sector "${nombre.value.trim()}"`, color: 'green' });
  ui.toast(`Sector "${nombre.value.trim()}" creado`);
  emit('close');
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
                <FontAwesomeIcon :icon="faLayerGroup" class="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-heading">Nuevo sector</h2>
                <p class="text-sm text-muted">Define un nuevo ámbito del Estado para agrupar plantillas</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
              <FontAwesomeIcon :icon="faXmark" />
            </button>
          </div>

          <div class="px-6 pb-6 space-y-5">
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-heading mb-1.5">
                  Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="nombre"
                  type="text"
                  placeholder="Ej. Energía y Minas"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Código corto</label>
                <input
                  :value="codigo"
                  @input="handleCodigoInput"
                  type="text"
                  class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>
            <p class="text-xs text-muted -mt-3">
              El código se autogenera a partir del nombre; puedes editarlo.
            </p>

            <IconPicker :value="icono" @update:value="icono = $event" />
            <ColorPicker :value="color" @update:value="color = $event" />

            <div>
              <label class="block text-sm font-medium text-heading mb-1.5">
                Descripción <span class="text-muted font-normal">(opcional)</span>
              </label>
              <textarea
                v-model="descripcion"
                rows="3"
                placeholder="Breve descripción del ámbito y los servicios que cubre..."
                class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">
                  Tipo de sector <span class="text-muted font-normal">(opcional)</span>
                </label>
                <div class="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    v-for="tipo in (['Sectorial', 'General'] as TipoSector[])"
                    :key="tipo"
                    @click="tipoSector = tipo"
                    type="button"
                    class="flex-1 px-4 py-2.5 text-sm font-medium transition-colors duration-75"
                    :class="tipoSector === tipo ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'"
                  >
                    {{ tipo }}
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-heading mb-1.5">Estado</label>
                <div class="flex items-center gap-3 py-2">
                  <span class="text-sm font-medium" :class="activo ? 'text-brand-600' : 'text-gray-400'">Activo</span>
                  <button
                    @click="activo = !activo"
                    type="button"
                    class="relative w-12 h-7 rounded-full transition-colors duration-100"
                    :class="activo ? 'bg-brand-500' : 'bg-gray-300'"
                  >
                    <span
                      class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-100"
                      :class="activo ? 'left-5.5' : 'left-0.5'"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <p class="text-xs text-muted">
                <span class="text-red-500">*</span> Campos obligatorios
              </p>
              <div class="flex gap-3">
                <button @click="emit('close')" class="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                  Cancelar
                </button>
                <button
                  @click="handleSubmit"
                  :disabled="!nombre.trim()"
                  class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                >
                  <FontAwesomeIcon :icon="faCheck" class="w-3.5 h-3.5" />
                  Crear sector
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
