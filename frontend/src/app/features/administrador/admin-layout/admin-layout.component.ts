import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ADMIN_NAV_ITEMS } from '../../../core/data/admin-navigation.data';
import { BottomNavComponent } from '../../../layout/bottom-nav/bottom-nav.component';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../layout/sidebar/sidebar.component';

interface PantallaCfg {
  menu?: 'full' | 'rail';
  fondo?: string;
}

const FONDOS: Record<string, string> = {
  ciudad: '/images/fondo-inicio.jpg',
  edificio: '/images/fondo-incidencias.jpg',
  terraza: '/images/fondo-reportar.jpg',
};

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, BottomNavComponent],
  templateUrl: './admin-layout.component.html',
  // Misma estructura visual que el layout del residente: se reutilizan sus estilos
  styleUrl: '../../../layout/main-layout/main-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);

  items = ADMIN_NAV_ITEMS;

  private readonly cfg = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map((): PantallaCfg => {
        let ruta = this.router.routerState.snapshot.root;
        while (ruta.firstChild) ruta = ruta.firstChild;
        return ruta.data as PantallaCfg;
      }),
    ),
    { initialValue: {} as PantallaCfg },
  );

  rail = computed(() => this.cfg().menu === 'rail');
  fondoUrl = computed(() => `url('${FONDOS[this.cfg().fondo ?? 'edificio'] ?? FONDOS['edificio']}')`);
}
