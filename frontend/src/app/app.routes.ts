import { Route, Routes } from '@angular/router';
import { NAV_ITEMS, NOTIFICACIONES_ITEM } from './core/data/navigation.data';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AdminLayoutComponent } from './features/administrador/admin-layout/admin-layout.component';
import { ADMIN_MANTENIMIENTO_ACTIONS, ADMIN_NAV_ITEMS } from './core/data/admin-navigation.data';
import { ADMIN_INCIDENCIAS_ACTIONS } from './core/data/admin-incidencias.data';

// Módulos del menú que aún no tienen pantalla propia: comparten la pantalla "en construcción"
const modulosPendientes: Route[] = [...NAV_ITEMS, NOTIFICACIONES_ITEM]
  .filter((i) => i.route.startsWith('/modulo/'))
  .map((i) => ({
    path: i.route.substring(1),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio' },
    loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
  }));

const adminPendientes: Route[] = [
  ...ADMIN_NAV_ITEMS.filter((i) => !['/administrador/mantenimiento', '/administrador/incidencias'].includes(i.route)).map((i) => ({
    path: i.route.replace('/administrador/', ''),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio', volver: '/administrador/dashboard', volverTexto: 'Volver al dashboard' },
  })),
  ...ADMIN_INCIDENCIAS_ACTIONS.filter( (i) => i.route !== '/administrador/incidencias/pendientes' && i.route !== '/administrador/incidencias/todas' ).map((i) => ({
    path: i.route.replace('/administrador/', ''),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio', volver: '/administrador/incidencias', volverTexto: 'Volver a Incidencias' },
  })),
  ...ADMIN_MANTENIMIENTO_ACTIONS.filter((i) => i.route !== '/administrador/mantenimiento/programar').map((i) => ({
    path: i.route.replace('/administrador/', ''),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio', menu: 'rail', volver: '/administrador/mantenimiento', volverTexto: 'Volver a Mantenimiento' },
  })),
].map((r) => ({
  ...r,
  loadComponent: () =>
    import('./features/administrador/pendiente/admin-pendiente.component').then((m) => m.AdminPendienteComponent),
}));

