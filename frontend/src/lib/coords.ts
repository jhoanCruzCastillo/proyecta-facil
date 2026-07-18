// Coordenadas de un campo tipo mapa_coordenadas, guardadas como JSON string `{"lat":...,"lng":...}`.
// El selector visual vive en components/CampoCoordenadasInput.vue + MapaModal.vue (Leaflet).

export function parseCoords(v?: string | null): { lat: number; lng: number } | null {
  if (!v) return null;
  try {
    const p = JSON.parse(v);
    if (typeof p?.lat === 'number' && typeof p?.lng === 'number') return p;
  } catch {
    /* noop */
  }
  return null;
}
