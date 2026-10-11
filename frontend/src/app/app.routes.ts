import { Route, Routes } from '@angular/router';
import { NAV_ITEMS, NOTIFICACIONES_ITEM } from './core/data/navigation.data';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

// Módulos del menú que aún no tienen pantalla propia: comparten la pantalla "en construcción"
const modulosPendientes: Route[] = [...NAV_ITEMS, NOTIFICACIONES_ITEM]
  .filter((i) => i.route.startsWith('/modulo/'))
  .map((i) => ({
    path: i.route.substring(1),
    title: i.label,
    data: { titulo: i.label, fondo: 'edificio' },
    loadComponent: () => import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
  }));

export const routes: Routes = [
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
        data: { fondo: 'ciudad' },
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
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
      ...modulosPendientes,
    ],
  },
  { path: '**', redirectTo: '' },
];