export const routes: Routes = [
  // Espacio del Administrador (con su propio layout y menú)
  {
    path: 'administrador',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'incidencias',
        pathMatch: 'full',
        title: 'Incidencias',
        data: { fondo: 'edificio' },
        loadComponent: () =>
          import('./features/administrador/incidencias/incidencias-hub.component').then((m) => m.IncidenciasHubComponent),
      },
      {
        path: 'incidencias/pendientes',
        title: 'Pendientes',
        data: { fondo: 'edificio' },
        loadComponent: () =>
          import('./features/administrador/incidencias/pendientes/pendientes.component').then((m) => m.PendientesComponent),
      },
      {
        path: 'incidencias/todas',
        title: 'Todas las incidencias',
        data: { fondo: 'edificio' },
        loadComponent: () =>
          import('./features/administrador/incidencias/todas/todas.component')
            .then((m) => m.TodasComponent),
      },
      {
        path: 'incidencias/detalle/:id',
        title: 'Detalle de la incidencia',
        data: { menu: 'rail', fondo: 'terraza' },
        loadComponent: () =>
          import('./features/administrador/incidencias/detalle/detalle-admin.component').then((m) => m.DetalleAdminComponent),
      },
      // Redirige enlaces viejos
      { path: 'incidencias/clasificar/:id', redirectTo: 'incidencias/detalle/:id' },
      {
        path: 'mantenimiento',
        pathMatch: 'full',
        title: 'Mantenimiento',
        data: { fondo: 'edificio' },
        loadComponent: () =>
          import('./features/administrador/mantenimiento/mantenimiento-hub.component').then((m) => m.MantenimientoHubComponent),
      },
      {
        path: 'mantenimiento/programar',
        title: 'Programar mantenimiento preventivo',
        data: { menu: 'rail', fondo: 'terraza' },
        loadComponent: () =>
          import('./features/mantenimiento/programar/programar.component').then((m) => m.ProgramarMantenimientoComponent),
      },
      {
        path: 'mantenimiento/activos',
        title: 'Registrar activo',
        data: { menu: 'rail', fondo: 'terraza' },
        loadComponent: () =>
          import('./features/administrador/activos/registrar/registrar-activo.component')
            .then((m) => m.RegistrarActivoComponent),
      },
      ...adminPendientes,
    ],
  },

  // Login
  {
    path: 'login',
    title: 'Iniciar sesión',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },

  // Espacio de Residentes y otros roles
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio',
        canActivate: [roleGuard],
        data: {
          fondo: 'ciudad',
          roles: ['residente'],
        },
        loadComponent: () =>
          import('./features/home/home.component')
            .then((m) => m.HomeComponent),
      },
      {
        path: 'administrador/inicio',
        title: 'Inicio del administrador',
        canActivate: [roleGuard],
        data: {
          fondo: 'ciudad',
          roles: ['administrador'],
        },
        loadComponent: () =>
          import('./features/home/home.component')
            .then((m) => m.HomeComponent),
      },
      {
        path: 'mantenimiento/inicio',
        title: 'Inicio de mantenimiento',
        canActivate: [roleGuard],
        data: {
          fondo: 'ciudad',
          roles: ['mantenimiento'],
        },
        loadComponent: () =>
          import('./features/home/home.component')
            .then((m) => m.HomeComponent),
      },
      {
        path: 'seguridad/inicio',
        title: 'Inicio de portería y seguridad',
        canActivate: [roleGuard],
        data: {
          fondo: 'ciudad',
          roles: ['seguridad'],
        },
        loadComponent: () =>
          import('./features/home/home.component')
            .then((m) => m.HomeComponent),
      },

      {
        path: 'incidencias',
        pathMatch: 'full',
        title: 'Incidencias',
        data: { fondo: 'edificio' },
        loadComponent: () => import('./features/incidencias/incidencias.component').then((m) => m.IncidenciasComponent),
      },
      {
        path: 'incidencias/reportar',
        title: 'Reportar incidencia',
        data: { menu: 'rail', fondo: 'terraza' },
        loadComponent: () => import('./features/incidencias/reportar/reportar.component').then((m) => m.ReportarComponent),
      },
      {
        path: 'incidencias/mis-incidencias',
        title: 'Mis incidencias',
        data: { fondo: 'edificio', titulo: 'Mis incidencias', filtro: 'todas' },
        loadComponent: () => import('./features/incidencias/listado/listado.component').then((m) => m.ListadoIncidenciasComponent),
      },
      {
        path: 'incidencias/seguimiento',
        title: 'Seguimiento de incidencias',
        data: { fondo: 'edificio', titulo: 'Seguimiento de incidencias', filtro: 'activas' },
        loadComponent: () => import('./features/incidencias/listado/listado.component').then((m) => m.ListadoIncidenciasComponent),
      },
      {
        path: 'incidencias/historial',
        title: 'Historial de incidencias',
        data: { fondo: 'edificio', titulo: 'Historial de incidencias', filtro: 'cerradas' },
        loadComponent: () => import('./features/incidencias/listado/listado.component').then((m) => m.ListadoIncidenciasComponent),
      },
      {
        path: 'incidencias/caso/:id',
        title: 'Seguimiento de incidencia',
        data: { fondo: 'edificio' },
        loadComponent: () => import('./features/incidencias/detalle/detalle.component').then((m) => m.DetalleIncidenciaComponent),
      },
      {
        path: 'incidencias/asignadas',
        title: 'Incidencias asignadas',
        data: { fondo: 'edificio', titulo: 'Incidencias asignadas', filtro: 'asignadas' },
        loadComponent: () =>
          import('./features/incidencias/listado/listado.component').then((m) => m.ListadoIncidenciasComponent),
      },
      ...modulosPendientes,
    ],
  },
  { path: '**', redirectTo: '' },
];
