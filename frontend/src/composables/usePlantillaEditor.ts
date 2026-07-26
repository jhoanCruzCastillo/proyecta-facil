import { type Ref, computed, ref, watch } from 'vue';
import { usePlantillaQuery, useActualizarPlantilla } from '@/composables/usePlantillas';
import { useEjemplosByPlantillaQuery, useCrearEjemplo, useActualizarEjemplo, useEliminarEjemplo } from '@/composables/useEjemplos';
import { useCatalogoExcelQuery } from '@/composables/useArchivosExcel';
import { useExcelEjemploQuery, useSetExcelEjemplo } from '@/composables/useExcelEjemplos';
import { generateId } from '@/api/mock/_shared';
import { excelEjemplosApi } from '@/api/excelEjemplos';
import { contarCamposSinCaptura } from '@/lib/campoValidation';
import { buildDocumento } from '@/lib/schemaExport';
import { insertarValoresEnExcel } from '@/lib/excelWriter';
import { usePushActividad } from '@/composables/useActividad';
import { useUiStore } from '@/stores/ui';
import type { VersionTab, Campo, Plantilla, Ejemplo, Seccion, TipologiaIoarr } from '@/types';

const MIN_LEFT = 180;
const MIN_RIGHT = 300;
const MIN_EXAMPLES = 220;
const DEFAULT_LEFT = 260;
const DEFAULT_RIGHT = 420;
const DEFAULT_EXAMPLES = 300;

