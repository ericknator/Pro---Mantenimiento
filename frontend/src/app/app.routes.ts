import { Route, Routes } from '@angular/router';
import { NAV_ITEMS, NOTIFICACIONES_ITEM, MANTENIMIENTO_ACTIONS } from './core/data/navigation.data';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AdminLayoutComponent } from './features/administrador/admin-layout/admin-layout.component';
import { ADMIN_MANTENIMIENTO_ACTIONS, ADMIN_NAV_ITEMS } from './core/data/admin-navigation.data';
import { ADMIN_INCIDENCIAS_ACTIONS } from './core/data/admin-incidencias.data';
import { ADMIN_ALERTAS_ACTIONS } from './core/data/admin-alertas.data';

const modulosPendientes: Route[] = [...NAV_ITEMS, NOTIFICACIONES_ITEM, ...MANTENIMIENTO_ACTIONS]
  .filter((i) =>
    i.route.startsWith('/modulo/') &&
    i.route !== '/modulo/alertas'
  )
  .map((i) => ({
    path: i.route.substring(1),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio' },
    loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
  }));

const adminPendientes: Route[] = [
  ...ADMIN_NAV_ITEMS.filter((i) => !['/administrador/mantenimiento', '/administrador/incidencias', '/administrador/alertas'].includes(i.route)).map((i) => ({
    path: i.route.replace('/administrador/', ''),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio', volver: '/administrador/dashboard', volverTexto: 'Volver al dashboard' },
  })),
  ...ADMIN_INCIDENCIAS_ACTIONS.filter((i) => i.route !== '/administrador/incidencias/pendientes' && i.route !== '/administrador/incidencias/todas').map((i) => ({
    path: i.route.replace('/administrador/', ''),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio', volver: '/administrador/incidencias', volverTexto: 'Volver a Incidencias' },
  })),
  ...ADMIN_MANTENIMIENTO_ACTIONS.filter((i) => !['/administrador/mantenimiento/programar', '/administrador/mantenimiento/activos', '/administrador/mantenimiento/historial'].includes(i.route)).map((i) => ({
    path: i.route.replace('/administrador/', ''),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio', menu: 'rail', volver: '/administrador/mantenimiento', volverTexto: 'Volver a Mantenimiento' },
  })),
  ...ADMIN_ALERTAS_ACTIONS.filter((i) => i.route !== '/administrador/alertas/activas').map((i) => ({
    path: i.route.replace('/administrador/', ''),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio', volver: '/administrador/alertas', volverTexto: 'Volver a Alertas' },
  })),
].map((r) => ({
  ...r,
  loadComponent: () =>
    import('./features/administrador/pendiente/admin-pendiente.component').then((m) => m.AdminPendienteComponent),
}));

