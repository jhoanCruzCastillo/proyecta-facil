<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLock, faChalkboardUser, faCalendarCheck, faVideo } from '@/lib/icons';
import { useSessionStore } from '@/stores/session';
import { useUsuariosQuery } from '@/composables/useUsuarios';
import { useMentoriasQuery } from '@/composables/useMentorias';
import { useEstadoEntrenamiento } from '@/composables/useEstadoEntrenamiento';
import { cuentaEfectivaDe } from '@/lib/permisos';
import { puedeAccederMentorias } from '@/lib/planAcceso';
import PageShell from '@/components/PageShell.vue';
import PlanesModal from '@/features/settings/PlanesModal.vue';
import ProximasSesionesList from './ProximasSesionesList.vue';
import MisMentoriasList from './MisMentoriasList.vue';

type Tab = 'proximas' | 'mias';

const session = useSessionStore();
const { data: usuariosData } = useUsuariosQuery();
const { data: mentoriasData } = useMentoriasQuery();
const { numeroNivel } = useEstadoEntrenamiento();
const showPlanes = ref(false);
const tab = ref<Tab>('proximas');

const mentorias = computed(() => mentoriasData.value ?? []);
const cuentaId = computed(() => (session.sesion ? cuentaEfectivaDe(usuariosData.value ?? [], session.sesion) : ''));
const bloqueado = computed(() => !puedeAccederMentorias(numeroNivel.value));

const countProximas = computed(() => mentorias.value.filter((m) => new Date(m.fechaISO).getTime() > Date.now()).length);
const countMias = computed(() => mentorias.value.filter((m) => m.inscritos.includes(cuentaId.value)).length);

const tabs = computed(() => [
  { key: 'proximas' as Tab, label: 'Próximas sesiones', icon: faCalendarCheck, count: countProximas.value },
  { key: 'mias' as Tab, label: 'Mis mentorías', icon: faVideo, count: countMias.value },
]);
</script>

<template>
  <PageShell
    :icon="faChalkboardUser"
    title="Mentorías"
    description="Sesiones grupales en vivo con un mentor real — más económicas que una consultoría 1 a 1."
  >
    <template v-if="bloqueado">
      <div class="flex flex-col items-center text-center max-w-lg mx-auto py-8">
        <div class="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
          <FontAwesomeIcon :icon="faLock" class="w-5 h-5" />
        </div>
        <h2 class="text-xl font-bold text-heading mb-2">Disponible desde el plan Nivel 1</h2>
        <p class="text-sm text-muted mb-6 leading-relaxed">
          El respaldo humano que complementa a tu asesor de IA: sesiones grupales en vivo con un
          mentor real, donde puedes hacer preguntas puntuales, ver cómo otros resuelven dudas
          parecidas y sentir que no estás solo llenando tu ficha.
        </p>
        <button @click="showPlanes = true" type="button" class="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
          Actualizar plan
        </button>
      </div>
      <PlanesModal v-if="cuentaId" :is-open="showPlanes" :usuario-id="cuentaId" @close="showPlanes = false" />
    </template>

    <template v-else>
      <div class="flex gap-2 mb-6">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="tab = t.key"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-75"
          :class="tab === t.key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
        >
          <FontAwesomeIcon :icon="t.icon" class="w-3.5 h-3.5" />
          {{ t.label }}
          <span
            class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center"
            :class="tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'"
          >
            {{ t.count }}
          </span>
        </button>
      </div>

      <ProximasSesionesList v-if="tab === 'proximas'" :mentorias="mentorias" :cuenta-id="cuentaId" />
      <MisMentoriasList v-else :mentorias="mentorias" :cuenta-id="cuentaId" :usuario-id="session.sesion?.usuarioId ?? ''" :numero-nivel="numeroNivel" />
    </template>
  </PageShell>
</template>
