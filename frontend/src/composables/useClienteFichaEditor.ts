import { type Ref, computed, ref, watch } from 'vue';
import { useEjemploQuery, useEjemplosByPlantillaQuery, useActualizarEjemplo } from '@/composables/useEjemplos';
import { usePlantillaQuery } from '@/composables/usePlantillas';
import { useExcelEjemploQuery, useSetExcelEjemplo } from '@/composables/useExcelEjemplos';
import { useRegistrarCambioFicha } from '@/composables/useHistorialCambios';
import { usePushActividad } from '@/composables/useActividad';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useEstadoEntrenamiento } from '@/composables/useEstadoEntrenamiento';
import { useSessionStore } from '@/stores/session';
import { useUiStore } from '@/stores/ui';
import { generateId } from '@/api/mock/_shared';
import { cuentaEfectivaDe, puedeVerFicha } from '@/lib/permisos';
import { puedeVerHistorial } from '@/lib/planAcceso';
import { insertarValoresEnExcel } from '@/lib/excelWriter';
import { calcularCambios } from '@/lib/historialFicha';
import { validarValoresPlantilla, calcularProgresoValores } from '@/lib/valorValidation';

const MIN_LEFT = 180;
const DEFAULT_LEFT = 260;

export function useClienteFichaEditor(ejemploId: Ref<string>) {
  const session = useSessionStore();
  const ui = useUiStore();

  const { data: ejemplo } = useEjemploQuery(ejemploId);
  const plantillaId = computed(() => ejemplo.value?.plantillaId ?? '');
  const { data: plantilla } = usePlantillaQuery(plantillaId);
  const { data: archivoEjemplo } = useExcelEjemploQuery(ejemploId);
  const { data: ejemplosPlantillaData } = useEjemplosByPlantillaQuery(plantillaId);
  const { data: usuariosData } = useUsuariosQuery();
  const actualizarEjemplo = useActualizarEjemplo();
  const setExcelEjemplo = useSetExcelEjemplo();
  const registrarCambioFicha = useRegistrarCambioFicha();
  const pushActividad = usePushActividad();
  const { esNivel0, vencido, diasRestantes, numeroNivel } = useEstadoEntrenamiento();

  const soloLectura = computed(() => esNivel0.value && vencido.value);
  const permiteMejoraIA = computed(() => numeroNivel.value >= 1);
  const muestraHistorial = computed(() => puedeVerHistorial(numeroNivel.value));
  const showHistorial = ref(false);

  const cuentaId = computed(() => (session.sesion ? cuentaEfectivaDe(usuariosData.value ?? [], session.sesion) : null));
  const esTitular = computed(() => !!session.sesion && session.sesion.usuarioId === cuentaId.value);
  const esPropietario = computed(
    () => !!ejemplo.value && !!session.sesion && ejemplo.value.propietarioId === cuentaId.value && puedeVerFicha(ejemplo.value, session.sesion.usuarioId, esTitular.value),
  );
  // Ejemplos autorados por el admin para esta plantilla (sin propietarioId) — sirven de guía al cliente.
  const ejemplosReferencia = computed(() => (ejemplosPlantillaData.value ?? []).filter((e) => !e.propietarioId));

  const activeSectionIndex = ref(0);
  const editedValores = ref<Record<string, string>>({});
  const leftWidth = ref(DEFAULT_LEFT);
  const showPreview = ref(false);
  const showInsertConfirm = ref(false);
  const isInserting = ref(false);
  const insertProgress = ref(0);
  const referenciaId = ref('');
  const referenciaEjemplo = computed(() => ejemplosReferencia.value.find((e) => e.id === referenciaId.value));

  watch(ejemplo, (ej) => {
    if (ej) editedValores.value = { ...ej.valores };
  });

  // En modo entrenamiento el solucionario es el punto central del ejercicio — se preselecciona
  // en vez de dejar que el cliente tenga que descubrir el selector de "Ejemplo de referencia".
  watch([esNivel0, ejemplosReferencia], ([nivel0, referencias]) => {
    if (nivel0 && !referenciaId.value && referencias.length > 0) referenciaId.value = referencias[0].id;
  });

  const errores = computed(() => (plantilla.value ? validarValoresPlantilla(plantilla.value, editedValores.value) : {}));
  const erroresCount = computed(() => Object.keys(errores.value).length);
  const progreso = computed(() => (plantilla.value ? calcularProgresoValores(plantilla.value, editedValores.value) : undefined));
  const erroresPorSeccion = computed(() => {
    if (!plantilla.value) return {} as Record<string, number>;
    const map: Record<string, number> = {};
    for (const seccion of plantilla.value.secciones) {
      map[seccion.id] = seccion.subsecciones.reduce((acc, sub) => acc + sub.campos.filter((c) => errores.value[c.identificador]).length, 0);
    }
    return map;
  });

  const secciones = computed(() => plantilla.value?.secciones ?? []);
  const safeIdx = computed(() => Math.min(activeSectionIndex.value, secciones.value.length - 1));
  const seccionActiva = computed(() => secciones.value[safeIdx.value]);
  const isFirst = computed(() => safeIdx.value === 0);
  const isLast = computed(() => safeIdx.value === secciones.value.length - 1);

  function handleLeftResize(d: number) { leftWidth.value = Math.max(MIN_LEFT, leftWidth.value + d); }
  function handleSectionSelect(seccionId: string) {
    const idx = secciones.value.findIndex((s) => s.id === seccionId);
    if (idx !== -1) activeSectionIndex.value = idx;
  }
  function goToPrevSection() { activeSectionIndex.value = Math.max(0, activeSectionIndex.value - 1); }
  function goToNextSection() { activeSectionIndex.value = Math.min(secciones.value.length - 1, activeSectionIndex.value + 1); }
  function handleValueChange(campoIdentificador: string, value: string) {
    editedValores.value = { ...editedValores.value, [campoIdentificador]: value };
  }

  async function handleSave() {
    if (!plantilla.value || !ejemplo.value || !session.sesion) return;
    const cambios = calcularCambios(plantilla.value, ejemplo.value.valores, editedValores.value);
    await actualizarEjemplo.mutateAsync({ id: ejemplo.value.id, data: { valores: editedValores.value } });
    if (cambios.length > 0) {
      await registrarCambioFicha.mutateAsync({
        id: generateId(),
        ejemploId: ejemplo.value.id,
        usuarioId: session.sesion.usuarioId,
        fecha: new Date().toISOString(),
        campos: cambios,
      });
    }
    await pushActividad.mutateAsync({ mensaje: `Guardaste avances en "${ejemplo.value.nombre}"`, color: 'blue' });
    ui.toast(`"${ejemplo.value.nombre}" guardada`);
  }

  function handleDownload() {
    if (!archivoEjemplo.value) { ui.toast('Esta ficha no tiene una copia de Excel asociada', 'error'); return; }
    const a = document.createElement('a');
    a.href = archivoEjemplo.value.dataUrl;
    a.download = archivoEjemplo.value.nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function handleInsert() {
    if (!plantilla.value || !ejemplo.value || !archivoEjemplo.value) {
      ui.toast('Esta ficha no tiene una copia de Excel asociada', 'error');
      showInsertConfirm.value = false;
      return;
    }
    isInserting.value = true;
    insertProgress.value = 0;
    try {
      // Se inserta siempre sobre la copia propia de la ficha (tomada al crearla), no sobre el
      // archivo que esté asignado hoy en el catálogo — así el resultado no se rompe si el admin
      // reasigna un Excel distinto a la plantilla después de que el cliente ya empezó a llenarla.
      const nuevaDataUrl = await insertarValoresEnExcel(archivoEjemplo.value.dataUrl, plantilla.value, editedValores.value, (fraction) => {
        insertProgress.value = Math.round(fraction * 100);
      });
      await setExcelEjemplo.mutateAsync({ ejemploId: ejemplo.value.id, archivo: { ...archivoEjemplo.value, dataUrl: nuevaDataUrl } });
      await pushActividad.mutateAsync({ mensaje: `Se insertaron los valores de "${ejemplo.value.nombre}" en su Excel`, color: 'blue' });
      ui.toast('Valores insertados en el Excel');
    } catch (e) {
      ui.toast(e instanceof Error ? e.message : 'No se pudo insertar los valores en el Excel', 'error');
    } finally {
      isInserting.value = false;
      showInsertConfirm.value = false;
    }
  }

  return {
    ejemplo, plantilla, archivoEjemplo, esNivel0, vencido, diasRestantes, numeroNivel,
    soloLectura, permiteMejoraIA, muestraHistorial, showHistorial,
    esPropietario, ejemplosReferencia, referenciaId, referenciaEjemplo,
    activeSectionIndex, editedValores, leftWidth, showPreview, showInsertConfirm, isInserting, insertProgress,
    errores, erroresCount, progreso, erroresPorSeccion,
    secciones, safeIdx, seccionActiva, isFirst, isLast,
    handleLeftResize, handleSectionSelect, goToPrevSection, goToNextSection, handleValueChange,
    handleSave, handleDownload, handleInsert,
  };
}
