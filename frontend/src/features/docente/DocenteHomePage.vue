<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faHouse, faCheck, faXmark, faComments, faVideo, faCalendarWeek } from '@/lib/icons';
import PageShell from '@/components/PageShell.vue';
import AsesoriaChatPanel from '@/features/asesoria/AsesoriaChatPanel.vue';
import { useSessionStore } from '@/stores/session';
import { useMisSolicitudesQuery, useAceptarSolicitud, useRechazarSolicitud } from '@/composables/useAsesoria';
import type { SolicitudAsesoria } from '@/types';

const session = useSessionStore();
const docenteId = computed(() => session.sesion?.usuarioId ?? '');

const { data: solicitudes, isLoading } = useMisSolicitudesQuery(docenteId, 'docente');
const aceptarSolicitud = useAceptarSolicitud();
const rechazarSolicitud = useRechazarSolicitud();

const pendientes = computed(() => (solicitudes.value ?? []).filter((s) => s.estado === 'pendiente'));
const activas = computed(() => (solicitudes.value ?? []).filter((s) => s.estado === 'aceptada'));
const historial = computed(() => (solicitudes.value ?? []).filter((s) => s.estado === 'rechazada' || s.estado === 'finalizada'));

const pidiendoLinkPara = ref<string | null>(null);
const linkBorrador = ref('');
const chatAbiertoId = ref<string | null>(null);
const chatAbierto = computed(() => activas.value.find((s) => s.id === chatAbiertoId.value) ?? null);

function aceptar(s: SolicitudAsesoria) {
  if (s.tipo === 'video') {
    pidiendoLinkPara.value = s.id;
    linkBorrador.value = '';
    return;
  }
  aceptarSolicitud.mutate({ solicitudId: s.id });
}

function confirmarAceptarConLink(s: SolicitudAsesoria) {
  aceptarSolicitud.mutate({ solicitudId: s.id, linkReunion: linkBorrador.value.trim() || undefined });
  pidiendoLinkPara.value = null;
}

function rechazar(s: SolicitudAsesoria) {
  rechazarSolicitud.mutate(s.id);
}
</script>

<template>
  <PageShell :icon="faHouse" title="Solicitudes de asesoría" description="Clientes que te pidieron ayuda mientras llenaban una ficha.">
    <template #actions>
      <RouterLink
        :to="{ name: 'docente-horario' }"
        class="px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon :icon="faCalendarWeek" class="w-3.5 h-3.5" />
        Mi horario
      </RouterLink>
    </template>

    <p v-if="isLoading" class="text-sm text-muted">Cargando…</p>
    <template v-else>
      <section v-if="pendientes.length > 0" class="mb-8">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Pendientes ({{ pendientes.length }})</h3>
        <div class="space-y-3">
          <div v-for="s in pendientes" :key="s.id" class="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-heading text-sm">{{ s.clienteNombre }}</span>
                  <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                    <FontAwesomeIcon :icon="s.tipo === 'video' ? faVideo : faComments" class="w-2.5 h-2.5" />
                    {{ s.tipo === 'video' ? 'Videollamada' : 'Chat' }}
                  </span>
                </div>
                <p v-if="s.mensajeInicial" class="text-xs text-muted mt-1">"{{ s.mensajeInicial }}"</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button
                  @click="rechazar(s)"
                  type="button"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Rechazar"
                >
                  <FontAwesomeIcon :icon="faXmark" class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="aceptar(s)"
                  type="button"
                  class="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors flex items-center gap-1.5"
                >
                  <FontAwesomeIcon :icon="faCheck" class="w-3 h-3" />
                  Aceptar
                </button>
              </div>
            </div>

            <div v-if="pidiendoLinkPara === s.id" class="mt-3 flex items-center gap-2" @click.stop>
              <input
                v-model="linkBorrador"
                type="text"
                placeholder="Pega tu link de Zoom/Meet..."
                class="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <button
                @click="confirmarAceptarConLink(s)"
                :disabled="!linkBorrador.trim()"
                type="button"
                class="px-3 py-2 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 disabled:opacity-40 transition-colors shrink-0"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-8">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Activas ({{ activas.length }})</h3>
        <p v-if="activas.length === 0" class="text-sm text-muted">No tienes asesorías activas.</p>
        <div v-else class="space-y-2">
          <button
            v-for="s in activas"
            :key="s.id"
            @click="chatAbiertoId = s.id"
            type="button"
            class="w-full flex items-center justify-between gap-4 p-3 rounded-xl bg-surface hover:bg-gray-100 transition-colors text-left"
          >
            <div class="flex items-center gap-2 min-w-0">
              <FontAwesomeIcon :icon="s.tipo === 'video' ? faVideo : faComments" class="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span class="font-medium text-heading text-sm truncate">{{ s.clienteNombre }}</span>
            </div>
            <span class="text-xs text-brand-600 font-medium shrink-0">Abrir chat →</span>
          </button>
        </div>
      </section>

      <section v-if="historial.length > 0">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Historial</h3>
        <div class="space-y-1.5">
          <div v-for="s in historial" :key="s.id" class="flex items-center justify-between px-3 py-2 rounded-lg bg-surface text-xs">
            <span class="text-heading">{{ s.clienteNombre }}</span>
            <span class="text-muted">{{ s.estado === 'finalizada' ? 'Finalizada' : 'Rechazada' }}</span>
          </div>
        </div>
      </section>
    </template>

    <AsesoriaChatPanel
      v-if="chatAbierto"
      :solicitud="chatAbierto"
      :usuario-actual-id="docenteId"
      :otra-parte-nombre="chatAbierto.clienteNombre ?? 'Cliente'"
      @close="chatAbiertoId = null"
      @finalizada="chatAbiertoId = null"
    />
  </PageShell>
</template>
