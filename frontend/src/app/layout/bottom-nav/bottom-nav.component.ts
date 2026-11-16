
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  NAV_ITEMS,
  resolverNavegacionPorRol
} from '../../core/data/navigation.data';

import { AuthService } from '../../core/services/auth.service';
import { NavItem } from '../../models/nav-item.model';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Elementos originales de navegación.
  readonly items = input<NavItem[]>(NAV_ITEMS);

  // Resuelve las rutas según el rol del usuario autenticado.
  readonly itemsPorRol = computed(() =>
    resolverNavegacionPorRol(
      this.items(),
      this.auth.usuario()?.rol
    )
  );

  // Elementos visibles en la barra inferior.
  readonly principales = computed(() =>
    this.itemsPorRol().filter((item) => item.bottom)
  );

  // Elementos visibles en el menú "Más opciones".
  readonly otros = computed(() =>
    this.itemsPorRol().filter((item) => !item.bottom)
  );

  readonly abierto = signal(false);

  alternar(): void {
    this.abierto.update((valor) => !valor);
  }

  cerrar(): void {
    this.abierto.set(false);
  }

  async salir(): Promise<void> {
    this.cerrar();

    try {
      await this.auth.salir();
      await this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