// `structuredClone` no puede clonar los Proxies reactivos de Vue — `toRaw()` solo desenvuelve el
// nivel superior, no los objetos anidados (secciones[].campos[].configTabla, etc). Como todo el
// dato de Plantilla es JSON-seguro (es justo lo que se persiste), un round-trip JSON clona
// profundamente sin toparse con Proxies.
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Toda la lógica de edición de estructura y de autoría de ejemplos (tab Ejemplos) de
// PlantillaEditPage.vue — separada del componente para mantenerlo bajo el límite de 200 líneas
// (ver CLAUDE.md).
export function usePlantillaEditor(plantillaId: Ref<string>) {
  const { data: plantillaOriginal } = usePlantillaQuery(plantillaId);
  const actualizarPlantilla = useActualizarPlantilla();
  const { data: ejemplosData } = useEjemplosByPlantillaQuery(plantillaId);
  const crearEjemplo = useCrearEjemplo();
  const actualizarEjemplo = useActualizarEjemplo();
  const eliminarEjemplo = useEliminarEjemplo();
  const { data: catalogoExcel } = useCatalogoExcelQuery(plantillaId);
  const setExcelEjemplo = useSetExcelEjemplo();
  const pushActividad = usePushActividad();
  const ui = useUiStore();

  const editData = ref<Plantilla | null>(null) as Ref<Plantilla | null>;
  watch(plantillaOriginal, (p) => {
    if (p) editData.value = deepClone(p);
  }, { immediate: true });

  const activeTab = ref<VersionTab>('estructura');
  const activeSectionIndex = ref(0);
  const selectedCampo = ref<Campo | null>(null) as Ref<Campo | null>;
  const isNewCampo = ref(false);
  const editingHojaSeccionId = ref<string | null>(null);
  const leftWidth = ref(DEFAULT_LEFT);
  const rightWidth = ref(DEFAULT_RIGHT);
  const examplesWidth = ref(DEFAULT_EXAMPLES);
  const highlightMissingCaptura = ref(false);
  const jsonPreview = ref<{ title: string; json: string } | null>(null);
  const showImportEstructura = ref(false);

  const ejemplos = computed(() => ejemplosData.value ?? []);
  const ejemplosCount = computed(() => ejemplos.value.length);
  const activeEjemplo = ref<Ejemplo | null>(null) as Ref<Ejemplo | null>;
  const editedValores = ref<Record<string, string>>({});
  const showNuevoEjemplo = ref(false);
  const deleteTarget = ref<Ejemplo | null>(null) as Ref<Ejemplo | null>;
  const showExcelCatalogModal = ref(false);
  const showPreview = ref(false);
  const showInsertConfirm = ref(false);
  const isInserting = ref(false);
  const insertProgress = ref(0);

  const archivoExcelAsignado = computed(() => {
    const catalogo = catalogoExcel.value;
    return catalogo?.archivos.find((a) => a.id === catalogo.asignadoId) ?? null;
  });
  const { data: excelEjemploActivo } = useExcelEjemploQuery(computed(() => activeEjemplo.value?.id ?? null));
  const previewFileUrl = computed(
    () => (showExamples.value && activeEjemplo.value ? excelEjemploActivo.value?.dataUrl : undefined) ?? archivoExcelAsignado.value?.dataUrl ?? null,
  );
  const previewFileName = computed(
    () => (showExamples.value && activeEjemplo.value ? excelEjemploActivo.value?.nombre : undefined) ?? archivoExcelAsignado.value?.nombre,
  );

  function getDefaultValores(): Record<string, string> {
    if (!editData.value) return {};
    const defaults: Record<string, string> = {};
    for (const sec of editData.value.secciones) {
      for (const sub of sec.subsecciones) {
        for (const campo of sub.campos) {
          if (campo.valorEjemplo) defaults[campo.identificador] = campo.valorEjemplo;
        }
      }
    }
    return defaults;
  }

  watch(activeEjemplo, (ej) => {
    editedValores.value = ej?.valores && Object.keys(ej.valores).length > 0 ? { ...ej.valores } : getDefaultValores();
  });
  watch(ejemplos, (list) => {
    if (!activeEjemplo.value && list.length > 0) activeEjemplo.value = list[0];
  });

  function handleExampleValueChange(identificador: string, value: string) {
    editedValores.value = { ...editedValores.value, [identificador]: value };
  }

  async function handleCreateExample(nombre: string, subtitulo: string, detalle: string, tipologiasIoarr?: TipologiaIoarr[]) {
    if (!archivoExcelAsignado.value) return; // NuevoEjemploModal ya bloquea la creación sin Excel asignado
    const nuevo: Ejemplo = { id: generateId(), nombre, subtitulo, detalle, plantillaId: plantillaId.value, activo: false, valores: {}, tipologiasIoarr, estado: 'archivado' };
    await crearEjemplo.mutateAsync(nuevo);
    activeEjemplo.value = nuevo;
    editedValores.value = {};

    // Copia propia del Excel asignado a la plantilla
    await setExcelEjemplo.mutateAsync({
      ejemploId: nuevo.id,
      archivo: { id: generateId(), nombre: archivoExcelAsignado.value.nombre, dataUrl: archivoExcelAsignado.value.dataUrl, fechaSubida: new Date().toLocaleDateString('es-PE') },
    });

    await pushActividad.mutateAsync({ mensaje: `Nuevo ejemplo "${nombre}" creado`, color: 'green' });
    ui.toast(`Ejemplo "${nombre}" creado — completa los valores`);
  }

  function handleToggleEjemploEstado(ejemplo: Ejemplo) {
    const nuevoEstado = ejemplo.estado === 'publicado' ? 'archivado' : 'publicado';
    actualizarEjemplo.mutate({ id: ejemplo.id, data: { estado: nuevoEstado } });
    if (activeEjemplo.value?.id === ejemplo.id) activeEjemplo.value = { ...ejemplo, estado: nuevoEstado };
    ui.toast(nuevoEstado === 'publicado' ? `Ejemplo "${ejemplo.nombre}" publicado` : `Ejemplo "${ejemplo.nombre}" movido a borrador`);
  }

  async function handleDownloadExcel(ejemplo: Ejemplo) {
    const archivo = await excelEjemplosApi.get(ejemplo.id);
    if (!archivo) { ui.toast('Este ejemplo no tiene una copia de Excel asociada', 'error'); return; }
    const a = document.createElement('a');
    a.href = archivo.dataUrl;
    a.download = archivo.nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function handlePreviewExample(ejemplo: Ejemplo) {
    activeEjemplo.value = ejemplo;
    showPreview.value = true;
  }

  async function handleInsertExcel() {
    if (!editData.value || !activeEjemplo.value || !archivoExcelAsignado.value) return;
    const archivo = excelEjemploActivo.value;
    if (!archivo) { ui.toast('Este ejemplo no tiene una copia de Excel asociada', 'error'); showInsertConfirm.value = false; return; }
    isInserting.value = true;
    insertProgress.value = 0;
    try {
      // Siempre se inserta sobre el Excel original del catálogo (no sobre la copia ya insertada
      // del ejemplo) — insertar dos veces sobre la copia ya modificada duplicaría las filas
      // insertadas por tablas que crecen más allá de sus filas base.
      const nuevaDataUrl = await insertarValoresEnExcel(archivoExcelAsignado.value.dataUrl, editData.value, editedValores.value, (fraction) => {
        insertProgress.value = Math.round(fraction * 100);
      });
      await setExcelEjemplo.mutateAsync({ ejemploId: activeEjemplo.value.id, archivo: { ...archivo, dataUrl: nuevaDataUrl } });
      await pushActividad.mutateAsync({ mensaje: `Se insertaron los valores del ejemplo "${activeEjemplo.value.nombre}" en su Excel`, color: 'blue' });
      ui.toast('Valores insertados en el Excel del ejemplo');
    } catch (e) {
      ui.toast(e instanceof Error ? e.message : 'No se pudo insertar los valores en el Excel', 'error');
    } finally {
      isInserting.value = false;
      showInsertConfirm.value = false;
    }
  }

  async function handleDeleteEjemplo() {
    if (!deleteTarget.value) return;
    const target = deleteTarget.value;
    await eliminarEjemplo.mutateAsync(target.id);
    if (activeEjemplo.value?.id === target.id) {
      const restantes = ejemplos.value.filter((e) => e.id !== target.id);
      activeEjemplo.value = restantes[0] ?? null;
    }
    await pushActividad.mutateAsync({ mensaje: `Se eliminó el ejemplo "${target.nombre}"`, color: 'orange' });
    ui.toast(`Ejemplo "${target.nombre}" eliminado`);
    deleteTarget.value = null;
  }

  function handleLeftResize(d: number) { leftWidth.value = Math.max(MIN_LEFT, leftWidth.value + d); }
  function handleRightResize(d: number) { rightWidth.value = Math.max(MIN_RIGHT, rightWidth.value - d); }
  function handleExamplesResize(d: number) { examplesWidth.value = Math.max(MIN_EXAMPLES, examplesWidth.value + d); }

  function handleTabChange(tab: VersionTab) {
    activeTab.value = tab;
    selectedCampo.value = null;
    isNewCampo.value = false;
  }

  const secciones = computed(() => editData.value?.secciones ?? []);
  const safeIdx = computed(() => Math.min(activeSectionIndex.value, secciones.value.length - 1));
  const seccionActiva = computed(() => secciones.value[safeIdx.value]);
  const isFirst = computed(() => safeIdx.value === 0);
  const isLast = computed(() => safeIdx.value === secciones.value.length - 1);
  const showExamples = computed(() => activeTab.value === 'ejemplos');

  function handleSectionSelect(seccionId: string) {
    const idx = secciones.value.findIndex((s) => s.id === seccionId);
    if (idx !== -1) { activeSectionIndex.value = idx; selectedCampo.value = null; isNewCampo.value = false; }
  }
  function goToPrevSection() { activeSectionIndex.value = Math.max(0, activeSectionIndex.value - 1); }
  function goToNextSection() { activeSectionIndex.value = Math.min(secciones.value.length - 1, activeSectionIndex.value + 1); }

  function mutate(fn: (p: Plantilla) => void) {
    if (!editData.value) return;
    const next = deepClone(editData.value);
    fn(next);
    editData.value = next;
  }

  function handleFieldUpdate(campoId: string, updates: Partial<Campo>) {
    mutate((p) => {
      for (const sec of p.secciones) {
        const campo = sec.subsecciones.flatMap((s) => s.campos).find((c) => c.id === campoId);
        if (campo) { Object.assign(campo, updates); break; }
      }
    });
    if (selectedCampo.value?.id === campoId) selectedCampo.value = { ...selectedCampo.value, ...updates };
  }

  function handleAddCampo(subseccionId: string, subseccionCodigo: string) {
    const nuevoId = generateId();
    let nuevoCampo: Campo | null = null;
    mutate((p) => {
      for (const sec of p.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) {
          const maxN = sub.campos.reduce((max, c) => {
            const n = Number(c.identificador.split('.').pop());
            return Number.isFinite(n) ? Math.max(max, n) : max;
          }, 0);
          nuevoCampo = { id: nuevoId, identificador: `${subseccionCodigo}.${maxN + 1}`, etiqueta: 'Nuevo campo', tipo: 'texto_corto', editable: true, descripcion: '' };
          sub.campos.push(nuevoCampo);
          sec.cantidadCampos += 1;
          break;
        }
      }
    });
    if (nuevoCampo) { selectedCampo.value = nuevoCampo; isNewCampo.value = true; }
    ui.toast('Campo agregado');
  }

  function handleDeleteCampo(campoId: string, subseccionId: string) {
    mutate((p) => {
      for (const sec of p.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) {
          sub.campos = sub.campos.filter((c) => c.id !== campoId);
          sec.cantidadCampos = sec.subsecciones.reduce((sum, s) => sum + s.campos.length, 0);
          break;
        }
      }
    });
    if (selectedCampo.value?.id === campoId) selectedCampo.value = null;
  }

  function handleSectionNameChange(seccionId: string, nombre: string) {
    mutate((p) => { const sec = p.secciones.find((s) => s.id === seccionId); if (sec) sec.nombre = nombre; });
  }
  function handleSectionHojaChange(seccionId: string, hoja: string) {
    mutate((p) => { const sec = p.secciones.find((s) => s.id === seccionId); if (sec) sec.hoja = hoja; });
  }
  function handleSubsectionNameChange(subseccionId: string, nombre: string) {
    mutate((p) => { for (const sec of p.secciones) { const sub = sec.subsecciones.find((s) => s.id === subseccionId); if (sub) { sub.nombre = nombre; break; } } });
  }
  function handleSubseccionAyudaChange(subseccionId: string, ayuda: string) {
    mutate((p) => { for (const sec of p.secciones) { const sub = sec.subsecciones.find((s) => s.id === subseccionId); if (sub) { sub.ayuda = ayuda; break; } } });
  }
  function handleAddSubsection(seccionId: string) {
    mutate((p) => {
      const sec = p.secciones.find((s) => s.id === seccionId);
      if (sec) {
        const num = String(sec.subsecciones.length + 1).padStart(2, '0');
        sec.subsecciones.push({ id: generateId(), codigo: `${sec.numero}.${num}`, nombre: 'NUEVA SUBSECCIÓN', campos: [] });
      }
    });
    ui.toast('Subsección agregada');
  }
  function handleDeleteSubsection(subseccionId: string, seccionId: string) {
    mutate((p) => {
      const sec = p.secciones.find((s) => s.id === seccionId);
      if (sec && sec.subsecciones.length > 1) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        sec.subsecciones = sec.subsecciones.filter((s) => s.id !== subseccionId);
        if (sub) sec.cantidadCampos -= sub.campos.length;
      }
    });
  }
  function handleAddSection() {
    const nuevoIndex = secciones.value.length;
    mutate((p) => {
      const num = String(p.secciones.length + 1).padStart(2, '0');
      p.secciones.push({ id: generateId(), numero: num, nombre: 'Nueva sección', cantidadCampos: 0, subsecciones: [{ id: generateId(), codigo: `${num}.01`, nombre: 'SUBSECCIÓN', campos: [] }] });
      p.cantidadSecciones = p.secciones.length;
    });
    activeSectionIndex.value = nuevoIndex;
    ui.toast('Sección agregada');
  }

  function handleImportEstructura(secciones: Seccion[]) {
    mutate((p) => {
      p.secciones = secciones;
      p.cantidadSecciones = secciones.length;
    });
    activeSectionIndex.value = 0;
    selectedCampo.value = null;
    isNewCampo.value = false;
    ui.toast(`Estructura reemplazada — ${secciones.length} secciones importadas`);
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

    await pushActividad.mutateAsync({ mensaje: `Se guardó la plantilla ${editData.value.codigo} — ${editData.value.nombre}`, color: 'blue' });

    const sinCaptura = contarCamposSinCaptura(editData.value);
    if (sinCaptura > 0) {
      ui.toast(`Guardado, pero ${sinCaptura} campo${sinCaptura === 1 ? '' : 's'} no ${sinCaptura === 1 ? 'tiene' : 'tienen'} registrada su posición en el Excel`, 'error');
      highlightMissingCaptura.value = true;
      setTimeout(() => { highlightMissingCaptura.value = false; }, 2500);
    } else {
      ui.toast(`Plantilla "${editData.value.codigo}" guardada`);
    }
  }

  function handleViewJson() {
    if (!editData.value) return;
    if (activeTab.value === 'ejemplos' && activeEjemplo.value) {
      const doc = buildDocumento(editData.value, 'ejemplo', { ...activeEjemplo.value, valores: editedValores.value });
      jsonPreview.value = { title: `${editData.value.codigo} — Ejemplo: ${activeEjemplo.value.nombre}`, json: JSON.stringify(doc, null, 2) };
    } else {
      const doc = buildDocumento(editData.value, 'estructura');
      jsonPreview.value = { title: `${editData.value.codigo} — Estructura`, json: JSON.stringify(doc, null, 2) };
    }
  }

  return {
    editData, activeTab, activeSectionIndex, selectedCampo, isNewCampo, editingHojaSeccionId,
    leftWidth, rightWidth, examplesWidth, highlightMissingCaptura, ejemplosCount, jsonPreview,
    showImportEstructura,
    secciones, safeIdx, seccionActiva, isFirst, isLast, showExamples,
    ejemplos, activeEjemplo, editedValores, showNuevoEjemplo, deleteTarget,
    archivoExcelAsignado, showExcelCatalogModal, showPreview, showInsertConfirm, isInserting, insertProgress,
    previewFileUrl, previewFileName,
    handleLeftResize, handleRightResize, handleExamplesResize, handleTabChange, handleSectionSelect,
    goToPrevSection, goToNextSection, handleFieldUpdate, handleAddCampo, handleDeleteCampo,
    handleSectionNameChange, handleSectionHojaChange, handleSubsectionNameChange,
    handleSubseccionAyudaChange, handleAddSubsection, handleDeleteSubsection, handleAddSection,
    handleExampleValueChange, handleCreateExample, handleDeleteEjemplo, handleToggleEjemploEstado,
    handleDownloadExcel, handlePreviewExample, handleInsertExcel,
    handleImportEstructura,
    handleSave, handleViewJson,
  };
}
