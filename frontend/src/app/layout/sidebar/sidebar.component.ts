import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NAV_ITEMS } from '../../core/data/navigation.data';
import { NavItem } from '../../models/nav-item.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  items = input<NavItem[]>(NAV_ITEMS);
  /** true: solo íconos (pantallas de acción como Reportar incidencia) */
  collapsed = input(false);

  // Filtro de rol: 'Mantenimientos' solo aparece para mantenimiento y administrador
  readonly itemsVisibles = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return this.items().filter((item) => {
      if (item.route === '/mantenimiento') {
        return rol === 'mantenimiento' || rol === 'administrador';
      }
      return true;
    });
  });

  esItemActivo(item: NavItem): boolean {
    const url = this.router.url;

    // Si estamos en el inicio del rol (ej: /mantenimiento/inicio)
    if (url.includes('/inicio')) {
      return item.route === '/inicio';
    }

    if (item.route === '/mantenimiento') {
      return url.startsWith('/mantenimiento') && !url.includes('/inicio');
    }

    return url.startsWith(item.route);
  }
}