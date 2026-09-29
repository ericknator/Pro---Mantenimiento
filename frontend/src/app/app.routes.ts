import { Route, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { EXIT_ITEM, INCIDENT_ACTIONS, NAV_ITEMS } from './core/data/navigation.data';

const placeholderRoutes: Route[] = [...NAV_ITEMS, ...INCIDENT_ACTIONS, EXIT_ITEM]
  .filter((i) => i.route.startsWith('/modulo/') || i.route.startsWith('/incidencias/'))
  .filter((i) => i.route !== '/incidencias/reportar')
  .map((i) => ({
    path: i.route.substring(1),
    title: i.label,
    data: {
      title: i.label,
      soon: !!i.soon,
      mode: i.route.startsWith('/incidencias/') ? 'focus' : 'scene',
    },
    loadComponent: () =>
      import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
  }));

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio',
        data: { mode: 'scene' },
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'incidencias',
        title: 'Incidencias',
        data: { mode: 'scene' },
        loadComponent: () =>
          import('./features/incidencias/incidencias.component').then((m) => m.IncidenciasComponent),
      },
      {
        path: 'incidencias/reportar',
        title: 'Reportar incidencia',
        data: { mode: 'focus' },
        loadComponent: () =>
          import('./features/incidencias/reportar/reportar.component').then((m) => m.ReportarComponent),
      },
      ...placeholderRoutes,
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];