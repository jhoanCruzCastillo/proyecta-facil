import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { plantillasApi } from '@/api/plantillas';
import { sectoresApi } from '@/api/sectores';
import { generateId } from '@/api/mock/_shared';
import type { Plantilla } from '@/types';

// Orquesta la creación de una plantilla + el incremento del contador denormalizado
// `Sector.cantidadPlantillas`, replicando el efecto cruzado que en el prototipo React vivía
// dentro del mismo closure de `context.tsx` (addPlantilla). Es una transacción del lado cliente
// temporal — el endpoint real de CodeIgniter debería hacerla atómica cuando exista.
export function useCrearPlantilla() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plantilla: Omit<Plantilla, 'id'>) => {
      const creada = await plantillasApi.create({ ...plantilla, id: generateId() });
      const sector = await sectoresApi.get(plantilla.sectorId);
      if (sector) {
        await sectoresApi.update(sector.id, { cantidadPlantillas: sector.cantidadPlantillas + 1 });
      }
      return creada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plantillas'] });
      queryClient.invalidateQueries({ queryKey: ['sectores'] });
    },
  });
}
