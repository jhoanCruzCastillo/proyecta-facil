<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSpinner, faFileExcel } from '@/lib/icons';

// Visor de Excel de solo lectura (Luckysheet). Reutilizado por ExcelCatalogModal y (más adelante)
// por ExcelPreviewModal — cambia de archivo cuando cambia `fileUrl`.
const props = withDefaults(
  defineProps<{ fileUrl: string | null; emptyMessage?: string }>(),
  { emptyMessage: 'Ningún archivo asignado' },
);

const VENDOR = '/vendor/luckysheet';
const CSS_FILES = [
  `${VENDOR}/plugins/css/pluginsCss.css`,
  `${VENDOR}/plugins/plugins.css`,
  `${VENDOR}/css/luckysheet.css`,
  `${VENDOR}/assets/iconfont/iconfont.css`,
];
const JS_FILES = [`${VENDOR}/plugins/js/plugin.js`, `${VENDOR}/luckysheet.umd.js`];

function loadAsset(url: string, kind: 'css' | 'js'): Promise<void> {
  return new Promise((resolve, reject) => {
    const selector = kind === 'css' ? `link[href="${url}"]` : `script[src="${url}"]`;
    if (document.querySelector(selector)) return resolve();
    const el = kind === 'css' ? document.createElement('link') : document.createElement('script');
    if (el instanceof HTMLLinkElement) {
      el.rel = 'stylesheet';
      el.href = url;
    } else {
      el.src = url;
    }
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    document.head.appendChild(el);
  });
}

const status = ref<'loading' | 'ready' | 'error'>('loading');
const errorMsg = ref('');
const reloadKey = ref(0);
const sheetsRef = shallowRef<unknown[] | null>(null);

watch(
  [() => props.fileUrl, reloadKey],
  async ([fileUrl], _old, onCleanup) => {
    if (!fileUrl) return;
    let disposed = false;
    onCleanup(() => { disposed = true; });
    sheetsRef.value = null;
    try {
      status.value = 'loading';
      await Promise.all(CSS_FILES.map((u) => loadAsset(u, 'css')));
      for (const js of JS_FILES) await loadAsset(js, 'js'); // plugin.js debe ir antes del umd
      const [{ default: LuckyExcel }, res] = await Promise.all([import('luckyexcel'), fetch(fileUrl)]);
      if (!res.ok) throw new Error(`No se pudo cargar el archivo (${res.status})`);
      const buffer = await res.arrayBuffer();
      // Algunos libros completamente vacíos hacen que transformExcelToLucky nunca invoque
      // ni resolve ni reject (cuelga la conversión) — con un plazo, si no responde a tiempo
      // se asume que el libro está vacío y se muestra una hoja en blanco igualmente.
      const conversion = new Promise<{ sheets?: unknown[] } | null>((resolve, reject) =>
        LuckyExcel.transformExcelToLucky(buffer, resolve, reject),
      );
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
      const json = await Promise.race([conversion, timeout]);
      const todasLasHojas = json?.sheets ?? [];
      // Omitir hojas sin celdas (p. ej. la portada "MENÚ" del 6A) — salvo que el libro esté
      // completamente vacío (o la conversión no haya respondido), en cuyo caso se muestra
      // una hoja en blanco en vez de un error.
      const conCeldas = todasLasHojas.filter((s) => ((s as { celldata?: unknown[] }).celldata?.length ?? 0) > 0);
      const sheets = conCeldas.length > 0
        ? conCeldas
        : todasLasHojas.length > 0
          ? todasLasHojas
          : [{ name: 'Hoja1', celldata: [], row: 36, column: 18, status: 1, order: 0, config: {} }];
      sheets.forEach((s, i) => { (s as { status: number }).status = i === 0 ? 1 : 0; });
      if (!disposed) { sheetsRef.value = sheets; status.value = 'ready'; }
    } catch (e) {
      if (!disposed) {
        errorMsg.value = e instanceof Error ? e.message : 'Error al leer el archivo';
        status.value = 'error';
      }
    }
  },
  { immediate: true },
);

// Montar Luckysheet cuando los datos están listos; destruir al desmontar/cambiar
watch(
  [() => props.fileUrl, status],
  ([fileUrl, st], _old, onCleanup) => {
    if (!fileUrl || st !== 'ready' || !sheetsRef.value) return;
    window.luckysheet?.create({
      container: 'excel-viewer-container',
      data: JSON.parse(JSON.stringify(sheetsRef.value)), // luckysheet muta los datos
      lang: 'es',
      allowEdit: false,
      showtoolbar: false,
      showinfobar: false,
      showstatisticBar: false,
      sheetFormulaBar: false,
      enableAddRow: false,
      enableAddBackTop: false,
      showsheetbarConfig: { add: false, menu: false },
      cellRightClickConfig: {
        copy: true, copyAs: false, paste: false, insertRow: false, insertColumn: false,
        deleteRow: false, deleteColumn: false, deleteCell: false, hideRow: false,
        hideColumn: false, rowHeight: false, columnWidth: false, clear: false,
        matrix: false, sort: false, filter: false, chart: false, image: false,
        link: false, data: false, cellFormat: false,
      },
    });
    onCleanup(() => {
      try { window.luckysheet?.destroy(); } catch { /* ya destruido */ }
    });
  },
);

function handleRetry() {
  sheetsRef.value = null;
  errorMsg.value = '';
  reloadKey.value += 1;
}
</script>

<template>
  <div v-if="!fileUrl" class="h-full flex flex-col items-center justify-center gap-2 text-muted">
    <FontAwesomeIcon :icon="faFileExcel" class="w-8 h-8 text-gray-300" />
    <span class="text-sm">{{ emptyMessage }}</span>
  </div>
  <div v-else class="relative h-full min-h-0">
    <div v-if="status === 'loading'" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
      <FontAwesomeIcon :icon="faSpinner" class="w-6 h-6 animate-spin text-brand-600" />
      <span class="text-sm">Cargando archivo...</span>
    </div>
    <div v-if="status === 'error'" class="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <span class="text-sm text-red-600 px-6 text-center">{{ errorMsg }}</span>
      <button @click="handleRetry" type="button" class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
        Reintentar
      </button>
    </div>
    <div id="excel-viewer-container" class="absolute inset-0" />
  </div>
</template>