export const routes: Routes = [
  {
    path: 'administrador',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador'] },
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
          import('./features/administrador/incidencias/todas/todas.component').then((m) => m.TodasComponent),
      },
      {
        path: 'incidencias/detalle/:id',
        title: 'Detalle de la incidencia',
        data: { menu: 'rail', fondo: 'terraza' },
        loadComponent: () =>
          import('./features/administrador/incidencias/detalle/detalle-admin.component').then((m) => m.DetalleAdminComponent),
      },
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
          import('./features/administrador/activos/registrar/registrar-activo.component').then((m) => m.RegistrarActivoComponent),
      },
      {
        path: 'mantenimiento/historial',
        title: 'Historial de activos',
        data: { menu: 'rail', fondo: 'terraza' },
        loadComponent: () =>
          import('./features/administrador/mantenimiento/historial/historial-activo.component').then((m) => m.HistorialActivoComponent),
      },
      {
        path: 'mantenimiento/historial/:id',
        title: 'Historial de activo',
        data: { menu: 'rail', fondo: 'terraza' },
        loadComponent: () =>
          import('./features/administrador/mantenimiento/historial/historial-activo.component').then((m) => m.HistorialActivoComponent),
      },
      {
        path: 'alertas',
        pathMatch: 'full',
        title: 'Alertas',
        data: { fondo: 'edificio' },
        loadComponent: () =>
          import('./features/administrador/alertas/alertas-hub.component').then((m) => m.AlertasHubComponent),
      },
      {
        path: 'alertas/activas',
        title: 'Alertas activas',
        data: { fondo: 'edificio' },
        loadComponent: () =>
          import('./features/administrador/alertas/activas/alertas-activas.component').then((m) => m.AlertasActivasComponent),
      },
      ...adminPendientes,
    ],
  },
  {
    path: 'login',
    title: 'Iniciar sesión',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
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
        data: { fondo: 'ciudad', roles: ['residente'] },
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'administrador/inicio',
        title: 'Inicio del administrador',
        canActivate: [roleGuard],
        data: { fondo: 'ciudad', roles: ['administrador'] },
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'mantenimiento/inicio',
        title: 'Inicio de mantenimiento',
        canActivate: [roleGuard],
        data: { fondo: 'ciudad', roles: ['mantenimiento'] },
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'seguridad/inicio',
        title: 'Inicio de portería y seguridad',
        canActivate: [roleGuard],
        data: { fondo: 'ciudad', roles: ['seguridad'] },
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'seguridad/alertas',
        title: 'Bandeja de alertas internas',
        canActivate: [roleGuard],
        data: { roles: ['seguridad'], fondo: 'edificio' },
        loadComponent: () =>
          import('./features/alertas-internas/bandeja-alertas.component').then((m) => m.BandejaAlertasComponent),
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
        data: { menu: 'rail', fondo: 'edificio' },
        loadComponent: () => import('./features/incidencias/detalle/detalle.component').then((m) => m.DetalleIncidenciaComponent),
      },
      {
        path: 'incidencias/detalle/:id',
        title: 'Detalle de la incidencia',
        data: { menu: 'rail', fondo: 'edificio' },
        loadComponent: () => import('./features/incidencias/detalle/detalle.component').then((m) => m.DetalleIncidenciaComponent),
      },
      {
        path: 'incidencias/asignadas',
        title: 'Incidencias asignadas',
        data: { fondo: 'edificio', titulo: 'Incidencias asignadas', filtro: 'asignadas' },
        loadComponent: () => import('./features/incidencias/listado/listado.component').then((m) => m.ListadoIncidenciasComponent),
      },
      {
        path: 'mantenimiento',
        pathMatch: 'full',
        title: 'Mantenimientos',
        data: { fondo: 'edificio' },
        loadComponent: () => import('./features/mantenimiento/mantenimiento.component').then((m) => m.MantenimientoComponent),
      },
      {
        path: 'mantenimiento/tareas-asignadas',
        title: 'Tareas preventivas asignadas',
        canActivate: [roleGuard],
        data: { menu: 'rail', fondo: 'terraza', titulo: 'Tareas preventivas asignadas', roles: ['mantenimiento', 'administrador'] },
        loadComponent: () =>
          import('./features/mantenimiento/tareas-asignadas/tareas-asignadas.component').then((m) => m.TareasAsignadasComponent),
      },
      {
        path: 'mantenimiento/tarea/:id',
        title: 'Detalle de tarea preventiva',
        canActivate: [roleGuard],
        data: { menu: 'rail', fondo: 'edificio', roles: ['mantenimiento', 'administrador'] },
        loadComponent: () =>
          import('./features/mantenimiento/detalle-tarea/detalle-tarea.component').then((m) => m.DetalleTareaComponent),
      },
      {
        path: 'mantenimiento/correctivos',
        title: 'Mantenimientos correctivos',
        data: { titulo: 'Mantenimientos correctivos', fondo: 'edificio', volver: '/mantenimiento', volverTexto: 'Volver a Mantenimiento' },
        loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'mantenimiento/calendario',
        title: 'Calendario de mantenimiento',
        data: { titulo: 'Calendario de mantenimiento', fondo: 'edificio', volver: '/mantenimiento', volverTexto: 'Volver a Mantenimiento' },
        loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'mantenimiento/historial',
        title: 'Historial de mantenimientos',
        data: { titulo: 'Historial de mantenimientos', fondo: 'edificio', volver: '/mantenimiento', volverTexto: 'Volver a Mantenimiento' },
        loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
      },
      {
        path: 'modulo/alertas',
        title: 'Alertas internas',
        canActivate: [roleGuard],
        data: { roles: ['residente'], fondo: 'edificio' },
        loadComponent: () =>
          import('./features/alertas-internas/reportar-alerta.component').then((m) => m.ReportarAlertaComponent),
      },
      {
        path: 'modulo/mis-alertas',
        title: 'Mis alertas',
        canActivate: [roleGuard],
        data: { roles: ['residente'], fondo: 'edificio' },
        loadComponent: () =>
          import('./features/alertas-internas/mis-alertas.component').then((m) => m.MisAlertasComponent),
      },
      ...modulosPendientes,
    ],
  },
  { path: '**', redirectTo: '' },
];