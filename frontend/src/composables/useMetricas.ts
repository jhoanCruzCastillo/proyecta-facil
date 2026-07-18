import { computed } from 'vue';
import { useSectoresQuery } from './useSectores';

// Igual que `getMetricas()` en context.tsx del prototipo: los totales de plantillas/ejemplos se
// derivan de los contadores denormalizados en cada Sector, no de los recursos `plantillas`/`ejemplos`
// (todavía no migrados).
export function useMetricas() {
  const { data: sectores } = useSectoresQuery();

  return computed(() => {
    const lista = sectores.value ?? [];
    return {
      totalSectores: lista.filter((s) => s.activo).length,
      totalPlantillas: lista.reduce((sum, s) => sum + s.cantidadPlantillas, 0),
      totalEjemplos: lista.reduce((sum, s) => sum + s.cantidadEjemplos, 0),
    };
  });
}
