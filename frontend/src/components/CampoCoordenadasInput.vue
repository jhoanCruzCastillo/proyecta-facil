<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLocationDot } from '@/lib/icons';
import { parseCoords } from '@/lib/coords';
import MapaModal from './MapaModal.vue';

const props = withDefaults(defineProps<{ value: string; editable?: boolean }>(), { editable: true });
const emit = defineEmits<{ change: [value: string] }>();

const open = ref(false);
const coords = ref(parseCoords(props.value));
watch(() => props.value, (v) => { coords.value = parseCoords(v); });

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;

const MINI_PIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30" width="20" height="30">
  <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 20 10 20S20 17.5 20 10C20 4.5 15.5 0 10 0z" fill="#16a34a" stroke="white" stroke-width="2"/>
  <circle cx="10" cy="10" r="4" fill="white"/>
</svg>`;

async function renderMiniMap() {
  map?.remove();
  map = null;
  if (!coords.value || !mapContainer.value) return;
  await nextTick();
  if (!mapContainer.value) return;
  map = L.map(mapContainer.value, {
    center: [coords.value.lat, coords.value.lng],
    zoom: 13,
    zoomControl: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false,
    attributionControl: false,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  L.marker([coords.value.lat, coords.value.lng], {
    icon: L.divIcon({ className: '', html: MINI_PIN, iconSize: [20, 30], iconAnchor: [10, 30] }),
  }).addTo(map);
}

watch(coords, renderMiniMap, { immediate: true });

function handleConfirm(c: { lat: number; lng: number }) {
  emit('change', JSON.stringify(c));
}
</script>

<template>
  <div @click.stop>
    <div
      v-if="coords"
      class="rounded-lg overflow-hidden border border-gray-200 transition-colors"
      :class="editable ? 'cursor-pointer hover:border-brand-400' : ''"
      @click="editable && (open = true)"
    >
      <div style="height: 110px; position: relative">
        <div ref="mapContainer" class="w-full h-full" style="pointer-events: none" />
      </div>
      <div class="flex items-center justify-between px-2.5 py-1.5 bg-white border-t border-gray-100">
        <span class="text-[11px] font-mono text-gray-500">{{ coords.lat.toFixed(5) }}, {{ coords.lng.toFixed(5) }}</span>
        <span v-if="editable" class="text-[11px] text-brand-600 font-medium">Cambiar ›</span>
      </div>
    </div>
    <button
      v-else
      @click="editable && (open = true)"
      :disabled="!editable"
      type="button"
      class="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-default"
    >
      <FontAwesomeIcon :icon="faLocationDot" class="w-4 h-4" />
      <span class="text-xs font-medium">Seleccionar en el mapa</span>
    </button>

    <MapaModal :is-open="open" :initial-coords="coords" @close="open = false" @confirm="handleConfirm" />
  </div>
</template>
