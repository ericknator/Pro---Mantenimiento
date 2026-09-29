import { Route, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { EXIT_ITEM, INCIDENT_ACTIONS, NAV_ITEMS } from './core/data/navigation.data';

// Cada botón sin pantalla propia apunta a una pantalla "en construcción"
const placeholderRoutes: Route[] = [...NAV_ITEMS, ...INCIDENT_ACTIONS, EXIT_ITEM]
  .filter((i) => i.route.startsWith('/modulo/') || i.route.startsWith('/incidencias/'))
  .map((i) => ({
    path: i.route.substring(1),
    title: i.label,
    data: { title: i.label, soon: !!i.soon },
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
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'incidencias',
        title: 'Incidencias',
        loadComponent: () =>
          import('./features/incidencias/incidencias.component').then((m) => m.IncidenciasComponent),
      },
      ...placeholderRoutes,
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
