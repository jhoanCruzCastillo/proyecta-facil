import { createRouter, createWebHistory } from 'vue-router';
import { useSessionStore } from '@/stores/session';
import { puedeAccederGestionUsuarios } from '@/lib/permisos';

// Rutas agregadas en fases posteriores (sectores/:id, editor, usuarios, cliente, etc.) — ver
// C:\Users\anton\.claude\plans\reactive-forging-wren.md. Cada meta.* controla el guard único de abajo,
// reemplazando los 4 componentes wrapper (RequireAuth/RequireGestionUsuarios/RequireNoCliente/RequireCliente)
// que tenía el prototipo React.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/features/auth/LoginPage.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/features/dashboard/HomeRouter.vue'),
        },
        {
          path: 'sectores',
          name: 'sectores',
          component: () => import('@/features/sectores/SectoresPage.vue'),
          meta: { noCliente: true },
        },
        {
          path: 'sectores/:sectorId',
          name: 'sector-detalle',
          component: () => import('@/features/plantillas/SectorDetallePage.vue'),
          meta: { noCliente: true },
        },
        {
          path: 'sectores/:sectorId/plantilla/:plantillaId',
          name: 'plantilla-ver',
          component: () => import('@/features/editor/PlantillaViewPage.vue'),
          meta: { noCliente: true },
        },
        {
          path: 'sectores/:sectorId/plantilla/:plantillaId/editar',
          name: 'plantilla-editar',
          component: () => import('@/features/editor/PlantillaEditPage.vue'),
          meta: { noCliente: true },
        },
        {
          path: 'sectores/:sectorId/plantilla/:plantillaId/perfil',
          name: 'plantilla-perfil',
          component: () => import('@/features/editor/PlantillaPerfilPage.vue'),
          meta: { noCliente: true },
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('@/features/usuarios/UsuariosPage.vue'),
          meta: { gestionUsuarios: true },
        },
        {
          path: 'fichas-oficiales',
          name: 'fichas-oficiales',
          component: () => import('@/features/cliente/FichasOficialesPage.vue'),
          meta: { soloCliente: true },
        },
        {
          path: 'mis-fichas/:ejemploId',
          name: 'mis-ficha-editar',
          component: () => import('@/features/cliente/ClienteFichaEditPage.vue'),
          meta: { soloCliente: true },
        },
        {
          path: 'mentorias',
          name: 'mentorias',
          component: () => import('@/features/cliente/MentoriasPage.vue'),
          meta: { soloCliente: true },
        },
        {
          path: 'docente/horario',
          name: 'docente-horario',
          component: () => import('@/features/docente/HorarioDocenteEditor.vue'),
          meta: { soloDocente: true },
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const session = useSessionStore();

  if (to.meta.requiresAuth && !session.sesion) {
    return { name: 'login' };
  }
  if (to.meta.noCliente && (session.sesion?.rol === 'cliente' || session.sesion?.rol === 'docente')) {
    return { name: 'home' };
  }
  if (to.meta.gestionUsuarios && !(session.sesion && puedeAccederGestionUsuarios(session.sesion.rol))) {
    return { name: 'home' };
  }
  if (to.meta.soloCliente && session.sesion?.rol !== 'cliente') {
    return { name: 'home' };
  }
  if (to.meta.soloDocente && session.sesion?.rol !== 'docente') {
    return { name: 'home' };
  }
  if (to.name === 'login' && session.sesion) {
    return { name: 'home' };
  }
  return true;
});

export default router;
