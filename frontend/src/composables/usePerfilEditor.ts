import { type Ref, computed, nextTick, ref, watch } from 'vue';
import { usePlantillaQuery, useActualizarPlantilla } from '@/composables/usePlantillas';
import { useSectorQuery } from '@/composables/useSectores';
import { useEjemplosByPlantillaQuery, useCrearEjemplo, useActualizarEjemplo } from '@/composables/useEjemplos';
import { useScrollSpy } from '@/composables/useScrollSpy';
import { usePushActividad } from '@/composables/useActividad';
import { generateId } from '@/api/mock/_shared';
import { useUiStore } from '@/stores/ui';
import type { VersionTab, Campo, Plantilla, Ejemplo } from '@/types';

const MIN_LEFT = 200;
const MIN_RIGHT = 280;
const DEFAULT_LEFT = 272;
const DEFAULT_RIGHT = 380;

// `structuredClone` no clona Proxies reactivos de Vue — ver la misma nota en usePlantillaEditor.ts.
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Lógica del editor de Perfil (PlantillaPerfilPage.vue), separada del componente para mantenerlo
// bajo el límite de 200 líneas. A diferencia del editor de Ficha Técnica, Perfil navega por
// apartados dentro de UNA sección visible a la vez, con scroll-spy sobre esos apartados.
export function usePerfilEditor(plantillaId: Ref<string>, sectorId: Ref<string>) {
  const { data: plantillaOriginal } = usePlantillaQuery(plantillaId);
  const { data: sector } = useSectorQuery(sectorId);
  const actualizarPlantilla = useActualizarPlantilla();
  const { data: ejemplosData } = useEjemplosByPlantillaQuery(plantillaId);
  const crearEjemplo = useCrearEjemplo();
  const actualizarEjemplo = useActualizarEjemplo();
  const pushActividad = usePushActividad();
  const ui = useUiStore();

  const editData = ref<Plantilla | null>(null) as Ref<Plantilla | null>;
  watch(plantillaOriginal, (p) => {
    if (p) editData.value = deepClone(p);
  });

  const activeTab = ref<VersionTab>('estructura');
  const activeSectionIndex = ref(0);
  const selectedCampoId = ref<string | null>(null);
  const activeEjemplo = ref<Ejemplo | null>(null) as Ref<Ejemplo | null>;
  const editedValores = ref<Record<string, string>>({});
  const showNuevoEjemplo = ref(false);
  const leftWidth = ref(DEFAULT_LEFT);
  const rightWidth = ref(DEFAULT_RIGHT);

  function handleLeftResize(d: number) { leftWidth.value = Math.max(MIN_LEFT, leftWidth.value + d); }
  function handleRightResize(d: number) { rightWidth.value = Math.max(MIN_RIGHT, rightWidth.value - d); }

  const ejemplos = computed(() => ejemplosData.value ?? []);

  watch(activeEjemplo, (ej) => {
    editedValores.value = ej?.valores && Object.keys(ej.valores).length > 0 ? { ...ej.valores } : {};
  });
  watch(ejemplos, (list) => {
    if (!activeEjemplo.value && list.length > 0) activeEjemplo.value = list[0];
  });

  const secciones = computed(() => editData.value?.secciones ?? []);
  const safeIdx = computed(() => Math.min(activeSectionIndex.value, Math.max(0, secciones.value.length - 1)));
  const seccionActiva = computed(() => secciones.value[safeIdx.value]);
  const isFirst = computed(() => safeIdx.value === 0);
  const isLast = computed(() => safeIdx.value === secciones.value.length - 1);
  const showExamples = computed(() => activeTab.value === 'ejemplos');

  const sectionItemIds = computed(() => seccionActiva.value?.subsecciones.flatMap((s) => s.campos.map((c) => c.id)) ?? []);
  const { activeId: activeItemId, containerRef, scrollToSection } = useScrollSpy(sectionItemIds);

  let pendingScrollId: string | null = null;

  // El reset de scroll-al-tope al cambiar de sección vive en el componente (PlantillaPerfilPage.vue),
  // que es dueño del elemento DOM de containerRef — acá solo se resetea el estado de selección.
  watch(safeIdx, () => { selectedCampoId.value = null; });

  function handleItemClick(sectionIdx: number, campoId: string) {
    selectedCampoId.value = campoId;
    if (sectionIdx !== safeIdx.value) {
      activeSectionIndex.value = sectionIdx;
      pendingScrollId = campoId;
      nextTick(() => {
        requestAnimationFrame(() => {
          if (pendingScrollId) { scrollToSection(pendingScrollId); pendingScrollId = null; }
        });
      });
    } else {
      scrollToSection(campoId);
    }
  }

  function mutate(fn: (p: Plantilla) => void) {
    if (!editData.value) return;
    const next = deepClone(editData.value);
    fn(next);
    editData.value = next;
  }

  function updateBloque(campoId: string, updates: Partial<Campo>) {
    mutate((p) => {
      for (const sec of p.secciones) {
        for (const sub of sec.subsecciones) {
          const c = sub.campos.find((f) => f.id === campoId);
          if (c) { Object.assign(c, updates); return; }
        }
      }
    });
  }

  function addBloque(subseccionId: string, prefijo: string, count: number) {
    const nuevo: Campo = { id: generateId(), identificador: `${prefijo}.${count + 1}`, etiqueta: 'Nuevo apartado', tipo: 'texto_largo', editable: true, descripcion: '' };
    mutate((p) => {
      for (const sec of p.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) { sub.campos.push(nuevo); break; }
      }
    });
    selectedCampoId.value = nuevo.id;
    ui.toast('Apartado agregado');
  }

  function deleteBloque(campoId: string, subseccionId: string) {
    mutate((p) => {
      for (const sec of p.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) { sub.campos = sub.campos.filter((c) => c.id !== campoId); break; }
      }
    });
    if (selectedCampoId.value === campoId) selectedCampoId.value = null;
    ui.toast('Apartado eliminado');
  }

  function handleExampleValueChange(identificador: string, value: string) {
    editedValores.value = { ...editedValores.value, [identificador]: value };
  }

  async function handleCreateExample(nombre: string, subtitulo: string, detalle: string) {
    const nuevo: Ejemplo = { id: generateId(), nombre, subtitulo, detalle, plantillaId: plantillaId.value, activo: false, valores: {}, estado: 'archivado' };
    await crearEjemplo.mutateAsync(nuevo);
    activeEjemplo.value = nuevo;
    editedValores.value = {};
    ui.toast(`Ejemplo "${nombre}" creado`);
  }

  async function handleSave() {
    if (!editData.value) return;
    const fechaActualizacion = new Date().toLocaleDateString('es-PE');
    await actualizarPlantilla.mutateAsync({ id: editData.value.id, data: { ...editData.value, fechaActualizacion } });

    if (activeTab.value === 'ejemplos' && activeEjemplo.value) {
      const valores = { ...editedValores.value };
      await actualizarEjemplo.mutateAsync({ id: activeEjemplo.value.id, data: { valores } });
      activeEjemplo.value = { ...activeEjemplo.value, valores };
    }

    await pushActividad.mutateAsync({ mensaje: `Se guardó el perfil ${editData.value.codigo} — ${editData.value.nombre}`, color: 'blue' });
    ui.toast(`Perfil "${editData.value.codigo}" guardado`);
  }

  const selectedCampo = computed(
    () => seccionActiva.value?.subsecciones.flatMap((s) => s.campos).find((c) => c.id === selectedCampoId.value) ?? null,
  );

  return {
    editData, sector, activeTab, activeSectionIndex, selectedCampoId, selectedCampo,
    ejemplos, activeEjemplo, editedValores, showNuevoEjemplo,
    leftWidth, rightWidth, secciones, safeIdx, seccionActiva, isFirst, isLast, showExamples,
    activeItemId, containerRef,
    handleLeftResize, handleRightResize, handleItemClick,
    updateBloque, addBloque, deleteBloque, handleExampleValueChange, handleCreateExample, handleSave,
  };
}
