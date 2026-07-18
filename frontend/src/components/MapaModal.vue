<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLocationDot, faXmark } from '@/lib/icons';

const props = defineProps<{
  isOpen: boolean;
  initialCoords?: { lat: number; lng: number } | null;
}>();

const emit = defineEmits<{ close: []; confirm: [coords: { lat: number; lng: number }] }>();

const PERU: L.LatLngLiteral = { lat: -9.19, lng: -75.01 };

function makePinIcon(size = 24) {
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size}" height="${size * 1.5}">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24S24 21 24 12C24 5.4 18.6 0 12 0z" fill="#16a34a" stroke="white" stroke-width="2.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.5],
  });
}

const mapContainer = ref<HTMLElement | null>(null);
const pending = ref<{ lat: number; lng: number } | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

function destroyMap() {
  map?.remove();
  map = null;
  marker = null;
}

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) { destroyMap(); return; }
    pending.value = props.initialCoords ?? null;
    await nextTick();
    if (!mapContainer.value) return;
    const center: L.LatLngExpression = props.initialCoords ? [props.initialCoords.lat, props.initialCoords.lng] : [PERU.lat, PERU.lng];
    const zoom = props.initialCoords ? 13 : 6;
    map = L.map(mapContainer.value, { center, zoom });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    const icon = makePinIcon();
    if (props.initialCoords) {
      marker = L.marker([props.initialCoords.lat, props.initialCoords.lng], { icon }).addTo(map);
    }
    map.on('click', (e) => {
      const c = { lat: +e.latlng.lat.toFixed(6), lng: +e.latlng.lng.toFixed(6) };
      pending.value = c;
      if (marker) marker.setLatLng([c.lat, c.lng]);
      else marker = L.marker([c.lat, c.lng], { icon }).addTo(map!);
    });
  },
);

function handleConfirm() {
  if (!pending.value) return;
  emit('confirm', pending.value);
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')" />
      <div class="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col w-full max-w-4xl" style="max-height: 90vh">
        <div class="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <FontAwesomeIcon :icon="faLocationDot" class="w-4 h-4 text-brand-600" />
            <div>
              <p class="font-bold text-heading text-sm">Seleccionar ubicación</p>
              <p class="text-xs text-muted">Haz clic en cualquier punto del mapa</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <code v-if="pending" class="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
              {{ pending.lat.toFixed(5) }}, {{ pending.lng.toFixed(5) }}
            </code>
            <button @click="emit('close')" type="button" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <FontAwesomeIcon :icon="faXmark" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref="mapContainer" class="flex-1" style="height: 58vh; min-height: 380px" />

        <div class="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50">
          <p class="text-xs text-muted">
            {{ pending ? `${pending.lat.toFixed(5)}° lat, ${pending.lng.toFixed(5)}° lng` : 'Ningún punto seleccionado' }}
          </p>
          <div class="flex gap-2.5">
            <button @click="emit('close')" type="button" class="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              @click="handleConfirm"
              :disabled="!pending"
              type="button"
              class="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Usar esta ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
